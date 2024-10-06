import { constants } from "@/app/constants";

export const generateLobbyCode = () => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const code = Array.from({ length: constants.lobbyCodeLength }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
    return code;
}

export function formatDateTime(date: Date): string {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}