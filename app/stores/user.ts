import { defineStore } from 'pinia'

const COOKIE_KEY = 'nv_nationality'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

export const useUserStore = defineStore('user', {
  state: () => ({
    nationality: '' as string,
    selectedCityId: null as number | null,
    showAllReviews: false as boolean, // persists between country/city pages
  }),
  actions: {
    setNationality(code: string) {
      this.nationality = code
      this.showAllReviews = false // reset when nationality changes
      if (import.meta.client) {
        localStorage.setItem('nationality', code)
        // Write to cookie so SSR can read it on next request
        document.cookie = `${COOKIE_KEY}=${code}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
      }
    },
    setSelectedCity(id: number | null) {
      this.selectedCityId = id
    },
    setShowAllReviews(val: boolean) {
      this.showAllReviews = val
    },
    initFromCookie(val: string) {
      if (val && !this.nationality) this.nationality = val
    },
    loadFromStorage() {
      if (import.meta.client && !this.nationality) {
        const stored = localStorage.getItem('nationality')
        if (stored) {
          this.nationality = stored
          // Backfill cookie so SSR can read it on the next request
          document.cookie = `nv_nationality=${stored}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
        }
      }
    },
  },
})
