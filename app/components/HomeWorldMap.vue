<template>
  <div class="home-world-map">
    <div class="map-toolbar">
      <div class="map-region-bar">
        <div
          class="map-region-scroll"
          role="tablist"
          :aria-label="$t('homepage.map.continentsLabel')"
        >
          <button
            v-for="continent in MAP_CONTINENT_IDS"
            :key="continent"
            type="button"
            class="map-region-chip map-region-chip--continent"
            :class="{ 'is-active': activeContinent === continent }"
            role="tab"
            :aria-selected="activeContinent === continent"
            @click="setContinent(continent)"
          >
            {{ $t(`homepage.map.continents.${continent}`) }}
          </button>
        </div>
        <div
          v-if="activeContinent !== 'world'"
          class="map-region-scroll map-region-scroll--sub"
          role="group"
          :aria-label="$t('homepage.map.regionsLabel')"
        >
          <button
            v-for="region in subregionsForContinent"
            :key="region"
            type="button"
            class="map-region-chip map-region-chip--sub"
            :class="{ 'is-active': activeRegion === region }"
            :aria-pressed="activeRegion === region"
            :title="$t(`homepage.map.regions.${region}`)"
            :aria-label="$t(`homepage.map.regions.${region}`)"
            @click="setRegion(region)"
          >
            {{ $t(`homepage.map.regionsShort.${region}`) }}
          </button>
        </div>
      </div>

      <div class="map-scope" role="status">
        <span class="map-scope-badge">
          <template v-if="scopeNationality && !showAllNationalities">
            <span class="map-scope-flag">{{ getFlagEmoji(scopeNationality) }}</span>
            {{ $t('homepage.map.scopeShowing', { name: scopeLabel }) }}
          </template>
          <template v-else>
            {{ $t('homepage.map.scopeAll') }}
          </template>
        </span>
        <button
          v-if="scopeNationality"
          type="button"
          class="map-scope-toggle"
          @click="toggleScope"
        >
          {{ showAllNationalities
            ? $t('homepage.map.scopeShowMine')
            : $t('homepage.map.scopeShowAll') }}
        </button>
      </div>
    </div>

    <div class="map-body">
      <div ref="mapWrapRef" class="map-wrap" :style="wrapStyle">
        <svg
          :viewBox="animatedViewBox"
          preserveAspectRatio="xMidYMid meet"
          class="worldmap"
          role="img"
          :aria-label="$t('homepage.map.title')"
        >
          <path
            v-for="[name, d] in paths"
            :key="name"
            :d="d"
            class="map-country"
            :class="{
              'has-data': !!reviewData[name],
              'is-active': selectedMapName === name,
              'is-dimmed': isDimmed(name),
              'in-region': isInActiveRegion(name),
            }"
          />
        </svg>

        <div
          v-if="isScopeEmpty"
          class="map-empty"
        >
          {{ $t('homepage.map.scopeEmpty', { name: scopeLabel }) }}
          <button type="button" class="map-empty-btn" @click="emit('update:showAllNationalities', true)">
            {{ $t('homepage.map.scopeShowAll') }}
          </button>
        </div>
      </div>

      <aside class="map-side" :aria-label="$t('homepage.map.listLabel')">
        <div
          v-if="selectedCountry"
          class="map-detail"
        >
          <div class="map-detail-top">
            <span class="map-detail-flag">{{ getFlagEmoji(selectedCountry.code) }}</span>
            <div class="map-detail-text">
              <div class="map-detail-name">{{ selectedCountry.label }}</div>
              <div v-if="selectedCountry.entry" class="map-detail-rating">
                ★ {{ selectedCountry.entry.rating }}
                <span class="map-detail-reviews">
                  · {{ selectedCountry.entry.reviews }} {{ $t('common.labels.reviews') }}
                </span>
              </div>
              <div v-else class="map-detail-sub">
                {{ $t('homepage.map.noReviews') }}
              </div>
            </div>
            <button
              type="button"
              class="map-detail-clear"
              :aria-label="$t('common.buttons.close')"
              @click="clearSelection"
            >×</button>
          </div>
          <p class="map-detail-blurb">
            {{ selectedCountry.entry
              ? $t('homepage.map.detailWithData')
              : $t('homepage.map.detailEmpty') }}
          </p>
          <div class="map-detail-actions">
            <NuxtLinkLocale
              :to="`/review/new?country=${selectedCountry.code}`"
              class="map-detail-btn map-detail-btn--primary"
              :class="{ 'map-detail-btn--write-first': !selectedCountry.entry }"
            >
              {{ selectedCountry.entry ? $t('homepage.map.leaveReview') : $t('country.empty.cta') }}
            </NuxtLinkLocale>
            <NuxtLinkLocale
              v-if="selectedCountry.entry"
              :to="`/country/${selectedCountry.code.toLowerCase()}`"
              class="map-detail-btn map-detail-btn--ghost"
            >
              {{ $t('homepage.map.openCountry') }}
            </NuxtLinkLocale>
          </div>
          <div v-if="mapAffiliateTitle" class="map-detail-affiliate">
            <div class="map-detail-affiliate-title">{{ mapAffiliateTitle }}</div>
            <AffiliatePartnerLinks
              partner-slot="map"
              :country="selectedCountry.code"
              :nat="effectiveNat"
              :limit="2"
              compact
            />
          </div>
        </div>

        <div v-else class="map-detail map-detail--placeholder">
          <p>{{ $t('homepage.map.selectHint') }}</p>
        </div>

        <div class="map-list-head">
          <span class="map-list-title">{{ $t('homepage.map.listTitle') }}</span>
          <span class="map-list-count">{{ regionCountries.length }}</span>
        </div>

        <div
          v-if="regionCountries.length"
          class="map-list"
          role="listbox"
          :aria-label="$t('homepage.map.listLabel')"
        >
          <button
            v-for="item in regionCountries"
            :key="item.code"
            type="button"
            class="map-list-item"
            :class="{
              'is-selected': selectedCode === item.code,
              'has-data': !!item.entry,
            }"
            role="option"
            :aria-selected="selectedCode === item.code"
            @click="selectCountry(item)"
          >
            <span class="map-list-flag">{{ getFlagEmoji(item.code) }}</span>
            <span class="map-list-name">{{ item.label }}</span>
            <span v-if="item.entry" class="map-list-meta">
              ★ {{ item.entry.rating }}
              <span class="map-list-meta-count">{{ item.entry.reviews }}</span>
            </span>
            <span v-else class="map-list-meta map-list-meta--write-first">
              {{ $t('homepage.map.writeFirst') }}
            </span>
          </button>
        </div>
        <div v-else class="map-list-empty">
          {{ $t('homepage.map.listEmpty') }}
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WORLD_COUNTRIES, RU_NAMES, codeToMapName } from '~/utils/worldMapGeo'
import { getCountryName, getFlagEmoji, TARGET_COUNTRIES } from '~/utils/countries'
import {
  MAP_CONTINENT_IDS,
  MAP_REGION_IDS,
  DEFAULT_MAP_REGION,
  DEFAULT_MAP_CONTINENT,
  DEFAULT_SUBREGION_BY_CONTINENT,
  SUBREGIONS_BY_CONTINENT,
  getRegionViewBox,
  getMapRegion,
  getSubregionForCode,
  getContinentForRegion,
  mapNameToCode,
  parseViewBox,
  formatViewBox,
  getCountryFocusViewBox,
  type MapRegionId,
  type MapContinentId,
} from '~/utils/worldMapRegions'

export interface MapReviewEntry {
  code: string
  rating: number
  reviews: number
}

type RegionCountryItem = {
  code: string
  mapName?: string
  label: string
  entry?: MapReviewEntry
}

const props = withDefaults(defineProps<{
  reviewData: Record<string, MapReviewEntry>
  mapHeight?: string
  initialRegion?: MapRegionId
  /** ISO nationality code when user has one set */
  scopeNationality?: string
  /** Localized nationality label for the badge */
  scopeLabel?: string
  /** When true, map shows all nationalities even if scopeNationality is set */
  showAllNationalities?: boolean
}>(), {
  mapHeight: '390px',
  initialRegion: DEFAULT_MAP_REGION,
  scopeNationality: '',
  scopeLabel: '',
  showAllNationalities: true,
})

const lastSubregionByContinent = ref<Partial<Record<Exclude<MapContinentId, 'world'>, MapRegionId>>>({})

const emit = defineEmits<{
  'update:showAllNationalities': [value: boolean]
}>()

const wrapStyle = computed(() => {
  const [, , vbW, vbH] = parseViewBox(animatedViewBox.value)
  const aspect = vbW / Math.max(vbH, 1)
  const maxH = activeRegion.value === 'world' && !selectedMapName.value ? 400 : 480
  return {
    aspectRatio: `${vbW} / ${vbH}`,
    width: '100%',
    maxHeight: `${maxH}px`,
    height: 'auto',
  }
})

const { locale, t } = useI18n()
const { getCountryNameLocalized } = useLocalizedCountries()

const effectiveNat = computed(() =>
  props.scopeNationality && !props.showAllNationalities ? props.scopeNationality : '',
)

const mapAffiliateTitle = computed(() => {
  if (!selectedCountry.value) return ''
  return t('partners.map.title', { country: selectedCountry.value.label })
})
const { trackEvent } = useAnalytics()

const scopeLabel = computed(() => {
  if (props.scopeLabel) return props.scopeLabel
  if (props.scopeNationality) return getCountryNameLocalized(props.scopeNationality)
  return ''
})

const isScopeEmpty = computed(() =>
  !!props.scopeNationality
  && !props.showAllNationalities
  && Object.keys(props.reviewData).length === 0
)

function toggleScope() {
  emit('update:showAllNationalities', !props.showAllNationalities)
}

const paths = WORLD_COUNTRIES.map(([name, d]) => [name, d] as const)

const activeRegion = ref<MapRegionId>(props.initialRegion)
const activeContinent = ref<MapContinentId>(
  props.initialRegion === 'world'
    ? 'world'
    : getContinentForRegion(props.initialRegion) || DEFAULT_MAP_CONTINENT,
)
const animatedViewBox = ref(getRegionViewBox(props.initialRegion))
const selectedCode = ref<string | null>(null)
let viewBoxRaf = 0

const subregionsForContinent = computed((): MapRegionId[] => {
  if (activeContinent.value === 'world') return []
  return SUBREGIONS_BY_CONTINENT[activeContinent.value]
})

const selectedMapName = computed(() => {
  if (!selectedCode.value) return null
  const item = regionCountries.value.find(c => c.code === selectedCode.value)
  return item?.mapName ?? null
})

const selectedCountry = computed(() => {
  if (!selectedCode.value) return null
  return regionCountries.value.find(c => c.code === selectedCode.value) ?? null
})

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

function animateViewBox(to: string, duration = 480) {
  if (viewBoxRaf) cancelAnimationFrame(viewBoxRaf)
  const fromParts = parseViewBox(animatedViewBox.value)
  const toParts = parseViewBox(to)
  if (fromParts.every((v, i) => Math.abs(v - toParts[i]!) < 0.05)) {
    animatedViewBox.value = to
    return
  }
  const start = performance.now()
  const tick = (now: number) => {
    const tNorm = Math.min(1, (now - start) / duration)
    const e = easeInOutCubic(tNorm)
    animatedViewBox.value = formatViewBox([
      fromParts[0] + (toParts[0] - fromParts[0]) * e,
      fromParts[1] + (toParts[1] - fromParts[1]) * e,
      fromParts[2] + (toParts[2] - fromParts[2]) * e,
      fromParts[3] + (toParts[3] - fromParts[3]) * e,
    ])
    if (tNorm < 1) {
      viewBoxRaf = requestAnimationFrame(tick)
    } else {
      viewBoxRaf = 0
      animatedViewBox.value = to
    }
  }
  viewBoxRaf = requestAnimationFrame(tick)
}

function setRegion(region: MapRegionId) {
  if (activeRegion.value === region) return
  activeRegion.value = region
  const continent = getContinentForRegion(region)
  activeContinent.value = continent
  if (continent !== 'world') {
    lastSubregionByContinent.value[continent] = region
  }
  selectedCode.value = null
  animateViewBox(getRegionViewBox(region))
}

function setContinent(continent: MapContinentId) {
  if (continent === 'world') {
    if (activeRegion.value === 'world') return
    activeContinent.value = 'world'
    activeRegion.value = 'world'
    selectedCode.value = null
    animateViewBox(getRegionViewBox('world'))
    return
  }
  const remembered = lastSubregionByContinent.value[continent]
  const next = remembered && SUBREGIONS_BY_CONTINENT[continent].includes(remembered)
    ? remembered
    : DEFAULT_SUBREGION_BY_CONTINENT[continent]
  activeContinent.value = continent
  if (activeRegion.value === next) return
  activeRegion.value = next
  lastSubregionByContinent.value[continent] = next
  selectedCode.value = null
  animateViewBox(getRegionViewBox(next))
}

function clearSelection() {
  selectedCode.value = null
  animateViewBox(getRegionViewBox(activeRegion.value))
}

function isInActiveRegion(mapName: string) {
  if (activeRegion.value === 'world') return true
  return getMapRegion(mapName) === activeRegion.value
}

function isDimmed(mapName: string) {
  if (selectedMapName.value && mapName !== selectedMapName.value) {
    // Soft-dim non-selected while a country is focused
    if (isInActiveRegion(mapName)) return false
  }
  return activeRegion.value !== 'world' && !isInActiveRegion(mapName)
}

function getLocalizedName(mapName: string, code?: string): string {
  if (code) {
    const localized = getCountryNameLocalized(code)
    if (localized && localized !== code) return localized
  }
  if (locale.value === 'ru' || locale.value === 'uk') {
    return RU_NAMES[mapName] ?? mapName
  }
  if (code) {
    const named = getCountryName(code)
    if (named !== code) return named
  }
  return mapName
}

function codeBelongsToRegion(code: string, region: MapRegionId): boolean {
  if (region === 'world') return true
  return getSubregionForCode(code) === region
}

/**
 * Region country list:
 * - Subregions: all map countries in the subregion + Triplandr targets
 * - World: targets + countries with review data (bounded)
 * Sorted: with reviews first (by count), then A–Z.
 */
const regionCountries = computed((): RegionCountryItem[] => {
  const region = activeRegion.value
  const byCode = new Map<string, RegionCountryItem>()

  const upsert = (code: string, mapName?: string) => {
    const upper = code.toUpperCase()
    const existing = byCode.get(upper)
    const resolvedMap = mapName
      ?? existing?.mapName
      ?? codeToMapName(upper, getCountryName(upper))
    const entry = (resolvedMap && props.reviewData[resolvedMap])
      || Object.values(props.reviewData).find(e => e.code.toUpperCase() === upper)
    byCode.set(upper, {
      code: upper,
      mapName: WORLD_COUNTRIES.some(c => c[0] === resolvedMap) ? resolvedMap : existing?.mapName,
      label: getLocalizedName(resolvedMap || upper, upper),
      entry,
    })
  }

  // Map paths in region
  for (const [mapName] of WORLD_COUNTRIES) {
    if (!isInActiveRegion(mapName)) continue
    const code = mapNameToCode(mapName)
    if (!code) continue
    const hasData = !!props.reviewData[mapName]
    // Subregions: full map list; world: only paths with review data
    if (region !== 'world' || hasData) {
      upsert(code, mapName)
    }
  }

  // Triplandr targets for this region
  for (const c of TARGET_COUNTRIES) {
    if (!codeBelongsToRegion(c.code, region)) continue
    upsert(c.code)
  }

  // Any review-data countries not already covered
  for (const [mapName, entry] of Object.entries(props.reviewData)) {
    if (!isInActiveRegion(mapName)) continue
    upsert(entry.code, mapName)
  }

  const items = [...byCode.values()]
  const prioritizeEmpty = !!props.scopeNationality && !props.showAllNationalities
  items.sort((a, b) => {
    const aEmpty = !a.entry
    const bEmpty = !b.entry
    if (prioritizeEmpty && aEmpty !== bEmpty) return aEmpty ? -1 : 1
    const ar = a.entry?.reviews ?? 0
    const br = b.entry?.reviews ?? 0
    if (ar !== br) return br - ar
    return a.label.localeCompare(b.label, locale.value)
  })
  return items
})

function selectCountry(item: RegionCountryItem) {
  selectedCode.value = item.code
  trackEvent('map_country_select', {
    country: item.code,
    has_reviews: Boolean(item.entry),
  })
  if (item.mapName) {
    const focus = getCountryFocusViewBox(item.mapName)
    if (focus) {
      animateViewBox(focus, 420)
      return
    }
  }
  animateViewBox(getRegionViewBox(activeRegion.value), 360)
}

const mapWrapRef = ref<HTMLElement | null>(null)

watch(() => props.reviewData, () => {
  // Keep selection if still in list; otherwise clear
  if (selectedCode.value && !regionCountries.value.some(c => c.code === selectedCode.value)) {
    clearSelection()
  }
}, { deep: true })

watch([() => props.showAllNationalities, () => props.scopeNationality], () => {
  clearSelection()
})

onMounted(() => {
  for (const id of MAP_REGION_IDS) getRegionViewBox(id)
})

onUnmounted(() => {
  if (viewBoxRaf) cancelAnimationFrame(viewBoxRaf)
})
</script>

<style scoped>
.home-world-map {
  display: flex;
  flex-direction: column;
}

.map-toolbar {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: #fff;
}

.map-region-bar {
  padding: 14px 18px 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.map-region-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 10px;
}

.map-region-scroll--sub {
  padding-top: 0;
  padding-bottom: 10px;
  gap: 6px;
}

.map-region-scroll::-webkit-scrollbar {
  display: none;
}

.map-region-chip {
  flex: 0 0 auto;
  border: 1.5px solid var(--line, #EAE7F5);
  background: #fff;
  color: var(--ink-soft, #5B5876);
  font-family: var(--font-display, 'Manrope', sans-serif);
  font-size: 12.5px;
  font-weight: 700;
  line-height: 1;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.map-region-chip--sub {
  font-size: 11.5px;
  font-weight: 650;
  padding: 6px 11px;
  border-radius: 8px;
  background: #F8F7FC;
}

.map-region-chip:hover {
  border-color: #C8BFE8;
  color: var(--ink, #1A1730);
}

.map-region-chip.is-active {
  background: var(--ink, #1A1730);
  border-color: var(--ink, #1A1730);
  color: #fff;
}

.map-region-chip--sub.is-active {
  background: var(--purple-600, #6C4CE0);
  border-color: var(--purple-600, #6C4CE0);
}

.map-region-chip:focus-visible {
  outline: 2px solid var(--purple-600, #6C4CE0);
  outline-offset: 2px;
}

.map-scope {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 18px 12px;
}

.map-scope-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-soft, #5B5876);
  background: #F3F1FA;
  border: 1px solid var(--line, #EAE7F5);
  border-radius: 8px;
  padding: 5px 10px;
  line-height: 1.2;
}

.map-scope-flag {
  font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
  line-height: 1;
}

.map-scope-toggle {
  border: none;
  background: transparent;
  color: var(--purple-600, #6C4CE0);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 2px;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.map-scope-toggle:hover {
  color: var(--purple-700, #5B3DE0);
}

.map-body {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(220px, 0.85fr);
  gap: 0;
  align-items: stretch;
  border-top: 1px solid var(--line, #EAE7F5);
}

.map-wrap {
  position: relative;
  background: #F8F7FC;
  width: 100%;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
}

.worldmap {
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}

.map-country {
  fill: #E7E4F3;
  stroke: #F4F2FA;
  stroke-width: 0.6;
  vector-effect: non-scaling-stroke;
  transition: fill 0.2s, stroke 0.15s, stroke-width 0.15s, opacity 0.25s;
  pointer-events: none;
}

.map-country.has-data {
  fill: #A994E8;
  stroke: #C4B6EC;
  stroke-width: 0.7;
}

.map-country.has-data.is-active {
  fill: #4F27CC;
  stroke: #3617A8;
  stroke-width: 1;
}

.map-country.is-active:not(.has-data):not(.is-dimmed) {
  fill: #9684D8;
  stroke: #6450B8;
  stroke-width: 0.9;
}

/* Soften siblings when one country is selected from the list */
.worldmap:has(.map-country.is-active) .map-country:not(.is-active):not(.is-dimmed) {
  opacity: 0.72;
}

.map-country.is-dimmed {
  fill: #EDEBF5;
  stroke: #F7F6FB;
  stroke-width: 0.5;
  opacity: 0.38;
}

.map-country.is-dimmed.has-data {
  fill: #D4CCEA;
  stroke: #E4DFF3;
}

.map-empty {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-soft, #5B5876);
  background: rgba(248, 247, 252, 0.72);
  pointer-events: none;
}

.map-empty-btn {
  pointer-events: auto;
  border: 1.5px solid var(--line, #EAE7F5);
  background: #fff;
  color: var(--purple-600, #6C4CE0);
  font-size: 12.5px;
  font-weight: 700;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.map-empty-btn:hover {
  border-color: #C8BFE8;
  background: #F8F7FC;
}

/* ---- Side panel: detail + list ---- */
.map-side {
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: 520px;
  background: #fff;
  border-left: 1px solid var(--line, #EAE7F5);
}

.map-detail {
  position: relative;
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--line, #EAE7F5);
  background: linear-gradient(180deg, #F8F7FC 0%, #fff 100%);
}

.map-detail--placeholder {
  padding: 16px;
}

.map-detail--placeholder p {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--ink-soft, #5B5876);
  font-weight: 600;
}

.map-detail-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.map-detail-flag {
  font-size: 28px;
  line-height: 1;
  font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
  flex-shrink: 0;
}

.map-detail-text {
  flex: 1;
  min-width: 0;
}

.map-detail-name {
  font-family: var(--font-display, 'Manrope', sans-serif);
  font-weight: 800;
  font-size: 16px;
  color: var(--ink, #1A1730);
  line-height: 1.2;
}

.map-detail-rating {
  margin-top: 4px;
  color: #F0A947;
  font-weight: 700;
  font-size: 13px;
}

.map-detail-reviews {
  color: var(--ink-soft, #5B5876);
  font-weight: 600;
  font-size: 12px;
}

.map-detail-sub {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-soft, #5B5876);
}

.map-detail-clear {
  border: none;
  background: transparent;
  color: #5B5876;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  padding: 0 2px;
  flex-shrink: 0;
}

.map-detail-blurb {
  margin: 10px 0 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--ink-soft, #5B5876);
}

.map-detail-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.map-detail-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border-radius: 10px;
  font-family: var(--font-display, 'Manrope', sans-serif);
  font-size: 13px;
  font-weight: 700;
  padding: 10px 14px;
  cursor: pointer;
  border: none;
  text-decoration: none;
  box-sizing: border-box;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.map-detail-btn--primary {
  background: var(--purple-600, #6C4CE0);
  color: #fff;
}

.map-detail-btn--primary:hover {
  background: var(--purple-700, #5B3DE0);
}

.map-detail-btn--write-first {
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(108, 76, 224, 0.35);
}

.map-detail-btn--ghost {
  background: #fff;
  color: var(--ink, #1A1730);
  border: 1.5px solid var(--line, #EAE7F5);
}

.map-detail-btn--ghost:hover {
  border-color: #C8BFE8;
  background: #F8F7FC;
}

.map-detail-affiliate {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--line, #EAE7F5);
}

.map-detail-affiliate-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink-soft, #5B5876);
  margin-bottom: 8px;
  line-height: 1.35;
}

.map-list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px 6px;
}

.map-list-title {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink-soft, #5B5876);
}

.map-list-count {
  font-size: 11px;
  font-weight: 700;
  color: #9B96B0;
  background: #F3F1FA;
  border-radius: 999px;
  padding: 2px 8px;
}

.map-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 0 8px 12px;
}

.map-list-item {
  display: grid;
  grid-template-columns: 22px 1fr auto;
  align-items: center;
  gap: 8px;
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  font-family: inherit;
  color: var(--ink, #1A1730);
  transition: background 0.12s;
}

.map-list-item:hover {
  background: #F3F1FA;
}

.map-list-item.is-selected {
  background: #EDE8FA;
  box-shadow: inset 0 0 0 1.5px #C8BFE8;
}

.map-list-flag {
  font-size: 16px;
  line-height: 1;
  font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
}

.map-list-name {
  font-size: 13px;
  font-weight: 700;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-list-meta {
  font-size: 11.5px;
  font-weight: 700;
  color: #F0A947;
  white-space: nowrap;
}

.map-list-meta-count {
  margin-left: 4px;
  color: var(--ink-soft, #5B5876);
  font-weight: 600;
}

.map-list-meta--empty {
  color: #C4C0D4;
}

.map-list-meta--write-first {
  color: var(--purple-600, #6C4CE0);
  font-size: 10.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.map-list-item:not(.has-data) {
  border: 1px dashed #E4DFF3;
}

.map-list-empty {
  padding: 16px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--ink-soft, #5B5876);
}

@media (max-width: 860px) {
  .map-body {
    grid-template-columns: 1fr;
  }

  .map-side {
    border-left: none;
    border-top: 1px solid var(--line, #EAE7F5);
    max-height: none;
  }

  .map-list {
    max-height: 280px;
  }

  .map-wrap {
    min-height: 220px;
    max-height: 340px;
  }

  .map-detail-actions {
    flex-direction: row;
  }

  .map-detail-btn {
    flex: 1;
  }
}
</style>
