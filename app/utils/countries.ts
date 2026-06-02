export interface Country {
  code: string
  name: string
}

export const NATIONALITIES: Country[] = [
  { code: 'UA', name: 'Ukraine' },
  { code: 'DE', name: 'Germany' },
  { code: 'PL', name: 'Poland' },
  { code: 'DK', name: 'Denmark' },
  { code: 'GB', name: 'United Kingdom' },
]

// EU, Scandinavia, Vietnam, Thailand, and Bali (Indonesia)
export const TARGET_COUNTRIES: Country[] = [
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NO', name: 'Norway' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IM', name: 'Isle of Man' },
  { code: 'JE', name: 'Jersey' },
  { code: 'GG', name: 'Guernsey' },
  { code: 'TH', name: 'Thailand' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'ID', name: 'Bali (Indonesia)' },
]

// Alias for template usage
export const COUNTRIES = TARGET_COUNTRIES

// Combined lists for lookup helpers
export const ALL_COUNTRIES = [
  ...NATIONALITIES,
  ...TARGET_COUNTRIES
].reduce((acc, current) => {
  if (!acc.some(item => item.code === current.code)) {
    acc.push(current)
  }
  return acc
}, [] as Country[])

export function getCountryName(code: string): string {
  return ALL_COUNTRIES.find(c => c.code === code)?.name ?? code
}

export function countryToSlug(code: string): string {
  return code.toLowerCase()
}

export function slugToCountry(slug: string): string {
  return slug.toUpperCase()
}

// Convert two-letter ISO country code to flag emoji dynamically
export function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
