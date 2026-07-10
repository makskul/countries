const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_BYTES = 5 * 1024 * 1024

function extForMime(mime: string) {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/gif') return 'gif'
  return 'jpg'
}

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')?.toUpperCase()
  if (!code) throw createError({ statusCode: 400, message: 'Missing code' })

  const { supabaseAdmin } = await requireAdmin(event, { roles: ['editor'] })
  const parts = await readMultipartFormData(event)
  const file = parts?.find(p => p.name === 'file' && p.data?.length)
  if (!file?.data) throw createError({ statusCode: 400, message: 'Файл не передан' })

  const mime = file.type || 'image/jpeg'
  if (!ALLOWED_MIME.has(mime)) {
    throw createError({ statusCode: 400, message: 'Допустимы JPEG, PNG, WebP, GIF' })
  }
  if (file.data.length > MAX_BYTES) {
    throw createError({ statusCode: 400, message: 'Максимум 5 МБ' })
  }

  const path = `${code.toLowerCase()}/hero-${Date.now()}.${extForMime(mime)}`
  const { error: uploadError } = await supabaseAdmin.storage
    .from('country-media')
    .upload(path, file.data, { contentType: mime, upsert: true })

  if (uploadError) {
    throw createError({ statusCode: 500, message: uploadError.message })
  }

  const { data: pub } = supabaseAdmin.storage.from('country-media').getPublicUrl(path)
  const url = pub.publicUrl

  const { data, error } = await supabaseAdmin
    .from('countries')
    .update({ hero_image_url: url, updated_at: new Date().toISOString() })
    .eq('code', code)
    .select('*')
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })
  return { url, country: data }
})
