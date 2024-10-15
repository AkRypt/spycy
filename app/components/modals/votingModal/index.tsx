"use client";

import { useEffect, useMemo, useState } from "react";
import { useLobby, useUser } from "@/hooks";
import state from "@/app/context";
import { useSnapshot } from "valtio";
import { castVote, getVotingResults } from "@/utils/firebase/firebaseHelpers";
import Voting from "./voting";
import VoteResults from "./voteResults";

export default function VotingModal({ endGame }: { endGame: () => void }) {
    const snap = useSnapshot(state);
    const { userId } = useUser();
    const { currentGame, lobbyCode } = useLobby();
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [remainingTime, setRemainingTime] = useState(30); // 30 seconds voting time
    const [hasVoted, setHasVoted] = useState(false);

    const showModal = useMemo(() => snap.showVotingModal, [snap.showVotingModal]);

    useEffect(() => {
        let loaded = true;
        let interval: any;
        if (loaded && currentGame?.votingEndTime) {
            interval = setInterval(() => {
                const now = Date.now();
                const startTime = currentGame.votingStartTime.toMillis ? currentGame.votingStartTime.toMillis() : currentGame.votingStartTime;
                const elapsed = now - startTime;
                const remaining = Math.max(0, currentGame.votingDuration - elapsed / 1000);
                setRemainingTime(Math.floor(remaining));

                if (remaining <= 0) {
                    clearInterval(interval);
                    finishVoting();
                }
            }, 1000);
        }
        return () => { loaded = false; clearInterval(interval) };
    }, [currentGame?.votingStartTime, currentGame?.votingDuration]);

    useEffect(() => {
        if (currentGame?.votingComplete) {
            finishVoting();
        }
    }, [currentGame?.votingComplete]);

    const handleVote = async () => {
        if (selectedPlayer && !hasVoted) {
            await castVote(lobbyCode, userId, selectedPlayer);
            setHasVoted(true);
        }
    };

    const finishVoting = async () => {
        // state.showVotingModal = false;
        const results = await getVotingResults(lobbyCode);
        // onVotingComplete(results);
    };

    return (
        showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded">
                    {!currentGame?.votingComplete
                        ? <Voting
                            remainingTime={remainingTime}
                            selectedPlayer={selectedPlayer}
                            setSelectedPlayer={setSelectedPlayer}
                            hasVoted={hasVoted}
                            handleVote={handleVote}
                        />
                        :
                        <VoteResults endGame={endGame} />
                    }
                </div>
            </div>
        )
    )
};