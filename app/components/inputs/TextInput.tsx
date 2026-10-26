"use client";

import { forwardRef } from "react";

const TextInput = forwardRef<HTMLInputElement, any>(function TextInput(props, ref) {
    const { className = "", ...rest } = props;

    return (
        <input
            ref={ref}
            className={`
                w-full touch-target rounded-xl border border-white/15
                bg-[var(--spycy-panel)] px-4 py-3 text-xl text-white
                placeholder:text-[var(--spycy-muted)]
                focus:outline-none focus:ring-2 focus:ring-rose-500/50
                ${className}
            `}
            type={props.type || "text"}
            name={props.name}
            placeholder={props.placeholder}
            onChange={props.onChange}
            value={props.value}
            autoComplete="off"
            {...rest}
        />
    );
});

export default TextInput;
