export default defineEventHandler(async (event) => {
  const { admin, supabaseAdmin } = await requireAdmin(event, { roles: ['moderator', 'editor'] })
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Missing id' })

  const body = await readBody<{
    is_approved?: boolean
    author_nationality?: string
    target_country?: string
    stay_purpose?: string
    still_there?: boolean
    climate?: string[] | null
    city_name?: string | null
    city_id?: number | null
    ratings?: Record<string, number>
    comments?: Record<string, string>
    note?: string
  }>(event)

  const updates: Record<string, unknown> = {}
  if (body.is_approved !== undefined) updates.is_approved = body.is_approved
  if (body.author_nationality !== undefined) updates.author_nationality = body.author_nationality.toUpperCase()
  if (body.target_country !== undefined) updates.target_country = body.target_country.toUpperCase()
  if (body.stay_purpose !== undefined) updates.stay_purpose = body.stay_purpose
  if (body.still_there !== undefined) updates.still_there = body.still_there
  if (body.climate !== undefined) updates.climate = body.climate
  if (body.city_name !== undefined) updates.city_name = body.city_name
  if (body.city_id !== undefined) updates.city_id = body.city_id
  if (body.ratings !== undefined) updates.ratings = body.ratings
  if (body.comments !== undefined) updates.comments = body.comments

  if (body.is_approved !== undefined) {
    updates.moderated_at = new Date().toISOString()
    updates.moderated_by = admin.id
  }

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })

  if (body.is_approved === true) {
    await logModeration(supabaseAdmin, { reviewId: id, adminId: admin.id, action: 'approve', note: body.note })
  } else if (body.is_approved === false) {
    await logModeration(supabaseAdmin, { reviewId: id, adminId: admin.id, action: 'reject', note: body.note })
  } else {
    await logModeration(supabaseAdmin, { reviewId: id, adminId: admin.id, action: 'edit', note: body.note })
  }

  return data
})
