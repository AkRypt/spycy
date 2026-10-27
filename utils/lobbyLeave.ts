import state from "@/app/context";

/**
 * Survives hard reload in the same tab (sessionStorage) and across tabs
 * (localStorage) until the user intentionally creates/joins a lobby again.
 * Prior one-shot session flag was cleared while Firestore membership could
 * still be set — a second reload then auto-rejoined.
 */
export const SPYCY_SUPPRESS_REJOIN_KEY = "spycy_suppress_rejoin";

/** @deprecated Prefer SPYCY_SUPPRESS_REJOIN_KEY; kept to clear the old one-shot flag. */
export const SPYCY_JUST_LEFT_KEY = "spycy_just_left";

export function markLeftLobby() {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(SPYCY_SUPPRESS_REJOIN_KEY, "1");
    localStorage.setItem(SPYCY_SUPPRESS_REJOIN_KEY, "1");
    sessionStorage.removeItem(SPYCY_JUST_LEFT_KEY);
}

/** Call when the user intentionally creates or joins a lobby. */
export function clearSuppressRejoin() {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(SPYCY_SUPPRESS_REJOIN_KEY);
    localStorage.removeItem(SPYCY_SUPPRESS_REJOIN_KEY);
    sessionStorage.removeItem(SPYCY_JUST_LEFT_KEY);
}

export function shouldSuppressRejoin(): boolean {
    if (typeof window === "undefined") return false;
    return (
        sessionStorage.getItem(SPYCY_SUPPRESS_REJOIN_KEY) === "1" ||
        localStorage.getItem(SPYCY_SUPPRESS_REJOIN_KEY) === "1" ||
        sessionStorage.getItem(SPYCY_JUST_LEFT_KEY) === "1"
    );
}

/** Wipe in-memory lobby membership so UI / effects cannot race back in. */
export function clearLobbyClientState() {
    state.userData = { ...state.userData, playerLobbyCode: "" };
    state.lobbyData = {
        lobbyCode: "",
        gameState: "",
        players: [],
        lobbyFetched: false,
        currentGame: null,
        playMode: undefined,
        hostId: undefined,
    };
}
