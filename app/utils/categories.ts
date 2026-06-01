// Keys MUST match what review/new.vue writes into ratings/comments JSONB
// Source of truth: app/types/review.ts CATEGORIES[].key
export const CATEGORIES = [
  'legalization',
  'attitude',
  'cost_of_living',
  'bureaucracy',
  'cleanliness',
  'weather',
  'safety',
  'healthcare',
  'language_barrier',
  'overall',
] as const

export type CategoryKey = typeof CATEGORIES[number]

export const CATEGORY_LABELS: Record<string, string> = {
  legalization:     'Легализация',
  attitude:         'Отношение',
  cost_of_living:   'Стоимость жизни',
  bureaucracy:      'Документы',
  cleanliness:      'Чистота',
  weather:          'Погода',
  safety:           'Безопасность',
  healthcare:       'Медицина',
  language_barrier: 'Языковой барьер',
  overall:          'Общая оценка',
}

export const CATEGORY_ICONS: Record<string, string> = {
  legalization:     'shield',
  attitude:         'users',
  cost_of_living:   'dollar',
  bureaucracy:      'clipboard',
  cleanliness:      'sparkles',
  weather:          'cloud',
  safety:           'badge',
  healthcare:       'heart',
  language_barrier: 'chat',
  overall:          'star',
}
