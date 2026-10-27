/**
 * Firebase Analytics (GA4) for Spycy on the shared akxh-games project.
 * Reads the public NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID already in the web config.
 * Nothing is written to Firestore and there is no in-app dashboard.
 *
 * Every event includes `app: "spycy"`.
 * `mode` is `pass_and_play` or `online`.
 * `deck_id` is the dealt word-bank category key (not the secret word).
 * GA4 records `session_start` on its own when Analytics initializes.
 */
import type { Analytics } from 'firebase/analytics'

export const ANALYTICS_APP = 'spycy'

export const ANALYTICS_EVENTS = {
  pageView: 'page_view',
  lobbyCreated: 'lobby_created',
  lobbyJoined: 'lobby_joined',
  deckSelected: 'deck_selected',
  gameStarted: 'game_started',
  gameFinished: 'game_finished',
} as const

export type AnalyticsMode = 'online' | 'pass_and_play'

type Params = Record<string, string | number>

let loading: Promise<Analytics | null> | null = null

function measurementId() {
  return process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim() || ''
}

async function analytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return null
  if (!measurementId()) return null
  if (!loading) {
    loading = (async () => {
      try {
        const { getAnalytics, initializeAnalytics, isSupported } = await import('firebase/analytics')
        const { app } = await import('@/utils/firebase/firebase')
        if (!(await isSupported())) return null
        const config: Record<string, string | boolean> = { send_page_view: false }
        if (process.env.NODE_ENV === 'development') config.debug_mode = true
        try {
          return initializeAnalytics(app, { config })
        } catch {
          return getAnalytics(app)
        }
      } catch {
        return null
      }
    })()
  }
  return loading
}

/** Dedupe strict-mode double effects. The key stays in sessionStorage, not in GA4. */
export function claimOnce(key: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const full = `akxh_analytics:${ANALYTICS_APP}:${key}`
    if (sessionStorage.getItem(full)) return false
    sessionStorage.setItem(full, '1')
    return true
  } catch {
    return true
  }
}

function clip(value: string | number | undefined | null) {
  const raw = String(value ?? '').trim()
  return (raw || 'unknown').slice(0, 100)
}

export function modeFromPlayMode(playMode: string | undefined | null): AnalyticsMode {
  return playMode === 'hotseat' ? 'pass_and_play' : 'online'
}

export function track(name: string, params: Params = {}) {
  void analytics().then(async (instance) => {
    if (!instance) return
    const { logEvent } = await import('firebase/analytics')
    const send = logEvent as (
      analyticsInstance: Analytics,
      eventName: string,
      eventParams?: Params
    ) => void
    send(instance, name, { app: ANALYTICS_APP, ...params })
  })
}

export function trackPageView(path: string) {
  const page_path = path || '/'
  const bucket = Math.floor(Date.now() / 1000)
  if (!claimOnce(`page:${page_path}:${bucket}`)) return
  track(ANALYTICS_EVENTS.pageView, {
    page_path,
    page_title: typeof document !== 'undefined' ? document.title : ANALYTICS_APP,
    page_location:
      typeof window !== 'undefined' ? `${window.location.origin}${page_path}` : page_path,
  })
}

export function trackLobbyCreated(mode: AnalyticsMode) {
  track(ANALYTICS_EVENTS.lobbyCreated, { mode })
}

export function trackLobbyJoined(mode: AnalyticsMode) {
  track(ANALYTICS_EVENTS.lobbyJoined, { mode })
}

export function trackRoundStart(args: {
  mode: AnalyticsMode
  playerCount: number
  deckId: string
  round: number
  lobbyCode: string
}) {
  const round = Number.isFinite(args.round) ? args.round : 1
  if (!claimOnce(`round-start:${args.lobbyCode}:${round}`)) return
  const deck_id = clip(args.deckId)
  const shared = {
    mode: args.mode,
    deck_id,
    round,
  }
  track(ANALYTICS_EVENTS.deckSelected, shared)
  track(ANALYTICS_EVENTS.gameStarted, {
    ...shared,
    player_count: Math.max(0, Math.round(args.playerCount)),
  })
}

/** Round end. One dealt Spycy round is one finished game (rematch starts another). */
export function trackGameFinished(args: {
  mode: AnalyticsMode
  deckId: string
  round: number
  lobbyCode: string
  durationS?: number
}) {
  const round = Number.isFinite(args.round) ? args.round : 1
  if (!claimOnce(`round-end:${args.lobbyCode}:${round}`)) return
  const params: Params = {
    mode: args.mode,
    deck_id: clip(args.deckId),
    round,
  }
  if (typeof args.durationS === 'number' && Number.isFinite(args.durationS)) {
    params.duration_s = Math.max(0, Math.round(args.durationS))
  }
  track(ANALYTICS_EVENTS.gameFinished, params)
}
