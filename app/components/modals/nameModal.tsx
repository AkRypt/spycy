"use client";

import { useEffect, useRef, useState } from "react";
import { updateUserData } from "@/utils/firebase/firebaseHelpers";
import { useUser } from "@/hooks";
import PrimaryButton from "../buttons/PrimaryButton";
import TextInput from "../inputs/TextInput";
import state from "@/app/context";
import { SPY } from "@/app/constants";

export default function NameModal() {
    const [playerInput, setPlayerInput] = useState("");
    const [showModal, setShowModal] = useState(false);
    const { userId, userFetched, playerName } = useUser();
    const playerNameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const cached = localStorage.getItem(SPY.playerName);
        if (cached && !playerName) {
            state.userData = { ...state.userData, playerName: cached };
        }
    }, [playerName]);

    useEffect(() => {
        const cached =
            typeof window !== "undefined" ? localStorage.getItem(SPY.playerName) : null;
        const hasName = !!(playerName && playerName.length > 0) || !!cached;
        // Show after a short wait even if Firebase auth fails
        const t = setTimeout(() => {
            if (!hasName) setShowModal(true);
            else setShowModal(false);
        }, userFetched ? 0 : 1200);
        return () => clearTimeout(t);
    }, [userFetched, playerName]);

    useEffect(() => {
        if (showModal && playerNameRef.current) {
            playerNameRef.current.focus();
        }
    }, [showModal]);

    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = playerInput.trim();
        if (!name) return;
        localStorage.setItem(SPY.playerName, name);
        state.userData = { ...state.userData, playerName: name, userFetched: true };
        if (userId) {
            try {
                await updateUserData(userId, { playerName: name });
            } catch {
                // offline / invalid firebase — local name is enough for pass & play
            }
        }
        setShowModal(false);
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fadeIn">
            <div className="spycy-panel w-full max-w-sm rounded-2xl p-6 animate-scaleIn">
                <p className="text-xs uppercase tracking-[0.2em] text-rose-400 mb-2">Agent callsign</p>
                <h2 className="text-2xl font-bold mb-4">What should we call you?</h2>
                <form onSubmit={handleNameSubmit} className="flex flex-col gap-3">
                    <TextInput
                        ref={playerNameRef}
                        type="text"
                        value={playerInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setPlayerInput(e.target.value.slice(0, 16))
                        }
                        placeholder="Your name"
                        autoCapitalize="words"
                        required
                        maxLength={16}
                    />
                    <PrimaryButton type="submit" text="Enter" className="w-full" disabled={!playerInput.trim()} />
                </form>
            </div>
        </div>
    );
}
