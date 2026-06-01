import { NATIONALITIES, TARGET_COUNTRIES } from '~/utils/countries'
import { getFlagEmoji } from '~/utils/countries'

// Map our locale codes to BCP 47 tags that Intl.DisplayNames understands
const LOCALE_MAP: Record<string, string> = {
  uk: 'uk-UA',
  en: 'en-US',
  ru: 'ru-RU',
}

export function useLocalizedCountries() {
  const { locale } = useI18n()

  function getDisplayNames(localeCode: string) {
    const bcp47 = LOCALE_MAP[localeCode] ?? localeCode
    return new Intl.DisplayNames([bcp47], { type: 'region' })
  }

  const countryList = computed(() => {
    if (!import.meta.client) return TARGET_COUNTRIES
    const dn = getDisplayNames(locale.value)
    return TARGET_COUNTRIES.map(c => ({
      code: c.code,
      name: dn.of(c.code) ?? c.name,
      flag: getFlagEmoji(c.code),
    })).sort((a, b) => a.name.localeCompare(b.name, locale.value))
  })

  const nationalityList = computed(() => {
    if (!import.meta.client) return NATIONALITIES
    const dn = getDisplayNames(locale.value)
    return NATIONALITIES.map(c => ({
      code: c.code,
      name: dn.of(c.code) ?? c.name,
      flag: getFlagEmoji(c.code),
    })).sort((a, b) => a.name.localeCompare(b.name, locale.value))
  })

  function getCountryNameLocalized(code: string): string {
    if (!import.meta.client || !code) return code
    try {
      const dn = getDisplayNames(locale.value)
      return dn.of(code.toUpperCase()) ?? code
    } catch {
      return code
    }
  }

  return { countryList, nationalityList, getCountryNameLocalized }
}
