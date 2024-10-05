"use client";

import { useEffect } from 'react';
import { initializeUser } from '@/utils/firebase/firebaseHelpers';

export default function UserProvider({ children }: { children: React.ReactNode }) {

    useEffect(() => {
        let loaded = true;
        loaded && initializeUser();
        return () => { loaded = false };
    }, []);

    return <>{children}</>;
}