export default defineEventHandler(async (event) => {
  const { supabaseAdmin } = await requireAdmin(event)

  const [
    pendingRes,
    todayRes,
    weekRes,
    monthRes,
    newsletterRes,
    topCountriesRes,
  ] = await Promise.all([
    supabaseAdmin.from('reviews').select('id', { count: 'exact', head: true }).eq('is_approved', false),
    supabaseAdmin.from('reviews').select('id', { count: 'exact', head: true }).gte('created_at', startOfDaysAgo(0)),
    supabaseAdmin.from('reviews').select('id', { count: 'exact', head: true }).gte('created_at', startOfDaysAgo(7)),
    supabaseAdmin.from('reviews').select('id', { count: 'exact', head: true }).gte('created_at', startOfDaysAgo(30)),
    supabaseAdmin.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('reviews').select('target_country').eq('is_approved', true),
  ])

  const countryCounts: Record<string, number> = {}
  for (const row of topCountriesRes.data ?? []) {
    const code = row.target_country as string
    countryCounts[code] = (countryCounts[code] ?? 0) + 1
  }
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([code, count]) => ({ code, count }))

  return {
    pending: pendingRes.count ?? 0,
    reviewsToday: todayRes.count ?? 0,
    reviewsWeek: weekRes.count ?? 0,
    reviewsMonth: monthRes.count ?? 0,
    newsletterCount: newsletterRes.count ?? 0,
    topCountries,
  }
})

function startOfDaysAgo(days: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - days)
  return d.toISOString()
}
