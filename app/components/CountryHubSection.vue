<script setup lang="ts">
import { getCompareSlugsForCountry, codesFromCompareSlug } from '~/data/comparePairs'
import { getFlagEmoji } from '~/utils/countries'

const props = defineProps<{
  countryCode: string
  countryName: string
  article: { title: string | null; excerpt: string | null; body: string | null } | null
  headerStats: { overallAvg: number; total: number } | null
  catStats: { category: string; avg: number | null; count: number }[] | null
  featuredReviews: any[]
  pending?: boolean
  natQuery?: string
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const { getCountryNameLocalized } = useLocalizedCountries()

const compareSlugs = computed(() => getCompareSlugsForCountry(props.countryCode, 3))

const compareLinks = computed(() =>
  compareSlugs.value.map((slug) => {
    const codes = codesFromCompareSlug(slug)
    if (!codes) return { slug, label: slug, href: localePath(`/compare/${slug}`) }
    const [a, b] = codes
    return {
      slug,
      label: t('country.hub.comparePair', {
        a: getCountryNameLocalized(a),
        b: getCountryNameLocalized(b),
      }),
      href: localePath(`/compare/${slug}`),
      flags: `${getFlagEmoji(a)} ${getFlagEmoji(b)}`,
    }
  }),
)

const topCategories = computed(() => {
  if (!props.catStats?.length) return []
  return [...props.catStats]
    .filter(row => row.avg != null && row.count > 0)
    .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))
    .slice(0, 3)
})

const hasArticle = computed(() =>
  Boolean(props.article?.title || props.article?.excerpt || props.article?.body),
)

const showBlock = computed(() =>
  hasArticle.value || compareLinks.value.length > 0,
)
</script>

<template>
  <section v-if="showBlock" class="country-hub">
    <ContentArticle
      v-if="hasArticle"
      :section-label="t('country.hub.sectionLabel', { country: countryName })"
      :title="article!.title"
      :excerpt="article!.excerpt"
      :body="article!.body"
    />

    <div v-if="headerStats || topCategories.length" class="hub-stats">
      <span class="section-label">{{ $t('country.hub.statsLabel') }}</span>
      <div class="hub-stats-grid">
        <div v-if="headerStats" class="hub-stat-pill">
          <span class="hub-stat-value">{{ headerStats.overallAvg }}</span>
          <span class="hub-stat-label">{{ $t('country.header.overallRating') }}</span>
        </div>
        <div v-if="headerStats" class="hub-stat-pill">
          <span class="hub-stat-value">{{ headerStats.total }}</span>
          <span class="hub-stat-label">{{ $t('common.labels.reviews') }}</span>
        </div>
        <div
          v-for="row in topCategories"
          :key="row.category"
          class="hub-stat-pill hub-stat-pill--cat"
        >
          <span class="hub-stat-value">{{ row.avg }}</span>
          <span class="hub-stat-label">{{ $t(`categories.${row.category}.name`) }}</span>
        </div>
      </div>
    </div>

    <div v-if="compareLinks.length" class="hub-compare">
      <span class="section-label">{{ $t('country.hub.compareLabel') }}</span>
      <div class="hub-compare-links">
        <NuxtLinkLocale
          v-for="link in compareLinks"
          :key="link.slug"
          :to="`/compare/${link.slug}`"
          class="hub-compare-link"
        >
          <span v-if="link.flags" class="hub-compare-flags">{{ link.flags }}</span>
          {{ link.label }}
          <span class="hub-compare-arrow">→</span>
        </NuxtLinkLocale>
      </div>
    </div>

    <div v-if="featuredReviews.length" class="hub-reviews">
      <span class="section-label">{{ $t('country.hub.reviewsLabel') }}</span>
      <div class="hub-reviews-list">
        <ReviewCard
          v-for="review in featuredReviews.slice(0, 3)"
          :key="review.id"
          :review="review"
        />
      </div>
    </div>

    <div v-if="pending && !hasArticle" class="hub-skeleton">
      <Skeleton height="120px" style="border-radius: var(--radius-lg); margin-bottom: 12px" />
    </div>
  </section>
</template>

<style scoped>
.country-hub {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  margin-bottom: 14px;
}

.country-hub :deep(.content-article) {
  margin-bottom: 18px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--color-border);
}

.section-label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  margin-bottom: 8px;
}

.hub-stats { margin-bottom: 16px; }

.hub-stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hub-stat-pill {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  min-width: 88px;
}

.hub-stat-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1.1;
}

.hub-stat-label {
  font-size: 11px;
  color: var(--color-text-muted);
}

.hub-compare { margin-bottom: 16px; }

.hub-compare-links {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hub-compare-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--color-primary-light);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary-dark);
  text-decoration: none;
  transition: background 0.15s;
}

.hub-compare-link:hover {
  background: #e8e2f8;
}

.hub-compare-flags { font-size: 16px; line-height: 1; }
.hub-compare-arrow { margin-left: auto; color: var(--color-primary); }

.hub-reviews-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
