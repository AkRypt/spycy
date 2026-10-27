import state from "@/app/context";
import { constants, GAME_STATE, PLAY_MODE, SPY } from "@/app/constants";
import { GameSession, Lobby, Player } from "@/app/interfaces";
import { pickFromPacks } from "@/app/words";
import { generateLobbyCode, makeLocalPlayerId } from ".";

const STORAGE_KEY = "spycy_hotseat_lobby";

function active(players: Player[] = []) {
    return players.filter((p) => !p.isSpectator);
}

function persist(lobby: Lobby) {
    if (typeof window !== "undefined") {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(lobby));
    }
    state.lobbyData = { ...lobby, lobbyFetched: true };
}

export function loadLocalLobby(): Lobby | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as Lobby;
    } catch {
        return null;
    }
}

export function clearLocalLobby() {
    if (typeof window !== "undefined") {
        sessionStorage.removeItem(STORAGE_KEY);
    }
}

export function createLocalHotseat(hostName: string): Lobby {
    const lobbyCode = generateLobbyCode();
    const host: Player = {
        userId: makeLocalPlayerId(hostName || "Host", 0),
        name: hostName || "Host",
        role: "lobby_player",
        prompt: "",
        score: 0,
        isHost: true,
    };
    const lobby: Lobby = {
        lobbyCode,
        playMode: PLAY_MODE.HOTSEAT,
        hostId: host.userId,
        gameState: GAME_STATE.LOBBY,
        players: [host],
        games: [],
        currentGame: null,
    };
    state.userData = {
        ...state.userData,
        userId: host.userId,
        playerName: host.name,
        playerLobbyCode: lobbyCode,
        userFetched: true,
    };
    if (typeof window !== "undefined") {
        localStorage.setItem(SPY.playerName, host.name);
        localStorage.setItem(SPY.userId, host.userId);
    }
    persist(lobby);
    return lobby;
}

export function hydrateLocalIfMatch(code: string): boolean {
    const lobby = loadLocalLobby();
    if (!lobby || lobby.lobbyCode.toUpperCase() !== code.toUpperCase()) return false;
    state.lobbyData = { ...lobby, lobbyFetched: true };
    if (!state.userData?.userId && lobby.hostId) {
        state.userData = {
            ...state.userData,
            userId: lobby.hostId,
            playerName: lobby.players?.[0]?.name || "Host",
            playerLobbyCode: lobby.lobbyCode,
            userFetched: true,
        };
    }
    return true;
}

function getLobby(): Lobby {
    const fromState = state.lobbyData as Lobby;
    if (fromState?.playMode === PLAY_MODE.HOTSEAT && fromState.lobbyCode) {
        return JSON.parse(JSON.stringify(fromState));
    }
    const stored = loadLocalLobby();
    if (!stored) throw new Error("No local lobby");
    return stored;
}

export function localAddPlayer(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, message: "Name required" };
    const lobby = getLobby();
    if ((lobby.players || []).length >= constants.maxPlayers) {
        return { ok: false, message: "Lobby is full" };
    }
    if ((lobby.players || []).some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
        return { ok: false, message: "Name already taken" };
    }
    lobby.players = [
        ...(lobby.players || []),
        {
            userId: makeLocalPlayerId(trimmed, (lobby.players || []).length),
            name: trimmed,
            role: "lobby_player",
            prompt: "",
            score: 0,
            isHost: false,
        },
    ];
    persist(lobby);
    return { ok: true };
}

export function localSetCategories(enabledCategories: string[]) {
    const lobby = getLobby();
    lobby.enabledCategories = enabledCategories;
    persist(lobby);
    return { ok: true };
}

export function localSetWordPacks(wordPacks: Record<string, string[]>) {
    const lobby = getLobby();
    lobby.wordPacks = wordPacks;
    persist(lobby);
}

export function localRemovePlayer(userId: string) {
    const lobby = getLobby();
    lobby.players = (lobby.players || []).filter((p) => p.userId !== userId);
    persist(lobby);
    return { ok: true };
}

export function localStartReveal() {
    const lobby = getLobby();
    const seats = active(lobby.players);
    if (seats.length < constants.minPlayers) {
        return { ok: false, error: `Need at least ${constants.minPlayers} players` };
    }

    if (lobby.currentGame) {
        lobby.games = [...(lobby.games || []), lobby.currentGame];
    }

    const spyIndex = Math.floor(Math.random() * seats.length);
    const spyId = seats[spyIndex].userId;
    const previousRound =
        lobby.games && lobby.games.length > 0 ? lobby.games[lobby.games.length - 1].round : 0;

    if (!lobby.wordPacks || Object.keys(lobby.wordPacks).length === 0) {
        return { ok: false, error: "Word packs are still loading" };
    }
    const picked = pickFromPacks(lobby.wordPacks, lobby.enabledCategories);
    if (!picked) {
        return { ok: false, error: "Turn on at least one category" };
    }
    const session: GameSession = {
        round: previousRound + 1,
        spy: spyId,
        defenders: seats.filter((_, i) => i !== spyIndex).map((p) => p.userId),
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

    lobby.currentGame = session;
    lobby.gameState = GAME_STATE.REVEAL;
    lobby.players = (lobby.players || []).map((p) => ({
        ...p,
        role: p.userId === spyId ? SPY.SPY : SPY.DEFENDER,
    }));
    persist(lobby);
    return {
        ok: true as const,
        category: picked.category,
        playerCount: seats.length,
        round: session.round,
    };
}

export function localAdvanceReveal() {
    const lobby = getLobby();
    const game = lobby.currentGame;
    if (!game) return;
    const seats = active(lobby.players);
    const next = (game.revealIndex ?? 0) + 1;
    if (next >= seats.length) {
        game.revealComplete = true;
        game.revealIndex = next;
        game.startTime = Date.now();
        lobby.gameState = GAME_STATE.GAME;
    } else {
        game.revealIndex = next;
    }
    persist(lobby);
}

export function localStartVoting() {
    const lobby = getLobby();
    if (!lobby.currentGame) return;
    lobby.currentGame.endTime = Date.now();
    lobby.currentGame.votingStartTime = Date.now();
    lobby.currentGame.votingDuration = constants.votingDurationMs;
    lobby.currentGame.votingStarted = true;
    lobby.currentGame.votePassIndex = 0;
    lobby.currentGame.votes = {};
    lobby.currentGame.votingComplete = false;
    persist(lobby);
}

export function localCastVote(voterId: string, votedForId: string) {
    const lobby = getLobby();
    if (!lobby.currentGame) return;
    const votes = { ...(lobby.currentGame.votes || {}), [voterId]: votedForId };
    lobby.currentGame.votes = votes;
    lobby.currentGame.votePassIndex = (lobby.currentGame.votePassIndex ?? 0) + 1;
    const seats = active(lobby.players);
    if (Object.keys(votes).length >= seats.length) {
        localFinishVotes(lobby);
        return;
    }
    persist(lobby);
}

function localFinishVotes(lobby: Lobby) {
    const game = lobby.currentGame!;
    const votes = game.votes || {};
    const counts: Record<string, number> = {};
    Object.values(votes).forEach((id) => {
        counts[id] = (counts[id] || 0) + 1;
    });

    if (Object.keys(counts).length === 0) {
        game.votingComplete = true;
        game.isGameOver = true;
        game.scoresUpdated = true;
        lobby.gameState = GAME_STATE.FINISHED;
        persist(lobby);
        return;
    }

    const mostVotedId = Object.entries(counts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    const isSpy = mostVotedId === game.spy;
    game.voteResults = { votes, mostVotedId, isSpy };
    game.votingComplete = true;
    game.isGameOver = true;
    game.scoresUpdated = true;
    lobby.gameState = GAME_STATE.FINISHED;

    if (isSpy) {
        lobby.players = lobby.players.map((p) =>
            Object.entries(votes).some(([voter, target]) => voter === p.userId && target === mostVotedId)
                ? { ...p, score: (p.score || 0) + SPY.SPY_VOTE_POINTS }
                : p
        );
    } else {
        lobby.players = lobby.players.map((p) =>
            p.userId === game.spy ? { ...p, score: (p.score || 0) + SPY.SPY_WIN_POINTS } : p
        );
    }
    persist(lobby);
}

export function localForceFinishVotes() {
    const lobby = getLobby();
    if (!lobby.currentGame) return;
    localFinishVotes(lobby);
}

export function localRematch() {
    return localStartReveal();
}

export function localBackToLobby() {
    const lobby = getLobby();
    if (lobby.currentGame) {
        lobby.games = [...(lobby.games || []), lobby.currentGame];
    }
    lobby.currentGame = null;
    lobby.gameState = GAME_STATE.LOBBY;
    lobby.players = (lobby.players || []).map((p) => ({ ...p, role: "lobby_player" }));
    persist(lobby);
}

export function localLeave() {
    clearLocalLobby();
    state.lobbyData = {
        lobbyCode: "",
        gameState: "",
        players: [],
        lobbyFetched: false,
        currentGame: null,
        playMode: undefined,
        hostId: undefined,
    };
    state.userData = { ...state.userData, playerLobbyCode: "" };
}

export function isLocalHotseatCode(code: string) {
    const lobby = loadLocalLobby();
    return !!lobby && lobby.lobbyCode.toUpperCase() === String(code).toUpperCase();
}
