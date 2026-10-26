"use client";

import { useEffect, useMemo, useState } from "react";
import { LobbyCode, PrimaryButton } from "@/app/components";
import VotingModal from "@/app/components/modals/votingModal";
import { PLAY_MODE, SPY } from "@/app/constants";
import state from "@/app/context";
import { activePlayers, formatTime } from "@/app/helpers";
import { Player } from "@/app/interfaces";
import { useUser } from "@/hooks";
import useLobby from "@/hooks/useLobby";
import { castVote, getVotingResults, startVoting } from "@/utils/firebase/firebaseHelpers";
import {
    isLocalHotseatCode,
    localCastVote,
    localForceFinishVotes,
    localStartVoting,
} from "@/utils/localLobby";
import { formatCategoryLabel } from "@/app/words";
import { useSnapshot } from "valtio";

export default function Game() {
    const snap = useSnapshot(state);
    const { userId } = useUser();
    const { lobbyCode, currentGame, players, playMode, hostId } = useLobby();
    const [remainingTime, setRemainingTime] = useState(currentGame?.timerDuration || 180000);
    const [selected, setSelected] = useState("");
    const [hotseatVoted, setHotseatVoted] = useState(false);

    const isHotseat = playMode === PLAY_MODE.HOTSEAT;
    const local = isHotseat && isLocalHotseatCode(String(lobbyCode || ""));
    const isHost = local || hostId === userId;
    const seats = useMemo(() => activePlayers((players || []) as Player[]), [players]);
    const isSpy = !isHotseat && userId === currentGame?.spy;
    const categoryLabel = formatCategoryLabel(currentGame?.category || "");

    useEffect(() => {
        if (!currentGame?.startTime || currentGame.votingStarted) return;

        const toMs = (t: any) => (t?.toMillis ? t.toMillis() : typeof t === "number" ? t : Date.now());

        const interval = setInterval(() => {
            const startTime = toMs(currentGame.startTime);
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, (currentGame.timerDuration || 180000) - elapsed);
            setRemainingTime(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
                if (isHost) startVotingPhase();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [currentGame?.startTime, currentGame?.votingStarted, currentGame?.timerDuration, isHost]);

    useEffect(() => {
        if (currentGame?.votingStarted && !isHotseat && !snap.showVotingModal) {
            state.showVotingModal = true;
        }
    }, [currentGame?.votingStarted, isHotseat, snap.showVotingModal]);

    useEffect(() => {
        setSelected("");
        setHotseatVoted(false);
    }, [currentGame?.votePassIndex]);

    const startVotingPhase = async () => {
        if (!currentGame?.votingStarted) {
            if (local) localStartVoting();
            else await startVoting(lobbyCode as string);
        }
        if (!isHotseat) {
            state.showVotingModal = true;
        }
    };

    if (isHotseat && currentGame?.votingStarted && !currentGame?.votingComplete) {
        const voteIndex = currentGame.votePassIndex ?? 0;
        const voter = seats[voteIndex];

        if (!voter || voteIndex >= seats.length) {
            if (local) localForceFinishVotes();
            else getVotingResults(lobbyCode as string);
            return (
                <div className="flex flex-1 items-center justify-center">
                    <p className="text-[var(--spycy-muted)]">Tallying votes…</p>
                </div>
            );
        }

        // One screen: pass-to name + ballot (no Continue / Show ballot step)
        return (
            <div className="flex flex-1 flex-col animate-riseIn">
                <LobbyCode text={lobbyCode} />
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--spycy-muted)] text-center mb-2">
                    Pass the phone
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-center mb-1 leading-tight">
                    Pass to <span className="spycy-logo">{voter.name}</span>
                </h2>
                <p className="text-center text-[var(--spycy-muted)] mb-5 text-sm">
                    Vote privately — who is the spy?
                </p>
                <div className="flex flex-col gap-2 mb-6">
                    {seats.map((p) => (
                        <button
                            key={p.userId}
                            type="button"
                            disabled={hotseatVoted}
                            onClick={() => setSelected(p.userId)}
                            className={`touch-target rounded-xl border px-4 py-3 text-left text-lg transition ${
                                selected === p.userId
                                    ? "border-rose-400 bg-rose-500/20"
                                    : "border-white/15 bg-[var(--spycy-panel)]"
                            }`}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
                {!hotseatVoted ? (
                    <PrimaryButton
                        text="Cast vote & hide"
                        disabled={!selected}
                        className="w-full mt-auto"
                        onClick={async () => {
                            if (local) localCastVote(voter.userId, selected);
                            else await castVote(lobbyCode as string, voter.userId, selected);
                            setHotseatVoted(true);
                        }}
                    />
                ) : (
                    <p className="text-center text-[var(--spycy-muted)] mt-auto py-4">Vote locked. Pass to the next player…</p>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 relative animate-riseIn">
            {!isHotseat && <VotingModal />}
            <LobbyCode text={lobbyCode} />

            <div className="spycy-panel rounded-2xl px-4 py-3 mb-4 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--spycy-muted)]">Time remaining</p>
                <p className={`text-4xl font-bold tabular-nums ${remainingTime < 30000 ? "text-rose-400" : "text-white"}`}>
                    {formatTime(remainingTime)}
                </p>
                <p className="text-xs text-[var(--spycy-muted)] mt-1">Round {currentGame?.round || 1}</p>
            </div>

            {!isHotseat ? (
                <div
                    className={`rounded-2xl px-4 py-4 mb-4 text-center border ${
                        isSpy
                            ? "border-rose-500/40 bg-rose-500/15"
                            : "border-cyan-500/40 bg-cyan-500/10"
                    }`}
                >
                    <p className={`text-xl font-bold ${isSpy ? "text-rose-300" : "text-cyan-300"}`}>
                        {isSpy ? SPY.YOU_ARE_SPY : SPY.YOU_ARE_DEFENDER}
                    </p>
                    {categoryLabel && (
                        <p className="mt-3 text-sm uppercase tracking-[0.2em] text-[var(--spycy-muted)]">
                            Category · <span className="text-white tracking-normal normal-case font-semibold">{categoryLabel}</span>
                        </p>
                    )}
                    {!isSpy && (
                        <p className="mt-3 text-3xl font-bold break-words text-white">{currentGame?.word}</p>
                    )}
                    {isSpy && (
                        <p className="mt-2 text-sm text-[var(--spycy-muted)]">
                            You know the category — figure out the word without getting voted out.
                        </p>
                    )}
                </div>
            ) : (
                <div className="spycy-panel rounded-2xl px-4 py-6 mb-4 text-center">
                    <p className="text-lg font-semibold mb-2">Discussion</p>
                    {categoryLabel && (
                        <p className="text-sm text-[var(--spycy-muted)] mb-3">
                            Category · <span className="text-white font-semibold">{categoryLabel}</span>
                        </p>
                    )}
                    <p className="text-[var(--spycy-muted)] text-sm text-balance">
                        Ask questions out loud. Defenders know the word — the spy only knows the category. When time&apos;s up, pass the phone to vote.
                    </p>
                </div>
            )}

            <div className="mt-auto flex flex-col gap-3 pb-2">
                {isHost && !currentGame?.votingStarted && (
                    <PrimaryButton text="Start voting" onClick={startVotingPhase} className="w-full" />
                )}
                {!isHost && !currentGame?.votingStarted && (
                    <p className="text-center text-sm text-[var(--spycy-muted)]">Host can open voting early.</p>
                )}
            </div>
        </div>
    );
}
