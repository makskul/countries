// Runs on BOTH server and client before any page renders.
// Reads the nv_nationality cookie and seeds the Pinia store,
// so SSR queries already know the nationality on first render.
export default defineNuxtPlugin(() => {
  const store = useUserStore()
  const route = useRoute()
  const cookie = useCookie('nv_nationality', { maxAge: 60 * 60 * 24 * 365 })

  function syncNationality() {
    if (cookie.value && !store.nationality) {
      store.initFromCookie(cookie.value)
    }

    const natQuery = route.query.nat
    if (typeof natQuery === 'string' && natQuery.trim()) {
      const code = natQuery.trim().toUpperCase()
      cookie.value = code
      store.setNationality(code)
    }
  }

  syncNationality()
  watch(() => route.query.nat, syncNationality)
})
