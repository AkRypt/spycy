"use client";

import { useState } from "react";
import { SPY } from "@/app/constants";
import PrimaryButton from "./buttons/PrimaryButton";

export default function RoleReveal({
    playerName,
    role,
    word,
    onDone,
}: {
    playerName: string;
    role: string;
    word?: string;
    onDone: () => void;
}) {
    const [revealed, setRevealed] = useState(false);
    const isSpy = role === SPY.SPY;

    if (!revealed) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center text-center animate-scaleIn py-10">
                <p className="text-sm text-[var(--spycy-muted)] mb-2">Only {playerName} should look</p>
                <h2 className="text-3xl font-bold mb-8">Tap to reveal your role</h2>
                <button
                    type="button"
                    onClick={() => setRevealed(true)}
                    className="touch-target h-40 w-40 rounded-full border-2 border-dashed border-white/25 bg-white/5 text-lg font-semibold hover:border-rose-400/60 hover:bg-rose-500/10 transition active:scale-95"
                >
                    Reveal
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col items-center justify-center text-center animate-fadeIn py-8">
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--spycy-muted)] mb-3">{playerName}</p>
            <div
                className={`w-full rounded-2xl px-6 py-8 mb-6 border ${
                    isSpy
                        ? "border-rose-500/40 bg-rose-500/15 shadow-[0_0_40px_var(--spycy-spy-glow)]"
                        : "border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_40px_var(--spycy-defender-glow)]"
                }`}
            >
                <p className={`text-3xl sm:text-4xl font-bold ${isSpy ? "text-rose-400" : "text-cyan-300"}`}>
                    {isSpy ? SPY.YOU_ARE_SPY : SPY.YOU_ARE_DEFENDER}
                </p>
                {!isSpy && word && (
                    <p className="mt-6 text-2xl sm:text-3xl font-bold text-white break-words">{word}</p>
                )}
                {isSpy && (
                    <p className="mt-4 text-[var(--spycy-muted)] text-sm">
                        You don&apos;t know the word. Blend in, then guess it — or dodge the vote.
                    </p>
                )}
            </div>
            <PrimaryButton
                text="Hide & pass"
                onClick={onDone}
                variant="secondary"
                className="w-full"
            />
        </div>
    );
}
