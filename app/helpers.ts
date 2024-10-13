import { constants } from "./constants";
import { Player } from "./interfaces";

// For SEO
export const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Game",
    mainEntityOfPage: {
        "@type": "WebPage",
        "@id": constants.siteUrl
    },
    headline: "<YOUR HEADLINE>",
    description:
        "<YOUR DESCRIPTION>",
    image: `${constants.siteUrl}/favicon.ico`,
    inLanguage: "en-US"
};

export const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// To change time format
export const formatTimeToReadable = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

// Get player name from player id
export const getPlayerName = (playerId: string, players: Player[]) => {
    return players?.find(player => player?.userId === playerId)?.name;
}