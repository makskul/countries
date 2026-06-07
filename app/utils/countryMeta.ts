export interface CountryMeta {
  languageKey: string
  currency: string
  climateKey: string
  costLevel: 'low' | 'medium' | 'high' | 'very_high'
  residencyMonths: string
  tax_employee: string
  tax_corporate: string
}

export const COUNTRY_META: Record<string, CountryMeta> = {
  AT: { languageKey: 'german',          currency: 'EUR', climateKey: 'temperate',    costLevel: 'very_high', residencyMonths: '60',  tax_employee: '0–55%',    tax_corporate: '23%' },
  BE: { languageKey: 'dutch_french',    currency: 'EUR', climateKey: 'temperate',    costLevel: 'high',      residencyMonths: '60',  tax_employee: '25–50%',   tax_corporate: '25%' },
  BG: { languageKey: 'bulgarian',       currency: 'EUR', climateKey: 'temperate',    costLevel: 'low',       residencyMonths: '60',  tax_employee: '10%',      tax_corporate: '10%' },
  HR: { languageKey: 'croatian',        currency: 'EUR', climateKey: 'mediterranean',costLevel: 'medium',    residencyMonths: '60',  tax_employee: '20–30%',   tax_corporate: '18%' },
  CY: { languageKey: 'greek_english',   currency: 'EUR', climateKey: 'mediterranean',costLevel: 'medium',    residencyMonths: '60',  tax_employee: '0–35%',    tax_corporate: '12.5%' },
  CZ: { languageKey: 'czech',           currency: 'CZK', climateKey: 'temperate',    costLevel: 'medium',    residencyMonths: '60',  tax_employee: '15–23%',   tax_corporate: '21%' },
  DK: { languageKey: 'danish',          currency: 'DKK', climateKey: 'temperate',    costLevel: 'very_high', residencyMonths: '60',  tax_employee: '37–52%',   tax_corporate: '22%' },
  EE: { languageKey: 'estonian',        currency: 'EUR', climateKey: 'temperate',    costLevel: 'medium',    residencyMonths: '60',  tax_employee: '20%',      tax_corporate: '0–20%' },
  FI: { languageKey: 'finnish',         currency: 'EUR', climateKey: 'northern',     costLevel: 'high',      residencyMonths: '60',  tax_employee: '12–44%',   tax_corporate: '20%' },
  FR: { languageKey: 'french',          currency: 'EUR', climateKey: 'temperate',    costLevel: 'high',      residencyMonths: '60',  tax_employee: '0–45%',    tax_corporate: '25%' },
  DE: { languageKey: 'german',          currency: 'EUR', climateKey: 'temperate',    costLevel: 'high',      residencyMonths: '60',  tax_employee: '14–45%',   tax_corporate: '15%' },
  GR: { languageKey: 'greek',           currency: 'EUR', climateKey: 'mediterranean',costLevel: 'medium',    residencyMonths: '60',  tax_employee: '9–44%',    tax_corporate: '22%' },
  HU: { languageKey: 'hungarian',       currency: 'HUF', climateKey: 'temperate',    costLevel: 'low',       residencyMonths: '60',  tax_employee: '15%',      tax_corporate: '9%' },
  IS: { languageKey: 'icelandic',       currency: 'ISK', climateKey: 'subarctic',    costLevel: 'very_high', residencyMonths: '48',  tax_employee: '31–46%',   tax_corporate: '20%' },
  IE: { languageKey: 'english',         currency: 'EUR', climateKey: 'temperate',    costLevel: 'very_high', residencyMonths: '60',  tax_employee: '20–40%',   tax_corporate: '12.5%' },
  IL: { languageKey: 'hebrew_arabic',   currency: 'ILS', climateKey: 'mediterranean',costLevel: 'high',      residencyMonths: '84',  tax_employee: '10–50%',   tax_corporate: '23%' },
  IT: { languageKey: 'italian',         currency: 'EUR', climateKey: 'mediterranean',costLevel: 'medium',    residencyMonths: '60',  tax_employee: '23–43%',   tax_corporate: '24%' },
  LV: { languageKey: 'latvian',         currency: 'EUR', climateKey: 'temperate',    costLevel: 'medium',    residencyMonths: '60',  tax_employee: '20–31%',   tax_corporate: '20%' },
  LT: { languageKey: 'lithuanian',      currency: 'EUR', climateKey: 'temperate',    costLevel: 'medium',    residencyMonths: '60',  tax_employee: '15–32%',   tax_corporate: '15%' },
  LU: { languageKey: 'french_german',   currency: 'EUR', climateKey: 'temperate',    costLevel: 'very_high', residencyMonths: '60',  tax_employee: '0–42%',    tax_corporate: '17%' },
  MD: { languageKey: 'romanian',        currency: 'MDL', climateKey: 'temperate',    costLevel: 'low',       residencyMonths: '36',  tax_employee: '12%',      tax_corporate: '12%' },
  MT: { languageKey: 'maltese_english', currency: 'EUR', climateKey: 'mediterranean',costLevel: 'medium',    residencyMonths: '60',  tax_employee: '0–35%',    tax_corporate: '35%' },
  NL: { languageKey: 'dutch',           currency: 'EUR', climateKey: 'temperate',    costLevel: 'very_high', residencyMonths: '60',  tax_employee: '9–49.5%',  tax_corporate: '19–25.8%' },
  NO: { languageKey: 'norwegian',       currency: 'NOK', climateKey: 'northern',     costLevel: 'very_high', residencyMonths: '60',  tax_employee: '22–47%',   tax_corporate: '22%' },
  PL: { languageKey: 'polish',          currency: 'PLN', climateKey: 'temperate',    costLevel: 'low',       residencyMonths: '60',  tax_employee: '12–32%',   tax_corporate: '19%' },
  PT: { languageKey: 'portuguese',      currency: 'EUR', climateKey: 'mediterranean',costLevel: 'medium',    residencyMonths: '24',  tax_employee: '14–48%',   tax_corporate: '21%' },
  RO: { languageKey: 'romanian',        currency: 'RON', climateKey: 'temperate',    costLevel: 'low',       residencyMonths: '60',  tax_employee: '10%',      tax_corporate: '16%' },
  SK: { languageKey: 'slovak',          currency: 'EUR', climateKey: 'temperate',    costLevel: 'medium',    residencyMonths: '60',  tax_employee: '19–25%',   tax_corporate: '21%' },
  SI: { languageKey: 'slovenian',       currency: 'EUR', climateKey: 'temperate',    costLevel: 'medium',    residencyMonths: '60',  tax_employee: '16–50%',   tax_corporate: '19%' },
  ES: { languageKey: 'spanish',         currency: 'EUR', climateKey: 'mediterranean',costLevel: 'medium',    residencyMonths: '60',  tax_employee: '19–47%',   tax_corporate: '25%' },
  SE: { languageKey: 'swedish',         currency: 'SEK', climateKey: 'northern',     costLevel: 'very_high', residencyMonths: '60',  tax_employee: '32–52%',   tax_corporate: '20.6%' },
  CH: { languageKey: 'german_french',   currency: 'CHF', climateKey: 'alpine',       costLevel: 'very_high', residencyMonths: '120', tax_employee: '0–40%',    tax_corporate: '12–21%' },
  GB: { languageKey: 'english',         currency: 'GBP', climateKey: 'temperate',    costLevel: 'high',      residencyMonths: '60',  tax_employee: '20–45%',   tax_corporate: '25%' },
  IM: { languageKey: 'english',         currency: 'GBP', climateKey: 'temperate',    costLevel: 'high',      residencyMonths: '60',  tax_employee: '10–20%',   tax_corporate: '0%' },
  JE: { languageKey: 'english',         currency: 'GBP', climateKey: 'temperate',    costLevel: 'high',      residencyMonths: '60',  tax_employee: '20%',      tax_corporate: '0%' },
  GG: { languageKey: 'english',         currency: 'GBP', climateKey: 'temperate',    costLevel: 'high',      residencyMonths: '60',  tax_employee: '20%',      tax_corporate: '0%' },
  TH: { languageKey: 'thai',            currency: 'THB', climateKey: 'tropical',     costLevel: 'low',       residencyMonths: '12',  tax_employee: '5–35%',    tax_corporate: '20%' },
  VN: { languageKey: 'vietnamese',      currency: 'VND', climateKey: 'tropical',     costLevel: 'low',       residencyMonths: '12',  tax_employee: '5–35%',    tax_corporate: '20%' },
  ID: { languageKey: 'indonesian',      currency: 'IDR', climateKey: 'tropical',     costLevel: 'low',       residencyMonths: '12',  tax_employee: '5–35%',    tax_corporate: '22%' },
}

export function getCountryMeta(code: string): CountryMeta | null {
  return COUNTRY_META[code.toUpperCase()] ?? null
}
