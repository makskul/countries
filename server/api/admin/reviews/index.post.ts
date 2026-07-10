export default defineEventHandler(async (event) => {
  const { admin, supabaseAdmin } = await requireAdmin(event, { roles: ['moderator', 'editor'] })
  const body = await readBody<{
    author_nationality: string
    target_country: string
    stay_purpose: string
    still_there?: boolean
    climate?: string[] | null
    city_name?: string | null
    city_id?: number | null
    ratings: Record<string, number>
    comments?: Record<string, string>
    is_approved?: boolean
  }>(event)

  if (!body.author_nationality || !body.target_country || !body.stay_purpose || !body.ratings) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  const isApproved = body.is_approved ?? true

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .insert({
      author_nationality: body.author_nationality.toUpperCase(),
      target_country: body.target_country.toUpperCase(),
      stay_purpose: body.stay_purpose,
      still_there: body.still_there ?? false,
      climate: body.climate ?? null,
      city_name: body.city_name ?? null,
      city_id: body.city_id ?? null,
      ratings: body.ratings,
      comments: body.comments ?? {},
      is_approved: isApproved,
      moderated_at: isApproved ? new Date().toISOString() : null,
      moderated_by: isApproved ? admin.id : null,
    })
    .select('*')
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })

  await logModeration(supabaseAdmin, {
    reviewId: data.id,
    adminId: admin.id,
    action: 'create',
    note: 'seed review',
  })

  return data
})
