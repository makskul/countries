import type { CountryRow } from '~/types/database.types'
import { getCountryMeta, mapCountryRowToMeta } from '~/utils/countryMeta'

export function useCountryMetaData(countryCode: MaybeRefOrGetter<string>) {
  const code = computed(() => String(toValue(countryCode) ?? '').toUpperCase())
  const supabase = useSupabaseClient()
  const { locale } = useI18n()

  const { data: meta, pending, refresh } = useAsyncData(
    () => `country-meta-${code.value}`,
    async () => {
      const { data } = await supabase
        .from('countries')
        .select('*')
        .eq('code', code.value)
        .eq('is_active', true)
        .maybeSingle()

      if (data) {
        return {
          meta: mapCountryRowToMeta(data as CountryRow),
          row: data as CountryRow,
        }
      }

      const staticMeta = getCountryMeta(code.value)
      return staticMeta ? { meta: staticMeta, row: null as CountryRow | null } : null
    },
    { watch: [code] },
  )

  const visaInfo = computed(() => {
    const row = meta.value?.row
    if (!row) return null
    const loc = locale.value
    if (loc === 'uk') return row.visa_info_uk
    if (loc === 'ru') return row.visa_info_ru
    return row.visa_info_en
  })

  const article = computed(() => {
    const row = meta.value?.row
    if (!row) return null
    if (row.article_published === false) return null
    const loc = locale.value
    const pick = (uk: string | null, en: string | null, ru: string | null) =>
      (loc === 'uk' ? uk : loc === 'ru' ? ru : en) || en || uk || ru || null
    const title = pick(row.article_title_uk, row.article_title_en, row.article_title_ru)
    const excerpt = pick(row.article_excerpt_uk, row.article_excerpt_en, row.article_excerpt_ru)
    const body = pick(row.article_body_uk, row.article_body_en, row.article_body_ru)
    if (!title && !excerpt && !body) return null
    return { title, excerpt, body }
  })

  return {
    meta: computed(() => meta.value?.meta ?? null),
    row: computed(() => meta.value?.row ?? null),
    visaInfo,
    article,
    pending,
    refresh,
  }
}
