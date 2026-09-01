import { createClient } from '@supabase/supabase-js'
import { requireUser } from '../../utils/requireUser'
import { verifyReviewClaimToken } from '../../utils/reviewClaim'

type ClaimBody = {
  review_id: string
  claim_token: string
}

export default defineEventHandler(async (event) => {
  const { user } = await requireUser(event)
  const body = await readBody<ClaimBody>(event)

  if (!body.review_id || !body.claim_token) {
    throw createError({ statusCode: 400, message: 'Missing review_id or claim_token' })
  }

  if (!verifyReviewClaimToken(body.claim_token, body.review_id)) {
    throw createError({ statusCode: 400, message: 'Invalid or expired claim token' })
  }

  const config = useRuntimeConfig()
  const supabaseAdmin = createClient(config.public.supabaseUrl, config.supabaseServiceKey)

  const { data: review, error: fetchError } = await supabaseAdmin
    .from('reviews')
    .select('id, user_id')
    .eq('id', body.review_id)
    .single()

  if (fetchError || !review) {
    throw createError({ statusCode: 404, message: 'Review not found' })
  }

  if (review.user_id && review.user_id !== user.id) {
    throw createError({ statusCode: 409, message: 'Review already claimed' })
  }

  const { error: updateError } = await supabaseAdmin
    .from('reviews')
    .update({ user_id: user.id })
    .eq('id', body.review_id)
    .is('user_id', null)

  if (updateError) throw createError({ statusCode: 500, message: updateError.message })

  return { ok: true, review_id: body.review_id }
})
