'use client';
import { useState } from 'react';
import { generateLobbyCode } from '../../utils';
import { createLobby } from '@/utils/supabase/supabaseHelper';
import { constants } from '../constants';
import { useRouter } from 'next/navigation';

export default function MainMenu() {
    const router = useRouter();
    const [lobbyCode, setLobbyCode] = useState('');

    const createGame = () => {
        const newLobbyCode = generateLobbyCode();
        createLobby(newLobbyCode)
            .then(() => {
                router.push(`/lobby/${newLobbyCode}`);
            })
            .catch((error) => {
                console.error('Error creating lobby:', error);
            });
    };

    const joinGame = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.push(`/lobby/${lobbyCode}`);
    };

    return (
        <div>
            {/* Logo */}
            <div>
                <img src="path/to/logo.png" alt="Logo" />
            </div>

            {/* Create Game Button */}
            <button onClick={createGame}>
                Create Game
            </button>

            {/* Join Game Input and Button */}
            <form onSubmit={joinGame}>
                <input
                    type="text"
                    placeholder="Enter game code"
                    onChange={(e) => setLobbyCode(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={lobbyCode.length !== constants.lobbyCodeLength}
                >
                    Join Game
                </button>
            </form>
        </div>
    );
}