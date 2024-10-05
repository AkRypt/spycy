import { proxy } from "valtio";

const state: any = proxy({
    isLoading: false,
    userData: {
        userId: "",
        playerName: "",
        playerRole: "",
        userFetched: false,
    },
    lobbyID: "",
    currentPrompt: "",
});

export default state;
