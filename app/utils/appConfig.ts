// ─── Central app identity config ───────────────────────────────────────────
// Change APP_NAME / APP_DOMAIN here → update all .vue / .ts references below
// Locale files (locales/**) still contain hardcoded strings — run a
// project-wide find-replace when renaming again.

export const APP_NAME   = 'Triplandr'
export const APP_DOMAIN = 'triplandr.com'
export const APP_URL    = `https://${APP_DOMAIN}`

export const APP_SOCIAL = {
  telegram:  `https://t.me/triplandr`,
  twitter:   `https://twitter.com/triplandr`,
  instagram: `https://instagram.com/triplandr`,
}

export const APP_EMAIL = {
  hello:   `hello@${APP_DOMAIN}`,
  privacy: `privacy@${APP_DOMAIN}`,
}
