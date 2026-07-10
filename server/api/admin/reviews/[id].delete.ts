export default defineEventHandler(async (event) => {
  const { admin, supabaseAdmin } = await requireAdmin(event, { roles: ['moderator', 'editor'] })
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Missing id' })

  const { error } = await supabaseAdmin.from('reviews').delete().eq('id', id)
  if (error) throw createError({ statusCode: 500, message: error.message })

  await logModeration(supabaseAdmin, { reviewId: id, adminId: admin.id, action: 'delete' })
  return { ok: true }
})
