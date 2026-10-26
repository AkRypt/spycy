import { constants } from "@/app/constants";

/** Ambiguous chars (0/O, 1/l/I) omitted for readable lobby codes. */
export const generateLobbyCode = () => {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const code = Array.from(
        { length: constants.lobbyCodeLength },
        () => characters[Math.floor(Math.random() * characters.length)]
    ).join("");
    return code;
}

export function formatDateTime(date: Date): string {
    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
}

export function makeLocalPlayerId(name: string, index: number): string {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "player";
    return `local_${slug}_${index}_${Math.random().toString(36).slice(2, 6)}`;
}
