<template>
  <div>
    <!-- ═══════════ HERO ═══════════ -->
    <section class="hero">
      <div class="hero-inner">
        <span class="hero-pill">{{ $t('homepage.hero.pill') }}</span>
        <h1 class="hero-h1">
          {{ $t('homepage.hero.title') }}
          <span style="color: var(--color-primary)">{{ $t('homepage.hero.titleAccent') }}</span>
        </h1>
        <p class="hero-sub">{{ $t('homepage.hero.subtitle') }}</p>

        <!-- Selectors -->
        <div class="hero-selectors">
          <NationalitySelector v-model="nationality" class="hero-select" />
          <CountrySelector v-model="targetCountry" class="hero-select" />
        </div>

        <Button
          :label="$t('homepage.hero.cta')"
          :disabled="!nationality || !targetCountry"
          @click="handleSubmit"
          class="hero-btn"
        />

        <!-- Dynamic stat line -->
        <p class="hero-stat" v-if="statsPending">
          <Skeleton width="260px" height="14px" style="display: inline-block" />
        </p>
        <p class="hero-stat" v-else-if="stats">
          {{ $t('homepage.hero.stat', { reviews: stats.total, countries: stats.countries, nationalities: stats.nationalities }) }}
        </p>
      </div>
    </section>

    <!-- ═══════════ TRENDING ═══════════ -->
    <section class="page-section">
      <div class="section-wrap">
        <div class="section-header">
          <div>
            <span class="section-label">{{ $t('homepage.trending.sectionLabel') }}</span>
            <h2 class="section-title">{{ $t('homepage.trending.title') }}</h2>
          </div>
          <NuxtLink to="/countries" class="section-link">{{ $t('common.buttons.seeAll') }}</NuxtLink>
        </div>

        <div v-if="trendingPending" class="grid-3">
          <Skeleton v-for="i in 6" :key="i" height="120px" style="border-radius: var(--radius-lg)" />
        </div>
        <Message v-else-if="!trending || trending.length === 0" severity="info" :closable="false">
          {{ $t('homepage.trending.empty') }}
        </Message>
        <div v-else class="grid-3">
          <TrendingCard
            v-for="item in trending"
            :key="item.code"
            :item="item"
            @click="handleTrendingClick(item.code)"
          />
        </div>
      </div>
    </section>

    <!-- ═══════════ LATEST REVIEWS ═══════════ -->
    <section class="page-section">
      <div class="section-wrap">
        <div class="section-header">
          <div>
            <span class="section-label">{{ $t('homepage.latest.sectionLabel') }}</span>
            <h2 class="section-title">{{ $t('homepage.latest.title') }}</h2>
          </div>
          <NuxtLink to="/" class="section-link">{{ $t('homepage.latest.seeAll') }}</NuxtLink>
        </div>

        <div v-if="latestPending" class="reviews-list">
          <Skeleton v-for="i in 3" :key="i" height="110px" style="border-radius: var(--radius-lg)" />
        </div>
        <Message v-else-if="!latest || latest.length === 0" severity="info" :closable="false">
          {{ $t('homepage.latest.empty') }}
        </Message>
        <div v-else class="reviews-list">
          <ReviewFeedItem v-for="r in latest" :key="r.id" :review="r" />
        </div>
      </div>
    </section>

    <!-- ═══════════ CATEGORY HIGHLIGHTS ═══════════ -->
    <section class="page-section">
      <div class="section-wrap">
        <div class="section-header">
          <div>
            <span class="section-label">{{ $t('homepage.categories.sectionLabel') }}</span>
            <h2 class="section-title">{{ $t('homepage.categories.title') }}</h2>
          </div>
        </div>

        <div v-if="catPending" class="grid-4">
          <Skeleton v-for="i in 4" :key="i" height="140px" style="border-radius: var(--radius-lg)" />
        </div>
        <Message v-else-if="!catStats || catStats.length === 0" severity="info" :closable="false">
          {{ $t('homepage.categories.empty') }}
        </Message>
        <div v-else class="grid-4">
          <CategoryHighlight v-for="item in catStats" :key="item.category" :item="item" />
        </div>
      </div>
    </section>

    <!-- ═══════════ CTA BANNER ═══════════ -->
    <section class="cta-section">
      <div class="section-wrap cta-inner">
        <div class="cta-text">
          <h3 class="cta-title">{{ $t('homepage.cta.title') }}</h3>
          <p class="cta-sub">{{ $t('homepage.cta.subtitle') }}</p>
        </div>
        <NuxtLink to="/review/new">
          <button class="cta-btn">{{ $t('common.buttons.writeReview') }}</button>
        </NuxtLink>
      </div>
    </section>

    <!-- Nationality guard dialog -->
    <Dialog v-model:visible="showNationalityDialog" :header="$t('countries.dialog.title')" modal style="width: 360px">
      <div style="display: flex; flex-direction: column; gap: 16px; padding-top: 4px">
        <p style="margin: 0; font-size: 14px; color: var(--color-text-secondary)">
          {{ $t('countries.dialog.subtitle') }}
        </p>
        <NationalitySelector v-model="dialogNationality" />
        <Button :label="$t('common.buttons.continue')" :disabled="!dialogNationality" @click="confirmNationalityAndRedirect" style="width: 100%" />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { countryToSlug } from '~/utils/countries'

useSeoMeta({
  title: 'NationView — Отзывы эмигрантов о странах по национальности',
  description: 'Узнай страну глазами своей национальности. Реальные отзывы о визах, ценах, отношении и бюрократии от людей как ты.',
  ogTitle: 'NationView — Отзывы эмигрантов о странах',
  ogDescription: 'Реальные отзывы о странах отфильтрованные по твоей национальности. Легализация, цены, безопасность, погода.',
  ogImage: 'https://nationview.app/og/home.png',
  ogUrl: 'https://nationview.app',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'NationView — Отзывы эмигрантов',
  twitterDescription: 'Узнай страну глазами своей национальности.',
  twitterImage: 'https://nationview.app/og/home.png',
})

const store = useUserStore()
const router = useRouter()

onMounted(() => store.loadFromStorage())

const nationality = ref(store.nationality)
const targetCountry = ref('')

const { stats, statsPending, trending, trendingPending, latest, latestPending, catStats, catPending } = useHomepageData()

function handleSubmit() {
  if (!nationality.value || !targetCountry.value) return
  store.setNationality(nationality.value)
  router.push(`/country/${countryToSlug(targetCountry.value)}`)
}

const showNationalityDialog = ref(false)
const dialogNationality = ref('')
const pendingRedirectCode = ref('')

function handleTrendingClick(code: string) {
  if (!store.nationality) {
    pendingRedirectCode.value = code
    dialogNationality.value = ''
    showNationalityDialog.value = true
    return
  }
  router.push(`/country/${code.toLowerCase()}`)
}

function confirmNationalityAndRedirect() {
  if (!dialogNationality.value) return
  store.setNationality(dialogNationality.value)
  showNationalityDialog.value = false
  router.push(`/country/${pendingRedirectCode.value.toLowerCase()}`)
}
</script>

<style scoped>
/* HERO */
.hero {
  background: #fff;
  padding: 40px 28px 32px;
  text-align: center;
  border-bottom: 1px solid var(--color-border-subtle);
}
.hero-inner {
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.hero-pill {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-radius: var(--radius-pill);
  padding: 5px 12px;
}
.hero-h1 {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-text);
  margin: 0;
}
.hero-sub {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0;
}
.hero-selectors {
  display: flex;
  gap: 10px;
  width: 100%;
  max-width: 520px;
}
.hero-select {
  flex: 1;
  font-size: 13px;
}
.hero-btn {
  padding: 11px 28px !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  border-radius: var(--radius-md) !important;
}
.hero-stat {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
}
.hero-stat strong {
  color: var(--color-text-secondary);
  font-weight: 600;
}

/* SECTIONS */
.page-section {
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border-subtle);
  padding: 24px 0;
}
.section-wrap {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 28px;
}
.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 16px;
}
.section-label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  margin-bottom: 2px;
}
.section-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}
.section-link {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary);
  text-decoration: none;
  white-space: nowrap;
  padding-bottom: 2px;
}
.section-link:hover { text-decoration: underline; }

/* GRIDS */
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* CTA BANNER */
.cta-section {
  background: var(--color-primary-light);
  border-top: 1px solid var(--color-border);
  padding: 24px 0;
}
.cta-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.cta-text { flex: 1; }
.cta-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 4px;
}
.cta-sub {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}
.cta-btn {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-pill);
  padding: 10px 22px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  white-space: nowrap;
}
.cta-btn:hover { background: var(--color-primary-hover); }

/* RESPONSIVE */
@media (max-width: 900px) {
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 600px) {
  .hero-selectors { flex-direction: column; }
  .hero-h1 { font-size: 24px; }
  .grid-3 { grid-template-columns: 1fr; }
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .cta-inner { flex-direction: column; align-items: flex-start; }
  .section-wrap { padding: 0 16px; }
}
</style>
