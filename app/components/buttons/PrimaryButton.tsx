"use client";

export default function PrimaryButton({ ...props }) {
    const { className = "", text, variant = "primary", disabled, ...rest } = props;

    const variants: Record<string, string> = {
        primary:
            "bg-gradient-to-r from-rose-600 to-pink-500 border-rose-400/40 shadow-[0_0_24px_var(--spycy-spy-glow)] hover:brightness-110",
        secondary:
            "bg-[var(--spycy-panel-2)] border-[var(--spycy-border)] hover:border-white/25",
        defender:
            "bg-gradient-to-r from-teal-600 to-cyan-500 border-cyan-400/40 shadow-[0_0_20px_var(--spycy-defender-glow)]",
        ghost:
            "bg-transparent border-white/20 hover:bg-white/5",
    };

    return (
        <button
            className={`
                relative touch-target overflow-hidden rounded-xl border-2 px-5 py-3
                text-lg sm:text-xl font-semibold text-white transition
                disabled:opacity-40 disabled:pointer-events-none
                active:scale-[0.98]
                ${variants[variant] || variants.primary}
                ${className}
            `}
            type={props.type || "button"}
            disabled={disabled}
            {...rest}
        >
            <span className="relative z-10">{text}</span>
        </button>
    );
}
