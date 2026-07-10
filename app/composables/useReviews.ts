import type { Review } from '~/types/review'

export function useReviews() {
  const supabase = useSupabaseClient()

  async function fetchReviews(targetCountry: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('target_country', targetCountry)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data ?? []).map(row => {
      // Safely parse JSONB if they happen to come as strings, though typical Supabase client parses automatically
      const ratings = (typeof row.ratings === 'string' 
        ? JSON.parse(row.ratings) 
        : row.ratings) as Record<string, number>
        
      const comments = (typeof row.comments === 'string' 
        ? JSON.parse(row.comments) 
        : row.comments) as Record<string, string | null>

      return {
        id: row.id,
        created_at: row.created_at,
        author_nationality: row.author_nationality,
        target_country: row.target_country,
        ratings,
        comments,
        is_approved: row.is_approved,
      }
    }) as Review[]
  }

  async function submitReview(review: Omit<Review, 'id' | 'created_at' | 'is_approved'>) {
    const { error } = await supabase.from('reviews').insert({
      author_nationality: review.author_nationality,
      target_country: review.target_country,
      ratings: review.ratings,
      comments: review.comments,
      is_approved: false,
    })
    if (error) throw error
  }

  return { fetchReviews, submitReview }
}
