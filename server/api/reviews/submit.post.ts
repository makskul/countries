import { createClient } from '@supabase/supabase-js'
import { checkReviewSubmitRateLimit } from '../../utils/reviewRateLimit'

type ReviewSubmitBody = {
  author_nationality: string
  target_country: string
  stay_purpose: string
  still_there?: boolean
  climate?: string[] | null
  city_name?: string | null
  city_id?: number | null
  ratings: Record<string, number>
  comments?: Record<string, string>
  /** Honeypot — must stay empty (EPIC-2.2.2). */
  website?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ReviewSubmitBody>(event)

  // Honeypot: bots fill hidden fields — pretend success without inserting
  if (body.website?.trim()) {
    return { ok: true }
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  checkReviewSubmitRateLimit(ip)

  if (!body.author_nationality || !body.target_country || !body.stay_purpose || !body.ratings) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  const ratingKeys = Object.keys(body.ratings)
  if (!ratingKeys.length && !(body.climate?.length)) {
    throw createError({ statusCode: 400, message: 'At least one rating or climate selection is required' })
  }

  const config = useRuntimeConfig()
  if (!config.public.supabaseUrl || !config.supabaseServiceKey) {
    throw createError({ statusCode: 503, message: 'Review submission unavailable' })
  }

  const supabaseAdmin = createClient(config.public.supabaseUrl, config.supabaseServiceKey)

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .insert({
      author_nationality: body.author_nationality.toUpperCase(),
      target_country: body.target_country.toUpperCase(),
      stay_purpose: body.stay_purpose,
      still_there: body.still_there ?? false,
      climate: body.climate?.length ? body.climate : null,
      city_name: body.city_name ?? null,
      city_id: body.city_id ?? null,
      ratings: body.ratings,
      comments: body.comments ?? {},
      is_approved: false,
    })
    .select('id')
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { ok: true, id: data.id }
})
