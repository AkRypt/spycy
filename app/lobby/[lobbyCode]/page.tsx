'use client';

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import state from "../../context";
import { joinLobby, subscribeToLobbyChanges, unjoinLobby } from "@/utils/supabase/supabaseHelper";
import { Player } from "@/app/interfaces";

export function Lobby() {
    const { lobbyCode } = useParams();
    const router = useRouter();
    const [players, setPlayers] = useState<Player[]>([]);

    // Makes the player join the lobby
    useEffect(() => {
        let isRedirecting = false;
        if (!localStorage.getItem('lobbyCode')) {
            joinLobby(lobbyCode as string)
                .then((res) => {
                    if (!res?.ok) {
                        if (isRedirecting) return;
                        isRedirecting = true;
                        alert(res?.message);
                        router.push(`/`);
                    }
                    localStorage.setItem('lobbyCode', lobbyCode as string);
                    setPlayers(res?.data?.players || []);
                })
        }

        // Set up real-time listener
        const subscription = subscribeToLobbyChanges(lobbyCode as string, (updatedPlayers) => {
            console.log('Received updated players:', updatedPlayers);
            setPlayers(updatedPlayers);
        });

        const handleBeforeUnload = () => {
            localStorage.removeItem('lobbyCode');
            unjoinLobby(lobbyCode as string);
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            isRedirecting = true;
            subscription.unsubscribe();
            window.removeEventListener('beforeunload', handleBeforeUnload);
            unjoinLobby(lobbyCode as string);
        };
    }, [lobbyCode, router]);

    return (
        <main className="min-h-screen md:px-10">
            {lobbyCode}
            {players.map((player) => (
                <div key={player.name}>{player.name}</div>
            ))}
        </main>
    );
}

// This is used when the page is receiving some data from the previous page.
const SuspenseWrapper = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <Lobby />
    </Suspense>
)

export default SuspenseWrapper;