import type { Review, GroupedReviews } from '~/types/review'
import { CATEGORIES } from '~/types/review'

export function useReviews() {
  const supabase = useSupabaseClient()

  async function fetchReviews(targetCountry: string, authorNationality: string): Promise<GroupedReviews[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('target_country', targetCountry)
      .eq('author_nationality', authorNationality)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    const reviews = (data ?? []) as Review[]

    return CATEGORIES.map(cat => {
      const catReviews = reviews.filter(r => r.category === cat.key)
      const avgRating = catReviews.length
        ? catReviews.reduce((sum, r) => sum + r.rating, 0) / catReviews.length
        : 0
      return {
        category: cat.key,
        label: cat.label,
        avgRating: Math.round(avgRating * 10) / 10,
        reviews: catReviews,
      }
    })
  }

  async function submitReview(review: Omit<Review, 'id' | 'created_at' | 'is_approved'>) {
    const { error } = await supabase.from('reviews').insert({
      ...review,
      is_approved: false,
    })
    if (error) throw error
  }

  return { fetchReviews, submitReview }
}
