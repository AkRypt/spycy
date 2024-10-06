import { proxy } from "valtio";

const state: any = proxy({
    isLoading: false,
    userData: {
        userId: "",
        playerName: "",
        playerRole: "",
        userFetched: false,
    },
    lobbyData: {
        lobbyCode: "",
        gameState: "",
        players: [],
        lobbyFetched: false,
    },
    currentPrompt: "",
});

export default state;
