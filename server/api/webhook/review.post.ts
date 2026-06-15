import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const secret = getHeader(event, 'x-webhook-secret')
  if (secret !== config.supabaseWebhookSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)
  const review = body.record

  if (!review) return { ok: true }

  const escape = (val: unknown): string =>
    String(val ?? '—')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

  const text = [
    `🆕 <b>Новий відгук</b>`,
    ``,
    `🌍 Країна: <b>${escape(review.target_country)}</b>`,
    `🏳️ Національність: <b>${escape(review.author_nationality)}</b>`,
    `🎯 Мета: ${escape(review.stay_purpose)}`,
    `📍 Зараз там: ${review.still_there ? 'Так ✅' : 'Ні'}`,
    review.city_name ? `🏙️ Місто: ${escape(review.city_name)}` : '',
    ``,
    `⭐ <b>Оцінки:</b>`,
    ...Object.entries(review.ratings ?? {}).map(
      ([key, val]) => `  • ${escape(key)}: ${val}/5`
    ),
    ``,
    `💬 <b>Коментарі:</b>`,
    ...Object.entries(review.comments ?? {})
      .filter(([_, val]) => val)
      .map(([key, val]) =>
        `  • <i>${escape(key)}</i>: ${escape(String(val)).slice(0, 150)}`
      ),
    ``,
    `🆔 <code>${review.id}</code>`,
  ].filter(Boolean).join('\n')

  await $fetch(
    `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`,
    {
      method: 'POST',
      body: {
        chat_id:    config.telegramAdminChatId,
        text,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[
            { text: '✅ Апрувити',  callback_data: `approve:${review.id}` },
            { text: '❌ Відхилити', callback_data: `reject:${review.id}`  },
          ]]
        }
      }
    }
  )

  return { ok: true }
})
