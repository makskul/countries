// Sync profile when auth session changes on the client.
export default defineNuxtPlugin(() => {
  const user = useSupabaseUser()
  const { fetchAndSyncProfile } = useAuthProfile()

  watch(user, (u) => {
    if (u) fetchAndSyncProfile()
    else useUserStore().clearSession()
  }, { immediate: true })
})
