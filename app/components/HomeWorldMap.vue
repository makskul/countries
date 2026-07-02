<template>
  <ClientOnly>
    <div ref="mapWrapRef" class="map-wrap" :style="{ height: mapHeight, marginTop: mapHeight === '190px' ? '0' : '10px' }">
      <svg ref="svgRef" :viewBox="viewBox" preserveAspectRatio="xMidYMid meet" class="worldmap" />
      <div ref="tooltipRef" class="map-tooltip" :class="{ show: tooltipVisible }" v-html="tooltipHtml" />
    </div>
  </ClientOnly>
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

const { locale, t } = useI18n()
const localePath = useLocalePath()

const mapWrapRef = ref<HTMLElement | null>(null)
const svgRef = ref<SVGElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const tooltipVisible = ref(false)
const tooltipHtml = ref('')

const CODE_TO_MAP_NAME: Record<string, string> = {
  GB: 'England',
  US: 'USA',
}

function codeToMapName(code: string): string {
  return CODE_TO_MAP_NAME[code.toUpperCase()] ?? getCountryName(code)
}

function getLocalizedName(mapName: string, code?: string): string {
  if (locale.value === 'ru' || locale.value === 'uk') {
    return RU_NAMES[mapName] ?? mapName
  }
  if (code) return getCountryName(code)
  return mapName
}

function showTooltip(mapName: string, cx: number, cy: number) {
  const wrap = mapWrapRef.value
  const svg = svgRef.value
  if (!wrap || !svg) return

  const entry = props.reviewData[mapName]
  const ru = getLocalizedName(mapName, entry?.code)

  if (entry) {
    tooltipHtml.value = `
      <div class="mt-flag-row">${getFlagEmoji(entry.code)} ${ru}</div>
      <div class="mt-rating">★ ${entry.rating}</div>
      <div class="mt-sub">${entry.reviews} ${t('common.labels.reviews')}</div>
      <a href="${localePath(`/country/${entry.code.toLowerCase()}`)}" class="mt-btn">${t('common.buttons.seeAll')} →</a>
    `
  } else {
    tooltipHtml.value = `
      <div class="mt-flag-row">${ru}</div>
      <div class="mt-sub">${t('homepage.map.noReviews')}</div>
      <a href="${localePath('/review/new')}" class="mt-btn">${t('homepage.map.writeFirst')} →</a>
    `
  }

  const rect = wrap.getBoundingClientRect()
  const svgRect = svg.getBoundingClientRect()
  const scaleX = svgRect.width / 1000
  const scaleY = svgRect.height / 520
  let left = cx * scaleX + 16
  let top = cy * scaleY - 20
  if (left + 190 > rect.width) left = cx * scaleX - 206
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

function buildMap() {
  const svg = svgRef.value
  if (!svg) return
  svg.innerHTML = ''

  WORLD_COUNTRIES.forEach(([name, d, cx, cy]) => {
    const hasData = !!props.reviewData[name]
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', d)
    path.setAttribute('class', `map-country${hasData ? ' has-data' : ''}`)
    path.addEventListener('mouseenter', () => showTooltip(name, cx, cy))
    path.addEventListener('mouseleave', hideTooltip)
    svg.appendChild(path)
  })

  Object.entries(props.reviewData).forEach(([mapName, data]) => {
    const entry = WORLD_COUNTRIES.find(c => c[0] === mapName)
    if (!entry) return
    const [, , cx, cy] = entry
    const r = Math.max(7, Math.min(13, 5 + data.reviews / 60))
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('class', 'map-pin')
    g.setAttribute('transform', `translate(${cx},${cy})`)
    const label = data.reviews >= 100 ? `${Math.round(data.reviews / 10) / 10}k` : String(data.reviews)
    g.innerHTML = `<circle class="dot" r="${r}"></circle><text x="0" y="${r * 0.35}" text-anchor="middle" style="font-size:${r * 0.85}px;">${label}</text>`
    svg.appendChild(g)
  })
}

watch(() => props.reviewData, () => buildMap(), { deep: true })

onMounted(() => buildMap())
</script>

<style scoped>
.map-wrap {
  position: relative;
  background: #F8F7FC;
}

@media (max-width: 768px) {
  .map-wrap {
    height: 260px;
  }
}
.worldmap {
  width: 100%;
  height: 100%;
  display: block;
}
:deep(.map-country) {
  fill: #E7E4F3;
  stroke: #fff;
  stroke-width: 0.5;
  transition: fill 0.15s;
  cursor: pointer;
}
:deep(.map-country:hover) { fill: #D5CEF0; }
:deep(.map-country.has-data) { fill: #B9A8ED; cursor: pointer; }
:deep(.map-country.has-data:hover) { fill: var(--purple-600, #6C4CE0); }
:deep(.map-pin) { pointer-events: none; }
:deep(.map-pin circle.dot) {
  fill: var(--purple-700, #5B3DE0);
  stroke: white;
  stroke-width: 1.4;
}
:deep(.map-pin text) {
  font-weight: 800;
  fill: white;
}
.map-tooltip {
  position: absolute;
  pointer-events: none;
  z-index: 20;
  background: white;
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 14px 32px rgba(26, 23, 48, 0.2);
  width: 190px;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.15s, transform 0.15s;
}
.map-tooltip.show {
  opacity: 1;
  transform: translateY(0);
}
:deep(.mt-flag-row) {
  display: flex;
  align-items: center;
  gap: 7px;
  font-weight: 800;
  font-size: 13.5px;
  margin-bottom: 3px;
}
:deep(.mt-rating) {
  display: flex;
  align-items: center;
  gap: 4px;
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
</style>
