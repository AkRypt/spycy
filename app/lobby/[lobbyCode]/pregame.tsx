"use client";

import { useEffect, useRef, useState } from "react";
import { LobbyCode, PrimaryButton, TextInput } from "@/app/components";
import { constants, GAME_STATE, PLAY_MODE } from "@/app/constants";
import { Player } from "@/app/interfaces";
import { formatCategoryLabel } from "@/app/words";
import { useUser } from "@/hooks";
import useLobby from "@/hooks/useLobby";
import {
    addHotseatPlayer,
    removePlayer,
    setEnabledCategories,
    setPlayerSpectator,
    updateLobby,
} from "@/utils/firebase/firebaseHelpers";
import {
    isLocalHotseatCode,
    localAddPlayer,
    localRemovePlayer,
    localSetCategories,
    localSetWordPacks,
    localStartReveal,
} from "@/utils/localLobby";
import { modeFromPlayMode, trackRoundStart } from "@/utils/analytics";

export default function Pregame() {
    const { lobbyCode, players, playMode, hostId, enabledCategories } = useLobby();
    const { userId } = useUser();
    const [hotseatName, setHotseatName] = useState("");
    const [error, setError] = useState("");
    const [starting, setStarting] = useState(false);
    const [catalog, setCatalog] = useState<string[]>([]);
    const [packs, setPacks] = useState<Record<string, string[]>>({});
    const [packsState, setPacksState] = useState<"loading" | "ready" | "error">("loading");

    const local = playMode === PLAY_MODE.HOTSEAT && isLocalHotseatCode(String(lobbyCode || ""));
    const isHost = local || hostId === userId;
    const activeCount = (players || []).filter((p: Player) => !p.isSpectator).length;
    const saved = Array.isArray(enabledCategories) ? enabledCategories : null;
    const selectable = catalog.filter((id) => (packs[id] || []).length > 0);
    const enabled = saved ? selectable.filter((id) => saved.includes(id)) : selectable;
    const enabledRef = useRef(enabled);
    enabledRef.current = enabled;
    const canStart = packsState === "ready" && activeCount >= constants.minPlayers && enabled.length > 0;

    useEffect(() => {
        let cancel = false;
        (async () => {
            try {
                const res = await fetch("/api/words", { cache: "no-store" });
                const data = await res.json().catch(() => null);
                if (cancel) return;
                if (!res.ok || !data?.ok || !data.packs) {
                    setPacksState("error");
                    return;
                }
                const next = data.packs as Record<string, string[]>;
                const ids = Object.keys(next).sort();
                setPacks(next);
                setCatalog(ids);
                setPacksState("ready");
                if (isLocalHotseatCode(String(lobbyCode || ""))) localSetWordPacks(next);
            } catch {
                if (!cancel) setPacksState("error");
            }
        })();
        return () => {
            cancel = true;
        };
    }, [lobbyCode]);

    const toggleCategory = (id: string) => {
        if (!isHost) return;
        const current = enabledRef.current;
        const next = current.includes(id)
            ? current.filter((category) => category !== id)
            : [...current, id].sort();
        enabledRef.current = next;
        if (local) {
            localSetCategories(next);
            return;
        }
        setEnabledCategories(String(lobbyCode), next).catch(() => {
            setError("Could not update categories");
        });
    };

    const startGame = async () => {
        if (!canStart || starting) return;
        setStarting(true);
        setError("");
        const chosen = enabledRef.current;
        if (local) {
            localSetCategories(chosen);
            localSetWordPacks(packs);
            const result = localStartReveal();
            if (!result.ok) {
                setError(result.error || "Could not start");
                setStarting(false);
                return;
            }
            trackRoundStart({
                mode: "pass_and_play",
                playerCount: result.playerCount ?? activeCount,
                deckId: result.category || "unknown",
                round: result.round ?? 1,
                lobbyCode: String(lobbyCode || ""),
            });
            return;
        }
        const result = await updateLobby(lobbyCode as string, {
            gameState: GAME_STATE.REVEAL,
            enabledCategories: chosen,
        });
        if (!result?.ok) {
            setError((result as any)?.error || "Could not start — need enough players.");
            setStarting(false);
            return;
        }
        const dealt = result.data?.currentGame;
        trackRoundStart({
            mode: modeFromPlayMode(playMode),
            playerCount: activeCount,
            deckId: dealt?.category || "unknown",
            round: dealt?.round ?? 1,
            lobbyCode: String(lobbyCode || ""),
        });
    };

    const addSeat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (local) {
            const result = localAddPlayer(hotseatName);
            if (!result.ok) {
                setError(result.message || "Could not add player");
                return;
            }
        } else {
            const result = await addHotseatPlayer(lobbyCode as string, hotseatName);
            if (!result.ok) {
                setError(result.message || "Could not add player");
                return;
            }
        }
        setHotseatName("");
        setError("");
    };

    const onRemove = (targetId: string) => {
        if (local) localRemovePlayer(targetId);
        else removePlayer(lobbyCode as string, targetId);
    };

    return (
        <div className="flex flex-1 flex-col animate-riseIn">
            <LobbyCode text={lobbyCode} />

            <div className="flex items-center justify-between mb-4 gap-2">
                <h2 className="text-2xl font-bold">Players</h2>
                <span className="text-xs uppercase tracking-wider text-[var(--spycy-muted)] px-2 py-1 rounded-full border border-white/10 shrink-0">
                    {playMode === PLAY_MODE.HOTSEAT ? "Pass & play" : "Online"} · {activeCount}/{constants.maxPlayers}
                </span>
            </div>

            <div className="flex flex-col gap-2 mb-4">
                {(players || []).map((player: Player) => (
                    <div
                        key={player.userId}
                        className="spycy-panel flex items-center justify-between rounded-xl px-4 py-3"
                    >
                        <div className="min-w-0">
                            <p className="text-lg font-semibold truncate">
                                {player.name}
                                {!local && player.userId === userId ? (
                                    <span className="text-[var(--spycy-muted)] text-sm"> (you)</span>
                                ) : null}
                            </p>
                            <p className="text-xs text-[var(--spycy-muted)]">
                                {player.isHost || player.userId === hostId ? "Host" : player.isSpectator ? "Spectator" : "Player"}
                                {typeof player.score === "number" ? ` · ${player.score} pts` : ""}
                            </p>
                        </div>
                        {isHost && (
                            <div className="flex gap-2 shrink-0">
                                {!local && playMode !== PLAY_MODE.HOTSEAT && (
                                    <button
                                        type="button"
                                        className="text-xs px-2 py-1 rounded-lg border border-white/15 text-[var(--spycy-muted)] hover:text-white"
                                        onClick={() =>
                                            setPlayerSpectator(lobbyCode as string, player.userId, !player.isSpectator)
                                        }
                                    >
                                        {player.isSpectator ? "Play" : "Spectate"}
                                    </button>
                                )}
                                {(local || player.userId !== userId) && (players || []).length > 1 && (
                                    <button
                                        type="button"
                                        className="text-xs px-2 py-1 rounded-lg border border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
                                        onClick={() => onRemove(player.userId)}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {(!players || players.length === 0) && (
                    <p className="text-center text-[var(--spycy-muted)] py-6">
                        Add everyone who will pass the phone.
                    </p>
                )}
            </div>

            {playMode === PLAY_MODE.HOTSEAT && (
                <form onSubmit={addSeat} className="flex gap-2 mb-4">
                    <TextInput
                        value={hotseatName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setHotseatName(e.target.value.slice(0, 16))
                        }
                        placeholder="Player name"
                        autoCapitalize="words"
                        maxLength={16}
                        className="flex-1"
                    />
                    <PrimaryButton type="submit" text="Add" variant="secondary" disabled={!hotseatName.trim()} />
                </form>
            )}

            {error && <p className="text-rose-400 text-sm text-center mb-3">{error}</p>}

            <div className="mb-4">
                <div className="flex items-baseline justify-between gap-2 mb-2">
                    <h2 className="text-sm uppercase tracking-[0.16em] text-rose-400">Categories</h2>
                    <span className="text-xs text-[var(--spycy-muted)]">
                        {enabled.length}/{catalog.length} on
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {packsState === "loading" && (
                        <p className="text-sm text-[var(--spycy-muted)]">Loading categories…</p>
                    )}
                    {packsState === "error" && (
                        <p className="text-sm text-rose-300">Could not load word packs.</p>
                    )}
                    {packsState === "ready" && catalog.length === 0 && (
                        <p className="text-sm text-[var(--spycy-muted)]">No word packs yet. Add some in /admin.</p>
                    )}
                    {catalog.map((id) => {
                        const words = packs[id] || [];
                        const on = enabled.includes(id);
                        return (
                            <button
                                key={id}
                                type="button"
                                aria-pressed={on}
                                disabled={!isHost || words.length === 0}
                                onClick={() => toggleCategory(id)}
                                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                                    on
                                        ? "border-rose-400/50 bg-rose-500/20 text-white"
                                        : "border-white/15 bg-transparent text-[var(--spycy-muted)]"
                                } disabled:opacity-80`}
                            >
                                {formatCategoryLabel(id)}
                                {words.length === 0 ? " (empty)" : ""}
                            </button>
                        );
                    })}
                </div>
                {packsState === "ready" && enabled.length === 0 && (
                    <p className="text-amber-300 text-sm mt-2">Turn on at least one category.</p>
                )}
            </div>

            <p className="text-center text-sm text-[var(--spycy-muted)] mb-3">
                Need at least {constants.minPlayers} players. The word comes from the categories left on.
            </p>

            {isHost ? (
                <PrimaryButton
                    text={starting ? "Starting…" : "Start game"}
                    onClick={startGame}
                    disabled={!canStart || starting}
                    className="w-full mt-auto"
                />
            ) : (
                <p className="text-center text-[var(--spycy-muted)] mt-auto py-4">Waiting for host to start…</p>
            )}
        </div>
    );
}
