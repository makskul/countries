export function useAuthProfile() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const store = useUserStore()
  const localePath = useLocalePath()

  async function fetchAndSyncProfile() {
    if (!user.value) {
      store.clearSession()
      return null
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('default_nationality, locale, display_name')
      .eq('id', user.value.id)
      .single()

    if (!error && profile) {
      store.syncFromProfile(profile, true)
    } else {
      store.isLoggedIn = true
    }

    return profile
  }

  async function signOut() {
    await supabase.auth.signOut()
    store.clearSession()
    await navigateTo(localePath('/'))
  }

  async function claimPendingReview(reviewId: string, claimToken: string) {
    await $fetch('/api/reviews/claim', {
      method: 'POST',
      body: { review_id: reviewId, claim_token: claimToken },
      credentials: 'include',
    })
    const { trackEvent } = await import('~/utils/analytics')
    trackEvent('review_claim', { review_id: reviewId })
  }

  return {
    user,
    fetchAndSyncProfile,
    signOut,
    claimPendingReview,
  }
}
