/** Fallback word bank when Firestore `words` is empty or unreachable. */
export const FALLBACK_WORDS: Record<string, string[]> = {
    places: [
        "Airport", "Beach", "Casino", "Circus", "Embassy", "Hospital",
        "Hotel", "Library", "Museum", "School", "Stadium", "Subway",
        "Theater", "Zoo", "Bank", "Cathedral", "Harbor", "Market",
    ],
    objects: [
        "Telescope", "Umbrella", "Suitcase", "Camera", "Violin", "Candle",
        "Compass", "Typewriter", "Mirror", "Backpack", "Helmet", "Lantern",
    ],
    jobs: [
        "Detective", "Pilot", "Chef", "Journalist", "Astronaut", "Librarian",
        "Magician", "Surgeon", "Architect", "Spy", "Judge", "Sailor",
    ],
    nature: [
        "Volcano", "Glacier", "Oasis", "Canyon", "Jungle", "Coral reef",
        "Aurora", "Desert", "Waterfall", "Tundra",
    ],
}

export type WordPick = {
    word: string;
    category: string;
}

export function formatCategoryLabel(category: string): string {
    if (!category) return "";
    return category
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function pickFallbackWord(): WordPick {
    const keys = Object.keys(FALLBACK_WORDS);
    const category = keys[Math.floor(Math.random() * keys.length)];
    const words = FALLBACK_WORDS[category];
    return {
        word: words[Math.floor(Math.random() * words.length)],
        category,
    };
}
