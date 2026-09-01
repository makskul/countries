<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const user = useSupabaseUser()
const { fetchAndSyncProfile, claimPendingReview } = useAuthProfile()

useSeoMeta({ robots: 'noindex, nofollow' })

const error = ref('')

const returnTo = computed(() => {
  const raw = route.query.returnTo
  if (typeof raw === 'string' && raw.startsWith('/') && !raw.startsWith('//')) {
    return raw
  }
  return localePath('/account')
})

async function finishAuth() {
  try {
    await fetchAndSyncProfile()

    if (import.meta.client) {
      const raw = sessionStorage.getItem('nv_pending_claim')
      if (raw) {
        try {
          const { review_id, claim_token } = JSON.parse(raw) as { review_id: string; claim_token: string }
          await claimPendingReview(review_id, claim_token)
          sessionStorage.removeItem('nv_pending_claim')
        } catch {
          sessionStorage.removeItem('nv_pending_claim')
        }
      }
    }

    const { trackEvent } = await import('~/utils/analytics')
    trackEvent('auth_signup_complete', { method: 'callback' })
    trackEvent('auth_login', {})

    await navigateTo(returnTo.value)
  } catch {
    error.value = t('auth.callback.error')
  }
}

watch(user, (u) => {
  if (u) finishAuth()
}, { immediate: true })

onMounted(() => {
  setTimeout(() => {
    if (!user.value) {
      error.value = t('auth.callback.error')
    }
  }, 8000)
})
</script>

<template>
  <div class="auth-page">
    <div class="auth-card auth-card--center">
      <ProgressSpinner v-if="!error" style="width: 48px; height: 48px" />
      <h1>{{ error || $t('auth.callback.title') }}</h1>
      <NuxtLinkLocale v-if="error" to="/login" class="auth-back">{{ $t('auth.login.title') }}</NuxtLinkLocale>
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
.auth-card--center {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.auth-card h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--color-text);
}
.auth-back {
  font-size: 13px;
  color: var(--color-primary);
  text-decoration: none;
}
.auth-back:hover { text-decoration: underline; }
</style>
