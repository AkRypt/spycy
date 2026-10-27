import { NextResponse } from 'next/server'
import { listWordPacks } from '@/utils/firebase/wordPacks'

/** Live word packs for the pre-game picker and the deal. Same collection /admin writes. */
export async function GET() {
  try {
    const packs = await listWordPacks()
    return NextResponse.json(
      { ok: true, packs },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Failed to load packs' },
      { status: 500 }
    )
  }
}
