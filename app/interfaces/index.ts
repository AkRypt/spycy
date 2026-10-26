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
    currentGame?: GameSession | null;
    games?: GameSession[];
    createdAt?: any;
}
