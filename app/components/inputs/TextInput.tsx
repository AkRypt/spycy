"use client";

export default function TextInput({ ...props }) {

    return (
        <input
            className={`border border-gray-300 bg-gray-600 rounded-md p-2 ${props.className}`}
            type="text"
            name="lobbyCode"
            placeholder="Enter game code"
            onChange={props.onChange}
            value={props.value}
            {...props}
        />
    );
};