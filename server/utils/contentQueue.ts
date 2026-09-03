/**
 * Types + helpers for the daily publication dataset.
 * Generator / Telegram send live in `scripts/daily-content.mjs` (CI + local).
 * This module is for Nuxt (newsletter rollup, future admin preview).
 */

import { APP_URL } from '~/utils/appConfig'

export type ContentLocale = 'uk' | 'en' | 'ru'

export type ContentItemType =
  | 'compare'
  | 'empty_country'
  | 'hub'
  | 'reviews_digest'
  | 'tip'
  | 'rss'

export type ContentItem = {
  id: string
  date: string
  type: ContentItemType
  locale: ContentLocale
  title: string
  body: string
  cta_url: string
  source: string
  tags: string[]
  country_codes: string[]
}

export function escapeContentHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Format a queue item for Telegram HTML parse_mode. */
export function formatContentItemForTelegram(item: ContentItem): string {
  const tags = (item.tags || []).map(t => `#${t.replace(/\s+/g, '_')}`).join(' ')
  return [
    `<b>${escapeContentHtml(item.title)}</b>`,
    '',
    escapeContentHtml(item.body),
    '',
    `👉 <a href="${escapeContentHtml(item.cta_url)}">Відкрити на Triplandr</a>`,
    tags ? `\n${escapeContentHtml(tags)}` : '',
  ].filter(Boolean).join('\n')
}

/**
 * Weekly rollup lines for newsletter (same dataset idea as daily TG posts).
 * Pass items already built by `scripts/daily-content.mjs --days=7 --write`.
 */
export function buildNewsletterRollupFromQueue(
  items: ContentItem[],
  opts: { locale?: ContentLocale } = {},
): { title: string, html: string, text: string } {
  const locale = opts.locale || 'uk'
  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 7)
  const title = 'Публікації тижня'

  const htmlList = sorted.length
    ? `<ul style="margin:0;padding-left:20px;">${sorted.map(item => {
        const url = item.cta_url.startsWith('http') ? item.cta_url : `${APP_URL}${item.cta_url}`
        return `<li style="margin-bottom:8px;">
          <a href="${escapeContentHtml(url)}" style="color:#534AB7;text-decoration:none;">${escapeContentHtml(item.title)}</a>
          <span style="color:#888;font-size:12px;"> · ${escapeContentHtml(item.date)} · ${escapeContentHtml(item.type)}</span>
        </li>`
      }).join('')}</ul>`
    : `<p style="color:#666;">Черга публікацій порожня — див. <a href="${APP_URL}/${locale}">${APP_URL}</a>.</p>`

  const text = sorted.length
    ? sorted.map(i => `• ${i.date} [${i.type}] ${i.title}\n  ${i.cta_url}`).join('\n')
    : '—'

  return {
    title,
    html: `<h2 style="margin:0 0 12px;font-size:16px;color:#1A1A2E;">📅 ${title}</h2>${htmlList}`,
    text: `${title}\n${text}`,
  }
}
