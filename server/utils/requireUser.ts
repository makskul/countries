import { serverSupabaseClient } from '#supabase/server'
import type { ProfileRow } from '~/types/database.types'

export async function requireUser(event: H3Event) {
  const client = await serverSupabaseClient(event)
  const { data: { user }, error: authError } = await client.auth.getUser()

  if (authError || !user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw createError({ statusCode: 404, message: 'Profile not found' })
  }

  return {
    user,
    profile: profile as ProfileRow,
    supabase: client,
  }
}

export async function getOptionalUser(event: H3Event) {
  const client = await serverSupabaseClient(event)
  const { data: { user } } = await client.auth.getUser()
  if (!user) return null

  const { data: profile } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { user, profile: profile as ProfileRow | null, supabase: client }
}
