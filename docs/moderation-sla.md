# Moderation SLA

Internal process for review moderation on Triplandr. No automation required beyond existing admin panel + optional manual checks.

## Targets

| Metric | Target | Action if missed |
|--------|--------|------------------|
| Time to approve | **< 48 hours** from submit | Prioritize queue; note reason in moderation log |
| Pending queue size | **≤ 20** reviews | Alert ops (see below); run Telegram “empty country” post |
| Rejection with feedback | Same day when possible | Use admin notes; no public comment required |

## Daily workflow

1. Open **Admin → Reviews** (`/admin/reviews`), filter **Pending**.
2. Approve or reject each item; log non-obvious decisions in **Moderation log**.
3. At end of session, note pending count in team chat if **> 10**.

## Alert: pending > 20

When the pending queue exceeds **20** reviews:

1. Post in the ops channel: `⚠️ Moderation backlog: {N} pending — SLA at risk`.
2. Assign one moderator for a **same-day clearing session** (goal: back under 10).
3. If backlog persists **3 days**, pause new Telegram review-drive posts until queue **< 15**.

**No Telegram bot** is required for v1 — a manual count in admin plus a calendar reminder is enough. Optional later: cron query on `reviews` where `is_approved IS NULL` and `created_at > now() - interval '7 days'`, webhook to ops chat when count > 20.

## SQL check (manual)

```sql
SELECT count(*) AS pending
FROM reviews
WHERE is_approved IS NULL OR is_approved = false
  AND created_at > now() - interval '30 days';
```

Adjust filter if your schema treats `is_approved = false` as rejected vs pending — align with admin list logic.

## Escalation

- **Spam burst** (>5 similar submits/hour): reject, note IP pattern; defer to EPIC-2.2 rate limits.
- **Legal / safety**: reject, do not approve for “balance”; contact team lead.
- **48h+ old pending**: approve or reject within next session; never leave indefinitely.

## Related docs

- [Admin setup](./admin-setup.md)
- [Telegram content calendar](./telegram-content-calendar.md)
