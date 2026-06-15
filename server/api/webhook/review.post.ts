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

  const text = [
    `🆕 *Новий відгук*`,
    ``,
    `🌍 Країна: *${review.target_country}*`,
    `🏳️ Національність: *${review.author_nationality}*`,
    `📍 Зараз там: ${review.still_there ? 'Так' : 'Ні'}`,
    ``,
    `⭐ Оцінки:`,
    ...Object.entries(review.ratings ?? {}).map(
      ([key, val]) => `  • ${key}: ${val}/5`
    ),
    ``,
    `💬 Коментарі:`,
    ...Object.entries(review.comments ?? {})
      .filter(([, val]) => val)
      .map(([key, val]) => `  • ${key}: ${String(val).slice(0, 100)}`),
    ``,
    `🆔 ID: \`${review.id}\``,
  ].join('\n')

  await $fetch(
    `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`,
    {
      method: 'POST',
      body: {
        chat_id:    config.telegramAdminChatId,
        text,
        parse_mode: 'Markdown',
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
