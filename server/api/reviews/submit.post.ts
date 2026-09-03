import { createClient } from '@supabase/supabase-js'
import { serverSupabaseClient } from '#supabase/server'
import { checkReviewSubmitRateLimit } from '../../utils/reviewRateLimit'
import { createReviewClaimToken } from '../../utils/reviewClaim'
import { isDestinationAllowed } from '~/utils/countries'

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

  if (!isDestinationAllowed(body.target_country)) {
    throw createError({ statusCode: 400, message: 'Target country is not available as a destination' })
  }

  const ratingKeys = Object.keys(body.ratings)
  if (!ratingKeys.length && !(body.climate?.length)) {
    throw createError({ statusCode: 400, message: 'At least one rating or climate selection is required' })
  }

  const config = useRuntimeConfig()
  if (!config.public.supabaseUrl || !config.supabaseServiceKey) {
    throw createError({ statusCode: 503, message: 'Review submission unavailable' })
  }

  const sessionClient = await serverSupabaseClient(event)
  const { data: { user } } = await sessionClient.auth.getUser()

  const supabaseAdmin = createClient(config.public.supabaseUrl, config.supabaseServiceKey)

  const insertPayload: Record<string, unknown> = {
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
  }

  if (user) {
    insertPayload.user_id = user.id
    // Seed profile nationality from first review if not set yet
    await supabaseAdmin
      .from('profiles')
      .update({
        default_nationality: body.author_nationality.toUpperCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .is('default_nationality', null)
  }

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .insert(insertPayload)
    .select('id')
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })

  const response: { ok: true; id: string; claim_token?: string } = { ok: true, id: data.id }

  if (!user) {
    const claimToken = createReviewClaimToken(data.id)
    response.claim_token = claimToken
    setCookie(event, 'nv_review_claim', claimToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
  }

  return response
})
