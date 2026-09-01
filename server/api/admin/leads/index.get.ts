export default defineEventHandler(async (event) => {
  const { supabaseAdmin } = await requireAdmin(event, { roles: ['editor'] })

  const { data, error } = await supabaseAdmin
    .from('leads')
    .select('id, country, author_nationality, email, message, source, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { items: data ?? [] }
})
