import state from '@/app/context';
import { auth, db } from './firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { GameSession, Lobby, Player } from '@/app/interfaces';
import { GAME_STATE, SPY, SPY_TABLES } from '@/app/constants';
import { formatDateTime } from '..';

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
        await fetchUserData(userId, 3);
    } catch (error) {
        console.error("Error in anonymous sign-in:", error);
        state.error = "Failed to sign in anonymously";
    }
}

async function createUserDocument(userId: string) {
    const userDocRef = doc(db, SPY_TABLES.USERS, userId);
    try {
        await setDoc(userDocRef, {
            createdAt: new Date(),
            userId: userId,
            // Add any other initial user data you want to store
        }, { merge: true });
    } catch (error) {
        console.error("Error creating/updating user document:", error);
        state.error = "Failed to create user document";
    }
}

async function fetchUserData(userId: string, place?: number) {
    state.loading = true;
    try {
        const userDocRef = doc(db, SPY_TABLES.USERS, userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            state.userData = { ...state.userData, ...userDoc.data() };
            state.userData.userFetched = true;
        } else {
            await createUserDocument(userId);
        }
    } catch (error) {
        console.error("Error fetching/creating user data:", error, userId, place);
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

export const createLobby = async (lobbyCode: string) => {
    state.loading = true;
    try {
        const lobbyRef = doc(db, SPY_TABLES.LOBBIES, lobbyCode);
        await setDoc(lobbyRef, {
            createdAt: new Date(),
            lobbyCode: lobbyCode,
            gameState: GAME_STATE.LOBBY,
            players: [],
        });
        state.loading = false;
        return { ok: true, data: { lobbyCode: lobbyCode } };
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
        let updatedLobbyData = { ...currentLobbyData, ...newLobbyData };

        // If we're starting the game, create a new game session
        if (newLobbyData.gameState === GAME_STATE.GAME) {
            updatedLobbyData = await createGameSession(updatedLobbyData);
        }

        await updateDoc(lobbyRef, updatedLobbyData);
        state.lobbyData = updatedLobbyData;
        return { ok: true, data: updatedLobbyData };
    } catch (error) {
        console.error("Error updating lobby:", error);
        state.error = "Failed to update lobby";
    }
};

export const joinLobby = async (lobbyCode: string, userId: string, playerName: string) => {
    try {
        console.log("Join lobby called");
        const lobbyRef = doc(db, SPY_TABLES.LOBBIES, lobbyCode);
        const lobbyDoc = await getDoc(lobbyRef);

        if (!lobbyDoc.exists()) {
            console.warn("Tried to join a non-existent lobby:", lobbyCode, playerName);
            return { ok: false, message: 'Lobby not found. Please check the lobby code and try again.' };
        }

        const existingLobby = lobbyDoc.data() as Lobby;
        const players = existingLobby.players || [];
        let storedPlayerName = playerName;
        if (players.some((player: Player) => player.name === playerName)) {
            console.warn("Player name already exists:", playerName, lobbyCode);
            storedPlayerName = `${playerName}_${userId.slice(0, 4)}`;
        }

        const currentPlayer = { userId, name: storedPlayerName, role: 'lobby_player', prompt: '' };
        const updatedPlayers: any = [...players, currentPlayer];
        await updateDoc(lobbyRef, { players: updatedPlayers });

        /** Updating user lobby code */
        await updateUserData(userId, { playerLobbyCode: lobbyCode });

        const data = { ...existingLobby, players: updatedPlayers };
        state.lobbyData = data;

        return { ok: true, data };
    } catch (error) {
        console.log(error);
        return { ok: false, message: 'An error occurred while joining the lobby. Please try again.' };
    }
};

export const unjoinLobby = async (lobbyCode: string, userId: string) => {
    try {
        console.log("Unjoin lobby called");
        const lobbyRef = doc(db, SPY_TABLES.LOBBIES, lobbyCode);
        const lobbyDoc = await getDoc(lobbyRef);

        if (!lobbyDoc.exists()) {
            console.warn("Tried to unjoin a non-existent lobby!");
            return { ok: false, message: 'Lobby not found.' };
        }

        const existingLobby = lobbyDoc.data() as Lobby;
        const updatedPlayers = existingLobby.players.filter((player: Player) => player.userId !== userId);
        await updateDoc(lobbyRef, { players: updatedPlayers });

        /** Updating user lobby code */
        await updateUserData(userId, { playerLobbyCode: '' });

        return { ok: true, data: { ...existingLobby, players: updatedPlayers } };
    } catch (error) {
        console.log(error);
        return { ok: false, message: 'An error occurred while leaving the lobby.' };
    }
};

export const subscribeLobby = (lobbyCode: string) => {
    const lobbyRef = doc(db, SPY_TABLES.LOBBIES, lobbyCode);
    try {
        const unsubscribe = onSnapshot(lobbyRef, (doc) => {
            if (doc.exists()) {
                const lobbyData = doc.data() as Lobby;
                state.lobbyData = lobbyData;
            } else {
                console.log("Lobby document does not exist");
            }
        }, (error) => {
            console.error("Error listening to lobby updates:", error);
        });

        return unsubscribe;
    } catch (error) {
        console.error("Error setting up lobby subscription:", error);
        // Return a no-op function as fallback
        return () => { };
    }
};

/** ***************
 * Game functions
 * *************** */

async function createGameSession(lobbyData: Lobby) {

    if (lobbyData?.currentGame) {
        // Add the finished game to the games array if it exists
        lobbyData.games = lobbyData?.games || [];
        lobbyData.games.push(lobbyData?.currentGame);
        lobbyData.currentGame = null;
    }

    const players = lobbyData?.players;
    if (players.length > 0) {
        const randomIndex = Math.floor(Math.random() * players.length);
        const randomWord = await getRandomWord();

        // Calculate the new round number
        const previousRound = lobbyData.games && lobbyData.games.length > 0
            ? lobbyData.games[lobbyData.games.length - 1].round
            : 0;
        const newRound = previousRound + 1;

        const newGameSession = {
            round: newRound,
            spy: players[randomIndex].userId,
            word: randomWord,
            startTime: formatDateTime(new Date()),
        };

        const updatedLobbyData = {
            ...lobbyData,
            currentGame: newGameSession,
            players: players.map((player, index) => ({
                ...player,
                role: index === randomIndex ? SPY.SPY : SPY.DEFENDER
            }))
        };
        return updatedLobbyData;
    } else {
        throw new Error('No players in the lobby');
    }
}

export async function updateGameSession(lobbyCode: string, gameSessionUpdates: Partial<GameSession>) {
    try {
        const lobbyRef = doc(db, SPY_TABLES.LOBBIES, lobbyCode);
        const lobbyDoc = await getDoc(lobbyRef);

        if (!lobbyDoc.exists()) {
            throw new Error('Lobby not found');
        }

        const currentLobbyData = lobbyDoc.data() as Lobby;
        let updatedLobbyData: Lobby = { ...currentLobbyData };

        if (!updatedLobbyData.currentGame) {
            throw new Error('No active game session');
        }

        // Update the current game session
        updatedLobbyData.currentGame = {
            ...updatedLobbyData.currentGame,
            ...gameSessionUpdates
        };

        // If the game is finished, move the current game to the games array and reset the current game
        if (gameSessionUpdates.isGameOver) {
            updatedLobbyData.gameState = GAME_STATE.FINISHED;
            updatedLobbyData.currentGame.endTime = formatDateTime(new Date());
        }

        console.log("updatedLobbyData", updatedLobbyData);

        // Update the lobby document in Firestore
        await updateDoc(lobbyRef, updatedLobbyData as any);

        // Update the local state
        state.lobbyData = updatedLobbyData;

        return { ok: true, data: updatedLobbyData };
    } catch (error) {
        console.error("Error updating game session:", error);
        state.error = "Failed to update game session";
        return { ok: false, error: "Failed to update game session" };
    }
};

/** ***************
 * Words functions
 * *************** */

export async function getRandomWord() {
    try {
        const wordsRef = collection(db, 'words');
        const wordsSnapshot = await getDocs(wordsRef);

        if (wordsSnapshot.empty) {
            throw new Error('No words found in the database');
        }

        // Get a random document (category)
        const randomDocIndex = Math.floor(Math.random() * wordsSnapshot.size);
        const randomDoc = wordsSnapshot.docs[randomDocIndex];

        const wordsArray = randomDoc.data().words;

        if (!Array.isArray(wordsArray) || wordsArray.length === 0) {
            throw new Error('Invalid words array in the selected document');
        }

        // Get a random word from the selected document
        const randomWordIndex = Math.floor(Math.random() * wordsArray.length);
        return wordsArray[randomWordIndex];
    } catch (error) {
        console.error("Error getting random word:", error);
        return '';
    }
}

export async function addWordsToFirestore(wordsData: any) {
    const wordsCollection = collection(db, 'words');

    for (const [category, words] of Object.entries(wordsData)) {
        try {
            await setDoc(doc(wordsCollection, category), { words });
            console.log(`Added ${category} words to Firestore`);
        } catch (error) {
            console.error(`Error adding ${category} words:`, error);
        }
    }
}