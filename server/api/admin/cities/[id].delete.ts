export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: 'Missing id' })

  const { supabaseAdmin } = await requireAdmin(event, { roles: ['editor'] })
  const { error } = await supabaseAdmin.from('cities').delete().eq('id', id)
  if (error) throw createError({ statusCode: 500, message: error.message })
  return { ok: true }
})
