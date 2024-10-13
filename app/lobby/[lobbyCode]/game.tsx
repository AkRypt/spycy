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
        <>
            <VotingModal endGame={endGame} />
            <div className="min-h-screen md:px-10">
                <h1>GAME SCREEN</h1>
                <p>Lobby Code: {lobbyCode}</p>
                <p>{userId === currentGame?.spy ? SPY.YOU_ARE_SPY : SPY.YOU_ARE_DEFENDER}</p>
                <p>Word: {currentGame?.word}</p>
                <p>Time Remaining: {formatTime(remainingTime)}</p>
                <button onClick={endGame}>End Game</button>
                <button onClick={startVotingPhase}>Start Voting</button>
            </div>
        </>
    );
}