"use client";

export default function SecondaryButton({ ...props }) {

    return (
        <button
            className='bg-gray-600 text-white px-4 py-2 rounded'
            type="submit"
            disabled={props.disabled}
            {...props}
        >
            Join Game
        </button>
    );
};