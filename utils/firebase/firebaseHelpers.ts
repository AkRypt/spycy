import state from '@/app/context';
import { auth, db } from './firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, onSnapshot, collection, getDocs, serverTimestamp, runTransaction, deleteField } from 'firebase/firestore';
import { GameSession, Lobby, Player } from '@/app/interfaces';
import { constants, GAME_STATE, PLAY_MODE, PlayMode, SPY, SPY_TABLES } from '@/app/constants';
import { pickFallbackWord } from '@/app/words';
import { makeLocalPlayerId } from '..';
import { shouldSuppressRejoin } from '@/utils/lobbyLeave';

/** ***************
 * User functions
 * *************** */

export async function initializeUser() {
    return new Promise<void>((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                state.userData.userId = user.uid;
                localStorage.setItem(SPY.userId, user.uid);
                await fetchUserData(user.uid);
            } else {
                await signInAnonymouslyAndCreateUser();
            }
            resolve();
        });
    });
}

async function signInAnonymouslyAndCreateUser() {
    try {
        const userCredential = await signInAnonymously(auth);
        const userId = userCredential.user.uid;
        state.userData.userId = userId;
        localStorage.setItem(SPY.userId, userId);
        await createUserDocument(userId);
        await fetchUserData(userId);
    } catch (error) {
        console.error("Error in anonymous sign-in:", error);
        state.error = "Failed to sign in anonymously";
        // Pass & play does not need Auth; mark fetched so the menu stays usable.
        state.userData = {
            ...state.userData,
            userFetched: true,
        };
    }
}

async function createUserDocument(userId: string) {
    const userDocRef = doc(db, SPY_TABLES.USERS, userId);
    try {
        await setDoc(userDocRef, {
            createdAt: new Date(),
            userId: userId,
        }, { merge: true });
    } catch (error) {
        console.error("Error creating/updating user document:", error);
        state.error = "Failed to create user document";
    }
}

async function fetchUserData(userId: string) {
    state.loading = true;
    try {
        const userDocRef = doc(db, SPY_TABLES.USERS, userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            state.userData = { ...state.userData, ...userDoc.data() };
            state.userData.userFetched = true;
        } else {
            await createUserDocument(userId);
            state.userData.userFetched = true;
        }
    } catch (error) {
        console.error("Error fetching/creating user data:", error, userId);
        state.error = "Failed to fetch or create user data";
    }
    state.loading = false;
}

export async function updateUserData(userId: string, newUserData: any) {
    const userDocRef = doc(db, SPY_TABLES.USERS, userId);
    try {
        await setDoc(userDocRef, newUserData, { merge: true });
        state.userData = { ...state.userData, ...newUserData };
    } catch (error) {
        console.error("Error updating user data:", error);
        state.error = "Failed to update user data";
    }
}

/** ***************
 * Lobby functions
 * *************** */

export const createLobby = async (
    lobbyCode: string,
    hostId: string,
    playMode: PlayMode = PLAY_MODE.ONLINE
) => {
    state.loading = true;
    try {
        const lobbyRef = doc(db, SPY_TABLES.LOBBIES, lobbyCode);
        await setDoc(lobbyRef, {
            createdAt: new Date(),
            lobbyCode,
            gameState: GAME_STATE.LOBBY,
            playMode,
            hostId,
            players: [],
            games: [],
            currentGame: null,
        });
        state.loading = false;
        return { ok: true, data: { lobbyCode } };
    } catch (error) {
        console.error("Error creating lobby:", error);
        state.loading = false;
        return { ok: false, error: "Failed to create lobby" };
    }
};

export const updateLobby = async (lobbyCode: string, newLobbyData: any) => {
    try {
        const lobbyRef = doc(db, SPY_TABLES.LOBBIES, lobbyCode);
        const lobbyDoc = await getDoc(lobbyRef);

        if (!lobbyDoc.exists()) {
            throw new Error('Lobby not found');
        }

        const currentLobbyData = lobbyDoc.data() as Lobby;
        let updatedLobbyData: any = { ...currentLobbyData, ...newLobbyData };

        if (newLobbyData.gameState === GAME_STATE.REVEAL || newLobbyData.gameState === GAME_STATE.GAME) {
            const needsNewSession =
                !currentLobbyData.currentGame ||
                currentLobbyData.gameState === GAME_STATE.FINISHED ||
                currentLobbyData.gameState === GAME_STATE.LOBBY;

            if (needsNewSession) {
                updatedLobbyData = await createGameSession({
                    ...currentLobbyData,
                    ...newLobbyData,
                    gameState: newLobbyData.gameState,
                });
            }
        }

        await updateDoc(lobbyRef, updatedLobbyData);
        state.lobbyData = updatedLobbyData;
        return { ok: true, data: updatedLobbyData };
    } catch (error) {
        console.error("Error updating lobby:", error);
        state.error = "Failed to update lobby";
        return { ok: false, error: String(error) };
    }
};

export const joinLobby = async (lobbyCode: string, userId: string, playerName: string) => {
    try {
        // Block the leave→clear→effect race that would re-write playerLobbyCode.
        if (shouldSuppressRejoin()) {
            return { ok: false, message: 'Left lobby; rejoin from the main menu.' };
        }

        const code = String(lobbyCode).toUpperCase();
        const lobbyRef = doc(db, SPY_TABLES.LOBBIES, code);
        const lobbyDoc = await getDoc(lobbyRef);

        if (!lobbyDoc.exists()) {
            return { ok: false, message: 'Lobby not found. Please check the lobby code and try again.' };
        }

        const existingLobby = lobbyDoc.data() as Lobby;

        if (existingLobby.gameState !== GAME_STATE.LOBBY) {
            const alreadyIn = (existingLobby.players || []).some((p) => p.userId === userId);
            if (!alreadyIn) {
                return { ok: false, message: 'This game has already started.' };
            }
            state.lobbyData = existingLobby;
            return { ok: true, data: existingLobby };
        }

        const players = existingLobby.players || [];
        const existingIndex = players.findIndex((player: Player) => player.userId === userId);
        if (existingIndex !== -1) {
            state.lobbyData = existingLobby;
            await updateUserData(userId, { playerLobbyCode: code });
            return { ok: true, data: existingLobby };
        }

        if (players.length >= constants.maxPlayers) {
            return { ok: false, message: 'Lobby is full.' };
        }

        let storedPlayerName = playerName.trim() || 'Player';
        if (players.some((player: Player) => player.name.toLowerCase() === storedPlayerName.toLowerCase())) {
            storedPlayerName = `${storedPlayerName}_${userId.slice(0, 4)}`;
        }

        const isHost = existingLobby.hostId === userId || players.length === 0;
        const currentPlayer: Player = {
            userId,
            name: storedPlayerName,
            role: 'lobby_player',
            prompt: '',
            score: 0,
            isHost,
            isSpectator: false,
        };
        const updatedPlayers = [...players, currentPlayer];
        const patch: any = { players: updatedPlayers };
        if (!existingLobby.hostId) {
            patch.hostId = userId;
        }

        await updateDoc(lobbyRef, patch);
        await updateUserData(userId, { playerLobbyCode: code });

        const data = { ...existingLobby, ...patch };
        state.lobbyData = data;
        return { ok: true, data };
    } catch (error) {
        console.log(error);
        return { ok: false, message: 'An error occurred while joining the lobby. Please try again.' };
    }
};

/** Hot-seat: add a local named seat (no second auth). */
export const addHotseatPlayer = async (lobbyCode: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, message: 'Name required' };

    const lobbyRef = doc(db, SPY_TABLES.LOBBIES, lobbyCode);
    const lobbyDoc = await getDoc(lobbyRef);
    if (!lobbyDoc.exists()) return { ok: false, message: 'Lobby not found' };

    const lobby = lobbyDoc.data() as Lobby;
    if (lobby.playMode !== PLAY_MODE.HOTSEAT) {
        return { ok: false, message: 'Not a pass-and-play lobby' };
    }
    if ((lobby.players || []).length >= constants.maxPlayers) {
        return { ok: false, message: 'Lobby is full' };
    }
    if ((lobby.players || []).some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
        return { ok: false, message: 'Name already taken' };
    }

    const player: Player = {
        userId: makeLocalPlayerId(trimmed, (lobby.players || []).length),
        name: trimmed,
        role: 'lobby_player',
        prompt: '',
        score: 0,
        isHost: (lobby.players || []).length === 0,
        isSpectator: false,
    };
    const players = [...(lobby.players || []), player];
    await updateDoc(lobbyRef, { players });
    return { ok: true, data: players };
};

export const removePlayer = async (lobbyCode: string, targetUserId: string) => {
    const lobbyRef = doc(db, SPY_TABLES.LOBBIES, lobbyCode);
    const lobbyDoc = await getDoc(lobbyRef);
    if (!lobbyDoc.exists()) return { ok: false, message: 'Lobby not found' };

    const lobby = lobbyDoc.data() as Lobby;
    const players = (lobby.players || []).filter((p) => p.userId !== targetUserId);
    await updateDoc(lobbyRef, { players });
    return { ok: true };
};

export const setPlayerSpectator = async (
    lobbyCode: string,
    targetUserId: string,
    isSpectator: boolean
) => {
    const lobbyRef = doc(db, SPY_TABLES.LOBBIES, lobbyCode);
    const lobbyDoc = await getDoc(lobbyRef);
    if (!lobbyDoc.exists()) return { ok: false };

    const lobby = lobbyDoc.data() as Lobby;
    const players = (lobby.players || []).map((p) =>
        p.userId === targetUserId ? { ...p, isSpectator } : p
    );
    await updateDoc(lobbyRef, { players });
    return { ok: true };
};

export const unjoinLobby = async (lobbyCode: string, userId: string) => {
    // Always clear membership on the user doc / local state, even if the lobby doc is gone.
    // deleteField removes the key so reload fetch cannot resurrect a stale lobby code.
    const clearMembership = async () => {
        state.userData = { ...state.userData, playerLobbyCode: "" };
        if (userId) {
            try {
                const userDocRef = doc(db, SPY_TABLES.USERS, userId);
                await updateDoc(userDocRef, { playerLobbyCode: deleteField() });
                state.userData = { ...state.userData, playerLobbyCode: "" };
            } catch (e) {
                // Doc may not exist yet — fall back to empty string merge.
                try {
                    await updateUserData(userId, { playerLobbyCode: "" });
                } catch (e2) {
                    console.error("Error clearing playerLobbyCode:", e2);
                }
            }
        }
    };

    try {
        const code = String(lobbyCode || "").toUpperCase();
        if (!code) {
            await clearMembership();
            return { ok: true, message: "No lobby code; cleared membership." };
        }

        const lobbyRef = doc(db, SPY_TABLES.LOBBIES, code);
        const lobbyDoc = await getDoc(lobbyRef);

        if (!lobbyDoc.exists()) {
            await clearMembership();
            return { ok: true, message: "Lobby not found; cleared local membership." };
        }

        const existingLobby = lobbyDoc.data() as Lobby;
        const updatedPlayers = (existingLobby.players || []).filter(
            (player: Player) => player.userId !== userId
        );
        await updateDoc(lobbyRef, { players: updatedPlayers });
        await clearMembership();

        return { ok: true, data: { ...existingLobby, players: updatedPlayers } };
    } catch (error) {
        console.log(error);
        await clearMembership();
        return { ok: false, message: "An error occurred while leaving the lobby." };
    }
};

export const subscribeLobby = (lobbyCode: string) => {
    const code = String(lobbyCode).toUpperCase();
    const lobbyRef = doc(db, SPY_TABLES.LOBBIES, code);
    try {
        const unsubscribe = onSnapshot(lobbyRef, (docSnap) => {
            if (docSnap.exists()) {
                state.lobbyData = { ...docSnap.data(), lobbyFetched: true };
            } else {
                console.log("Lobby document does not exist");
            }
        }, (error) => {
            console.error("Error listening to lobby updates:", error);
        });

        return unsubscribe;
    } catch (error) {
        console.error("Error setting up lobby subscription:", error);
        return () => { };
    }
};

export async function updatePlayerScore(
    lobbyCode: string,
    playerId: string,
    scoreChange: number
): Promise<void> {
    const lobbyRef = doc(db, SPY_TABLES.LOBBIES, lobbyCode);

    const lobbyDoc = await getDoc(lobbyRef);
    if (!lobbyDoc.exists()) {
        throw new Error("Lobby does not exist!");
    }

    const lobbyData = lobbyDoc.data() as Lobby;
    const playerIndex = lobbyData.players.findIndex(player => player.userId === playerId);
    if (playerIndex === -1) {
        throw new Error("Player not found in lobby!");
    }

    const updatedLobbyData = {
        players: lobbyData.players.map((player, index) =>
            index === playerIndex
                ? { ...player, score: (player.score || 0) + scoreChange }
                : player
        )
    };

    await updateDoc(lobbyRef, updatedLobbyData);
}

/** ***************
 * Game functions
 * *************** */

function activePlayers(players: Player[]) {
    return (players || []).filter((p) => !p.isSpectator);
}

async function createGameSession(lobbyData: Lobby) {
    if (lobbyData?.currentGame && (lobbyData.currentGame.isGameOver || lobbyData.gameState === GAME_STATE.FINISHED)) {
        lobbyData.games = lobbyData?.games || [];
        lobbyData.games.push(lobbyData.currentGame);
        lobbyData.currentGame = null;
    }

    const players = activePlayers(lobbyData?.players || []);
    if (players.length < constants.minPlayers) {
        throw new Error(`Need at least ${constants.minPlayers} players to start`);
    }

    const randomIndex = Math.floor(Math.random() * players.length);
    const picked = await getRandomWord();
    const spyId = players[randomIndex].userId;

    const previousRound = lobbyData.games && lobbyData.games.length > 0
        ? lobbyData.games[lobbyData.games.length - 1].round
        : 0;

    const newGameSession: GameSession = {
        round: previousRound + 1,
        spy: spyId,
        defenders: players.filter((_, i) => i !== randomIndex).map((p) => p.userId),
        word: picked.word,
        category: picked.category,
        startTime: null,
        isGameOver: false,
        votes: {},
        votingComplete: false,
        votingDuration: constants.votingDurationMs,
        votingStarted: false,
        scoresUpdated: false,
        voteResults: null,
        timerDuration: constants.discussDurationMs,
        revealIndex: 0,
        revealComplete: false,
        votePassIndex: 0,
    };

    return {
        ...lobbyData,
        currentGame: newGameSession,
        players: (lobbyData.players || []).map((player) => {
            if (player.isSpectator) {
                return { ...player, role: 'spectator' };
            }
            return {
                ...player,
                role: player.userId === spyId ? SPY.SPY : SPY.DEFENDER,
            };
        }),
    };
}

export async function advanceReveal(lobbyCode: string) {
    const lobbyRef = doc(db, SPY_TABLES.LOBBIES, lobbyCode);
    const lobbyDoc = await getDoc(lobbyRef);
    if (!lobbyDoc.exists()) throw new Error('Lobby not found');

    const lobby = lobbyDoc.data() as Lobby;
    const game = lobby.currentGame;
    if (!game) throw new Error('No game');

    const seats = activePlayers(lobby.players || []);
    const nextIndex = (game.revealIndex ?? 0) + 1;

    if (nextIndex >= seats.length) {
        await updateDoc(lobbyRef, {
            gameState: GAME_STATE.GAME,
            'currentGame.revealComplete': true,
            'currentGame.revealIndex': nextIndex,
            'currentGame.startTime': serverTimestamp(),
        });
    } else {
        await updateDoc(lobbyRef, {
            'currentGame.revealIndex': nextIndex,
        });
    }
}

export async function startDiscussPhase(lobbyCode: string) {
    const lobbyRef = doc(db, SPY_TABLES.LOBBIES, lobbyCode);
    await updateDoc(lobbyRef, {
        gameState: GAME_STATE.GAME,
        'currentGame.revealComplete': true,
        'currentGame.startTime': serverTimestamp(),
    });
}

export async function updateGameSession(lobbyCode: string, gameSessionUpdates: Partial<GameSession>) {
    try {
        const lobbyRef = doc(db, SPY_TABLES.LOBBIES, lobbyCode);
        const lobbyDoc = await getDoc(lobbyRef);

        if (!lobbyDoc.exists()) {
            throw new Error('Lobby not found');
        }

        const currentLobbyData = lobbyDoc.data() as Lobby;
        if (!currentLobbyData.currentGame) {
            throw new Error('No active game session');
        }

        const updatedCurrent = {
            ...currentLobbyData.currentGame,
            ...gameSessionUpdates,
        };

        const patch: any = { currentGame: updatedCurrent };
        if (gameSessionUpdates.isGameOver) {
            patch.gameState = GAME_STATE.FINISHED;
        }

        await updateDoc(lobbyRef, patch);
        state.lobbyData = { ...currentLobbyData, ...patch };
        return { ok: true, data: state.lobbyData };
    } catch (error) {
        console.error("Error updating game session:", error);
        state.error = "Failed to update game session";
        return { ok: false, error: "Failed to update game session" };
    }
}

/** Rematch: archive current game, deal new roles, enter reveal. */
export async function rematch(lobbyCode: string) {
    return updateLobby(lobbyCode, { gameState: GAME_STATE.REVEAL });
}

export async function backToLobby(lobbyCode: string) {
    const lobbyRef = doc(db, SPY_TABLES.LOBBIES, lobbyCode);
    const lobbyDoc = await getDoc(lobbyRef);
    if (!lobbyDoc.exists()) return { ok: false };

    const lobby = lobbyDoc.data() as Lobby;
    const games = [...(lobby.games || [])];
    if (lobby.currentGame) {
        games.push(lobby.currentGame);
    }

    const players = (lobby.players || []).map((p) => ({
        ...p,
        role: 'lobby_player',
    }));

    await updateDoc(lobbyRef, {
        gameState: GAME_STATE.LOBBY,
        currentGame: null,
        games,
        players,
    });
    return { ok: true };
}

/** ***************
 * Vote functions
 * *************** */

export async function startVoting(lobbyCode: string) {
    await updateGameSession(lobbyCode, {
        endTime: serverTimestamp() as any,
        votingStartTime: serverTimestamp() as any,
        votingDuration: constants.votingDurationMs,
        votingStarted: true,
        votePassIndex: 0,
        votes: {},
        votingComplete: false,
    });
}

export async function getVotingResults(lobbyCode: string) {
    const lobbyRef = doc(db, SPY_TABLES.LOBBIES, lobbyCode);
    const lobbyDoc = await getDoc(lobbyRef);
    const lobbyData = lobbyDoc.data() as Lobby;

    if (!lobbyData?.currentGame) return null;
    if (lobbyData.currentGame.scoresUpdated) return lobbyData.currentGame.voteResults;

    const votes: Record<string, string> = lobbyData.currentGame?.votes || {};
    const voters = activePlayers(lobbyData.players || []);

    // Allow results when time is up even if not everyone voted
    if (!lobbyData.currentGame.votingComplete && Object.keys(votes).length < voters.length) {
        // If host forced finish or timer expired, proceed with what we have
        if (Object.keys(votes).length === 0) {
            return null;
        }
    }

    const voteCounts: Record<string, number> = Object.values(votes).reduce((acc: Record<string, number>, votedForId) => {
        acc[votedForId] = (acc[votedForId] || 0) + 1;
        return acc;
    }, {});

    if (!voteCounts || Object.keys(voteCounts).length === 0) return null;

    const mostVotedId = Object.entries(voteCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    const isSpy = mostVotedId === lobbyData.currentGame?.spy;
    const voteResults = { votes, mostVotedId, isSpy };

    await updateDoc(lobbyRef, {
        'currentGame.voteResults': voteResults,
        'currentGame.votingComplete': true,
        'currentGame.isGameOver': true,
        'currentGame.scoresUpdated': true,
        gameState: GAME_STATE.FINISHED,
    });

    if (isSpy) {
        for (const [voterId, votedForId] of Object.entries(votes)) {
            if (votedForId === mostVotedId) {
                await updatePlayerScore(lobbyCode, voterId, SPY.SPY_VOTE_POINTS);
            }
        }
    } else {
        await updatePlayerScore(lobbyCode, lobbyData.currentGame.spy, SPY.SPY_WIN_POINTS);
    }

    return voteResults;
}

export async function castVote(lobbyCode: string, voterId: string, votedForId: string) {
    const lobbyRef = doc(db, SPY_TABLES.LOBBIES, lobbyCode);

    try {
        await runTransaction(db, async (transaction) => {
            const lobbyDoc = await transaction.get(lobbyRef);
            if (!lobbyDoc.exists()) {
                throw "Lobby does not exist!";
            }

            const lobbyData = lobbyDoc.data() as Lobby;
            const currentGame = lobbyData.currentGame;
            if (!currentGame) {
                throw "No active game session!";
            }

            const updatedVotes = { ...(currentGame.votes || {}), [voterId]: votedForId };
            const voters = activePlayers(lobbyData.players || []);
            const allPlayersVoted = Object.keys(updatedVotes).length >= voters.length;
            const nextPass = (currentGame.votePassIndex ?? 0) + 1;

            transaction.update(lobbyRef, {
                'currentGame.votes': updatedVotes,
                'currentGame.votingComplete': allPlayersVoted,
                'currentGame.votePassIndex': nextPass,
            });
        });
    } catch (error) {
        console.error("Error casting vote:", error);
        throw error;
    }
}

export async function advanceVotePass(lobbyCode: string) {
    const lobbyRef = doc(db, SPY_TABLES.LOBBIES, lobbyCode);
    const lobbyDoc = await getDoc(lobbyRef);
    if (!lobbyDoc.exists()) return;
    const lobby = lobbyDoc.data() as Lobby;
    const idx = (lobby.currentGame?.votePassIndex ?? 0) + 1;
    await updateDoc(lobbyRef, { 'currentGame.votePassIndex': idx });
}

/** ***************
 * Words functions
 * *************** */

export async function getRandomWord() {
    try {
        const wordsRef = collection(db, SPY_TABLES.WORDS);
        const wordsSnapshot = await getDocs(wordsRef);

        if (!wordsSnapshot.empty) {
            const randomDocIndex = Math.floor(Math.random() * wordsSnapshot.size);
            const randomDoc = wordsSnapshot.docs[randomDocIndex];
            const wordsArray = randomDoc.data().words;
            const category =
                (typeof randomDoc.data().category === "string" && randomDoc.data().category) ||
                randomDoc.id;

            if (Array.isArray(wordsArray) && wordsArray.length > 0) {
                return {
                    word: wordsArray[Math.floor(Math.random() * wordsArray.length)],
                    category,
                };
            }
        }
    } catch (error) {
        console.error("Error getting random word from Firestore:", error);
    }
    return pickFallbackWord();
}

export async function addWordsToFirestore(wordsData: any) {
    const wordsCollection = collection(db, SPY_TABLES.WORDS);

    for (const [category, words] of Object.entries(wordsData)) {
        try {
            await setDoc(doc(wordsCollection, category), { words });
            console.log(`Added ${category} words to Firestore`);
        } catch (error) {
            console.error(`Error adding ${category} words:`, error);
        }
    }
}
