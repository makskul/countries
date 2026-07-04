import { defineStore } from 'pinia'

const COOKIE_KEY = 'nv_nationality'
const FAVORITES_KEY = 'nv_favorites'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

export const useUserStore = defineStore('user', {
  state: () => ({
    nationality: '' as string,
    selectedCityId: null as number | null,
    showAllReviews: false as boolean,
    favoriteCountries: [] as string[],
  }),
  getters: {
    isFavorite: state => (code: string) =>
      state.favoriteCountries.includes(code.toUpperCase()),
  },
  actions: {
    setNationality(code: string) {
      this.nationality = code
      this.showAllReviews = false
      if (import.meta.client) {
        localStorage.setItem('nationality', code)
        document.cookie = `${COOKIE_KEY}=${code}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
      }
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
      if (!this.nationality) {
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
