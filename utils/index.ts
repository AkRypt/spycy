import { constants } from "@/app/constants";

export const generateLobbyCode = () => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const code = Array.from({ length: constants.lobbyCodeLength }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
    return code;
}