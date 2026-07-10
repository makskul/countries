export default defineEventHandler(async (event) => {
  const body = await readBody<{
    code: string
    region?: string
    language_key?: string
    currency?: string
    climate_key?: string
    cost_level?: string
    residency_months?: string
    tax_employee?: string
    tax_corporate?: string
  }>(event)

  if (!body.code) throw createError({ statusCode: 400, message: 'code required' })

  const { supabaseAdmin } = await requireAdmin(event, { roles: ['editor'] })
  const { data, error } = await supabaseAdmin
    .from('countries')
    .insert({
      code: body.code.toUpperCase(),
      region: body.region ?? 'other',
      is_active: true,
      language_key: body.language_key ?? null,
      currency: body.currency ?? null,
      climate_key: body.climate_key ?? null,
      cost_level: body.cost_level ?? null,
      residency_months: body.residency_months ?? null,
      tax_employee: body.tax_employee ?? null,
      tax_corporate: body.tax_corporate ?? null,
    })
    .select('*')
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
