"use client";

import { useState } from "react";
import { LobbyCode } from "@/app/components";
import PassScreen from "@/app/components/PassScreen";
import RoleReveal from "@/app/components/RoleReveal";
import { PLAY_MODE, SPY } from "@/app/constants";
import { activePlayers } from "@/app/helpers";
import { Player } from "@/app/interfaces";
import { useUser } from "@/hooks";
import useLobby from "@/hooks/useLobby";
import { advanceReveal, startDiscussPhase } from "@/utils/firebase/firebaseHelpers";
import { isLocalHotseatCode, localAdvanceReveal } from "@/utils/localLobby";

export default function Reveal() {
    const { lobbyCode, players, currentGame, playMode, hostId } = useLobby();
    const { userId } = useUser();
    const [waitingPass, setWaitingPass] = useState(true);
    const [localDone, setLocalDone] = useState(false);

    const seats = activePlayers((players || []) as Player[]);
    const index = currentGame?.revealIndex ?? 0;
    const currentSeat = seats[index];
    const isHotseat = playMode === PLAY_MODE.HOTSEAT;
    const local = isHotseat && isLocalHotseatCode(String(lobbyCode || ""));
    const isHost = local || hostId === userId;

    if (!currentSeat) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center">
                <LobbyCode text={lobbyCode} />
                <p className="text-[var(--spycy-muted)]">Preparing roles…</p>
            </div>
        );
    }

    if (!isHotseat) {
        const me = seats.find((p) => p.userId === userId);
        const myRole = me?.role || (currentGame?.spy === userId ? SPY.SPY : SPY.DEFENDER);

        return (
            <div className="flex flex-1 flex-col">
                <LobbyCode text={lobbyCode} />
                {localDone ? (
                    <div className="flex flex-1 flex-col items-center justify-center text-center animate-fadeIn">
                        <p className="text-2xl font-bold mb-2">Role locked in</p>
                        <p className="text-[var(--spycy-muted)] mb-8 max-w-xs">
                            Keep it secret. Wait for everyone, then the host starts discussion.
                        </p>
                        {isHost && (
                            <button
                                type="button"
                                className="touch-target w-full rounded-xl border-2 border-rose-400/40 bg-gradient-to-r from-rose-600 to-pink-500 px-5 py-3 text-lg font-semibold"
                                onClick={() => startDiscussPhase(lobbyCode as string)}
                            >
                                Start discussion
                            </button>
                        )}
                    </div>
                ) : (
                    <RoleReveal
                        playerName={me?.name || "You"}
                        role={myRole}
                        word={currentGame?.word}
                        onDone={() => setLocalDone(true)}
                    />
                )}
            </div>
        );
    }

    if (waitingPass) {
        return (
            <div className="flex flex-1 flex-col">
                <LobbyCode text={lobbyCode} />
                <PassScreen
                    playerName={currentSeat.name}
                    subtitle={`Player ${index + 1} of ${seats.length}. Others look away.`}
                    onReady={() => setWaitingPass(false)}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col">
            <LobbyCode text={lobbyCode} />
            <RoleReveal
                playerName={currentSeat.name}
                role={currentSeat.role || (currentGame?.spy === currentSeat.userId ? SPY.SPY : SPY.DEFENDER)}
                word={currentGame?.word}
                onDone={async () => {
                    setWaitingPass(true);
                    if (local) localAdvanceReveal();
                    else await advanceReveal(lobbyCode as string);
                }}
            />
        </div>
    );
}
