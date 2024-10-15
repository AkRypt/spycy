"use client";

export default function PrimaryButton({ ...props }) {
    const { className, ...rest } = props;

    return (
        <button
            className={`bg-blue-500 text-white px-4 py-2 rounded ${className}`}
            type={props.type}
            {...rest}
        >
            {props.text}
        </button>
    );
};