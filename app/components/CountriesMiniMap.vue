<template>
  <div ref="mapWrapRef" class="countries-minimap">
    <svg
      :viewBox="viewBox"
      :preserveAspectRatio="preserveAspectRatio"
      class="countries-minimap__svg"
    >
      <path
        v-for="[name, d] in paths"
        :key="name"
        :d="d"
        :class="['mini-map-country', { 'has-data': !!reviewData[name] }]"
        @mouseenter="showTooltip(name, $event)"
        @mouseleave="hideTooltip"
      />
      <g
        v-for="pin in pins"
        :key="pin.name"
        class="mini-pin"
        :transform="`translate(${pin.cx},${pin.cy})`"
      >
        <circle class="dot" r="2.2" />
      </g>
    </svg>
    <div ref="tooltipRef" class="mini-tooltip" :class="{ show: tooltipVisible }" v-html="tooltipHtml" />
  </div>
</template>

<script setup lang="ts">
import type { MapReviewEntry } from '~/components/HomeWorldMap.vue'
import { WORLD_COUNTRIES, RU_NAMES } from '~/utils/worldMapGeo'
import { getCountryName, getFlagEmoji } from '~/utils/countries'

const props = withDefaults(defineProps<{
  reviewData: Record<string, MapReviewEntry>
  viewBox?: string
  preserveAspectRatio?: string
}>(), {
  viewBox: '0 0 1000 190',
  preserveAspectRatio: 'xMidYMin slice',
})

const { locale, t } = useI18n()
const localePath = useLocalePath()

const paths = WORLD_COUNTRIES.map(([name, d]) => [name, d] as const)

const CODE_TO_MAP_NAME: Record<string, string> = {
  GB: 'England',
  US: 'USA',
}

function getLocalizedName(mapName: string, code?: string): string {
  if (locale.value === 'ru' || locale.value === 'uk') {
    return RU_NAMES[mapName] ?? mapName
  }
  if (code) return getCountryName(code)
  return mapName
}

const pins = computed(() =>
  Object.entries(props.reviewData)
    .map(([mapName]) => {
      const entry = WORLD_COUNTRIES.find(c => c[0] === mapName)
      if (!entry) return null
      const [, , cx, cy] = entry
      return { name: mapName, cx, cy }
    })
    .filter(Boolean) as { name: string; cx: number; cy: number }[]
)

const mapWrapRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const tooltipVisible = ref(false)
const tooltipHtml = ref('')

function showTooltip(mapName: string, event: MouseEvent) {
  const wrap = mapWrapRef.value
  const svg = (event.currentTarget as SVGPathElement)?.ownerSVGElement
  if (!wrap || !svg) return

  const entry = props.reviewData[mapName]
  const label = getLocalizedName(mapName, entry?.code)

  if (entry) {
    tooltipHtml.value = `
      <div class="mt-flag-row"><span class="mt-flag">${getFlagEmoji(entry.code)}</span><span class="mt-name">${label}</span></div>
      <div class="mt-rating">★ ${entry.rating}</div>
      <div class="mt-sub">${entry.reviews} ${t('common.labels.reviews')}</div>
      <a href="${localePath(`/country/${entry.code.toLowerCase()}`)}" class="mt-btn">${t('common.buttons.seeAll')} →</a>
    `
  } else {
    tooltipHtml.value = `
      <div class="mt-flag-row"><span class="mt-name">${label}</span></div>
      <div class="mt-sub">${t('homepage.map.noReviews')}</div>
      <a href="${localePath('/review/new')}" class="mt-btn">${t('homepage.map.writeFirst')} →</a>
    `
  }

  const worldEntry = WORLD_COUNTRIES.find(c => c[0] === mapName)
  if (!worldEntry) return
  const [, , cx, cy] = worldEntry

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

  if (tooltipRef.value) {
    tooltipRef.value.style.left = `${left}px`
    tooltipRef.value.style.top = `${top}px`
  }
  tooltipVisible.value = true
}

function hideTooltip() {
  tooltipVisible.value = false
}
</script>

<style scoped>
.countries-minimap {
  position: relative;
  width: 100%;
  height: 100%;
}
.countries-minimap__svg {
  width: 100%;
  height: 100%;
  display: block;
}
.mini-map-country {
  fill: #E7E4F3;
  stroke: #fff;
  stroke-width: 0.4;
  transition: fill 0.15s;
  cursor: pointer;
}
.mini-map-country:hover { fill: #D5CEF0; }
.mini-map-country.has-data { fill: #B9A8ED; }
.mini-map-country.has-data:hover { fill: #6C4CE0; }
.mini-pin { pointer-events: none; }
.mini-pin .dot {
  fill: #5B3DE0;
  stroke: white;
  stroke-width: 0.7;
}
.mini-tooltip {
  position: absolute;
  pointer-events: none;
  z-index: 20;
  background: white;
  border-radius: 12px;
  padding: 10px 12px;
  width: 170px;
  box-shadow: 0 14px 32px rgba(26, 23, 48, 0.2);
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.15s, transform 0.15s;
}
.mini-tooltip.show {
  opacity: 1;
  transform: translateY(0);
}
:deep(.mt-flag-row) {
  display: flex;
  align-items: center;
  gap: 7px;
  font-weight: 800;
  font-size: 13px;
  margin-bottom: 3px;
}
:deep(.mt-flag) {
  font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
  line-height: 1;
  flex-shrink: 0;
}
:deep(.mt-name) {
  font-family: 'Manrope', sans-serif;
}
:deep(.mt-rating) {
  color: #F0A947;
  font-weight: 700;
  font-size: 12px;
  margin-bottom: 6px;
}
:deep(.mt-sub) {
  font-size: 11px;
  color: #5B5876;
  margin-bottom: 4px;
}
:deep(.mt-btn) {
  font-size: 11px;
  font-weight: 700;
  color: white;
  background: #6C4CE0;
  padding: 6px 10px;
  border-radius: 8px;
  display: inline-block;
  margin-top: 4px;
  text-decoration: none;
}
</style>
