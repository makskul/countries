function isAdminLoginPath(path: string) {
  return path === '/admin/login' || path.endsWith('/admin/login')
}

function isAdminPath(path: string) {
  return path === '/admin' || path.startsWith('/admin/')
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (!isAdminPath(to.path)) {
    return
  }

  if (isAdminLoginPath(to.path)) {
    const user = useSupabaseUser()
    if (user.value) {
      return navigateTo('/admin')
    }
    return
  }

  const client = useSupabaseClient()
  const { data: { session } } = await client.auth.getSession()
  if (!session) {
    return navigateTo('/admin/login')
  }
})
