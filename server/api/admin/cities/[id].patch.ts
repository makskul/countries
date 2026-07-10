export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: 'Missing id' })

  const body = await readBody<Record<string, unknown>>(event)

  const updates: Record<string, unknown> = {}
  if (body.country !== undefined) updates.country = String(body.country).toUpperCase()
  if (body.name_en !== undefined) updates.name_en = body.name_en
  if (body.name_uk !== undefined) updates.name_uk = body.name_uk
  if (body.name_ru !== undefined) updates.name_ru = body.name_ru
  if (body.slug !== undefined) updates.slug = slugify(String(body.slug))
  if (body.population !== undefined) updates.population = body.population

  const articleKeys = [
    'article_title_uk', 'article_title_en', 'article_title_ru',
    'article_excerpt_uk', 'article_excerpt_en', 'article_excerpt_ru',
    'article_body_uk', 'article_body_en', 'article_body_ru',
  ] as const
  for (const key of articleKeys) {
    if (body[key] !== undefined) updates[key] = body[key]
  }

  const { supabaseAdmin } = await requireAdmin(event, { roles: ['editor'] })
  const { data, error } = await supabaseAdmin
    .from('cities')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
