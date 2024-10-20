'use client';
import { useEffect, useState } from 'react';
import { generateLobbyCode } from '../../utils';
import { addWordsToFirestore, createLobby, getRandomWord } from '@/utils/firebase/firebaseHelpers';
import { constants } from '../constants';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks';
import { Background, PrimaryButton, TextInput } from '../components';

export default function MainMenu() {
    const router = useRouter();
    const [lobbyCode, setLobbyCode] = useState('');
    const { userFetched, playerLobbyCode } = useUser();
    const [randomWord, setRandomWord] = useState<any>('');

    useEffect(() => {
        if (userFetched && playerLobbyCode) {
            router.push(`/lobby/${playerLobbyCode}`);
        }
    }, [userFetched, playerLobbyCode]);

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

    const getRando = () => {
        setRandomWord(getRandomWord());
    };

    return (
        <Background>


            <div className="flex flex-col items-center justify-center items-center rounded-xl z-10 mt-[30%] p-6 w-[100%] max-w-md">

                {/* Logo */}
                <div className="mb-6 relative">
                    <h1 className="text-6xl font-bold text-center bg-gradient-to-r from-pink-500 to-red-500 text-transparent bg-clip-text relative z-10">
                        spYcy
                    </h1>
                    <h1 className="text-6xl font-bold text-center text-red-600 absolute top-0 left-0 right-0 blur-md opacity-100 animate-pulse">
                        spYcy
                    </h1>
                </div>

                {/* Join Game Input and Button */}
                <p className="text-xl text-white w-full px-1 text-center mb-2">Have a code?</p>
                <form className="flex flex-col w-full gap-2"
                    onSubmit={joinGame}>
                    <TextInput
                        name="lobbyCode"
                        value={lobbyCode}
                        onChange={(e: any) => setLobbyCode(e.target.value.toLowerCase())}
                        placeholder="Enter game code"
                        className="text-center"
                    />
                    <PrimaryButton
                        type="submit"
                        text="Join Game"
                        disabled={lobbyCode.length !== constants.lobbyCodeLength}
                        className="w-full"
                    />
                </form>

                <div className="flex items-center w-full my-4">
                    <div className="flex-grow h-0.5 bg-gray-700"></div>
                    <span className="flex-shrink text-md mx-4 text-gray-500">or</span>
                    <div className="flex-grow h-0.5 bg-gray-700"></div>
                </div>

                {/* Create Game Button */}
                <p className="text-xl text-white w-full text-center px-1 mb-2">Are you the host?</p>
                <div className="w-full">
                    <PrimaryButton
                        onClick={createGame}
                        text="Create Game"
                        className="w-full"
                    />
                </div>

            </div>
        </Background>
    );
}