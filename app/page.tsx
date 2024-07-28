'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { jsonLd } from "./helpers";
import { greatVibes, raleway } from "./fonts";

export default function Home() {
    const router = useRouter();

    // Going to Next Page
    const goToLobby = () => {
        router.push('/lobby');
    }

    // Google Login
    const onClickGoogleLogin = async () => {
        router.push('/auth/google')
    }

    return (
        <main className="">

            {/* Your Body here */}

            {/* Include this to use jsonLd for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
        </main>
    );
}
