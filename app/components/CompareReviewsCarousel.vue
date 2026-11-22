<template>
  <section v-if="pending || reviews.length" class="crc">
    <div class="crc-head">
      <span class="section-label">{{ $t('homepage.latest.title') }}</span>
      <div class="crc-head-right">
        <NuxtLinkLocale to="/reviews" class="crc-all">{{ $t('homepage.latest.seeAll') }} →</NuxtLinkLocale>
        <div v-if="reviews.length > 1" class="crc-nav">
          <button
            type="button"
            class="crc-btn"
            :disabled="atStart"
            :aria-label="$t('compare.latestReviews.prev')"
            @click="scrollByPage(-1)"
          >‹</button>
          <button
            type="button"
            class="crc-btn"
            :disabled="atEnd"
            :aria-label="$t('compare.latestReviews.next')"
            @click="scrollByPage(1)"
          >›</button>
        </div>
      </div>
    </div>

    <div v-if="pending" class="crc-track">
      <Skeleton v-for="i in 4" :key="i" height="150px" class="crc-slide" style="border-radius: var(--radius-lg)" />
    </div>
    <div v-else ref="track" class="crc-track" @scroll.passive="updateEdges">
      <ReviewFeedItem v-for="r in reviews" :key="r.id" :review="r" class="crc-slide" />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Review } from '~/types/review'
import { isDestinationAllowed } from '~/utils/countries'

const MAX_REVIEWS = 15

const supabase = useSupabaseClient()
const track = ref<HTMLElement | null>(null)
const atStart = ref(true)
const atEnd = ref(false)

// Client-only fetch (same approach as /reviews): keeps the cached SSR page free of live data.
const { data, pending } = useLazyAsyncData('compare-latest-reviews', async () => {
  const { data: rows } = await supabase
    .from('reviews')
    .select('id, target_country, author_nationality, ratings, comments, climate, created_at, is_approved')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(MAX_REVIEWS + 10)
  return ((rows ?? []) as Review[])
    .filter(r => isDestinationAllowed(r.target_country))
    .slice(0, MAX_REVIEWS)
}, { server: false })

const reviews = computed(() => data.value ?? [])

function updateEdges() {
  const el = track.value
  if (!el) return
  atStart.value = el.scrollLeft <= 4
  atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
}

function scrollByPage(dir: 1 | -1) {
  const el = track.value
  if (!el) return
  el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' })
}

watch(reviews, async () => {
  await nextTick()
  updateEdges()
})
</script>

<style scoped>
.crc {
  margin-top: 16px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
}
.crc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.crc-head-right { display: flex; align-items: center; gap: 14px; }
.crc-all {
  font-size: 13px;
  color: var(--color-primary);
  text-decoration: none;
  white-space: nowrap;
}
.crc-all:hover { text-decoration: underline; }
.crc-nav { display: flex; gap: 6px; }
.crc-btn {
  width: 30px;
  height: 30px;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0 2px;
  transition: background 0.15s;
}
.crc-btn:hover:not(:disabled) { background: var(--color-primary-light); }
.crc-btn:disabled { opacity: 0.4; cursor: default; }

.crc-track {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.crc-track::-webkit-scrollbar { display: none; }
.crc-slide {
  flex: 0 0 calc((100% - 36px) / 4);
  min-width: 0;
  scroll-snap-align: start;
}

@media (max-width: 1024px) {
  .crc-slide { flex-basis: calc((100% - 12px) / 2); }
}
@media (max-width: 600px) {
  .crc { padding: 14px; }
  .crc-slide { flex-basis: 86%; }
  .crc-nav { display: none; }
}
</style>
