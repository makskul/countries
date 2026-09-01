import { createClient } from '@supabase/supabase-js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const country = String(body?.country ?? '').trim().toUpperCase()
  const authorNationality = String(body?.author_nationality ?? '').trim().toUpperCase()
  const email = String(body?.email ?? '').trim().toLowerCase()
  const message = String(body?.message ?? '').trim().slice(0, 2000) || null
  const source = String(body?.source ?? 'country_page').trim().slice(0, 64) || 'country_page'

  if (!country || country.length !== 2) {
    throw createError({ statusCode: 400, message: 'Invalid country' })
  }
  if (!authorNationality || authorNationality.length !== 2) {
    throw createError({ statusCode: 400, message: 'Invalid nationality' })
  }
  if (!email || !EMAIL_RE.test(email)) {
    throw createError({ statusCode: 400, message: 'Invalid email' })
  }

  const supabaseAdmin = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey,
  )

  const { data: lead, error } = await supabaseAdmin
    .from('leads')
    .insert({
      country,
      author_nationality: authorNationality,
      email,
      message,
      source,
    })
    .select('id, country, author_nationality, email, message, source, created_at')
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  await notifyTelegram(config, lead)

  return { ok: true, id: lead.id }
})

function escapeHtml(val: unknown): string {
  return String(val ?? '—')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

async function notifyTelegram(
  config: ReturnType<typeof useRuntimeConfig>,
  lead: {
    id: string
    country: string
    author_nationality: string
    email: string
    message: string | null
    source: string
  },
) {
  if (!config.telegramBotToken || !config.telegramAdminChatId) return

  const text = [
    '📩 <b>Новий лід</b>',
    '',
    `🌍 Країна: <b>${escapeHtml(lead.country)}</b>`,
    `🏳️ Національність: <b>${escapeHtml(lead.author_nationality)}</b>`,
    `📧 Email: <code>${escapeHtml(lead.email)}</code>`,
    lead.message ? `💬 ${escapeHtml(lead.message).slice(0, 500)}` : '',
    `📎 Source: ${escapeHtml(lead.source)}`,
    '',
    `🆔 <code>${lead.id}</code>`,
  ].filter(Boolean).join('\n')

  try {
    await $fetch(
      `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`,
      {
        method: 'POST',
        body: {
          chat_id: config.telegramAdminChatId,
          text,
          parse_mode: 'HTML',
        },
      },
    )
  } catch (err) {
    console.error('[leads] Telegram notify failed:', err)
  }
}
