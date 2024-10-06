export interface Player {
    userId: string;
    name: string;
    role: string;
    prompt: string;
    playerLobbyCode: string;
}

export interface GameSession {
    round: number;
    spy: string;
    defenders: any;
    word: string;
    startTime: string;
    endTime: string;
    winner: string;
    isGameOver: boolean;
}

export interface Lobby {
    lobbyCode: string;
    players: Player[];
    gameState: string;
    currentGame?: GameSession | null;
    games: GameSession[];
}