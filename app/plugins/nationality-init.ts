// Runs on BOTH server and client before any page renders.
// Reads the nv_nationality cookie and seeds the Pinia store,
// so SSR queries already know the nationality on first render.
export default defineNuxtPlugin(() => {
  const store = useUserStore()
  const cookie = useCookie('nv_nationality')
  if (cookie.value) {
    store.initFromCookie(cookie.value)
  }
})
