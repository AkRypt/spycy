'use client';
import { useEffect, useState } from 'react';
import { generateLobbyCode } from '../../utils';
import { addWordsToFirestore, createLobby, getRandomWord } from '@/utils/firebase/firebaseHelpers';
import { constants } from '../constants';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks';
import { PrimaryButton, TextInput } from '../components';

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
        <div className="flex relative h-[100vh] w-full justify-center items-center bg-slate-950">
            <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>
            <div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div>

            <div className="flex flex-col items-center justify-center bg-white rounded-xl p-10">
                {/* Logo */}
                <div>
                    {/* <img src="path/to/logo.png" alt="Logo" /> */}
                    <h1>spYcy</h1>
                </div>


                {/* Join Game Input and Button */}
                <p className="text-sm w-full px-1 mt-4">Have a code?</p>
                <form className="flex items-center justify-center border gap-2"
                    onSubmit={joinGame}>
                    <TextInput />
                    <PrimaryButton
                        type="submit"
                        text="Join Game"
                        disabled={lobbyCode.length !== constants.lobbyCodeLength}
                    />
                </form>

                <hr className="w-full h-1 bg-gray-500 rounded my-4" />

                {/* Create Game Button */}
                <div>
                    <PrimaryButton 
                        onClick={createGame}
                        text="Create Game"
                    />
                </div>

                {/* These are Miscelleaneous */}
                <br /><br />
                <p>Miscellaneous:</p>
                <button onClick={addWordsToFirestore}>Add Words</button>
                <button onClick={getRando}>Get Random Word</button>
                <p>{randomWord}</p>
            </div>
        </div>
    );
}