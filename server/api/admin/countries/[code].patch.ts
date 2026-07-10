export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')?.toUpperCase()
  if (!code) throw createError({ statusCode: 400, message: 'Missing code' })

  const body = await readBody<Record<string, unknown>>(event)
  const allowed = [
    'region', 'is_active', 'language_key', 'currency', 'climate_key', 'cost_level',
    'residency_months', 'tax_employee', 'tax_corporate', 'hero_image_url',
    'visa_info_uk', 'visa_info_en', 'visa_info_ru',
  ]

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key]
  }

  const { supabaseAdmin } = await requireAdmin(event, { roles: ['editor'] })
  const { data, error } = await supabaseAdmin
    .from('countries')
    .update(updates)
    .eq('code', code)
    .select('*')
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
