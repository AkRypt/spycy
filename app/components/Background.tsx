"use client";

export default function Background({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-[100dvh] w-full relative overflow-hidden bg-[var(--spycy-ink)]">
            <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
                    backgroundSize: "28px 28px",
                }}
            />
            <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-rose-600/25 blur-3xl animate-blob" />
            <div className="pointer-events-none absolute top-[35%] -right-20 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl animate-blob animation-delay-2000" />
            <div className="pointer-events-none absolute -bottom-28 left-[15%] h-72 w-72 rounded-full bg-orange-500/15 blur-3xl animate-blob animation-delay-4000" />
            <div className="relative z-10 flex flex-1 flex-col w-full max-w-lg mx-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]">
                {children}
            </div>
        </div>
    );
}
