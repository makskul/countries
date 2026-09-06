# Review claim flow (Auth Phase 1 stub)

Anonymous submits receive a `claim_token` (HMAC-SHA256, 7-day TTL) in the API response and an httpOnly cookie `nv_review_claim`.

After signup/login, the client calls `POST /api/reviews/claim` with `{ review_id, claim_token }` (stored in `sessionStorage` as `nv_pending_claim`).

Requires `REVIEW_CLAIM_SECRET` in runtime config. One-time attach: sets `reviews.user_id` when still null.

Phase 2: post-submit CTA UI, email match, token invalidation table.
