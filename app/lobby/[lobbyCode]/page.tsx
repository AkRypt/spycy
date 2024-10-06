"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
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
        <>
            {gameState === GAME_STATE.GAME ?
                <Game />
                : gameState === GAME_STATE.FINISHED ?
                    <Results />
                    :
                    <Pregame />
            }
        </>
    );
}