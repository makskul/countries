const LOCALE_PREFIX_RE = /^\/(en|ru)(?=\/|$)/

function stripLocalePrefix(path: string) {
  return path.replace(LOCALE_PREFIX_RE, '') || '/'
}

function isAccountPath(path: string) {
  const bare = stripLocalePrefix(path)
  return bare === '/account' || bare.startsWith('/account/')
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (!isAccountPath(to.path)) return

  const client = useSupabaseClient()
  const { data: { session } } = await client.auth.getSession()
  if (!session) {
    const returnTo = encodeURIComponent(to.fullPath)
    const localePath = useLocalePath()
    return navigateTo(`${localePath('/login')}?returnTo=${returnTo}`)
  }
})
