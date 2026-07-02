<template>
  <div ref="mapWrapRef" class="map-wrap" :style="wrapStyle">
    <svg
      :viewBox="viewBox"
      preserveAspectRatio="xMidYMid meet"
      class="worldmap"
    >
      <path
        v-for="[name, d] in paths"
        :key="name"
        :d="d"
        :class="['map-country', { 'has-data': !!reviewData[name] }]"
        @mouseenter="showTooltip(name)"
        @mouseleave="hideTooltip"
      />
      <g
        v-for="pin in pins"
        :key="pin.name"
        class="map-pin"
        :transform="`translate(${pin.cx},${pin.cy})`"
      >
        <circle class="dot" :r="pin.r" />
        <text x="0" :y="pin.r * 0.35" text-anchor="middle" :style="{ fontSize: `${pin.r * 0.85}px` }">
          {{ pin.label }}
        </text>
      </g>
    </svg>

    <div
      v-if="tooltipVisible && activeTooltip"
      ref="tooltipRef"
      class="map-tooltip show"
      :style="tooltipStyle"
      @mouseenter="onTooltipEnter"
      @mouseleave="onTooltipLeave"
    >
      <div class="mt-flag-row">
        <span v-if="activeTooltip.entry" class="mt-flag">{{ getFlagEmoji(activeTooltip.entry.code) }}</span>
        <span class="mt-name">{{ activeTooltip.label }}</span>
      </div>
      <div v-if="activeTooltip.entry" class="mt-rating">★ {{ activeTooltip.entry.rating }}</div>
      <div class="mt-sub">
        <template v-if="activeTooltip.entry">
          {{ activeTooltip.entry.reviews }} {{ $t('common.labels.reviews') }}
        </template>
        <template v-else>
          {{ $t('homepage.map.noReviews') }}
        </template>
      </div>
      <NuxtLinkLocale
        v-if="activeTooltip.entry"
        :to="`/country/${activeTooltip.entry.code.toLowerCase()}`"
        class="mt-btn"
      >
        {{ $t('common.buttons.seeAll') }} →
      </NuxtLinkLocale>
      <NuxtLinkLocale
        v-else
        to="/review/new"
        class="mt-btn"
      >
        {{ $t('homepage.map.writeFirst') }} →
      </NuxtLinkLocale>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WORLD_COUNTRIES, RU_NAMES } from '~/utils/worldMapGeo'
import { getCountryName, getFlagEmoji } from '~/utils/countries'

export interface MapReviewEntry {
  code: string
  rating: number
  reviews: number
}

const props = withDefaults(defineProps<{
  reviewData: Record<string, MapReviewEntry>
  viewBox?: string
  mapHeight?: string
}>(), {
  viewBox: '0 0 1000 520',
  mapHeight: '390px',
})

const wrapStyle = computed(() => ({
  height: props.mapHeight,
  marginTop: props.mapHeight === '190px' || props.mapHeight === '280px' || props.mapHeight === '240px' ? '0' : '10px',
}))

const { locale, t } = useI18n()

const paths = WORLD_COUNTRIES.map(([name, d]) => [name, d] as const)

function getLocalizedName(mapName: string, code?: string): string {
  if (locale.value === 'ru' || locale.value === 'uk') {
    return RU_NAMES[mapName] ?? mapName
  }
  if (code) return getCountryName(code)
  return mapName
}

const pins = computed(() =>
  Object.entries(props.reviewData)
    .map(([mapName, data]) => {
      const entry = WORLD_COUNTRIES.find(c => c[0] === mapName)
      if (!entry) return null
      const [, , cx, cy] = entry
      const r = Math.max(7, Math.min(13, 5 + data.reviews / 60))
      const label = data.reviews >= 100 ? `${Math.round(data.reviews / 10) / 10}k` : String(data.reviews)
      return { name: mapName, cx, cy, r, label }
    })
    .filter(Boolean) as { name: string; cx: number; cy: number; r: number; label: string }[]
)

const mapWrapRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const tooltipVisible = ref(false)
const tooltipHovered = ref(false)
const tooltipStyle = ref({ left: '0px', top: '0px' })
let hideTooltipTimer: ReturnType<typeof setTimeout> | null = null

const activeTooltip = ref<{
  mapName: string
  label: string
  entry?: MapReviewEntry
} | null>(null)

function showTooltip(mapName: string) {
  if (hideTooltipTimer) {
    clearTimeout(hideTooltipTimer)
    hideTooltipTimer = null
  }

  const worldEntry = WORLD_COUNTRIES.find(c => c[0] === mapName)
  if (!worldEntry) return

  const [, , cx, cy] = worldEntry
  const entry = props.reviewData[mapName]
  activeTooltip.value = {
    mapName,
    label: getLocalizedName(mapName, entry?.code),
    entry,
  }

  const wrap = mapWrapRef.value
  const svg = wrap?.querySelector('svg')
  if (!wrap || !svg) return

  const rect = wrap.getBoundingClientRect()
  const pt = svg.createSVGPoint()
  pt.x = cx
  pt.y = cy
  const ctm = svg.getScreenCTM()
  if (!ctm) return
  const screenPt = pt.matrixTransform(ctm)
  let left = screenPt.x - rect.left + 16
  let top = screenPt.y - rect.top - 20
  if (left + 190 > rect.width) left = screenPt.x - rect.left - 206
  if (top < 0) top = 4

  tooltipStyle.value = { left: `${left}px`, top: `${top}px` }
  tooltipVisible.value = true
}

function hideTooltip() {
  hideTooltipTimer = setTimeout(() => {
    if (!tooltipHovered.value) {
      tooltipVisible.value = false
      activeTooltip.value = null
    }
  }, 120)
}

function onTooltipEnter() {
  tooltipHovered.value = true
  if (hideTooltipTimer) {
    clearTimeout(hideTooltipTimer)
    hideTooltipTimer = null
  }
}

function onTooltipLeave() {
  tooltipHovered.value = false
  hideTooltip()
}

watch(() => props.reviewData, () => {
  if (tooltipVisible.value && activeTooltip.value) {
    showTooltip(activeTooltip.value.mapName)
  }
}, { deep: true })
</script>

<style scoped>
.map-wrap {
  position: relative;
  background: #F8F7FC;
}
.worldmap {
  width: 100%;
  height: 100%;
  display: block;
}
.map-country {
  fill: #E7E4F3;
  stroke: #fff;
  stroke-width: 0.5;
  transition: fill 0.15s;
  cursor: pointer;
}
.map-country:hover { fill: #D5CEF0; }
.map-country.has-data { fill: #B9A8ED; cursor: pointer; }
.map-country.has-data:hover { fill: var(--purple-600, #6C4CE0); }
.map-pin { pointer-events: none; }
.map-pin .dot {
  fill: var(--purple-700, #5B3DE0);
  stroke: white;
  stroke-width: 1.4;
}
.map-pin text {
  font-family: var(--font-display);
  font-weight: 800;
  fill: white;
}
.map-tooltip {
  position: absolute;
  z-index: 20;
  background: white;
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 14px 32px rgba(26, 23, 48, 0.2);
  width: 190px;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.15s, transform 0.15s;
  pointer-events: auto;
}
.map-tooltip.show {
  opacity: 1;
  transform: translateY(0);
}
.mt-flag-row {
  display: flex;
  align-items: center;
  gap: 7px;
  font-weight: 800;
  font-size: 13.5px;
  margin-bottom: 3px;
  font-family: var(--font-display);
}
.mt-flag {
  font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
  line-height: 1;
  flex-shrink: 0;
}
.mt-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #F0A947;
  font-weight: 700;
  font-size: 12px;
  margin-bottom: 6px;
}
.mt-sub {
  font-size: 11px;
  color: #5B5876;
  margin-bottom: 4px;
}
.mt-btn {
  font-size: 11.5px;
  font-weight: 700;
  color: white;
  background: #6C4CE0;
  padding: 6px 10px;
  border-radius: 8px;
  display: inline-block;
  margin-top: 4px;
  text-decoration: none;
}
.mt-btn:hover {
  background: #5B3DE0;
}
</style>
