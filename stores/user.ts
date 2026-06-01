import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    nationality: '' as string,
  }),
  actions: {
    setNationality(code: string) {
      this.nationality = code
      if (import.meta.client) {
        localStorage.setItem('nationality', code)
      }
    },
    loadFromStorage() {
      if (import.meta.client) {
        const stored = localStorage.getItem('nationality')
        if (stored) this.nationality = stored
      }
    },
  },
})
