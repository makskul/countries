<template>
  <div
    class="h-scroll"
    :class="{
      'h-scroll--start': !canScrollLeft,
      'h-scroll--end': !canScrollRight,
      'h-scroll--no-nav': !hasOverflow,
    }"
  >
    <button
      v-if="hasOverflow"
      type="button"
      class="h-scroll-btn h-scroll-btn--left"
      :disabled="!canScrollLeft"
      :aria-label="$t('common.buttons.scrollLeft')"
      @click="scrollByDir(-1)"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6"/></svg>
    </button>

    <div ref="trackRef" class="h-scroll-track" @scroll="updateScrollState">
      <slot />
    </div>

    <button
      v-if="hasOverflow"
      type="button"
      class="h-scroll-btn h-scroll-btn--right"
      :disabled="!canScrollRight"
      :aria-label="$t('common.buttons.scrollRight')"
      @click="scrollByDir(1)"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M9 18l6-6-6-6"/></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
const trackRef = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const hasOverflow = ref(false)

function updateScrollState() {
  const el = trackRef.value
  if (!el) return
  const max = el.scrollWidth - el.clientWidth
  hasOverflow.value = max > 4
  canScrollLeft.value = el.scrollLeft > 4
  canScrollRight.value = el.scrollLeft < max - 4
}

function scrollByDir(dir: -1 | 1) {
  const el = trackRef.value
  if (!el) return
  const step = Math.max(220, Math.round(el.clientWidth * 0.72))
  el.scrollBy({ left: dir * step, behavior: 'smooth' })
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateScrollState()
  if (!trackRef.value || typeof ResizeObserver === 'undefined') return
  resizeObserver = new ResizeObserver(() => updateScrollState())
  resizeObserver.observe(trackRef.value)
  for (const child of trackRef.value.children) {
    resizeObserver.observe(child)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})
</script>

<style scoped>
.h-scroll {
  position: relative;
}
.h-scroll-track {
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.h-scroll-track::-webkit-scrollbar {
  display: none;
}
.h-scroll-btn {
  position: absolute;
  top: 50%;
  z-index: 3;
  width: 36px;
  height: 36px;
  margin-top: -18px;
  border: 1px solid var(--line, #EAE7F5);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.96);
  color: var(--ink-soft, #5B5876);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(26, 23, 48, 0.1);
  transition: color 0.15s, border-color 0.15s, opacity 0.15s, transform 0.15s;
}
.h-scroll-btn:hover:not(:disabled) {
  color: var(--purple-600, #6C4CE0);
  border-color: #C9BFF5;
  transform: scale(1.05);
}
.h-scroll-btn:disabled {
  opacity: 0.35;
  cursor: default;
}
.h-scroll-btn--left { left: -6px; }
.h-scroll-btn--right { right: -6px; }

@media (max-width: 768px) {
  .h-scroll-btn {
    width: 32px;
    height: 32px;
    margin-top: -16px;
  }
  .h-scroll-btn--left { left: 0; }
  .h-scroll-btn--right { right: 0; }
}
</style>
