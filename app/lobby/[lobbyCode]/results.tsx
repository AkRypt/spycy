"use client";

import { useEffect } from "react";
import { LobbyCode, PrimaryButton } from "@/app/components";
import { GAME_STATE, PLAY_MODE, SPY } from "@/app/constants";
import state from "@/app/context";
import { getPlayerName } from "@/app/helpers";
import { Player } from "@/app/interfaces";
import { useUser } from "@/hooks";
import useLobby from "@/hooks/useLobby";
import { modeFromPlayMode, trackGameFinished, trackRoundStart } from "@/utils/analytics";
import { backToLobby, rematch } from "@/utils/firebase/firebaseHelpers";
import { isLocalHotseatCode, localBackToLobby, localRematch } from "@/utils/localLobby";
import { formatCategoryLabel } from "@/app/words";

function startMillis(value: unknown): number | null {
    if (!value) return null;
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "object" && value && "toMillis" in value) {
        const millis = (value as { toMillis?: () => number }).toMillis;
        if (typeof millis === "function") return millis.call(value);
    }
    if (typeof value === "object" && value && "seconds" in value) {
        const seconds = Number((value as { seconds: number }).seconds);
        if (Number.isFinite(seconds)) return seconds * 1000;
    }
    return null;
}

export default function Results() {
    const { lobbyCode, gameState, currentGame, players, playMode, hostId } = useLobby();
    const { userId } = useUser();
    const results = currentGame?.voteResults;
    const spyName = getPlayerName(currentGame?.spy, players as Player[]);
    const local = playMode === PLAY_MODE.HOTSEAT && isLocalHotseatCode(String(lobbyCode || ""));
    const isHost = local || hostId === userId;
    const mode = modeFromPlayMode(local ? PLAY_MODE.HOTSEAT : playMode);

    useEffect(() => {
        if (gameState === GAME_STATE.FINISHED) {
            state.showVotingModal = false;
        }
    }, [gameState]);

    useEffect(() => {
        if (gameState !== GAME_STATE.FINISHED || !currentGame || !isHost) return;
        const start = startMillis(currentGame.startTime);
        const durationS = start ? Math.max(0, Math.round((Date.now() - start) / 1000)) : undefined;
        trackGameFinished({
            mode,
            deckId: currentGame.category || "unknown",
            round: currentGame.round ?? 1,
            lobbyCode: String(lobbyCode || ""),
            durationS,
        });
    }, [gameState, currentGame, isHost, lobbyCode, mode]);

    const onRematch = async () => {
        const count = (players || []).filter((p: Player) => !p.isSpectator).length;
        if (local) {
            const dealt = localRematch();
            if (!dealt.ok) return;
            trackRoundStart({
                mode: "pass_and_play",
                playerCount: dealt.playerCount ?? count,
                deckId: dealt.category || "unknown",
                round: dealt.round ?? 1,
                lobbyCode: String(lobbyCode || ""),
            });
            return;
        }
        const dealt = await rematch(lobbyCode as string);
        if (!dealt?.ok) return;
        trackRoundStart({
            mode: modeFromPlayMode(playMode),
            playerCount: count,
            deckId: dealt.data?.currentGame?.category || "unknown",
            round: dealt.data?.currentGame?.round ?? 1,
            lobbyCode: String(lobbyCode || ""),
        });
    };

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
                    onClick={onRematch}
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
