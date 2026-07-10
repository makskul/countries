import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  checkLoginRateLimit(ip)

  const body = await readBody<{ email?: string; password?: string }>(event)
  if (!body.email || !body.password) {
    throw createError({ statusCode: 400, message: 'Email and password required' })
  }

  const client = await serverSupabaseClient(event)
  const { data, error } = await client.auth.signInWithPassword({
    email: body.email,
    password: body.password,
  })

  if (error || !data.user) {
    throw createError({ statusCode: 401, message: error?.message ?? 'Invalid credentials' })
  }

  const config = useRuntimeConfig()
  const { createClient } = await import('@supabase/supabase-js')
  const supabaseAdmin = createClient(config.public.supabaseUrl, config.supabaseServiceKey)
  const { data: admin } = await supabaseAdmin
    .from('admin_users')
    .select('id')
    .eq('id', data.user.id)
    .single()

  if (!admin) {
    await client.auth.signOut()
    throw createError({ statusCode: 403, message: 'Not an admin user' })
  }

  return { ok: true, email: data.user.email }
})
