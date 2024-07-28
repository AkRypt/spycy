import { constants } from "./constants";

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

// To change time format
export const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}