'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { trackPageView } from '@/utils/analytics'

/** Logs a GA4 page_view on each App Router navigation. Sessions are automatic. */
export default function FirebaseAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    trackPageView(pathname || '/')
  }, [pathname])

  return null
}
