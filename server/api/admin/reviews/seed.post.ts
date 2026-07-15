export default defineEventHandler(async (event) => {
  const { supabaseAdmin } = await requireAdmin(event, { roles: ['editor'] })
  const body = await readBody<{ action?: 'unpublish' | 'delete' }>(event)
  const action = body?.action ?? 'unpublish'

  if (action === 'delete') {
    const { error, count } = await supabaseAdmin
      .from('reviews')
      .delete({ count: 'exact' })
      .eq('author_profile', 'seed')
    if (error) throw createError({ statusCode: 500, message: error.message })
    return { action, affected: count ?? 0 }
  }

  const { error, count } = await supabaseAdmin
    .from('reviews')
    .update({ is_approved: false }, { count: 'exact' })
    .eq('author_profile', 'seed')
  if (error) throw createError({ statusCode: 500, message: error.message })
  return { action: 'unpublish', affected: count ?? 0 }
})
