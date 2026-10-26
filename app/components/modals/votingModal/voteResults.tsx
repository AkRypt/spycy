"use client";

import { getPlayerName } from "@/app/helpers";
import { useLobby } from "@/hooks";
import { Player } from "@/app/interfaces";
import { PrimaryButton } from "@/app/components";
import state from "@/app/context";

export default function VoteResults() {
    const { players, currentGame } = useLobby();
    const voteResults = currentGame?.voteResults;

    return (
        <div className="flex flex-col text-center">
            <h2 className="text-lg font-bold mb-2">Voting results</h2>
            <p className="text-2xl my-2">
                Spy was <span className="text-rose-300 font-bold">{getPlayerName(currentGame?.spy, players as Player[])}</span>
            </p>
            {voteResults && (
                <>
                    <p className="text-[var(--spycy-muted)] my-1">
                        Most votes: {getPlayerName(voteResults.mostVotedId, players as Player[])}
                    </p>
                    <p className={`text-3xl font-bold my-3 ${voteResults.isSpy ? "text-cyan-300" : "text-rose-300"}`}>
                        {voteResults.isSpy ? "Defenders win!" : "Spy wins!"}
                    </p>
                </>
            )}
            <PrimaryButton
                text="See scoreboard"
                onClick={() => {
                    state.showVotingModal = false;
                }}
                className="w-full mt-2"
            />
        </div>
    );
}
