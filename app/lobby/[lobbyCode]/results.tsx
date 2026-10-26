"use client";

import { useEffect } from "react";
import { LobbyCode, PrimaryButton } from "@/app/components";
import { GAME_STATE, PLAY_MODE, SPY } from "@/app/constants";
import state from "@/app/context";
import { getPlayerName } from "@/app/helpers";
import { Player } from "@/app/interfaces";
import useLobby from "@/hooks/useLobby";
import { backToLobby, rematch } from "@/utils/firebase/firebaseHelpers";
import { isLocalHotseatCode, localBackToLobby, localRematch } from "@/utils/localLobby";
import { formatCategoryLabel } from "@/app/words";

export default function Results() {
    const { lobbyCode, gameState, currentGame, players, playMode } = useLobby();
    const results = currentGame?.voteResults;
    const spyName = getPlayerName(currentGame?.spy, players as Player[]);
    const local = playMode === PLAY_MODE.HOTSEAT && isLocalHotseatCode(String(lobbyCode || ""));

    useEffect(() => {
        if (gameState === GAME_STATE.FINISHED) {
            state.showVotingModal = false;
        }
    }, [gameState]);

    const sorted = [...(players || [])].sort(
        (a: Player, b: Player) => (b.score || 0) - (a.score || 0)
    );

    return (
        <div className="flex flex-1 flex-col animate-riseIn">
            <LobbyCode text={lobbyCode} />
            <h2 className="text-center text-2xl font-bold mb-2">Results</h2>

            <div
                className={`rounded-2xl px-4 py-5 mb-5 text-center border ${
                    results?.isSpy
                        ? "border-cyan-500/40 bg-cyan-500/10"
                        : "border-rose-500/40 bg-rose-500/15"
                }`}
            >
                <p className="text-sm text-[var(--spycy-muted)] mb-1">The spy was</p>
                <p className="text-2xl font-bold text-rose-300 mb-3">{spyName || "—"}</p>
                {results ? (
                    <>
                        <p className="text-sm text-[var(--spycy-muted)]">
                            Most votes: {getPlayerName(results.mostVotedId, players as Player[])}
                        </p>
                        <p
                            className={`mt-3 text-3xl font-bold ${
                                results.isSpy ? "text-cyan-300" : "text-rose-300"
                            }`}
                        >
                            {results.isSpy ? "Defenders win!" : "Spy wins!"}
                        </p>
                        <p className="mt-2 text-xs text-[var(--spycy-muted)]">
                            {results.isSpy
                                ? `+${SPY.SPY_VOTE_POINTS} to correct voters`
                                : `+${SPY.SPY_WIN_POINTS} to the spy`}
                        </p>
                    </>
                ) : (
                    <p className="text-[var(--spycy-muted)]">No votes cast this round.</p>
                )}
                {(currentGame?.category || currentGame?.word) && (
                    <p className="mt-4 text-sm text-[var(--spycy-muted)]">
                        {currentGame?.category && (
                            <>
                                Category{" "}
                                <span className="font-semibold text-white">
                                    {formatCategoryLabel(currentGame.category)}
                                </span>
                                {currentGame?.word ? " · " : ""}
                            </>
                        )}
                        {currentGame?.word && (
                            <>
                                Word <span className="font-bold text-white">{currentGame.word}</span>
                            </>
                        )}
                    </p>
                )}
            </div>

            <div className="space-y-2 mb-6">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--spycy-muted)]">Scoreboard</p>
                {sorted.map((player: Player, i: number) => (
                    <div
                        key={player.userId}
                        className="spycy-panel flex justify-between items-center rounded-xl px-4 py-3"
                    >
                        <span className="text-lg">
                            <span className="text-[var(--spycy-muted)] mr-2">{i + 1}.</span>
                            {player.name}
                        </span>
                        <span className="text-xl font-bold tabular-nums">{player.score || 0}</span>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3 mt-auto">
                <PrimaryButton
                    text="Rematch"
                    onClick={() => (local ? localRematch() : rematch(lobbyCode as string))}
                    className="w-full"
                />
                <PrimaryButton
                    text="Back to lobby"
                    onClick={() => (local ? localBackToLobby() : backToLobby(lobbyCode as string))}
                    variant="secondary"
                    className="w-full"
                />
            </div>
        </div>
    );
}
