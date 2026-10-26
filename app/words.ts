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

export function pickFallbackWord(): string {
    const categories = Object.values(FALLBACK_WORDS)
    const words = categories[Math.floor(Math.random() * categories.length)]
    return words[Math.floor(Math.random() * words.length)]
}
