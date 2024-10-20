"use client";

import { getPlayerName } from "@/app/helpers";
import { useGame, useLobby } from "@/hooks";
import { PrimaryButton } from "@/app/components";

export default function VoteResults({
    endGame
}: {
    endGame: () => void;
}) {
    const { players, currentGame } = useLobby();
    const { voteResults } = useGame();

    return (
        <div className="flex flex-col">
            <h2 className="text-center text-lg font-bold">Voting Results</h2>
            <p className="text-center text-2xl my-3">The spy is {getPlayerName(currentGame?.spy, players)}</p>
            {voteResults && (
                <>
                    <p className="text-center text-lg my-2">Most votes: {
                        getPlayerName(voteResults?.mostVotedId, players)}
                    </p>

                    {voteResults.isSpy
                        ?
                        <p className="text-center text-bold text-2xl text-cyan-500 my-2">
                            Defenders Win!
                        </p>
                        :
                        <p className="text-center text-bold text-2xl text-red-500 my-2">
                            Spy Wins!
                        </p>
                    }
                </>
            )}
            <PrimaryButton
                text="End Game"
                onClick={endGame}
                className="text-xl mt-4"
            />
        </div>
    )
};