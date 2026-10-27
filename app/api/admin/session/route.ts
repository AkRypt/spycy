import { NextRequest, NextResponse } from 'next/server'
import { isAdminConfigured, isAdminRequest } from '@/utils/adminAuth'

/**
 * Lightweight auth probe — no Firestore.
 * Lets /admin leave the Loading state even when ADMIN_PASSWORD is unset
 * or word-pack fetches would hang.
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    ok: true,
    configured: isAdminConfigured(),
    authenticated: isAdminRequest(req),
  })
}
