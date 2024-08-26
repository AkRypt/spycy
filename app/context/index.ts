import { proxy } from "valtio";

const state: any = proxy({
    isLoading: false,
    playerName: "",
    playerRole: "",
    lobbyID: "",
    currentPrompt: "",
});

export default state;
