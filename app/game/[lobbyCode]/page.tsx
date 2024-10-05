'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { joinLobby, subscribeToLobbyChanges, unjoinLobby } from "@/utils/supabase/supabaseHelper";
import { Player } from "@/app/interfaces";
import { SPY } from "@/app/constants";

export default function GamePage() {
    const { lobbyCode } = useParams();
    const router = useRouter();
    const [players, setPlayers] = useState<Player[]>([]);

    // Makes the player join the lobby
    useMemo(() => {
        joinLobby(lobbyCode as string)
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
    }, []);

    // Removes player from the lobby when the page is unloaded
    useEffect(() => {
        const handleUnload = () => {
            localStorage.removeItem(SPY.lobbyCode);
            unjoinLobby(lobbyCode as string);
        };
        window.addEventListener('beforeunload', handleUnload);
        return () => {
            window.removeEventListener('beforeunload', handleUnload);
            handleUnload();
        };
    }, []);

    // Listening for when players join or leave lobby
    useEffect(() => {
        const subscription = subscribeToLobbyChanges(lobbyCode as string, (lobby) => {
            setPlayers(lobby.players);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const startGame = () => {
        router.push(`/game/${lobbyCode}`);
    }

    return (
        <div className="min-h-screen md:px-10">
            {lobbyCode}
            {players.map((player) => (
                <div key={player.name}>{player.name}</div>
            ))}
            <button onClick={startGame}>Start</button>
        </div>
    );
}