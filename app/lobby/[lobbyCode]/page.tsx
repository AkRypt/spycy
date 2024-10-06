"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { joinLobby, subscribeLobby, unjoinLobby, updateLobby } from "@/utils/firebase/firebaseHelpers";
import { Player } from "@/app/interfaces";
import { GAME_STATE, SPY } from "@/app/constants";
import { useUser } from "@/hooks";
import useLobby from "@/hooks/useLobby";
import Pregame from "./pregame";
import Game from "./game";
import Results from "./results";

export default function Lobby() {
    const { lobbyCode } = useParams();
    const router = useRouter();
    const { userId, userFetched, playerName, playerLobbyCode } = useUser();
    const { gameState } = useLobby();
    const [players, setPlayers] = useState<Player[]>([]);

    // Makes the player join the lobby
    useEffect(() => {
        let loaded = true;
        if (loaded) {
            if (!userFetched) return;
            // Return if the player is already in the lobby
            if (playerLobbyCode === lobbyCode) return;
            // Return if the player is in a different lobby
            if (playerLobbyCode !== lobbyCode) {
                unjoinLobby(playerLobbyCode, userId)
            }

            // Join the lobby
            joinLobby(lobbyCode as string, userId, playerName)
                .then((res) => {
                    if (!res?.ok) {
                        alert(res?.message);
                        router.push('/');
                        return;
                    }
                    localStorage.setItem(SPY.lobbyCode, lobbyCode as string);
                    setPlayers(res?.data?.players || []);
                })
                .catch((error) => {
                    console.error("Error joining lobby:", error);
                });
        }
        return () => { loaded = false };
    }, [userFetched]);

    // Listening for when players join or leave lobby
    useEffect(() => {
        let loaded = true;
        let unsubscribe: () => void;
        if (loaded) {
            unsubscribe = subscribeLobby(lobbyCode as string, (updatedLobby) => {
                console.log("updatedLobby", updatedLobby);
                if (updatedLobby) {
                    setPlayers(updatedLobby.players);
                } else {
                    // Handle case where lobby doesn't exist
                    console.log("Lobby not found or error occurred");
                }
            });
        }

        // Cleanup subscription on component unmount
        return () => {
            loaded = false;
            unsubscribe();
        }
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