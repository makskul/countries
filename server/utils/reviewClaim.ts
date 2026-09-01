import { createHmac, timingSafeEqual } from 'node:crypto'

const TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function getSecret(): string {
  const config = useRuntimeConfig()
  return config.reviewClaimSecret || 'dev-claim-secret-change-me'
}

/** HMAC claim token for linking anonymous reviews to an account (Phase 1 stub). */
export function createReviewClaimToken(reviewId: string): string {
  const exp = Date.now() + TTL_MS
  const payload = `${reviewId}:${exp}`
  const sig = createHmac('sha256', getSecret()).update(payload).digest('hex')
  return Buffer.from(`${payload}:${sig}`).toString('base64url')
}

export function verifyReviewClaimToken(token: string, reviewId: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8')
    const lastColon = decoded.lastIndexOf(':')
    if (lastColon === -1) return false

    const payload = decoded.slice(0, lastColon)
    const sig = decoded.slice(lastColon + 1)
    const expected = createHmac('sha256', getSecret()).update(payload).digest('hex')

    const sigBuf = Buffer.from(sig, 'hex')
    const expectedBuf = Buffer.from(expected, 'hex')
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      return false
    }

    const [tokenReviewId, expStr] = payload.split(':')
    if (tokenReviewId !== reviewId) return false
    const exp = Number(expStr)
    if (!Number.isFinite(exp) || Date.now() > exp) return false
    return true
  } catch {
    return false
  }
}
