<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const user = useSupabaseUser()
const toast = useToast()
const { fetchAndSyncProfile, claimPendingReview } = useAuthProfile()

useSeoMeta({ robots: 'noindex, nofollow' })

const error = ref('')
const finishing = ref(false)

const returnTo = computed(() => {
  const raw = route.query.returnTo
  if (typeof raw === 'string' && raw.startsWith('/') && !raw.startsWith('//')) {
    return raw
  }
  return localePath('/account')
})

async function finishAuth() {
  if (finishing.value) return
  finishing.value = true
  try {
    await fetchAndSyncProfile()

    if (import.meta.client) {
      const raw = sessionStorage.getItem('nv_pending_claim')
      if (raw) {
        try {
          const { review_id, claim_token } = JSON.parse(raw) as { review_id: string; claim_token: string }
          await claimPendingReview(review_id, claim_token)
          sessionStorage.removeItem('nv_pending_claim')
          toast.add({
            severity: 'success',
            summary: t('auth.account.claimSuccess'),
            life: 4000,
          })
        } catch {
          // Keep token so a retry after refresh can still claim
          toast.add({
            severity: 'warn',
            summary: t('auth.callback.claimError'),
            life: 5000,
          })
        }
      } else {
        // Cookie-backed claim when sessionStorage is empty (cross-device / new tab)
        try {
          await $fetch('/api/reviews/claim', {
            method: 'POST',
            body: {},
            credentials: 'include',
          })
          toast.add({
            severity: 'success',
            summary: t('auth.account.claimSuccess'),
            life: 4000,
          })
        } catch {
          // No pending cookie claim — ignore
        }
      }
    }

    const { trackEvent } = await import('~/utils/analytics')
    trackEvent('auth_signup_complete', { method: 'callback' })
    trackEvent('auth_login', {})

    await navigateTo(returnTo.value)
  } catch {
    finishing.value = false
    error.value = t('auth.callback.error')
  }
}

watch(user, (u) => {
  if (u) finishAuth()
}, { immediate: true })

onMounted(() => {
  setTimeout(() => {
    if (!user.value && !finishing.value) {
      error.value = t('auth.callback.error')
    }
  }, 12000)
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
