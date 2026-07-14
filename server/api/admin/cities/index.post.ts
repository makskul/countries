export default defineEventHandler(async (event) => {
  const body = await readBody<{
    country: string
    name_en: string
    name_uk?: string
    name_ru?: string
    slug?: string
    population?: number
  }>(event)

  if (!body.country || !body.name_en) {
    throw createError({ statusCode: 400, message: 'country and name_en required' })
  }

  const slug = body.slug ? slugify(body.slug) : slugify(body.name_en)
  const { supabaseAdmin } = await requireAdmin(event, { roles: ['editor'] })

  const { data, error } = await supabaseAdmin
    .from('cities')
    .insert({
      country: body.country.toUpperCase(),
      name_en: body.name_en,
      name_uk: body.name_uk ?? null,
      name_ru: body.name_ru ?? null,
      slug,
      population: body.population ?? 0,
    })
    .select('*')
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
