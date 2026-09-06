<script setup lang="ts">
definePageMeta({ middleware: 'auth-required' })

const { t, locale } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('auth.seo.reviews.title'),
  description: () => t('auth.seo.reviews.description'),
  robots: 'noindex, nofollow',
})

type ReviewRow = {
  id: string
  created_at: string
  target_country: string
  author_nationality: string
  is_approved: boolean
  city_name: string | null
  stay_purpose: string | null
}

const { data, pending, error } = await useFetch<{ reviews: ReviewRow[] }>('/api/account/reviews', {
  credentials: 'include',
})

const reviews = computed(() => data.value?.reviews ?? [])

function statusLabel(review: ReviewRow) {
  if (review.is_approved) return t('auth.reviews.status.approved')
  return t('auth.reviews.status.pending')
}

function statusSeverity(review: ReviewRow): 'success' | 'warn' {
  return review.is_approved ? 'success' : 'warn'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function countryLink(code: string) {
  return localePath(`/country/${code.toLowerCase()}`)
}
</script>

<template>
  <div class="account-page">
    <div class="account-container">
      <header class="account-header">
        <NuxtLinkLocale to="/account" class="account-back">
          <i class="pi pi-arrow-left" />
        </NuxtLinkLocale>
        <h1>{{ $t('auth.reviews.title') }}</h1>
        <p>{{ $t('auth.reviews.subtitle') }}</p>
      </header>

      <div v-if="pending" class="account-loading">
        <ProgressSpinner style="width: 40px; height: 40px" />
      </div>

      <Message v-else-if="error" severity="error" :closable="false">
        {{ (error as Error).message }}
      </Message>

      <div v-else-if="!reviews.length" class="account-empty">
        <p>{{ $t('auth.reviews.empty') }}</p>
        <NuxtLinkLocale to="/review/new" class="account-btn">
          {{ $t('auth.reviews.writeFirst') }}
        </NuxtLinkLocale>
      </div>

      <div v-else class="reviews-list">
        <div v-for="review in reviews" :key="review.id" class="review-row">
          <div class="review-main">
            <NuxtLink :to="countryLink(review.target_country)" class="review-country">
              {{ review.target_country }}
            </NuxtLink>
            <span v-if="review.city_name" class="review-city">{{ review.city_name }}</span>
          </div>
          <div class="review-meta">
            <span class="review-date">{{ formatDate(review.created_at) }}</span>
            <Tag :severity="statusSeverity(review)" :value="statusLabel(review)" />
          </div>
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
  max-width: 720px;
  margin: 0 auto;
}
.account-header {
  position: relative;
  margin-bottom: 24px;
}
.account-back {
  display: inline-flex;
  align-items: center;
  color: var(--color-text-muted);
  text-decoration: none;
  margin-bottom: 12px;
  font-size: 14px;
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
  margin: 0;
}
.account-loading,
.account-empty {
  text-align: center;
  padding: 48px 24px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}
.account-empty p {
  margin: 0 0 16px;
  color: var(--color-text-secondary);
}
.account-btn {
  display: inline-block;
  background: var(--color-primary);
  color: #fff;
  padding: 10px 20px;
  border-radius: var(--radius-pill);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.review-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}
.review-country {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
}
.review-city {
  display: block;
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 2px;
}
.review-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}
.review-date {
  font-size: 12px;
  color: var(--color-text-muted);
}
@media (max-width: 600px) {
  .review-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .review-meta {
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: space-between;
  }
}
</style>
