export const constants = {
    siteUrl: "https://spycy.vercel.app",
    lobbyCodeLength: 5,
    discussDurationMs: 180_000,
    votingDurationMs: 45_000,
    minPlayers: 3,
    maxPlayers: 10,
}

export const SPY = {
    userId: "userId",
    playerName: "playerName",
    lobbyCode: "lobbyCode",
    SPY: "spy",
    DEFENDER: "defender",
    YOU_ARE_SPY: "You are the spy",
    YOU_ARE_DEFENDER: "You are a defender",
    SPY_VOTE_POINTS: 500,
    SPY_WIN_POINTS: 1000,
}

export const GAME_STATE = {
    LOBBY: "lobby",
    REVEAL: "reveal",
    GAME: "game",
    FINISHED: "finished",
}

export const PLAY_MODE = {
    ONLINE: "online",
    HOTSEAT: "hotseat",
} as const

export type PlayMode = (typeof PLAY_MODE)[keyof typeof PLAY_MODE]

/** Namespaced for shared Firebase project (akxh-games). */
export const SPY_TABLES = {
    USERS: "spycy_users",
    LOBBIES: "spycy_lobbies",
    WORDS: "spycy_words",
}
