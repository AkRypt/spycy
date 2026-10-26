# Spycy word decks

## Firestore (preferred for live online games)

Collection: **`spycy_words`**

| Document ID | Fields |
|-------------|--------|
| category slug, e.g. `places`, `jobs`, `nature` | `{ "words": ["Airport", "Beach", …] }` |

Optional: `category` string field (defaults to the document ID).

**How to add:** Firebase Console → Firestore → `spycy_words` → Add document → ID = category → field `words` (array of strings).

There is **no in-app admin UI** for editing packs yet. Seed via Console, or call `addWordsToFirestore()` from `utils/firebase/firebaseHelpers.ts` in a one-off script/dev console.

## Local fallback

File: **`app/words.ts`** (`FALLBACK_WORDS`)

Used when Firestore is empty or unreachable (including pass-and-play offline). Edit that object to change default categories/words in code.
