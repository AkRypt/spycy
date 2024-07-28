'use client';

import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { getDecks, signOut } from "./actions";

export function Lobby() {
    const router = useRouter();

    return (
        <main className="min-h-screen md:px-10">

        </main>
    );
}

// This is used when the page is receiving some data from the previous page.
const SuspenseWrapper = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <Lobby />
    </Suspense>
)

export default SuspenseWrapper;