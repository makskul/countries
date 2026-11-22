export default defineEventHandler(async (event) => {
  const { admin, supabaseAdmin } = await requireAdmin(event, { roles: ['editor'] })
  const body = await readBody<Record<string, unknown>>(event)
  const fields = pickPostFields(body ?? {}, { partial: false })

  if (fields.status === 'published' && !fields.published_at) {
    fields.published_at = new Date().toISOString()
  }

  const { data, error } = await supabaseAdmin.from('blog_posts').insert(fields).select('*').single()
  if (error) {
    if (error.code === '23505') throw createError({ statusCode: 409, message: 'Статья с таким slug уже есть' })
    throw createError({ statusCode: 500, message: error.message })
  }

  await logModeration(supabaseAdmin, {
    adminId: admin.id,
    action: 'create',
    entityType: 'post',
    entityRef: data.slug,
  })
  return data
})
