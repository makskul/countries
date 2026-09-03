import type { SupabaseClient } from '@supabase/supabase-js'
import { APP_NAME, APP_URL } from '~/utils/appConfig'
import { getFeaturedCompareSlugs } from '~/data/comparePairs'
import type { ContentItem } from './contentQueue'
import { buildNewsletterRollupFromQueue } from './contentQueue'

export type DigestReview = {
  id: string
  targetCountry: string
  targetCountryName: string
  authorNationality: string
  authorNationalityName: string
  snippet: string
  countryUrl: string
}

export type DigestCompareLink = {
  slug: string
  label: string
  url: string
}

export type DigestContent = {
  subject: string
  html: string
  text: string
  compareLinks: DigestCompareLink[]
  reviews: DigestReview[]
}

function countryNameUk(code: string): string {
  try {
    return new Intl.DisplayNames(['uk-UA'], { type: 'region' }).of(code.toUpperCase()) ?? code
  } catch {
    return code
  }
}

function pickReviewSnippet(comments: Record<string, unknown> | null): string {
  if (!comments) return ''
  for (const val of Object.values(comments)) {
    if (typeof val === 'string' && val.trim()) {
      const trimmed = val.trim()
      return trimmed.length > 180 ? `${trimmed.slice(0, 177)}…` : trimmed
    }
  }
  return ''
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function buildWeeklyDigestUk(
  supabaseAdmin: SupabaseClient,
  opts: { contentQueue?: ContentItem[] } = {},
): Promise<DigestContent> {
  const compareSlugs = getFeaturedCompareSlugs(5)
  const compareLinks: DigestCompareLink[] = compareSlugs.map(slug => {
    const [a, b] = slug.split('-vs-').map(s => s.toUpperCase())
    const label = `${countryNameUk(a)} vs ${countryNameUk(b)}`
    return {
      slug,
      label,
      url: `${APP_URL}/compare/${slug}`,
    }
  })

  const { data: reviewsRaw, error } = await supabaseAdmin
    .from('reviews')
    .select('id, target_country, author_nationality, comments, created_at')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(3)

  if (error) throw new Error(error.message)

  const reviews: DigestReview[] = (reviewsRaw ?? []).map(r => {
    const target = String(r.target_country)
    const nat = String(r.author_nationality)
    const slug = target.toLowerCase()
    return {
      id: r.id,
      targetCountry: target,
      targetCountryName: countryNameUk(target),
      authorNationality: nat,
      authorNationalityName: countryNameUk(nat),
      snippet: pickReviewSnippet(r.comments as Record<string, unknown>),
      countryUrl: `${APP_URL}/country/${slug}`,
    }
  })

  const subject = `${APP_NAME} — дайджест тижня`

  const compareHtml = compareLinks.length
    ? `<ul style="margin:0;padding-left:20px;">${compareLinks.map(l =>
        `<li style="margin-bottom:8px;"><a href="${l.url}" style="color:#534AB7;text-decoration:none;">${escapeHtml(l.label)}</a></li>`,
      ).join('')}</ul>`
    : '<p style="color:#666;">Порівняння зʼявляться незабаром.</p>'

  const reviewsHtml = reviews.length
    ? reviews.map(r => `
        <div style="margin-bottom:16px;padding:12px 14px;background:#f7f7fb;border-radius:8px;">
          <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#1A1A2E;">
            <a href="${r.countryUrl}" style="color:#534AB7;text-decoration:none;">${escapeHtml(r.targetCountryName)}</a>
            <span style="font-weight:400;color:#666;"> · ${escapeHtml(r.authorNationalityName)}</span>
          </p>
          ${r.snippet ? `<p style="margin:0;font-size:14px;line-height:1.5;color:#444;">${escapeHtml(r.snippet)}</p>` : ''}
        </div>`).join('')
    : '<p style="color:#666;">Нових відгуків поки немає — будь першим на triplandr.com!</p>'

  const queue = opts.contentQueue ?? []
  const rollup = queue.length
    ? buildNewsletterRollupFromQueue(queue, { locale: 'uk' })
    : null
  const rollupHtml = rollup
    ? `<div style="margin:24px 0 0;">${rollup.html}</div>`
    : ''
  const rollupText = rollup ? `\n\n${rollup.text}\n` : ''

  const html = `<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f0f0f5;font-family:Inter,Arial,sans-serif;">
  <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;">
    <div style="background:#534AB7;padding:24px 28px;">
      <h1 style="margin:0;font-size:22px;color:#fff;">${escapeHtml(APP_NAME)}</h1>
      <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85);">Твій тижневий дайджест</p>
    </div>
    <div style="padding:28px;">
      <h2 style="margin:0 0 12px;font-size:16px;color:#1A1A2E;">🔥 Топ порівняння тижня</h2>
      ${compareHtml}
      <h2 style="margin:24px 0 12px;font-size:16px;color:#1A1A2E;">💬 Свіжі відгуки</h2>
      ${reviewsHtml}
      ${rollupHtml}
      <p style="margin:28px 0 0;font-size:13px;color:#888;line-height:1.5;">
        Ти отримав цей лист, бо підписався на дайджест ${APP_NAME}.
        <a href="${APP_URL}" style="color:#534AB7;">triplandr.com</a>
      </p>
    </div>
  </div>
</body>
</html>`

  const textCompare = compareLinks.map(l => `• ${l.label}: ${l.url}`).join('\n')
  const textReviews = reviews.map(r =>
    `${r.targetCountryName} (${r.authorNationalityName})${r.snippet ? `\n  ${r.snippet}` : ''}\n  ${r.countryUrl}`,
  ).join('\n\n')

  const text = `${subject}

Топ порівняння тижня:
${textCompare || '—'}

Свіжі відгуки:
${textReviews || '—'}${rollupText}
${APP_URL}`

  return { subject, html, text, compareLinks, reviews }
}
