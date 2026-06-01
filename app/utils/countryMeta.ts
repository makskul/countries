export interface CountryMeta {
  language: string
  currency: string
  climate: string
  costLevel: 'Низкая' | 'Средняя' | 'Высокая'
  residencyMonths: string
}

export const COUNTRY_META: Record<string, CountryMeta> = {
  PT: { language: 'Португальский', currency: 'EUR', climate: 'Средиземноморский', costLevel: 'Средняя', residencyMonths: '24 мес.' },
  DE: { language: 'Немецкий', currency: 'EUR', climate: 'Умеренный', costLevel: 'Высокая', residencyMonths: '60 мес.' },
  ES: { language: 'Испанский', currency: 'EUR', climate: 'Средиземноморский', costLevel: 'Средняя', residencyMonths: '60 мес.' },
  FR: { language: 'Французский', currency: 'EUR', climate: 'Умеренный', costLevel: 'Высокая', residencyMonths: '60 мес.' },
  IT: { language: 'Итальянский', currency: 'EUR', climate: 'Средиземноморский', costLevel: 'Средняя', residencyMonths: '60 мес.' },
  PL: { language: 'Польский', currency: 'PLN', climate: 'Умеренный', costLevel: 'Низкая', residencyMonths: '60 мес.' },
  CZ: { language: 'Чешский', currency: 'CZK', climate: 'Умеренный', costLevel: 'Средняя', residencyMonths: '60 мес.' },
  NL: { language: 'Нидерландский', currency: 'EUR', climate: 'Умеренный', costLevel: 'Высокая', residencyMonths: '60 мес.' },
  AT: { language: 'Немецкий', currency: 'EUR', climate: 'Умеренный', costLevel: 'Высокая', residencyMonths: '60 мес.' },
  CH: { language: 'Немецкий / Французский', currency: 'CHF', climate: 'Альпийский', costLevel: 'Высокая', residencyMonths: '120 мес.' },
  GB: { language: 'Английский', currency: 'GBP', climate: 'Умеренный', costLevel: 'Высокая', residencyMonths: '60 мес.' },
  US: { language: 'Английский', currency: 'USD', climate: 'Разнообразный', costLevel: 'Высокая', residencyMonths: '60 мес.' },
  CA: { language: 'Английский / Французский', currency: 'CAD', climate: 'Умеренный / Арктический', costLevel: 'Высокая', residencyMonths: '36 мес.' },
  AU: { language: 'Английский', currency: 'AUD', climate: 'Жаркий', costLevel: 'Высокая', residencyMonths: '48 мес.' },
  TR: { language: 'Турецкий', currency: 'TRY', climate: 'Средиземноморский', costLevel: 'Низкая', residencyMonths: '24 мес.' },
  GE: { language: 'Грузинский', currency: 'GEL', climate: 'Умеренный', costLevel: 'Низкая', residencyMonths: '12 мес.' },
  TH: { language: 'Тайский', currency: 'THB', climate: 'Тропический', costLevel: 'Низкая', residencyMonths: '12 мес.' },
  JP: { language: 'Японский', currency: 'JPY', climate: 'Умеренный', costLevel: 'Высокая', residencyMonths: '60 мес.' },
  AE: { language: 'Арабский / Английский', currency: 'AED', climate: 'Пустынный', costLevel: 'Высокая', residencyMonths: '24 мес.' },
  ME: { language: 'Черногорский', currency: 'EUR', climate: 'Средиземноморский', costLevel: 'Низкая', residencyMonths: '36 мес.' },
  RS: { language: 'Сербский', currency: 'RSD', climate: 'Умеренный', costLevel: 'Низкая', residencyMonths: '60 мес.' },
  AM: { language: 'Армянский', currency: 'AMD', climate: 'Умеренный', costLevel: 'Низкая', residencyMonths: '12 мес.' },
}

export function getCountryMeta(code: string): CountryMeta | null {
  return COUNTRY_META[code.toUpperCase()] ?? null
}
