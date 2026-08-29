<template>
  <div class="rv-page">
    <div class="rv-container">

      <!-- Header -->
      <div class="rv-header">
        <NuxtLinkLocale to="/" class="rv-back">{{ $t('pages.reviews.backHome') }}</NuxtLinkLocale>
        <h1>{{ $t('pages.reviews.title') }}</h1>
        <p class="rv-lead">{{ $t('pages.reviews.lead') }}</p>
      </div>

      <!-- Today's reviews -->
      <template v-if="!pending">
        <div v-if="todayReviews.length" class="rv-section">
          <div class="rv-section-label">
            <span class="rv-badge rv-badge--today">{{ $t('pages.reviews.today') }}</span>
            <span class="rv-count">{{ $t('pages.reviews.reviewsCount', { count: todayReviews.length }) }}</span>
          </div>
          <div :class="gridClass(todayReviews.length)">
            <ReviewFeedItem v-for="r in todayReviews" :key="r.id" :review="r" />
          </div>
        </div>

        <div v-if="olderReviews.length" class="rv-section">
          <div class="rv-section-label" v-if="todayReviews.length">
            <span class="rv-badge">{{ $t('pages.reviews.earlier') }}</span>
          </div>
          <div :class="gridClass(olderReviews.length)">
            <ReviewFeedItem v-for="r in olderReviews" :key="r.id" :review="r" />
          </div>
        </div>

        <div v-if="!reviews?.length" class="rv-empty">
          <p>{{ $t('pages.reviews.empty') }}</p>
        </div>

        <!-- Load more -->
        <div v-if="hasMore" class="rv-loadmore">
          <button class="rv-loadmore-btn" @click="loadMore" :disabled="loadingMore">
            {{ loadingMore ? $t('pages.reviews.loading') : $t('pages.reviews.loadMore') }}
          </button>
        </div>
      </template>

      <template v-else>
        <Skeleton v-for="i in 5" :key="i" height="100px" style="margin-bottom: 10px; border-radius: var(--radius-lg)" />
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Останні відгуки',
  description: 'Найновіші відгуки емігрантів про країни світу на Triplandr.',
  robots: 'index, follow',
})

const supabase = useSupabaseClient()
const PAGE_SIZE = 20

const { data: reviews, pending } = useLazyAsyncData('reviews-feed', async () => {
  // Try today first
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data: todayData } = await supabase
    .from('reviews')
    .select('id, target_country, author_nationality, ratings, comments, climate, created_at')
    .eq('is_approved', true)
    .gte('created_at', todayStart.toISOString())
    .order('created_at', { ascending: false })

  // Always fetch latest 20 as well
  const { data: latestData } = await supabase
    .from('reviews')
    .select('id, target_country, author_nationality, ratings, comments, climate, created_at')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE)

  const todayIds = new Set((todayData ?? []).map((r: any) => r.id))
  return [
    ...(todayData ?? []),
    ...(latestData ?? []).filter((r: any) => !todayIds.has(r.id)),
  ] as any[]
}, { server: false })

// Split today vs older
const todayReviews = computed(() => {
  if (!reviews.value) return []
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  return reviews.value.filter(r => new Date(r.created_at) >= todayStart)
})

const olderReviews = computed(() => {
  if (!reviews.value) return []
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  return reviews.value.filter(r => new Date(r.created_at) < todayStart)
})

// Adaptive grid class
function gridClass(count: number): string {
  if (count === 1) return 'rv-grid rv-grid--1'
  if (count === 2) return 'rv-grid rv-grid--2'
  return 'rv-grid rv-grid--4'
}

// Pagination
const offset = ref(PAGE_SIZE)
const loadingMore = ref(false)
const hasMore = computed(() => (reviews.value?.length ?? 0) >= offset.value)

async function loadMore() {
  loadingMore.value = true
  try {
    const { data } = await supabase
      .from('reviews')
      .select('id, target_country, author_nationality, ratings, comments, climate, created_at')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .range(offset.value, offset.value + PAGE_SIZE - 1)

    if (data?.length) {
      if (reviews.value) reviews.value.push(...(data as any[]))
      offset.value += PAGE_SIZE
    }
  } finally {
    loadingMore.value = false
  }
}
</script>

<style scoped>
.rv-page { background: var(--color-bg-secondary); min-height: 100vh; padding: 32px 24px; }
.rv-container { max-width: 1144px; margin: 0 auto; }
.rv-header { margin-bottom: 28px; }
.rv-back {
  font-size: 13px; color: var(--color-primary); text-decoration: none;
  display: inline-block; margin-bottom: 12px;
}
.rv-back:hover { text-decoration: underline; }
.rv-header h1 { font-size: 26px; font-weight: 700; margin: 0 0 6px; color: var(--color-text); }
.rv-lead { font-size: 14px; color: var(--color-text-secondary); margin: 0; }

.rv-section { margin-bottom: 24px; }
.rv-section-label {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 12px;
}
.rv-badge {
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.06em;
  background: var(--color-bg-tertiary); color: var(--color-text-muted);
  border-radius: var(--radius-pill); padding: 3px 10px;
}
.rv-badge--today {
  background: var(--color-success-light); color: var(--color-success);
}
.rv-count { font-size: 12px; color: var(--color-text-muted); }

/* Adaptive grid */
.rv-grid { display: grid; gap: 12px; margin-bottom: 4px; }
.rv-grid--1 { grid-template-columns: 1fr; }
.rv-grid--2 { grid-template-columns: 1fr 1fr; }
.rv-grid--4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 1024px) {
  .rv-grid--4 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .rv-grid--2, .rv-grid--4 { grid-template-columns: 1fr; }
}

.rv-empty { text-align: center; padding: 48px; color: var(--color-text-muted); }

.rv-loadmore { text-align: center; margin-top: 16px; }
.rv-loadmore-btn {
  background: none; border: 1px solid var(--color-border);
  border-radius: var(--radius-md); padding: 9px 24px;
  font-size: 13px; font-weight: 500; color: var(--color-primary);
  cursor: pointer; font-family: inherit; transition: background 0.15s;
}
.rv-loadmore-btn:hover { background: var(--color-primary-light); }
.rv-loadmore-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
