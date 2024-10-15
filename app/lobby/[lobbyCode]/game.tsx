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
        <div className="bg-white p-4 rounded">
            <VotingModal endGame={endGame} />
            <div className="">
                <LobbyCode text={lobbyCode} />
                <p className="text-xl text-center font-bold bg-red-500 rounded-md py-1 px-2">
                    {isSpy ? SPY.YOU_ARE_SPY : SPY.YOU_ARE_DEFENDER}
                </p>
                {!isSpy &&
                    <p className="font-bold text-xl text-center text-cyan-600 my-3">
                        {currentGame?.word}
                    </p>
                }
                <p>Time Remaining: {formatTime(remainingTime)}</p>
                {/* <PrimaryButton
                    text="End Game"
                    className="mr-1"
                    onClick={endGame}
                /> */}
                <PrimaryButton
                    text="Start Voting"
                    onClick={startVotingPhase}
                />
            </div>
        </div>
    );
}