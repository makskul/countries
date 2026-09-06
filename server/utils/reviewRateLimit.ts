const reviewSubmitAttempts = new Map<string, { count: number; resetAt: number }>()

/** Max public review submits per IP per hour (EPIC-2.2.1). */
export function checkReviewSubmitRateLimit(
  ip: string,
  max = 5,
  windowMs = 60 * 60 * 1000,
) {
  const now = Date.now()
  const entry = reviewSubmitAttempts.get(ip)
  if (!entry || now > entry.resetAt) {
    reviewSubmitAttempts.set(ip, { count: 1, resetAt: now + windowMs })
    return
  }
  entry.count += 1
  if (entry.count > max) {
    throw createError({ statusCode: 429, message: 'Too many review submissions. Try again later.' })
  }
}
