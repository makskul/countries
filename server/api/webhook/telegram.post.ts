import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config  = useRuntimeConfig()
  const body    = await readBody(event)
  const query   = body.callback_query

  if (!query) return { ok: true }

  const [action, reviewId] = (query.data as string).split(':')
  const chatId    = query.message.chat.id
  const messageId = query.message.message_id

  if (String(chatId) !== String(config.telegramAdminChatId)) {
    return { ok: true }
  }

  const supabase = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey
  )

  const isApprove = action === 'approve'

  await supabase
    .from('reviews')
    .update({ is_approved: isApprove })
    .eq('id', reviewId)

  await $fetch(
    `https://api.telegram.org/bot${config.telegramBotToken}/editMessageReplyMarkup`,
    {
      method: 'POST',
      body: {
        chat_id:    chatId,
        message_id: messageId,
        reply_markup: { inline_keyboard: [] }
      }
    }
  )

  await $fetch(
    `https://api.telegram.org/bot${config.telegramBotToken}/answerCallbackQuery`,
    {
      method: 'POST',
      body: {
        callback_query_id: query.id,
        text: isApprove ? '✅ Відгук апрувлено!' : '❌ Відгук відхилено',
        show_alert: false,
      }
    }
  )

  return { ok: true }
})
