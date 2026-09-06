<script setup lang="ts">
definePageMeta({ middleware: 'auth-required' })

const { t } = useI18n()
const user = useSupabaseUser()
const store = useUserStore()
const { signOut } = useAuthProfile()

useSeoMeta({
  title: () => t('auth.seo.account.title'),
  description: () => t('auth.seo.account.description'),
  robots: 'noindex, nofollow',
})

const { data: reviewsData } = await useFetch('/api/account/reviews', {
  credentials: 'include',
})

const reviewCount = computed(() => reviewsData.value?.reviews?.length ?? 0)

const nationalityLabel = computed(() => {
  const code = store.profileNationality || store.nationality
  if (!code) return t('auth.account.nationalityUnset')
  return code
})
</script>

<template>
  <div class="account-page">
    <div class="account-container">
      <header class="account-header">
        <h1>{{ $t('auth.account.title') }}</h1>
        <p>{{ $t('auth.account.subtitle') }}</p>
      </header>

      <div class="account-card">
        <dl class="account-dl">
          <div>
            <dt>{{ $t('auth.account.email') }}</dt>
            <dd>{{ user?.email }}</dd>
          </div>
          <div>
            <dt>{{ $t('auth.account.nationality') }}</dt>
            <dd>{{ nationalityLabel }}</dd>
          </div>
        </dl>

        <div class="account-actions">
          <NuxtLinkLocale to="/account/reviews" class="account-link">
            <i class="pi pi-list" />
            {{ $t('auth.account.reviewsLink') }}
            <span class="account-badge">{{ $t('auth.account.reviewsCount', { count: reviewCount }) }}</span>
          </NuxtLinkLocale>
          <Button
            type="button"
            :label="$t('auth.account.signOut')"
            severity="secondary"
            outlined
            @click="signOut"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.account-page {
  min-height: 70vh;
  padding: 40px 24px;
  background: var(--color-bg-secondary);
}
.account-container {
  max-width: 640px;
  margin: 0 auto;
}
.account-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--color-text);
}
.account-header p {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin: 0 0 24px;
}
.account-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
}
.account-dl {
  margin: 0 0 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.account-dl dt {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}
.account-dl dd {
  font-size: 15px;
  color: var(--color-text);
  margin: 0;
}
.account-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.account-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
}
.account-link i { color: var(--color-primary); }
.account-badge {
  margin-left: auto;
  font-size: 12px;
  color: var(--color-text-muted);
  font-weight: 400;
}
</style>
