"use client";

import { useEffect, useState } from "react";

export default function NameModal() {
    const [playerName, setPlayerName] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (!localStorage.getItem('playerName') || localStorage.getItem('playerName') === '') {
                setShowModal(true);
            }
        }
    }, []);

    const handleNameSubmit = (e: any) => {
        e.preventDefault();
        if (typeof window !== 'undefined') {
            localStorage.setItem('playerName', playerName);
            setShowModal(false);
        }
    }

    return (
        showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg">
                    <h2 className="text-xl mb-4">Enter Your Name</h2>
                    <form onSubmit={handleNameSubmit}>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
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