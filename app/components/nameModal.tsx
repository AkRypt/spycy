"use client";

import { useEffect, useRef, useState } from "react";
import { updateUserData } from "@/utils/firebase/firebaseHelpers";
import { useUser } from "@/hooks";

export default function NameModal() {
    const [playerInput, setPlayerInput] = useState('');
    const [showModal, setShowModal] = useState(false);
    const { userId, userFetched, playerName } = useUser();
    const playerNameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let loaded = true;
        if (loaded && userFetched) {
            setShowModal(playerName?.length === 0);
        }
        return () => { loaded = false };
    }, [userFetched]);

    useEffect(() => {
        if (!showModal) return;
        if (playerNameRef.current) {
            playerNameRef.current.focus();
        }
    }, [showModal]);

    const handleNameSubmit = (e: any) => {
        e.preventDefault();
        updateUserData(userId, { playerName: playerInput })
            .then(() => {
                setShowModal(false);
            });
    }

    return (
        showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg">
                    <h2 className="text-xl mb-4">Enter Your Name</h2>
                    <form onSubmit={handleNameSubmit}>
                        <input
                            ref={playerNameRef}
                            type="text"
                            value={playerInput}
                            onChange={(e) => setPlayerInput(e.target.value)}
                            className="border p-2 mb-4 w-full"
                            placeholder="Your name"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            Done
                        </button>
                    </form>
                </div>
            </div>
        )
    )
};