"use client";

import React, { useRef } from "react";
import { useUser } from "@/hooks";
import { unjoinLobby } from "@/utils/firebase/firebaseHelpers";
import { useRouter } from "next/navigation";
import SuccessToast from "./successToast";
import { PLAY_MODE } from "@/app/constants";
import useLobby from "@/hooks/useLobby";
import { isLocalHotseatCode, localLeave } from "@/utils/localLobby";
import {
    clearLobbyClientState,
    markLeftLobby,
    SPYCY_SUPPRESS_REJOIN_KEY,
} from "@/utils/lobbyLeave";

/** Re-export so older imports keep working. */
export { SPYCY_SUPPRESS_REJOIN_KEY as SPYCY_JUST_LEFT_KEY };

export default function LobbyCode({ ...props }) {
    const router = useRouter();
    const { playerLobbyCode, userId } = useUser();
    const { playMode } = useLobby();
    const toastRef = useRef<{ showToast: () => void } | null>(null);
    const code = String(props.text || "").toUpperCase();
    const local = playMode === PLAY_MODE.HOTSEAT && isLocalHotseatCode(code);

    const leaveLobby = async () => {
        const codeToLeave = (playerLobbyCode || code || "").toUpperCase();

        // Mark leave BEFORE clearing membership so the lobby page join effect
        // cannot race and call joinLobby again (that was restoring Firestore
        // playerLobbyCode and causing reload → old lobby).
        markLeftLobby();
        clearLobbyClientState();

        if (local || playMode === PLAY_MODE.HOTSEAT) {
            localLeave();
            clearLobbyClientState();
        } else if (codeToLeave && userId) {
            await unjoinLobby(codeToLeave, userId);
            clearLobbyClientState();
        } else if (codeToLeave) {
            // No auth uid yet — still wipe client; membership clear is best-effort.
            clearLobbyClientState();
        }

        router.replace("/");
    };

    const copyCode = () => {
        if (typeof window === "undefined") return;
        const value = playMode === PLAY_MODE.HOTSEAT ? code : window.location.href;
        navigator.clipboard?.writeText(value)
            .then(() => toastRef.current?.showToast())
            .catch((err) => console.error("Failed to copy: ", err));
    };

    return (
        <div className="spycy-panel relative my-3 rounded-2xl px-14 py-4 text-center">
            <button
                onClick={leaveLobby}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col items-center touch-target text-[var(--spycy-muted)] hover:text-rose-400 transition-colors"
                aria-label="Leave lobby"
                type="button"
            >
                <svg className="w-6 h-6 rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2" />
                </svg>
                <span className="text-[10px] uppercase tracking-wide">Leave</span>
            </button>

            <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--spycy-muted)] mb-1">Lobby</p>
            <p className="text-3xl sm:text-4xl font-bold tracking-[0.2em] text-white">{code}</p>

            <button
                onClick={copyCode}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center touch-target text-[var(--spycy-muted)] hover:text-cyan-400 transition-colors"
                aria-label="Copy lobby link"
                type="button"
            >
                <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M9 8v3a1 1 0 0 1-1 1H5m11 4h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1m4 3v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.13a1 1 0 0 1 .24-.65L7.7 8.35A1 1 0 0 1 8.46 8H13a1 1 0 0 1 1 1Z" />
                </svg>
                <span className="text-[10px] uppercase tracking-wide">Copy</span>
            </button>

            <SuccessToast ref={toastRef} text={playMode === PLAY_MODE.HOTSEAT ? "Code copied!" : "Link copied!"} />
        </div>
    );
}
