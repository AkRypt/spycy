"use client";

export default function TextInput({ ...props }) {
    const { className, ...rest } = props;

    return (
        <input
            className={`border border-gray-300 bg-gray-800 text-2xl text-white rounded-md p-2 z-10 ${props.className}`}
            type="text"
            name={props.name}
            placeholder={props.placeholder}
            onChange={props.onChange}
            value={props.value}
            {...rest}
        />
    );
};