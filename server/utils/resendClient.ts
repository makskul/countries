import { Resend } from 'resend'
import type { DigestContent } from './newsletterDigest'

export async function sendDigestEmail(params: {
  apiKey: string
  from: string
  to: string
  digest: DigestContent
}): Promise<{ id: string }> {
  const resend = new Resend(params.apiKey)
  const { data, error } = await resend.emails.send({
    from: params.from,
    to: params.to,
    subject: params.digest.subject,
    html: params.digest.html,
    text: params.digest.text,
  })

  if (error) {
    throw createError({ statusCode: 502, message: error.message })
  }
  if (!data?.id) {
    throw createError({ statusCode: 502, message: 'Resend returned no message id' })
  }
  return { id: data.id }
}
