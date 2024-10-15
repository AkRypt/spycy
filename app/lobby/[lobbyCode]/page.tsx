"use client";

import { useParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { joinLobby, subscribeLobby, unjoinLobby } from "@/utils/firebase/firebaseHelpers";
import { GAME_STATE } from "@/app/constants";
import { useUser } from "@/hooks";
import useLobby from "@/hooks/useLobby";
import Pregame from "./pregame";
import Game from "./game";
import Results from "./results";

export default function Lobby() {
    const { lobbyCode } = useParams();
    const { userId, userFetched, playerName, playerLobbyCode } = useUser();
    const { gameState } = useLobby();

    // Makes the player join the lobby
    useEffect(() => {
        let loaded = true;
        if (loaded) {
            if (!userFetched) return;
            // Return if the player is already in the lobby
            if (playerLobbyCode === lobbyCode || !playerName) return;
            // Unjoin the player from the previous lobby
            if (playerLobbyCode && playerLobbyCode !== lobbyCode) {
                unjoinLobby(playerLobbyCode, userId);
            }
            joinLobby(lobbyCode as string, userId, playerName);
        }
        return () => { loaded = false };
    }, [userFetched, playerName]);

    useEffect(() => {
        // Listening for when players join or leave lobby
        let loaded = true;
        let unsubscribe: () => void;
        if (loaded) { unsubscribe = subscribeLobby(lobbyCode as string); }
        return () => { loaded = false; unsubscribe(); }
    }, [lobbyCode]);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="flex relative h-[100vh] w-full justify-center items-center bg-slate-950">
                <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
                <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>

                {gameState === GAME_STATE.GAME ?
                    <Game />
                    : gameState === GAME_STATE.FINISHED ?
                        <Results />
                        :
                        <Pregame />
                }

            </div>
        </Suspense>
    );
}