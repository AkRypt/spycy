"use client";

import { useEffect, useMemo, useState } from "react";
import { useLobby, useUser } from "@/hooks";
import state from "@/app/context";
import { useSnapshot } from "valtio";
import { castVote, getVotingResults } from "@/utils/firebase/firebaseHelpers";
import Voting from "./voting";
import VoteResults from "./voteResults";
import { activePlayers } from "@/app/helpers";
import { Player } from "@/app/interfaces";

export default function VotingModal() {
    const snap = useSnapshot(state);
    const { userId } = useUser();
    const { currentGame, lobbyCode, players } = useLobby();
    const [selectedPlayer, setSelectedPlayer] = useState("");
    const [remainingTime, setRemainingTime] = useState(45);
    const [hasVoted, setHasVoted] = useState(false);

    const showModal = useMemo(() => snap.showVotingModal, [snap.showVotingModal]);
    const voters = activePlayers((players || []) as Player[]);

    useEffect(() => {
        if (!currentGame?.votingStartTime || !currentGame?.votingDuration) return;

        const toMs = (t: any) => (t?.toMillis ? t.toMillis() : typeof t === "number" ? t : Date.now());

        const interval = setInterval(() => {
            const start = toMs(currentGame.votingStartTime);
            const elapsed = Date.now() - start;
            const remainingMs = Math.max(0, currentGame.votingDuration - elapsed);
            setRemainingTime(Math.ceil(remainingMs / 1000));

            if (remainingMs <= 0) {
                clearInterval(interval);
                finishVoting();
            }
        }, 250);

        return () => clearInterval(interval);
    }, [currentGame?.votingStartTime, currentGame?.votingDuration]);

    useEffect(() => {
        if (currentGame?.votingComplete) {
            finishVoting();
        }
    }, [currentGame?.votingComplete]);

    useEffect(() => {
        if (currentGame?.votes?.[userId]) {
            setHasVoted(true);
        }
    }, [currentGame?.votes, userId]);

    const handleVote = async () => {
        if (selectedPlayer && !hasVoted) {
            await castVote(lobbyCode as string, userId, selectedPlayer);
            setHasVoted(true);
        }
    };

    const finishVoting = async () => {
        await getVotingResults(lobbyCode as string);
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 animate-fadeIn p-4">
            <div className="spycy-panel w-full max-w-md rounded-2xl py-6 px-5 sm:px-8 animate-scaleIn max-h-[90dvh] overflow-y-auto">
                {!currentGame?.votingComplete && !currentGame?.voteResults ? (
                    <Voting
                        remainingTime={remainingTime}
                        selectedPlayer={selectedPlayer}
                        setSelectedPlayer={setSelectedPlayer}
                        hasVoted={hasVoted}
                        handleVote={handleVote}
                        players={voters.filter((p) => p.userId !== userId)}
                        voteCount={Object.keys(currentGame?.votes || {}).length}
                        totalVoters={voters.length}
                    />
                ) : (
                    <VoteResults />
                )}
            </div>
        </div>
    );
}
