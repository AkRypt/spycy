"use client";

import PrimaryButton from "./buttons/PrimaryButton";

export default function PassScreen({
    playerName,
    subtitle = "Hand the phone over — no peeking.",
    cta = "I'm ready",
    onReady,
}: {
    playerName: string;
    subtitle?: string;
    cta?: string;
    onReady: () => void;
}) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center text-center animate-riseIn py-10">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--spycy-muted)] mb-4">Pass the phone</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight">
                Pass to<br />
                <span className="spycy-logo">{playerName}</span>
            </h2>
            <p className="text-[var(--spycy-muted)] mb-10 max-w-xs text-balance">{subtitle}</p>
            <PrimaryButton text={cta} onClick={onReady} className="w-full max-w-xs" />
        </div>
    );
}
