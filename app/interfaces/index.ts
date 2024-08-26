export interface Player {
    name: string;
    role: string;
    prompt: string;
}

export interface Lobby {
    lobbyCode: string;
    players: Player[];
    isGameStarted: boolean;
    isGameOver: boolean;
}