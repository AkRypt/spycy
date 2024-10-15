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
        <div>
            <h2>Voting Results</h2>
            <p>The spy is {getPlayerName(currentGame?.spy, players)}</p>
            {voteResults && (
                <>
                    <p>The player with the most votes: {
                        getPlayerName(voteResults?.mostVotedId, players)}
                    </p>
                    <p>
                        {voteResults.isSpy
                            ? "The group successfully identified the spy!"
                            : "The group voted out a defender!"}
                    </p>
                </>
            )}
            <PrimaryButton
                text="End Game"
                onClick={endGame}
            />
        </div>
    )
};