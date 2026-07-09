export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: 'Missing id' })

  const body = await readBody<{
    country?: string
    name_en?: string
    name_uk?: string | null
    name_ru?: string | null
    slug?: string
    population?: number
  }>(event)

  const updates: Record<string, unknown> = {}
  if (body.country !== undefined) updates.country = body.country.toUpperCase()
  if (body.name_en !== undefined) updates.name_en = body.name_en
  if (body.name_uk !== undefined) updates.name_uk = body.name_uk
  if (body.name_ru !== undefined) updates.name_ru = body.name_ru
  if (body.slug !== undefined) updates.slug = slugify(body.slug)
  if (body.population !== undefined) updates.population = body.population

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
