import { createClient } from '@supabase/supabase-js'
import { requireUser } from '../../../utils/requireUser'

export default defineEventHandler(async (event) => {
  const { user } = await requireUser(event)
  const config = useRuntimeConfig()

  const supabaseAdmin = createClient(config.public.supabaseUrl, config.supabaseServiceKey)
  const { data, error } = await supabaseAdmin
    .from('reviews')
    .select('id, created_at, target_country, author_nationality, is_approved, city_name, stay_purpose')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { reviews: data ?? [] }
})
