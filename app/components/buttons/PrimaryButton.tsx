"use client";

export default function PrimaryButton({ ...props }) {
    const { className, ...rest } = props;

    return (
        <button
            className={`
                relative overflow-hidden bg-gray-800 text-2xl border-2 border-gray-700 rounded-lg text-white px-4 py-2
                ${className}
                before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-500 before:via-purple-500 before:to-pink-500
                before:blur-lg before:opacity-50 before:animate-pulse
                hover:before:opacity-75 transition-all duration-300
            `}
            type={props.type}
            {...rest}
        >
            <span className="relative z-10 text-white opacity-90 text-shadow-sm">
                {props.text}
            </span>
        </button>
    );
};