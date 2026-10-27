import { constants } from "./constants";
import { Player } from "./interfaces";

export const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Game",
    mainEntityOfPage: {
        "@type": "WebPage",
        "@id": constants.siteUrl
    },
    headline: "spYcy — find the spy",
    description:
        "A party word game: one spy doesn't know the secret word. Bluff, question, and vote them out.",
    image: `${constants.siteUrl}/og-image.png`,
    inLanguage: "en-US"
};

export const formatTime = (ms: number) => {
    const safe = Math.max(0, ms || 0);
    const minutes = Math.floor(safe / 60000);
    const seconds = Math.floor((safe % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const formatTimeToReadable = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

export const getPlayerName = (playerId: string, players: Player[]) => {
    return players?.find(player => player?.userId === playerId)?.name;
}

export const activePlayers = (players: Player[] = []) =>
    players.filter((p) => !p.isSpectator);
