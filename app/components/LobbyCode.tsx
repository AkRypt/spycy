"use client";

export default function LobbyCode({ ...props }) {

    return (
        <div className="text-xl text-center font-bold border-4 border-cyan-300 rounded-md py-1 px-2">
            {props.text}
        </div>
    );
};