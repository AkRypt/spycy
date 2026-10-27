# Spycy word decks

## In-app admin

1. Set server-only `ADMIN_PASSWORD` in `.env.local` (and Vercel).
2. Open `/admin`, sign in, edit categories/words, or click **Seed defaults**.
3. Writes go to Firestore `spycy_words` via Admin SDK (bypasses client rules).

## Firestore

Collection: **`spycy_words`**

| Document ID | Fields |
|-------------|--------|
| category slug, e.g. `places`, `jobs`, `nature` | `{ "words": ["Airport", "Beach", …] }` |

CLI seed (Admin + `.env.local`):

```bash
node scripts/seed-spycy-words.mjs
```

## Local fallback

File: **`app/words.ts`** (`FALLBACK_WORDS`) — used when Firestore is empty/unreachable.
