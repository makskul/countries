import type { CountryRow } from '~/types/database.types'
import { getCountryMeta, mapCountryRowToMeta } from '~/utils/countryMeta'

export function useCountryMetaData(countryCode: MaybeRef<string>) {
  const code = computed(() => unref(countryCode).toUpperCase())
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

  return { meta: computed(() => meta.value?.meta ?? null), visaInfo, pending, refresh }
}
