export function useAdminFetch<T>(url: string, options: Parameters<typeof $fetch<T>>[1] = {}) {
  return $fetch<T>(url, {
    ...options,
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
