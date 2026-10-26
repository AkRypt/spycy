"use client";

import { Player } from "@/app/interfaces";
import { PrimaryButton } from "@/app/components";

export default function Voting({
    remainingTime,
    selectedPlayer,
    setSelectedPlayer,
    hasVoted,
    handleVote,
    players,
    voteCount,
    totalVoters,
}: {
    remainingTime: number;
    selectedPlayer: string;
    setSelectedPlayer: (playerId: string) => void;
    hasVoted: boolean;
    handleVote: () => void;
    players: Player[];
    voteCount: number;
    totalVoters: number;
}) {
    return (
        <div className="flex flex-col">
            <h2 className="text-center text-2xl font-bold">Vote for the spy</h2>
            <p className="text-center text-sm text-[var(--spycy-muted)] my-2">
                {remainingTime}s left · {voteCount}/{totalVoters} voted
            </p>
            <div className="flex flex-col gap-2 my-4 max-h-[40vh] overflow-y-auto">
                {players?.map((player) => (
                    <button
                        key={player.userId}
                        type="button"
                        disabled={hasVoted}
                        onClick={() => setSelectedPlayer(player.userId)}
                        className={`touch-target rounded-xl border px-4 py-3 text-left text-lg transition ${
                            selectedPlayer === player.userId
                                ? "border-rose-400 bg-rose-500/20"
                                : "border-white/15 bg-black/20"
                        } disabled:opacity-60`}
                    >
                        {player.name}
                    </button>
                ))}
            </div>
            {!hasVoted ? (
                <PrimaryButton
                    text="Cast vote"
                    onClick={handleVote}
                    disabled={!selectedPlayer}
                    className="w-full"
                />
            ) : (
                <p className="text-center text-[var(--spycy-muted)] py-3">
                    Vote cast. Waiting for others…
                </p>
            )}
        </div>
    );
}
