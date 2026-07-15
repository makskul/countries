export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')?.toUpperCase()
  if (!code) throw createError({ statusCode: 400, message: 'Missing code' })

  const body = await readBody<Record<string, unknown>>(event)
  const allowed = [
    'region', 'is_active', 'language_key', 'currency', 'climate_key', 'cost_level',
    'residency_months', 'tax_employee', 'tax_corporate', 'hero_image_url',
    'visa_info_uk', 'visa_info_en', 'visa_info_ru',
    'article_title_uk', 'article_title_en', 'article_title_ru',
    'article_excerpt_uk', 'article_excerpt_en', 'article_excerpt_ru',
    'article_body_uk', 'article_body_en', 'article_body_ru',
    'article_published',
    'seo_title_uk', 'seo_title_en', 'seo_title_ru',
    'seo_description_uk', 'seo_description_en', 'seo_description_ru',
  ]

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key]
  }

  const { admin, supabaseAdmin } = await requireAdmin(event, { roles: ['editor'] })
  const { data, error } = await supabaseAdmin
    .from('countries')
    .update(updates)
    .eq('code', code)
    .select('*')
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })

  const changed = Object.keys(updates).filter(k => k !== 'updated_at')
  const action = body.article_published !== undefined && changed.length === 2 && changed.includes('article_published')
    ? 'cms_publish'
    : 'cms_edit'
  await logModeration(supabaseAdmin, {
    adminId: admin.id,
    action,
    entityType: 'country',
    entityRef: code,
    note: changed.join(', '),
  })

  return data
})
