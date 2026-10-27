/**
 * Seed decks for /admin "Seed defaults" only.
 * The pre-game picker and the deal read Firestore `spycy_words` via GET /api/words.
 * Live editor: /admin (ADMIN_PASSWORD). See docs/word-decks.md.
 */
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

/** `enabled` limits the deal. Omit it to use every pack that has words. */
export function pickFromPacks(
    packs: Record<string, string[]>,
    enabled?: string[]
): WordPick | null {
    let keys = Object.keys(packs).filter(
        (key) => Array.isArray(packs[key]) && packs[key].length > 0
    );
    if (enabled) keys = keys.filter((key) => enabled.includes(key));
    if (!keys.length) return null;
    const category = keys[Math.floor(Math.random() * keys.length)];
    const words = packs[category];
    return {
        word: words[Math.floor(Math.random() * words.length)],
        category,
    };
}

