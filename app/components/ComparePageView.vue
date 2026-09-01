<template>
  <div class="cmp-page">

    <div class="breadcrumb">
      <NuxtLinkLocale to="/" class="bc-link">{{ $t('nav.breadcrumbs.home') }}</NuxtLinkLocale>
      <span class="bc-sep">→</span>
      <span class="bc-current">{{ $t('compare.title') }}</span>
    </div>

    <div class="cmp-header">
      <div class="cmp-header-inner">
        <span class="section-label">{{ $t('compare.sectionLabel') }}</span>
        <h1 class="cmp-title">{{ pageH1 }}</h1>
        <p class="cmp-subtitle">{{ $t('compare.subtitle') }}</p>
      </div>
    </div>

    <div class="cmp-selectors-wrap">
      <div class="cmp-selectors">
        <Select
          v-model="countryA"
          :options="countryList"
          optionLabel="name"
          optionValue="code"
          :placeholder="$t('compare.selectCountry')"
          filter
          class="cmp-select"
        >
          <template #option="{ option }">
            <span>{{ option.flag }} {{ option.name }}</span>
          </template>
          <template #value="{ value }">
            <span v-if="value">{{ getFlagEmoji(value) }} {{ getCountryNameLocalized(value) }}</span>
            <span v-else style="color:var(--color-text-muted)">{{ $t('compare.selectCountry') }}</span>
          </template>
        </Select>

        <span class="cmp-vs">VS</span>

        <Select
          v-model="countryB"
          :options="countryList"
          optionLabel="name"
          optionValue="code"
          :placeholder="$t('compare.selectCountry')"
          filter
          class="cmp-select"
        >
          <template #option="{ option }">
            <span>{{ option.flag }} {{ option.name }}</span>
          </template>
          <template #value="{ value }">
            <span v-if="value">{{ getFlagEmoji(value) }} {{ getCountryNameLocalized(value) }}</span>
            <span v-else style="color:var(--color-text-muted)">{{ $t('compare.selectCountry') }}</span>
          </template>
        </Select>

        <template v-if="showThird">
          <span class="cmp-vs">VS</span>
          <div style="display:flex; align-items:center; gap:6px">
            <Select
              v-model="countryC"
              :options="countryList"
              optionLabel="name"
              optionValue="code"
              :placeholder="$t('compare.selectCountry')"
              filter
              class="cmp-select"
            >
              <template #option="{ option }">
                <span>{{ option.flag }} {{ option.name }}</span>
              </template>
              <template #value="{ value }">
                <span v-if="value">{{ getFlagEmoji(value) }} {{ getCountryNameLocalized(value) }}</span>
                <span v-else style="color:var(--color-text-muted)">{{ $t('compare.selectCountry') }}</span>
              </template>
            </Select>
            <button class="cmp-remove-btn" @click="showThird = false; countryC = ''">×</button>
          </div>
        </template>

        <button v-if="!showThird" class="cmp-add-btn" @click="showThird = true">
          {{ $t('compare.addCountry') }}
        </button>

        <div class="cmp-nat-filter">
          <span class="cmp-filter-label">{{ $t('compare.filterBy') }}</span>
          <Select
            v-model="localNat"
            :options="nationalityList"
            optionLabel="name"
            optionValue="code"
            :placeholder="$t('compare.allNationalities')"
            showClear
            class="cmp-select cmp-select--nat"
          >
            <template #option="{ option }">
              <span>{{ option.flag }} {{ option.name }}</span>
            </template>
            <template #value="{ value }">
              <span v-if="value">{{ getFlagEmoji(value) }} {{ getCountryNameLocalized(value) }}</span>
            </template>
          </Select>
        </div>
      </div>
    </div>

    <div class="cmp-content">

      <div v-if="selectedCountries.length < 2" class="cmp-empty">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--color-border)" stroke-width="1" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="8" x2="16" y2="16"/><line x1="16" y1="8" x2="8" y2="16"/></svg>
        <p>{{ $t('compare.selectHint') }}</p>
      </div>

      <template v-else>
        <Message v-if="!localNat" severity="info" :closable="false" style="margin-bottom:16px; font-size:13px">
          {{ $t('compare.noNatHint') }}
        </Message>

        <div v-if="isLowData" class="cmp-low-data">
          <p class="cmp-low-data-text">{{ $t('compare.lowData.message', { count: totalReviewCount }) }}</p>
          <NuxtLinkLocale
            :to="`/review/new?country=${firstReviewCountry.toLowerCase()}${localNat ? `&nat=${localNat.toLowerCase()}` : ''}`"
            class="cmp-low-data-cta"
          >
            {{ $t('compare.lowData.cta') }}
          </NuxtLinkLocale>
        </div>

        <div v-if="pending" class="cmp-skeleton">
          <Skeleton height="200px" style="border-radius:var(--radius-lg)" />
        </div>

        <template v-else-if="statsData">
          <div class="cmp-table-wrap">
            <div class="cmp-table" :style="`grid-template-columns: 180px repeat(${selectedCountries.length}, 1fr)`">

              <div class="cmp-cell cmp-cell--label" />
              <div
                v-for="item in statsData"
                :key="item.country"
                class="cmp-cell cmp-cell--head"
              >
                <div class="cmp-country-flag">{{ getFlagEmoji(item.country) }}</div>
                <div class="cmp-country-name">{{ getCountryNameLocalized(item.country) }}</div>
                <div class="cmp-overall-score">
                  {{ item.stats?.avg_overall ? Number(item.stats.avg_overall).toFixed(1) : '—' }}
                </div>
                <Rating
                  v-if="item.stats?.avg_overall"
                  :modelValue="Number(item.stats.avg_overall)"
                  readonly :cancel="false" :stars="5"
                />
                <div class="cmp-overall-label">{{ $t('compare.overallLabel') }}</div>
                <NuxtLinkLocale
                  :to="`/country/${item.country.toLowerCase()}${localNat ? `?nat=${localNat.toLowerCase()}` : ''}`"
                  class="cmp-country-link"
                  target="_blank"
                >
                  {{ $t('compare.goToReviews') }} →
                </NuxtLinkLocale>
              </div>

              <template v-for="cat in COMPARE_CATEGORIES" :key="cat.key">
                <div class="cmp-cell cmp-cell--label">
                  <div class="cmp-cat-icon">
                    <svg v-if="cat.icon === 'shield'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                    <svg v-else-if="cat.icon === 'dollar'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    <svg v-else-if="cat.icon === 'safety'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <svg v-else-if="cat.icon === 'clipboard'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/></svg>
                    <svg v-else-if="cat.icon === 'cloud'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
                    <svg v-else-if="cat.icon === 'chat'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <svg v-else-if="cat.icon === 'sparkles'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                    <svg v-else-if="cat.icon === 'heart'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <span class="cmp-cat-name">{{ $t(`categories.${cat.key}.name`) }}</span>
                </div>

                <div
                  v-for="item in statsData"
                  :key="`${cat.key}-${item.country}`"
                  class="cmp-cell cmp-cell--val"
                >
                  <template v-if="getCatAvg(item.stats, cat.key) !== null">
                    <div class="cmp-bar-wrap">
                      <div
                        class="cmp-bar"
                        :style="{
                          width: ((getCatAvg(item.stats, cat.key) ?? 0) / 5 * 100) + '%',
                          background: barColor(getCatAvg(item.stats, cat.key) ?? 0),
                        }"
                      />
                    </div>
                    <div class="cmp-score-row">
                      <span class="cmp-score">{{ (getCatAvg(item.stats, cat.key) ?? 0).toFixed(1) }}</span>
                      <span
                        v-if="isWinner(cat.key, item.country)"
                        class="cmp-winner"
                      >{{ $t('compare.winner') }}</span>
                    </div>
                    <div v-if="cat.key === 'weather'" class="compare-climate-icons">
                      <span
                        v-if="getCountryMeta(item.country)?.climateKey"
                        :title="$t(`country.climates.${getCountryMeta(item.country)!.climateKey}`)"
                      >{{ CLIMATE_ICONS[getCountryMeta(item.country)!.climateKey] ?? '🌡️' }}</span>
                      <span class="compare-climate-text">{{ $t(`country.climates.${getCountryMeta(item.country)?.climateKey ?? 'temperate'}`) }}</span>
                    </div>
                    <div
                      v-if="cat.key === 'cost_of_living'"
                      class="compare-cost-label"
                      :class="getCostClass(getCountryMeta(item.country)?.costLevel)"
                    >{{ getCostLabel(getCountryMeta(item.country)?.costLevel) }}</div>
                  </template>
                  <span v-else class="cmp-no-data">—</span>
                </div>
              </template>
            </div>
          </div>

          <div class="cmp-static-wrap" v-if="metaList.some(m => m.meta)">
            <div class="cmp-static-header">{{ $t('compare.staticInfo') }}</div>
            <div class="cmp-table" :style="`grid-template-columns: 180px repeat(${selectedCountries.length}, 1fr)`">
              <template v-for="row in staticRows" :key="row.key">
                <div class="cmp-cell cmp-cell--label cmp-cell--static-label">{{ row.label }}</div>
                <div
                  v-for="item in metaList"
                  :key="`${row.key}-${item.country}`"
                  class="cmp-cell cmp-cell--val cmp-cell--static-val"
                  :class="row.key === 'cost' ? costClass(item.meta?.costLevel) : ''"
                >
                  {{ row.getValue(item.meta) }}
                </div>
              </template>
            </div>
          </div>

          <div v-if="legalizationWinner && showCompareAffiliate" class="cmp-winner-affiliate">
            <div class="cmp-winner-affiliate-head">
              <span class="cmp-winner-affiliate-flag">{{ getFlagEmoji(legalizationWinner) }}</span>
              <div>
                <div class="cmp-winner-affiliate-title">
                  {{ $t('partners.compare.winnerTitle', { country: getCountryNameLocalized(legalizationWinner) }) }}
                </div>
                <div class="cmp-winner-affiliate-sub">
                  {{ $t('partners.compare.cta', { country: getCountryNameLocalized(legalizationWinner) }) }}
                </div>
              </div>
            </div>
            <AffiliatePartnerLinks
              partner-slot="compare"
              :country="legalizationWinner"
              :nat="localNat"
              :partners-override="compareWinnerPartners"
              :limit="1"
            />
          </div>

          <div v-if="hubCountryLinks.length" class="cmp-hub-links">
            <div class="cmp-hub-links-head">
              <span class="section-label">{{ $t('compare.hubLinks.title') }}</span>
              <p class="cmp-hub-links-sub">{{ $t('compare.hubLinks.subtitle') }}</p>
            </div>
            <div class="cmp-hub-links-list">
              <NuxtLinkLocale
                v-for="link in hubCountryLinks"
                :key="link.code"
                :to="link.href"
                class="cmp-hub-link"
              >
                <span class="cmp-hub-link-flag">{{ link.flag }}</span>
                <span>{{ link.label }}</span>
                <span class="cmp-hub-link-arrow">→</span>
              </NuxtLinkLocale>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getFlagEmoji } from '~/utils/countries'
import { getCountryMeta } from '~/utils/countryMeta'
import {
  useComparePage,
  COMPARE_CATEGORIES,
  CLIMATE_ICONS,
  getCatAvg,
  barColor,
} from '~/composables/useComparePage'
import { getCompareWinnerPartner } from '~/utils/partners'
import { isContentHubCountry } from '~/data/contentHubCountries'

const props = defineProps<{
  fixedPair?: { a: string; b: string }
  ssr?: boolean
}>()

const {
  countryA,
  countryB,
  countryC,
  showThird,
  localNat,
  countryList,
  nationalityList,
  getCountryNameLocalized,
  selectedCountries,
  statsData,
  pending,
  metaList,
  isLowData,
  totalReviewCount,
  isWinner,
  costClass,
  getCostLabel,
  getCostClass,
  staticRows,
  pageH1,
  firstReviewCountry,
} = useComparePage({ fixedPair: props.fixedPair, ssr: props.ssr })

const { showCompareAffiliate } = useAffiliateAb()

const legalizationWinner = computed((): string | null => {
  if (selectedCountries.value.length !== 2 || !statsData.value?.length) return null
  const avgs = statsData.value.map(item => ({
    country: item.country,
    avg: getCatAvg(item.stats, 'legalization') ?? 0,
  }))
  if (avgs.every(a => a.avg === 0)) return null
  const sorted = [...avgs].sort((a, b) => b.avg - a.avg)
  const top = sorted[0]
  const second = sorted[1]
  if (!top || !second || top.avg - second.avg <= 0.2) return null
  return top.country
})

const compareWinnerPartners = computed(() => {
  if (!legalizationWinner.value) return []
  const partner = getCompareWinnerPartner({
    slot: 'compare',
    country: legalizationWinner.value,
    nat: localNat.value || undefined,
  })
  return partner ? [partner] : []
})

const localePath = useLocalePath()
const { t } = useI18n()

const hubCountryLinks = computed(() => {
  const nat = (localNat.value || 'UA').toLowerCase()
  return selectedCountries.value
    .filter(code => isContentHubCountry(code))
    .map((code) => ({
      code,
      flag: getFlagEmoji(code),
      label: t('compare.hubLinks.link', { country: getCountryNameLocalized(code) }),
      href: localePath(`/country/${code.toLowerCase()}?nat=${nat}`),
    }))
})
</script>

<style scoped>
.cmp-page { background: var(--color-bg-secondary); min-height: 100vh; }

.breadcrumb { padding: 12px 24px; font-size: 12px; display: flex; align-items: center; gap: 6px; max-width: 1200px; margin: 0 auto; }
.bc-link { color: var(--color-primary); text-decoration: none; }
.bc-link:hover { text-decoration: underline; }
.bc-sep { color: var(--color-text-muted); }
.bc-current { color: var(--color-text-secondary); }

.cmp-header { background: #fff; border-bottom: 1px solid var(--color-border); padding: 24px; }
.cmp-header-inner { max-width: 1152px; margin: 0 auto; }
.cmp-title { font-size: 24px; font-weight: 700; color: var(--color-text); margin: 4px 0 6px; }
.cmp-subtitle { font-size: 14px; color: var(--color-text-secondary); margin: 0; }

.cmp-selectors-wrap { background: #fff; border-bottom: 1px solid var(--color-border); padding: 16px 24px; }
.cmp-selectors { max-width: 1152px; margin: 0 auto; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.cmp-select { min-width: 180px; font-size: 13px; }
.cmp-select--nat { min-width: 160px; }
.cmp-vs { font-size: 11px; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.06em; flex-shrink: 0; }
.cmp-add-btn {
  background: var(--color-primary-light); color: var(--color-primary);
  border: 1.5px dashed var(--color-primary); border-radius: var(--radius-md);
  padding: 8px 14px; font-size: 13px; cursor: pointer; font-family: inherit;
  white-space: nowrap; transition: background 0.15s;
}
.cmp-add-btn:hover { background: var(--color-primary-light); opacity: 0.8; }
.cmp-remove-btn {
  background: none; border: 1px solid var(--color-border); border-radius: 50%;
  width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 14px; color: var(--color-text-muted); flex-shrink: 0;
}
.cmp-remove-btn:hover { background: var(--color-bg-secondary); }
.cmp-nat-filter { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.cmp-filter-label { font-size: 12px; color: var(--color-text-muted); white-space: nowrap; }

.cmp-content { max-width: 1200px; margin: 0 auto; padding: 20px 24px; }
.cmp-empty { text-align: center; padding: 60px 24px; color: var(--color-text-muted); font-size: 15px; }
.cmp-empty svg { display: block; margin: 0 auto 16px; }
.cmp-skeleton { margin-bottom: 20px; }

.cmp-low-data {
  background: var(--color-warning-light);
  border: 1px solid #e8c97a;
  border-radius: var(--radius-md);
  padding: 14px 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.cmp-low-data-text { margin: 0; font-size: 13px; color: var(--color-text-secondary); }
.cmp-low-data-cta {
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-md);
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}
.cmp-low-data-cta:hover { background: var(--color-primary-hover); }

.cmp-table-wrap { background: #fff; border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow-x: auto; -webkit-overflow-scrolling: touch; margin-bottom: 16px; }
.cmp-table { display: grid; min-width: 600px; }

.cmp-cell {
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-border-subtle);
  border-right: 1px solid var(--color-border-subtle);
  display: flex; align-items: center; gap: 8px;
}
.cmp-cell:last-child { border-right: none; }

.cmp-cell--head {
  flex-direction: column; align-items: center; text-align: center;
  background: var(--color-bg-secondary); padding: 16px 14px; gap: 4px;
}
.cmp-country-flag { font-size: 28px; line-height: 1; }
.cmp-country-name { font-size: 13px; font-weight: 600; color: var(--color-text); }
.cmp-overall-score { font-size: 22px; font-weight: 700; color: var(--color-primary); line-height: 1; margin-top: 4px; }
.cmp-overall-label { font-size: 10px; color: var(--color-text-muted); }
.cmp-country-link { font-size: 11px; color: var(--color-primary); text-decoration: none; margin-top: 4px; }
.cmp-country-link:hover { text-decoration: underline; }

.cmp-cell--label { background: var(--color-bg-secondary); font-size: 12px; color: var(--color-text-secondary); }
.cmp-cat-icon {
  width: 26px; height: 26px; flex-shrink: 0;
  background: var(--color-primary-light); border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
}
.cmp-cat-name { font-size: 12px; color: var(--color-text-secondary); }

.cmp-cell--val { flex-direction: column; align-items: flex-start; gap: 4px; }
.cmp-bar-wrap { width: 100%; height: 4px; background: var(--color-bg-tertiary); border-radius: 2px; overflow: hidden; }
.cmp-bar { height: 100%; border-radius: 2px; transition: width 0.4s ease; }
.cmp-score-row { display: flex; align-items: center; gap: 6px; }
.cmp-score { font-size: 12px; font-weight: 600; color: var(--color-text); }
.cmp-winner { font-size: 10px; background: var(--color-success); color: #fff; border-radius: var(--radius-pill); padding: 1px 6px; white-space: nowrap; }
.cmp-no-data { font-size: 13px; color: var(--color-text-muted); }
.compare-climate-icons { display: flex; align-items: center; gap: 5px; margin-top: 4px; flex-wrap: wrap; }
.compare-climate-icons span:first-child { font-size: 14px; line-height: 1; }
.compare-climate-text { font-size: 11px; color: var(--color-text-muted); }
.compare-cost-label { font-size: 11px; font-weight: 500; margin-top: 4px; width: fit-content; padding: 1px 7px; border-radius: 999px; }
.cost-low       { background: var(--color-success-light); color: var(--color-success); }
.cost-medium    { background: var(--color-bg-tertiary);   color: var(--color-text-secondary); }
.cost-high      { background: var(--color-warning-light); color: var(--color-warning); }
.cost-very-high { background: var(--color-danger-light);  color: var(--color-danger); }

.cmp-static-wrap { background: #fff; border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow-x: auto; -webkit-overflow-scrolling: touch; }
.cmp-static-header { background: var(--color-primary-light); padding: 10px 16px; font-size: 12px; font-weight: 600; color: var(--color-primary-dark); min-width: 600px; }
.cmp-cell--static-label { font-size: 12px; color: var(--color-text-secondary); background: var(--color-bg-secondary); }
.cmp-cell--static-val { font-size: 12px; font-weight: 500; color: var(--color-text); }
.val-success { color: var(--color-success) !important; }
.val-warn    { color: var(--color-warning) !important; }
.val-danger  { color: var(--color-danger) !important; }

.cmp-winner-affiliate {
  margin-top: 16px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
}
.cmp-winner-affiliate-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}
.cmp-winner-affiliate-flag { font-size: 28px; line-height: 1; }
.cmp-winner-affiliate-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}
.cmp-winner-affiliate-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.cmp-hub-links {
  margin-top: 16px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
}
.cmp-hub-links-head { margin-bottom: 10px; }
.cmp-hub-links-sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.cmp-hub-links-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.cmp-hub-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  text-decoration: none;
  transition: background 0.15s;
}
.cmp-hub-link:hover { background: var(--color-primary-light); }
.cmp-hub-link-flag { font-size: 18px; line-height: 1; }
.cmp-hub-link-arrow { margin-left: auto; color: var(--color-primary); }

@media (max-width: 768px) {
  .cmp-selectors { gap: 8px; }
  .cmp-nat-filter { margin-left: 0; width: 100%; }
  .cmp-select { min-width: 140px; }
}
</style>
