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

  const topCountries = ref(['PT', 'DE', 'PL', 'BG', 'NL'])

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
