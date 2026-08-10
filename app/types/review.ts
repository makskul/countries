export interface Review {
  id: string
  created_at: string
  author_nationality: string
  target_country: string
  ratings: Record<string, number>
  comments: Record<string, string | null>
  climate?: string[] | null
  is_approved: boolean
}

export const CATEGORIES = [
  { key: 'legalization', label: 'Legalization / Visa / Residency' },
  { key: 'cost_of_living', label: 'Cost of Living' },
  { key: 'bureaucracy', label: 'Government Document Speed' },
  { key: 'cleanliness', label: 'Cleanliness / Infrastructure' },
  { key: 'weather', label: 'Weather / Climate' },
  { key: 'safety', label: 'Safety' },
  { key: 'healthcare', label: 'Healthcare Quality' },
  { key: 'language_barrier', label: 'Language Barrier' },
  { key: 'overall', label: 'Overall Recommendation' },
] as const

export type CategoryKey = typeof CATEGORIES[number]['key']
