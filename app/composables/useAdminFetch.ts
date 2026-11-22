export function useAdminFetch<T>(url: string, options: Parameters<typeof $fetch<T>>[1] = {}) {
  // During SSR, $fetch to an internal route does not forward the browser's cookies,
  // so /api/admin/* saw no session and the admin layout bounced to /admin/login
  // (which bounces back for signed-in users: ERR_TOO_MANY_REDIRECTS). Forward them.
  const ssrHeaders = import.meta.server ? useRequestHeaders(['cookie']) : undefined
  return $fetch<T>(url, {
    ...options,
    headers: { ...ssrHeaders, ...(options?.headers as Record<string, string> | undefined) },
    credentials: 'include',
  })
}

export function avgRating(ratings: Record<string, number> | null | undefined): string {
  if (!ratings) return '—'
  const vals = Object.values(ratings).filter(v => v > 0)
  if (!vals.length) return '—'
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
}

export function formatAdminDate(iso: string): string {
  return new Date(iso).toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
