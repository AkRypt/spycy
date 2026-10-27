export interface Player {
    userId: string;
    name: string;
    role: string;
    prompt: string;
    score?: number;
    playerLobbyCode?: string;
    isHost?: boolean;
    isSpectator?: boolean;
}

export interface VoteResults {
    votes: Record<string, string>;
    mostVotedId: string;
    isSpy: boolean;
}

export interface GameSession {
    round: number;
    spy: string;
    defenders?: string[];
    word: string;
    /** Word bank category key — shown to the spy (and defenders as context). */
    category?: string;
    startTime: any;
    endTime?: any;
    winner?: string;
    isGameOver: boolean;
    votes: Record<string, string>;
    votingComplete: boolean;
    votingStartTime?: any;
    votingEndTime?: any;
    votingDuration: number;
    votingStarted: boolean;
    scoresUpdated: boolean;
    voteResults?: VoteResults | null;
    timerDuration: number;
    /** Pass-and-play / shared reveal cursor */
    revealIndex: number;
    revealComplete: boolean;
    /** Hot-seat voting: whose turn to cast a private vote */
    votePassIndex: number;
}

export interface Lobby {
    lobbyCode: string;
    players: Player[];
    gameState: string;
    playMode?: "online" | "hotseat";
    hostId?: string;
    /** Category ids the next deal may use. Missing means every available category. */
    enabledCategories?: string[];
    /** Pass-and-play copy of the decks used to deal. Online reads Firestore instead. */
    wordPacks?: Record<string, string[]>;
    currentGame?: GameSession | null;
    games?: GameSession[];
    createdAt?: any;
}
