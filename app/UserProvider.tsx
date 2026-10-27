"use client";

import { useEffect } from 'react';
import { initializeUser } from '@/utils/firebase/firebaseHelpers';

export default function UserProvider({ children }: { children: React.ReactNode }) {

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
            return;
        }
        let loaded = true;
        loaded && initializeUser();
        return () => { loaded = false };
    }, []);

    return <>{children}</>;
}