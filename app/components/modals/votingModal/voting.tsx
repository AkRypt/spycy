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
        <div className="flex flex-col">
            <h2 className="text-center text-xl font-bold">Vote for the Spy</h2>
            <p className="text-center text-md my-2">Time remaining: {remainingTime} seconds</p>
            <select
                className="mt-2 mb-6 bg-gray-700 text-lg rounded-md p-2"
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
                        className="text-xl"
                    />
                    :
                    <p>Your vote has been cast. Waiting for other players...</p>
            }
        </div>
    )
};