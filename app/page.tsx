'use client';

import { useRouter } from "next/navigation";
import { jsonLd } from "./helpers";
import MainMenu from "./main-menu/page";

export default function Home() {
    const router = useRouter();

    return (
        <main className="">
            {/* Your Body here */}
            <MainMenu />

            {/* Include this to use jsonLd for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
        </main>
    );
}
