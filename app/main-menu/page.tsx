'use client';
import { useEffect, useState } from 'react';
import { generateLobbyCode } from '../../utils';
import { createLobby, unjoinLobby } from '@/utils/firebase/firebaseHelpers';
import { createLocalHotseat } from '@/utils/localLobby';
import { constants, PLAY_MODE } from '../constants';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks';
import { Background, PrimaryButton, TextInput } from '../components';
import {
    clearSuppressRejoin,
    shouldSuppressRejoin,
} from '@/utils/lobbyLeave';
import { rockSalt } from '../fonts';
import { trackLobbyCreated } from '@/utils/analytics';

export default function MainMenu() {
    const router = useRouter();
    const [lobbyCode, setLobbyCode] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const { userFetched, playerLobbyCode, userId, playerName } = useUser();

    useEffect(() => {
        if (!userFetched) return;

        // After Leave: stay on menu and scrub any leftover Firestore membership
        // so a later reload cannot auto-rejoin. Do not clear the suppress flag
        // here — only intentional create/join clears it.
        if (shouldSuppressRejoin()) {
            if (playerLobbyCode && userId) {
                void unjoinLobby(playerLobbyCode, userId);
            }
            return;
        }

        if (playerLobbyCode) {
            router.replace(`/lobby/${playerLobbyCode}`);
        }
    }, [userFetched, playerLobbyCode, userId, router]);

    const createOnline = async () => {
        if (!userId || busy) return;
        setBusy(true);
        setError('');
        try {
            clearSuppressRejoin();
            const newLobbyCode = generateLobbyCode();
            const result = await createLobby(newLobbyCode, userId, PLAY_MODE.ONLINE);
            if (result.ok) {
                trackLobbyCreated('online');
                router.push(`/lobby/${newLobbyCode}`);
            } else {
                setError('Could not create online lobby. Check Firebase Auth (Anonymous) and env keys.');
            }
        } catch (e) {
            console.error(e);
            setError('Online lobby needs a valid Firebase project.');
        } finally {
            setBusy(false);
        }
    };

    const createPassPlay = () => {
        if (busy) return;
        setBusy(true);
        setError('');
        try {
            clearSuppressRejoin();
            const name =
                playerName ||
                (typeof window !== 'undefined' ? localStorage.getItem('playerName') : null) ||
                'Host';
            const lobby = createLocalHotseat(name);
            trackLobbyCreated('pass_and_play');
            router.push(`/lobby/${lobby.lobbyCode}`);
        } catch (e) {
            console.error(e);
            setError('Could not start pass & play.');
        } finally {
            setBusy(false);
        }
    };

    const joinGame = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const code = lobbyCode.trim().toUpperCase();
        if (code.length !== constants.lobbyCodeLength) return;
        clearSuppressRejoin();
        router.push(`/lobby/${code}`);
    };

    return (
        <Background>
            <div className="flex flex-1 flex-col items-center justify-center animate-riseIn py-8">
                <div className="mb-8 relative text-center">
                    <h1 className={`text-6xl sm:text-7xl font-bold relative z-10 spycy-logo ${rockSalt.className}`}>
                        spYcy
                    </h1>
                    <h1
                        aria-hidden
                        className={`text-6xl sm:text-7xl font-bold absolute inset-0 spycy-logo-glow animate-pulse ${rockSalt.className}`}
                    >
                        spYcy
                    </h1>
                    <p className="mt-4 text-[var(--spycy-muted)] text-sm sm:text-base tracking-wide">
                        One spy. One word. Don&apos;t get caught.
                    </p>
                </div>

                <div className="w-full spycy-panel rounded-2xl p-5 sm:p-6">
                    <p className="text-sm uppercase tracking-[0.2em] text-[var(--spycy-muted)] mb-3 text-center">
                        Have a code?
                    </p>
                    <form className="flex flex-col w-full gap-3" onSubmit={joinGame}>
                        <TextInput
                            name="lobbyCode"
                            value={lobbyCode}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setLobbyCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, constants.lobbyCodeLength))
                            }
                            placeholder="Enter code"
                            className="text-center tracking-[0.35em] uppercase"
                            maxLength={constants.lobbyCodeLength}
                            inputMode="text"
                        />
                        <PrimaryButton
                            type="submit"
                            text="Join game"
                            disabled={lobbyCode.length !== constants.lobbyCodeLength}
                            className="w-full"
                        />
                    </form>

                    <div className="flex items-center w-full my-5">
                        <div className="flex-grow h-px bg-white/10" />
                        <span className="mx-3 text-xs uppercase tracking-widest text-[var(--spycy-muted)]">or host</span>
                        <div className="flex-grow h-px bg-white/10" />
                    </div>

                    <div className="flex flex-col gap-3">
                        <PrimaryButton
                            onClick={createPassPlay}
                            text={busy ? "Starting…" : "Pass & play"}
                            className="w-full"
                            disabled={busy}
                        />
                        <PrimaryButton
                            onClick={createOnline}
                            text={busy ? "Creating…" : "Online lobby"}
                            variant="secondary"
                            className="w-full"
                            disabled={busy || !userId}
                        />
                        <p className="text-center text-xs text-[var(--spycy-muted)]">
                            Pass &amp; play works on one phone offline. Online needs Firebase Anonymous Auth.
                        </p>
                        {error && <p className="text-center text-sm text-rose-400">{error}</p>}
                    </div>
                </div>
            </div>
        </Background>
    );
}
