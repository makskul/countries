import { defineStore } from 'pinia'

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
      }
    },
    setSelectedCity(id: number | null) {
      this.selectedCityId = id
    },
    setShowAllReviews(val: boolean) {
      this.showAllReviews = val
    },
    loadFromStorage() {
      if (import.meta.client) {
        const stored = localStorage.getItem('nationality')
        if (stored) this.nationality = stored
      }
    },
  },
})
