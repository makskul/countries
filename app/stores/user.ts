import { defineStore } from 'pinia'

const COOKIE_KEY = 'nv_nationality'
const FAVORITES_KEY = 'nv_favorites'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

export type ProfileSnapshot = {
  default_nationality: string | null
  locale: string | null
  display_name: string | null
}

export const useUserStore = defineStore('user', {
  state: () => ({
    nationality: '' as string,
    profileNationality: '' as string,
    isLoggedIn: false as boolean,
    selectedCityId: null as number | null,
    showAllReviews: false as boolean,
    favoriteCountries: [] as string[],
  }),
  getters: {
    effectiveNationality: (state): string =>
      (state.isLoggedIn && state.profileNationality) || state.nationality,
    isFavorite: state => (code: string) =>
      state.favoriteCountries.includes(code.toUpperCase()),
  },
  actions: {
    setNationality(code: string) {
      const prev = this.effectiveNationality
      this.nationality = code
      this.showAllReviews = false
      if (import.meta.client) {
        localStorage.setItem('nationality', code)
        document.cookie = `${COOKIE_KEY}=${code}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
        if (code && code !== prev) {
          import('~/utils/analytics').then(({ trackEvent }) => {
            trackEvent('nat_set', { nationality: code })
          })
        }
      }
    },
    syncFromProfile(profile: ProfileSnapshot | null, loggedIn = true) {
      this.isLoggedIn = loggedIn
      if (!loggedIn) {
        this.profileNationality = ''
        return
      }
      if (profile?.default_nationality) {
        this.profileNationality = profile.default_nationality.toUpperCase()
        this.nationality = this.profileNationality
        if (import.meta.client) {
          localStorage.setItem('nationality', this.profileNationality)
          document.cookie = `${COOKIE_KEY}=${this.profileNationality}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
        }
      }
    },
    clearSession() {
      this.isLoggedIn = false
      this.profileNationality = ''
    },
    setSelectedCity(id: number | null) {
      this.selectedCityId = id
    },
    setShowAllReviews(val: boolean) {
      this.showAllReviews = val
    },
    toggleFavorite(code: string) {
      const upper = code.toUpperCase()
      const idx = this.favoriteCountries.indexOf(upper)
      if (idx === -1) this.favoriteCountries.push(upper)
      else this.favoriteCountries.splice(idx, 1)
      this.persistFavorites()
    },
    persistFavorites() {
      if (import.meta.client) {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(this.favoriteCountries))
      }
    },
    initFromCookie(val: string) {
      if (val && !this.nationality) this.nationality = val
    },
    loadFavoritesFromStorage() {
      if (!import.meta.client) return
      const raw = localStorage.getItem(FAVORITES_KEY)
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          this.favoriteCountries = parsed.map((c: string) => String(c).toUpperCase())
        }
      } catch {
        // ignore invalid storage
      }
    },
    loadFromStorage() {
      if (!import.meta.client) return
      if (!this.nationality && !this.profileNationality) {
        const stored = localStorage.getItem('nationality')
        if (stored) {
          this.nationality = stored
          document.cookie = `nv_nationality=${stored}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
        }
      }
      this.loadFavoritesFromStorage()
    },
  },
})
