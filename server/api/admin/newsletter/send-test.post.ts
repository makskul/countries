import { buildWeeklyDigestUk } from '../../../utils/newsletterDigest'
import { sendDigestEmail } from '../../../utils/resendClient'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ dryRun?: boolean }>(event)
  const dryRun = body?.dryRun === true

  const { supabaseAdmin } = await requireAdmin(event, { roles: ['editor'] })
  const config = useRuntimeConfig()

  const digest = await buildWeeklyDigestUk(supabaseAdmin)

  if (dryRun) {
    return {
      dryRun: true,
      subject: digest.subject,
      html: digest.html,
      text: digest.text,
      compareLinks: digest.compareLinks,
      reviews: digest.reviews,
    }
  }

  const apiKey = config.resendApiKey
  if (!apiKey) {
    throw createError({ statusCode: 503, message: 'RESEND_API_KEY is not configured' })
  }

  const to = config.adminEmail
  if (!to) {
    throw createError({ statusCode: 503, message: 'ADMIN_EMAIL is not configured' })
  }

  const result = await sendDigestEmail({
    apiKey,
    from: config.resendFromEmail,
    to,
    digest,
  })

  return {
    dryRun: false,
    sent: true,
    to,
    messageId: result.id,
    subject: digest.subject,
  }
})
