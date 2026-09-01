<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

useSeoMeta({
  title: () => t('auth.seo.login.title'),
  description: () => t('auth.seo.login.description'),
  robots: 'noindex, nofollow',
})

const email = ref('')
const error = ref('')
const loading = ref(false)
const magicLinkSent = ref(false)

const returnTo = computed(() => {
  const raw = route.query.returnTo
  if (typeof raw === 'string' && raw.startsWith('/') && !raw.startsWith('//')) {
    return raw
  }
  return localePath('/account')
})

watch(user, (u) => {
  if (u) navigateTo(returnTo.value)
}, { immediate: true })

function callbackUrl() {
  if (!import.meta.client) return ''
  return `${window.location.origin}${localePath('/auth/callback')}?returnTo=${encodeURIComponent(returnTo.value)}`
}

async function sendMagicLink() {
  error.value = ''
  loading.value = true
  try {
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.value.trim(),
      options: { emailRedirectTo: callbackUrl() },
    })
    if (authError) throw authError
    magicLinkSent.value = true
    const { trackEvent } = await import('~/utils/analytics')
    trackEvent('auth_signup_start', { method: 'magic_link' })
  } catch (e: unknown) {
    const err = e as { message?: string }
    error.value = err.message ?? t('auth.login.errors.generic')
  } finally {
    loading.value = false
  }
}

async function signInWithGoogle() {
  error.value = ''
  loading.value = true
  try {
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl() },
    })
    if (authError) throw authError
    const { trackEvent } = await import('~/utils/analytics')
    trackEvent('auth_signup_start', { method: 'google' })
  } catch {
    error.value = t('auth.login.errors.oauth')
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>{{ $t('auth.login.title') }}</h1>
      <p class="auth-sub">{{ $t('auth.login.subtitle') }}</p>

      <Message v-if="magicLinkSent" severity="success" :closable="false" class="mb-3">
        {{ $t('auth.login.magicLinkSent') }}
      </Message>

      <form v-if="!magicLinkSent" @submit.prevent="sendMagicLink">
        <div class="auth-field">
          <label for="email">{{ $t('auth.login.emailLabel') }}</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            class="w-full"
            :placeholder="$t('auth.login.emailPlaceholder')"
            required
            autocomplete="email"
          />
        </div>
        <Message v-if="error" severity="error" :closable="false" class="mb-3">{{ error }}</Message>
        <Button
          type="submit"
          :label="$t('auth.login.magicLinkBtn')"
          class="w-full mb-2"
          :loading="loading"
        />
      </form>

      <Button
        v-else
        type="button"
        :label="$t('auth.login.magicLinkResend')"
        class="w-full mb-2"
        severity="secondary"
        :loading="loading"
        @click="magicLinkSent = false"
      />

      <div class="auth-divider"><span>{{ $t('auth.login.orDivider') }}</span></div>

      <Button
        type="button"
        :label="$t('auth.login.googleBtn')"
        class="w-full"
        severity="secondary"
        icon="pi pi-google"
        :loading="loading"
        @click="signInWithGoogle"
      />

      <p class="auth-note">{{ $t('auth.login.noAccount') }}</p>
      <NuxtLinkLocale to="/" class="auth-back">{{ $t('auth.login.backHome') }}</NuxtLinkLocale>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: var(--color-bg-secondary);
}
.auth-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 32px;
}
.auth-card h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--color-text);
}
.auth-sub {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0 0 24px;
  line-height: 1.5;
}
.auth-field {
  margin-bottom: 16px;
}
.auth-field label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
  color: var(--color-text);
}
.auth-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  color: var(--color-text-muted);
  font-size: 12px;
}
.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
}
.auth-note {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 20px 0 12px;
  line-height: 1.5;
  text-align: center;
}
.auth-back {
  display: block;
  text-align: center;
  font-size: 13px;
  color: var(--color-primary);
  text-decoration: none;
}
.auth-back:hover { text-decoration: underline; }
.mb-3 { margin-bottom: 12px; }
.mb-2 { margin-bottom: 8px; }
.w-full { width: 100%; }
</style>
