"use client";

import { useParams } from "next/navigation";
import { useEffect, Suspense, useState } from "react";
import { joinLobby, subscribeLobby, unjoinLobby } from "@/utils/firebase/firebaseHelpers";
import { GAME_STATE, PLAY_MODE } from "@/app/constants";
import { useUser } from "@/hooks";
import useLobby from "@/hooks/useLobby";
import Pregame from "./pregame";
import Reveal from "./reveal";
import Game from "./game";
import Results from "./results";
import { Background } from "@/app/components";
import { hydrateLocalIfMatch, isLocalHotseatCode } from "@/utils/localLobby";

export default function Lobby() {
    const { lobbyCode } = useParams();
    const code = String(lobbyCode || "").toUpperCase();
    const { userId, userFetched, playerName, playerLobbyCode } = useUser();
    const { gameState, playMode } = useLobby();
    const [joinError, setJoinError] = useState("");
    const [localMode, setLocalMode] = useState(false);

    useEffect(() => {
        if (!code) return;
        if (hydrateLocalIfMatch(code) || isLocalHotseatCode(code)) {
            setLocalMode(true);
            return;
        }
        setLocalMode(false);
        const unsubscribe = subscribeLobby(code);
        return () => unsubscribe();
    }, [code]);

    useEffect(() => {
        if (localMode) return;
        if (!userFetched || !playerName) return;
        if (playerLobbyCode === code) return;

        let cancelled = false;
        (async () => {
            if (playerLobbyCode && playerLobbyCode !== code) {
                await unjoinLobby(playerLobbyCode, userId);
            }
            const result = await joinLobby(code, userId, playerName);
            if (cancelled) return;
            if (!result.ok) {
                setJoinError(result.message || "Could not join lobby");
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [userFetched, playerName, code, userId, localMode, playerLobbyCode]);

    const effectiveLocal = localMode || playMode === PLAY_MODE.HOTSEAT;

    return (
        <Suspense fallback={<div className="p-8 text-center text-white">Loading…</div>}>
            <Background>
                {joinError && !effectiveLocal ? (
                    <div className="flex flex-1 flex-col items-center justify-center text-center gap-4">
                        <p className="text-rose-300 text-lg">{joinError}</p>
                        <a href="/" className="text-cyan-300 underline">Back home</a>
                    </div>
                ) : gameState === GAME_STATE.REVEAL ? (
                    <Reveal />
                ) : gameState === GAME_STATE.GAME ? (
                    <Game />
                ) : gameState === GAME_STATE.FINISHED ? (
                    <Results />
                ) : (
                    <Pregame />
                )}
            </Background>
        </Suspense>
    );
}
