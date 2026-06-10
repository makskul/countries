<template>
  <div>
    <!-- ═══════════ HERO ═══════════ -->
    <div class="hero-dark-wrapper">
      <div class="hero-dark-inner">
      <!-- LEFT — form -->
      <div class="hero-form">
        <!-- Headline -->
        <h1 class="hero-h1-dark">
          {{ $t('homepage.hero.title') }}<br>
          <span class="hero-accent">{{ $t('homepage.hero.titleAccent') }}</span>
        </h1>

        <!-- Subtitle -->
        <p class="hero-sub-dark">{{ $t('homepage.hero.subtitle') }}</p>

        <!-- Selectors -->
        <div class="hero-dark selectors-stack">
          <div class="hero-inset-field" :class="{ 'is-filled': nationality }">
            <span class="hero-field-label">{{ $t('homepage.hero.selectNationalityLabel') }}</span>
            <NationalitySelector v-model="nationality" />
          </div>
          <div class="hero-inset-field" :class="{ 'is-filled': targetCountry }">
            <span class="hero-field-label">{{ $t('homepage.hero.selectCountryLabel') }}</span>
            <CountrySelector v-model="targetCountry" />
          </div>
        </div>

        <!-- CTA button -->
        <button
          class="hero-cta-btn"
          :disabled="!nationality || !targetCountry"
          @click="handleSubmit"
        >
          {{ $t('homepage.hero.cta') }}
        </button>

        <!-- Stat line — fixed height, no layout shift -->
        <div class="hero-stat-wrap">
          <p v-if="stats" class="hero-stat-dark">
            <strong>{{ stats.total }}</strong> {{ $t('common.labels.reviews') }} ·
            <strong>{{ stats.countries }}</strong> {{ $t('common.labels.countries') }} ·
            <strong>{{ stats.nationalities }}</strong> {{ $t('common.labels.nationalities') }}
          </p>
          <div v-else class="hero-stat-skeleton">
            <div class="hero-stat-skeleton-bar" />
          </div>
        </div>
      </div>

      <!-- RIGHT — canvas + floating cards -->
      <div class="hero-canvas-wrap">
        <canvas ref="canvasRef" class="hero-canvas" />

        <!-- Floating country cards -->
        <template v-if="!topCountriesPending && (topCountries?.length ?? 0) > 0">
          <div
            v-for="(c, idx) in (topCountries ?? []).slice(0, 4)"
            :key="c.code"
            class="floating-card"
            :style="floatPos[idx]"
          >
            <span class="float-flag">{{ getFlagEmoji(c.code) }}</span>
            <div>
              <div class="float-name">{{ getCountryNameLocalized(c.code) }}</div>
              <div class="float-meta">
                <span class="float-score">★ {{ c.avgRating }}</span>
                <span class="float-count">{{ c.total }} {{ $t('common.labels.reviews') }}</span>
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="topCountriesPending">
          <div v-for="i in 4" :key="i" class="floating-card" :style="floatPos[i-1]">
            <Skeleton width="120px" height="40px" style="opacity:0.3;border-radius:8px" />
          </div>
        </template>
      </div>
      </div><!-- /hero-dark-inner -->
    </div>

    <!-- ═══════════ TRENDING ═══════════ -->
    <section class="page-section">
      <div class="section-wrap">
        <div class="section-header">
          <div>
            <span class="section-label">{{ $t('homepage.trending.sectionLabel') }}</span>
            <h2 class="section-title">{{ $t('homepage.trending.title') }}</h2>
          </div>
          <NuxtLinkLocale to="/countries" class="section-link">{{ $t('common.buttons.seeAll') }}</NuxtLinkLocale>
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
          />
        </div>
      </div>
    </section>

    <!-- ═══════════ LATEST CITIES ═══════════ -->
    <section v-if="latestCities.length" class="page-section">
      <div class="section-wrap">
        <div class="section-header">
          <div>
            <span class="section-label">{{ $t('homepage.cities.sectionLabel') }}</span>
            <h2 class="section-title">{{ $t('homepage.cities.title') }}</h2>
          </div>
        </div>
        <div class="cities-scroll">
          <NuxtLinkLocale
            v-for="city in latestCities"
            :key="city.city_id"
            :to="`/country/${city.target_country.toLowerCase()}/${city.city_slug}`"
            class="city-card"
          >
            <div class="city-flag">{{ getFlagEmoji(city.target_country) }}</div>
            <div class="city-name">{{ getCityName(city) }}</div>
            <div class="city-country">{{ getCountryNameLocalized(city.target_country) }}</div>
          </NuxtLinkLocale>
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
          <NuxtLinkLocale to="/reviews" class="section-link">{{ $t('homepage.latest.seeAll') }}</NuxtLinkLocale>
        </div>

        <div v-if="latestPending" class="reviews-list">
          <Skeleton v-for="i in 3" :key="i" height="110px" style="border-radius: var(--radius-lg)" />
        </div>
        <Message v-else-if="!latest || latest.length === 0" severity="info" :closable="false">
          {{ $t('homepage.latest.empty') }}
        </Message>
        <div v-else class="reviews-grid">
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
        <NuxtLinkLocale to="/review/new" class="cta-btn">{{ $t('common.buttons.writeReview') }}</NuxtLinkLocale>
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
import { APP_NAME, APP_URL } from '~/utils/appConfig'
import { countryToSlug, getFlagEmoji } from '~/utils/countries'

const { t, locale } = useI18n()

function getCityName(city: any): string {
  if (!city.cityMeta) return city.city_name
  if (locale.value === 'uk' && city.cityMeta.name_uk) return city.cityMeta.name_uk
  if (locale.value === 'ru' && city.cityMeta.name_ru) return city.cityMeta.name_ru
  return city.cityMeta.name_en ?? city.city_name
}

useSeoMeta({
  title: () => t('seo.home.title'),
  description: () => t('seo.home.description'),
  ogTitle: () => t('seo.home.title'),
  ogDescription: () => t('seo.home.description'),
  ogImage: APP_URL + '/og/home.png',
  ogUrl: APP_URL,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: () => t('seo.home.title'),
  twitterDescription: () => t('seo.home.description'),
  twitterImage: APP_URL + '/og/home.png',
})

const store = useUserStore()
const router = useRouter()
const localePath = useLocalePath()
const supabase = useSupabaseClient()
const { getCountryNameLocalized } = useLocalizedCountries()

onMounted(() => store.loadFromStorage())

const nationality = ref(store.nationality)
const targetCountry = ref('')

const { stats, statsPending, trending, trendingPending, latest, latestPending, catStats, catPending } = useHomepageData()

const { data: latestCitiesRaw } = useAsyncData('latestCities', async () => {
  // Step 1: get latest reviews with city_id
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('city_id, city_name, target_country, created_at')
    .not('city_id', 'is', null)
    .not('city_name', 'is', null)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) { console.error('[latestCities]', error.message); return [] }

  // Step 2: collect unique city_ids
  const cityIds = [...new Set((reviews ?? []).map((r: any) => r.city_id).filter(Boolean))]
  if (!cityIds.length) return []

  // Step 3: fetch slug + localized names from cities table
  const { data: cities } = await supabase
    .from('cities')
    .select('id, slug, name_en, name_uk, name_ru')
    .in('id', cityIds)
  const cityMap: Record<number, { slug: string; name_en: string; name_uk: string; name_ru: string }> = {}
  for (const c of (cities ?? []) as any[]) {
    if (c.slug) cityMap[c.id] = c
  }

  // Step 4: merge — only include cities that have a slug
  return (reviews ?? [])
    .filter((r: any) => cityMap[r.city_id])
    .map((r: any) => ({ ...r, city_slug: cityMap[r.city_id].slug, cityMeta: cityMap[r.city_id] })) as any[]
})

const latestCities = computed(() => {
  const seen = new Set<number>()
  return (latestCitiesRaw.value ?? [])
    .filter((r: any) => {
      if (seen.has(r.city_id)) return false
      seen.add(r.city_id)
      return true
    })
    .slice(0, 6)
})


function handleSubmit() {
  if (!nationality.value || !targetCountry.value) return
  store.setNationality(nationality.value)
  router.push(localePath(`/country/${countryToSlug(targetCountry.value)}`))
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
  router.push(localePath(`/country/${code.toLowerCase()}`))
}

function confirmNationalityAndRedirect() {
  if (!dialogNationality.value) return
  store.setNationality(dialogNationality.value)
  showNationalityDialog.value = false
  router.push(localePath(`/country/${pendingRedirectCode.value.toLowerCase()}`))
}

// Canvas animation
const canvasRef = ref<HTMLCanvasElement | null>(null)
let animId = 0

interface CanvasNode {
  x: number; y: number
  vx: number; vy: number
  r: number; pulse: number
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const nodes: CanvasNode[] = []
  let W = 0, H = 0

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth
    H = canvas.height = canvas.offsetHeight
  }

  const init = () => {
    nodes.length = 0
    for (let i = 0; i < 32; i++) {
      nodes.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.8,
        pulse: Math.random() * Math.PI * 2,
      })
    }
  }

  const draw = () => {
    ctx.clearRect(0, 0, W, H)
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]
        const dx = a.x - b.x, dy = a.y - b.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 110) {
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(127,119,221,${(1 - dist / 110) * 0.3})`
          ctx.lineWidth = 0.7
          ctx.stroke()
        }
      }
    }
    nodes.forEach(n => {
      n.pulse += 0.018
      const glow = 0.5 + Math.sin(n.pulse) * 0.5
      ctx.beginPath()
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(144,136,229,${glow})`
      ctx.fill()
      n.x += n.vx; n.y += n.vy
      if (n.x < 0 || n.x > W) n.vx *= -1
      if (n.y < 0 || n.y > H) n.vy *= -1
    })
    animId = requestAnimationFrame(draw)
  }

  resize(); init(); draw()
  window.addEventListener('resize', () => { resize(); init() })
})

onUnmounted(() => { if (animId) cancelAnimationFrame(animId) })

// Top countries for floating cards
const { data: topCountries, pending: topCountriesPending } = useAsyncData(
  'heroTopCountries',
  async () => {
    const { data } = await supabase
      .from('reviews')
      .select('target_country, ratings')
      .eq('is_approved', true)
      .limit(500)
    if (!data?.length) return []
    const grouped: Record<string, number[]> = {}
    for (const r of data as any[]) {
      if (!grouped[r.target_country]) grouped[r.target_country] = []
      // ratings is JSONB — average all category values per row
      const vals = Object.values((r.ratings ?? {}) as Record<string, number>).filter(v => typeof v === 'number')
      const rowAvg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
      grouped[r.target_country].push(rowAvg)
    }
    return Object.entries(grouped)
      .map(([code, avgs]) => ({
        code,
        total: avgs.length,
        avgRating: Math.round((avgs.reduce((a, b) => a + b, 0) / avgs.length) * 10) / 10,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4)
  }
)

const floatPos = [
  { top: '36px',    right: '28px'  },
  { top: '118px',   right: '50px'  },
  { bottom: '80px', right: '22px'  },
  { bottom: '32px', right: '90px'  },
]
</script>

<style scoped>
/* ── DARK HERO ──────────────────────────────────── */
.hero-dark-wrapper {
  background: #0F0E1A;
  border-radius: 0;
  overflow: hidden;
  min-height: 380px;
  border-top: 1px solid #2A2845;
  border-bottom: 1px solid #2A2845;
  margin-bottom: 0;
}
.hero-dark-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 380px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 28px;
}

/* Left form panel */
.hero-form {
  padding: 60px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-pill-dark {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: rgba(83,74,183,0.25);
  color: #AFA9EC;
  border: 1px solid rgba(83,74,183,0.35);
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 18px;
  width: fit-content;
}
.hero-pill-dot {
  width: 5px; height: 5px;
  background: #7F77DD;
  border-radius: 50%;
  flex-shrink: 0;
}

.hero-h1-dark {
  font-size: 30px;
  font-weight: 700;
  color: white;
  line-height: 1.25;
  margin: 0 0 12px;
}
.hero-accent { color: #9088E5; }

.hero-sub-dark {
  font-size: 14px;
  color: rgba(255,255,255,0.45);
  line-height: 1.65;
  margin: 0 0 24px;
}

.selectors-stack {
  display: flex;
  flex-direction: row;
  gap: 8px;
  margin-bottom: 14px;
}
.hero-inset-field {
  position: relative;
  flex: 1;
}
.hero-field-label {
  position: absolute;
  top: 8px;
  left: 14px;
  z-index: 1;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  pointer-events: none;
  transition: color 0.15s;
}
.hero-inset-field.is-filled .hero-field-label {
  color: #9088E5;
}
.hero-inset-field :deep(.p-select-label) {
  padding-top: 20px;
  padding-bottom: 6px;
}
.hero-inset-field :deep(.p-select) {
  min-height: 52px;
  align-items: center;
  width: 100%;
}

.hero-cta-btn {
  width: 100%;
  background: #534AB7;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 13px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.hero-cta-btn:hover:not(:disabled) { background: #4840A0; }
.hero-cta-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.hero-stat-wrap {
  margin-top: 14px;
  height: 16px; /* fixed height — never shifts */
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-stat-dark {
  margin: 0;
  text-align: center;
  font-size: 11px;
  color: rgba(255,255,255,0.22);
  line-height: 1;
}
.hero-stat-dark strong { color: rgba(255,255,255,0.4); font-weight: 600; }
.hero-stat-skeleton {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
.hero-stat-skeleton-bar {
  width: 220px;
  height: 10px;
  border-radius: 5px;
  background: rgba(255,255,255,0.08);
  animation: shimmer 1.5s infinite ease-in-out;
}
@keyframes shimmer {
  0%   { opacity: 0.08; }
  50%  { opacity: 0.18; }
  100% { opacity: 0.08; }
}

/* Right canvas panel */
.hero-canvas-wrap {
  position: relative;
  overflow: hidden;
  background: #0F0E1A;
}
.hero-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* Floating cards */
.floating-card {
  position: absolute;
  z-index: 10;
  background: rgba(20,18,40,0.85);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 9px 13px;
  display: flex;
  align-items: center;
  gap: 9px;
  backdrop-filter: blur(6px);
}
.float-flag { font-size: 18px; flex-shrink: 0; }
.float-name { font-size: 12px; font-weight: 600; color: white; }
.float-meta { display: flex; align-items: center; gap: 6px; margin-top: 2px; }
.float-score { font-size: 11px; color: #EF9F27; font-weight: 600; }
.float-count { font-size: 10px; color: rgba(255,255,255,0.3); }

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
.reviews-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
@media (max-width: 640px) {
  .reviews-grid { grid-template-columns: 1fr; }
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
  display: inline-block;
  background: var(--color-primary);
  color: #fff;
  text-decoration: none;
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

/* CITIES */
.cities-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}
.city-card {
  display: block;
  text-decoration: none;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 12px 14px;
  cursor: pointer;
  min-width: 150px;
  flex-shrink: 0;
  transition: box-shadow 0.2s;
}
.city-card:hover { box-shadow: var(--shadow-hover); }
.city-flag { font-size: 22px; margin-bottom: 6px; }
.city-name { font-size: 13px; font-weight: 600; color: var(--color-text); }
.city-country { font-size: 11px; color: var(--color-text-muted); margin-top: 2px; }

/* RESPONSIVE */
@media (max-width: 900px) {
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .hero-dark-inner { grid-template-columns: 1fr; padding: 0; }
  .hero-canvas-wrap { display: none; }
  .hero-form { padding: 36px 28px; }
  .hero-h1-dark { font-size: 24px; }
}
@media (max-width: 600px) {
  .grid-3 { grid-template-columns: 1fr; }
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .cta-inner { flex-direction: column; align-items: flex-start; }
  .section-wrap { padding: 0 16px; }
  .hero-form { padding: 36px 16px; }
  .selectors-stack .p-select { flex: none; width: 50%; }
}
</style>
