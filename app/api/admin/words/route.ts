import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/utils/firebase/admin'
import { isAdminRequest } from '@/utils/adminAuth'
import { SPY_TABLES } from '@/app/constants'
import { FALLBACK_WORDS } from '@/app/words'

function slugifyCategory(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48)
}

/** List all word packs. */
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = getAdminDb()
    const snap = await db.collection(SPY_TABLES.WORDS).get()
    const packs: Record<string, string[]> = {}
    snap.docs.forEach((d) => {
      const words = d.data()?.words
      packs[d.id] = Array.isArray(words) ? words.map(String) : []
    })
    return NextResponse.json({ ok: true, packs })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to load packs' }, { status: 500 })
  }
}

/** Create/update one category: { category, words: string[] } */
export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const category = slugifyCategory(String(body?.category || ''))
    const words = Array.isArray(body?.words)
      ? body.words.map((w: unknown) => String(w).trim()).filter(Boolean)
      : []

    if (!category) {
      return NextResponse.json({ ok: false, error: 'Category required' }, { status: 400 })
    }

    const db = getAdminDb()
    await db.collection(SPY_TABLES.WORDS).doc(category).set(
      { words, category, updatedAt: new Date().toISOString() },
      { merge: true }
    )
    return NextResponse.json({ ok: true, category, words })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to save' }, { status: 500 })
  }
}

/** Delete category: ?category=places */
export async function DELETE(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const category = slugifyCategory(req.nextUrl.searchParams.get('category') || '')
    if (!category) {
      return NextResponse.json({ ok: false, error: 'Category required' }, { status: 400 })
    }
    const db = getAdminDb()
    await db.collection(SPY_TABLES.WORDS).doc(category).delete()
    return NextResponse.json({ ok: true, category })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to delete' }, { status: 500 })
  }
}

/** Seed from FALLBACK_WORDS (merge). Body: { replace?: boolean } */
export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const replace = !!body?.replace
    const db = getAdminDb()
    const batch = db.batch()
    const seeded: string[] = []

    for (const [category, words] of Object.entries(FALLBACK_WORDS)) {
      const ref = db.collection(SPY_TABLES.WORDS).doc(category)
      if (replace) {
        batch.set(ref, { words, category, updatedAt: new Date().toISOString() })
      } else {
        batch.set(ref, { words, category, updatedAt: new Date().toISOString() }, { merge: true })
      }
      seeded.push(category)
    }

    await batch.commit()
    return NextResponse.json({ ok: true, seeded })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Seed failed' }, { status: 500 })
  }
}
