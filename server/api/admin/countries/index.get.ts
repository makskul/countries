export default defineEventHandler(async (event) => {
  const { supabaseAdmin } = await requireAdmin(event, { roles: ['editor'] })

  const { data: countries, error: countriesError } = await supabaseAdmin
    .from('countries')
    .select('*')
    .order('code')

  if (countriesError) throw createError({ statusCode: 500, message: countriesError.message })

  const { data: reviewRows } = await supabaseAdmin
    .from('reviews')
    .select('target_country')
    .eq('is_approved', true)

  const reviewCounts: Record<string, number> = {}
  for (const row of reviewRows ?? []) {
    const code = row.target_country as string
    reviewCounts[code] = (reviewCounts[code] ?? 0) + 1
  }

  const items = (countries ?? []).map(c => ({
    ...c,
    review_count: reviewCounts[c.code] ?? 0,
  }))

  return { items }
})
