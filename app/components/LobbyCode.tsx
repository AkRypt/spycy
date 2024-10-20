"use client";

import React, { useRef } from "react";
import { useUser } from "@/hooks";
import { unjoinLobby } from "@/utils/firebase/firebaseHelpers";
import { useRouter } from "next/navigation";
import SuccessToast from "./successToast";

export default function LobbyCode({ ...props }) {
    const router = useRouter();
    const { playerLobbyCode, userId } = useUser();
    const toastRef = useRef<{ showToast: () => void } | null>(null);

    const leaveLobby = async () => {
        await unjoinLobby(playerLobbyCode, userId);
        router.push('/');
    }

    const copyCurrentURL = () => {
        if (typeof window !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(window.location.href)
                .then(() => {
                    toastRef.current?.showToast();
                })
                .catch((err) => {
                    console.error('Failed to copy: ', err);
                });
        } else {
            console.warn('Clipboard API not available');
        }
    };

    return (
        <div className="text-4xl text-center relative text-white font-bold border-2 border-gray-200 rounded-md my-3 p-3">
            <button
                onClick={leaveLobby}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 flex flex-col items-center"
                aria-label="Leave lobby"
            >
                <svg className="w-7 h-7 text-gray-800 dark:text-white rotate-180 hover:text-red-500 transition-colors duration-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H8m12 0-4 4m4-4-4-4M9 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2" />
                </svg>
                <span className="text-xs">Leave</span>
            </button>

            {props.text}

            <button
                onClick={copyCurrentURL}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 flex flex-col items-center"
                aria-label="Leave lobby"
            >
                <svg className="w-7 h-7 text-gray-800 dark:text-white hover:text-blue-500 transition-colors duration-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M9 8v3a1 1 0 0 1-1 1H5m11 4h2a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1m4 3v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7.13a1 1 0 0 1 .24-.65L7.7 8.35A1 1 0 0 1 8.46 8H13a1 1 0 0 1 1 1Z" />
                </svg>

                <span className="text-xs">Copy</span>
            </button>

            <SuccessToast ref={toastRef} text="URL copied to clipboard!" />
        </div>
    );
};