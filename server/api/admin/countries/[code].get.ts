export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')?.toUpperCase()
  if (!code) throw createError({ statusCode: 400, message: 'Missing code' })

  const { supabaseAdmin } = await requireAdmin(event, { roles: ['editor'] })
  const { data, error } = await supabaseAdmin.from('countries').select('*').eq('code', code).single()

  if (error || !data) throw createError({ statusCode: 404, message: 'Country not found' })
  return data
})
