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

  // Use the same source as the login branch above (useSupabaseUser, which is
  // populated from cookies on the server too). client.auth.getSession() is empty
  // during SSR, which made /admin -> /admin/login -> /admin loop forever on a
  // hard page load for a signed-in user (ERR_TOO_MANY_REDIRECTS).
  const user = useSupabaseUser()
  if (!user.value) {
    return navigateTo('/admin/login')
  }
})
