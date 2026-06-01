export function useFooterData() {
  const supabase = useSupabaseClient()

  const { data: stats } = useLazyAsyncData('footerStats', async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('target_country, author_nationality')
      .eq('is_approved', true)
    if (error || !data?.length) return { totalReviews: 0, totalCountries: 0, totalNationalities: 0 }
    return {
      totalReviews: data.length,
      totalCountries: new Set(data.map((r: any) => r.target_country)).size,
      totalNationalities: new Set(data.map((r: any) => r.author_nationality)).size,
    }
  }, { server: false })

  const { data: topCountries } = useLazyAsyncData('footerTopCountries', async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('target_country')
      .eq('is_approved', true)
    if (error || !data?.length) return [] as string[]
    const counts: Record<string, number> = {}
    for (const r of data as { target_country: string }[]) {
      counts[r.target_country] = (counts[r.target_country] ?? 0) + 1
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([code]) => code)
  }, { server: false })

  async function subscribeNewsletter(email: string, supabaseClient: any) {
    const { error } = await supabaseClient
      .from('newsletter_subscribers')
      .insert({ email, source: 'footer' })
    if (error) {
      if (error.code === '23505') throw new Error('already_subscribed')
      throw error
    }
  }

  return { stats, topCountries, subscribeNewsletter }
}
