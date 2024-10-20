import { LobbyCode, PrimaryButton } from "@/app/components";
import VotingModal from "@/app/components/modals/votingModal";
import { SPY } from "@/app/constants";
import state from "@/app/context";
import { formatTime } from "@/app/helpers";
import { useUser } from "@/hooks";
import useLobby from "@/hooks/useLobby"
import { startVoting, updateGameSession } from "@/utils/firebase/firebaseHelpers";
import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";

export default function Game() {
    const snap = useSnapshot(state);
    const { userId } = useUser();
    const { lobbyCode, currentGame } = useLobby();
    const [remainingTime, setRemainingTime] = useState(currentGame?.timerDuration || 300000);
    const isSpy = userId === currentGame?.spy;

    useEffect(() => {
        if (currentGame?.startTime && !currentGame.endTime) {
            const interval = setInterval(() => {
                const now = Date.now();
                const startTime = currentGame.startTime.toMillis();
                const elapsed = now - startTime;
                const remaining = Math.max(0, currentGame.timerDuration - elapsed);
                setRemainingTime(remaining);

                if (remaining <= 0) {
                    clearInterval(interval);
                    startVotingPhase();
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [currentGame]);

    useEffect(() => {
        if (currentGame?.votingStarted && !snap.showVotingModal) {
            startVotingPhase();
        }
    }, [snap.showVotingModal, currentGame?.votingStarted]);

    const startVotingPhase = async () => {
        await startVoting(lobbyCode);
        !currentGame?.votingComplete && (state.showVotingModal = true);
    };

    const endGame = () => {
        updateGameSession(lobbyCode, {
            isGameOver: true,
        });
    }

    return (
        <div className="flex flex-col p-4 relative h-[90vh]">
            <VotingModal endGame={endGame} />
            <div className="flex flex-col flex-grow">
                <LobbyCode text={lobbyCode} />

                <p className="text-white text-center text-xl">Time Remaining: {formatTime(remainingTime)}</p>

                <div className="my-6">
                    {isSpy ?
                        <p className="text-xl text-center font-bold bg-red-500 rounded-md py-1 px-2">
                            {SPY.YOU_ARE_SPY}
                        </p>
                        :
                        <p className="text-xl text-center font-bold bg-cyan-500 rounded-md py-1 px-2">
                            {SPY.YOU_ARE_DEFENDER}
                        </p>
                    }
                </div>

                {!isSpy &&
                    <div className="flex-grow flex items-center justify-center">
                        <p className="font-bold text-3xl text-center overflow-wrap break-words text-cyan-500 my-4 mx-2">
                            {currentGame?.word}
                        </p>
                    </div>
                }

                <PrimaryButton
                    text="Start Voting"
                    onClick={startVotingPhase}
                    className="mb-10 mx-auto"
                />
            </div>
        </div>
    );
}