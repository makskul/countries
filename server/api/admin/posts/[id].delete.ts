export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Missing id' })
  const { admin, supabaseAdmin } = await requireAdmin(event, { roles: ['editor'] })

  const { data, error } = await supabaseAdmin.from('blog_posts').delete().eq('id', id).select('slug').maybeSingle()
  if (error) throw createError({ statusCode: 500, message: error.message })
  if (!data) throw createError({ statusCode: 404, message: 'Not found' })

  await logModeration(supabaseAdmin, {
    adminId: admin.id,
    action: 'delete',
    entityType: 'post',
    entityRef: data.slug,
  })
  return { ok: true }
})
