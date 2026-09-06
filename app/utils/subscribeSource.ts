const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const
const STORAGE_KEY = 'nv_subscribe_utm'

/** Persist UTM params from landing URL for later newsletter subscribe. */
export function captureSubscribeUtm(query: Record<string, unknown>) {
  if (!import.meta.client) return
  const utm: Record<string, string> = {}
  for (const key of UTM_KEYS) {
    const val = query[key]
    if (typeof val === 'string' && val.trim()) utm[key] = val.trim()
  }
  if (Object.keys(utm).length) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm))
  }
}

/** Build newsletter_subscribers.source value: footer or footer|utm_source=… */
export function buildSubscribeSource(base = 'footer'): string {
  if (!import.meta.client) return base
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const utm = JSON.parse(raw) as Record<string, string>
    const parts = UTM_KEYS
      .filter(k => utm[k])
      .map(k => `${k}=${utm[k]}`)
    return parts.length ? `${base}|${parts.join('|')}` : base
  } catch {
    return base
  }
}
