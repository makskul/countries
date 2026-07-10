const LOCALE_PREFIX_RE = /^\/(en|ru)(?=\/|$)/

function stripLocalePrefix(path: string) {
  return path.replace(LOCALE_PREFIX_RE, '') || '/'
}

function isAdminLoginPath(path: string) {
  const bare = stripLocalePrefix(path)
  return bare === '/admin/login'
}

function isAdminPath(path: string) {
  const bare = stripLocalePrefix(path)
  return bare === '/admin' || bare.startsWith('/admin/')
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
