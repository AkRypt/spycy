"use client";

import { Player } from "@/app/interfaces";
import { useLobby } from "@/hooks";
import { PrimaryButton } from "@/app/components";

export default function Voting({
    remainingTime,
    selectedPlayer,
    setSelectedPlayer,
    hasVoted,
    handleVote
}: {
    remainingTime: number;
    selectedPlayer: string;
    setSelectedPlayer: (playerId: string) => void;
    hasVoted: boolean;
    handleVote: () => void;
}) {
    const { players } = useLobby();

    return (
        <div>
            <h2>Vote for the Spy</h2>
            <p>Time remaining: {remainingTime} seconds</p>
            <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                disabled={hasVoted}
            >
                <option value="">Select a player</option>
                {players?.map((player: Player) => (
                    <option key={player.userId} value={player.userId}>
                        {player.name}
                    </option>
                ))}
            </select>
            {
                !hasVoted ?
                    <PrimaryButton
                        text="Cast Vote"
                        onClick={handleVote}
                        disabled={hasVoted}
                    />
                    :
                    <p>Your vote has been cast. Waiting for other players...</p>
            }
        </div>
    )
};