export interface Player {
    userId: string;
    name: string;
    role: string;
    prompt: string;
    score?: number;
    playerLobbyCode: string;
}

export interface GameSession {
    round: number;
    spy: string;
    defenders: any;
    word: string;
    startTime: any;
    endTime: any;
    winner: string;
    isGameOver: boolean;
    votes: any;
    votingComplete: boolean;
    votingStartTime: any;
    votingEndTime: any;
    votingDuration: number;
    votingStarted: boolean;
    scoresUpdated: boolean;
    voteResults: any;
}

export interface Lobby {
    lobbyCode: string;
    players: Player[];
    gameState: string;
    currentGame?: GameSession | null;
    games: GameSession[];
}