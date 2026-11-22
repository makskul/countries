export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Missing id' })
  const { admin, supabaseAdmin } = await requireAdmin(event, { roles: ['editor'] })

  const body = await readBody<Record<string, unknown>>(event)
  const fields = pickPostFields(body ?? {}, { partial: true })

  // Published without a date (field omitted or cleared in the form) → keep the existing
  // date, otherwise publish now. The admin form always sends published_at (null when empty).
  if (fields.status === 'published' && !fields.published_at) {
    const { data: current } = await supabaseAdmin.from('blog_posts').select('published_at').eq('id', id).maybeSingle()
    fields.published_at = current?.published_at ?? new Date().toISOString()
  }

  const updates = { ...fields, updated_at: new Date().toISOString() }
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .update(updates)
    .eq('id', id)
    .select('*')
    .maybeSingle()

  if (error) {
    if (error.code === '23505') throw createError({ statusCode: 409, message: 'Статья с таким slug уже есть' })
    throw createError({ statusCode: 500, message: error.message })
  }
  if (!data) throw createError({ statusCode: 404, message: 'Not found' })

  await logModeration(supabaseAdmin, {
    adminId: admin.id,
    action: fields.status !== undefined ? 'cms_publish' : 'cms_edit',
    entityType: 'post',
    entityRef: data.slug,
    note: Object.keys(fields).join(', '),
  })
  return data
})
