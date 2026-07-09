export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin/login') {
    const user = useSupabaseUser()
    if (user.value) return navigateTo('/admin')
    return
  }

  const client = useSupabaseClient()
  const { data: { session } } = await client.auth.getSession()
  if (!session) {
    return navigateTo('/admin/login')
  }
})
