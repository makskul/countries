export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Missing id' })

  const { supabaseAdmin } = await requireAdmin(event)
  const { data, error } = await supabaseAdmin.from('reviews').select('*').eq('id', id).single()
  if (error || !data) throw createError({ statusCode: 404, message: 'Review not found' })

  let author: { id: string; display_name: string | null } | null = null
  if (data.user_id) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, display_name')
      .eq('id', data.user_id)
      .maybeSingle()
    author = {
      id: data.user_id,
      display_name: profile?.display_name ?? null,
    }
  }

  return { ...data, author }
})
