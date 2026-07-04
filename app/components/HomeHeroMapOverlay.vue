<template>
  <svg
    :viewBox="viewBox"
    :preserveAspectRatio="preserveAspectRatio"
    aria-hidden="true"
  >
    <path
      v-for="[name, d] in paths"
      :key="name"
      :d="d"
      class="hero-map-country"
    />
  </svg>
</template>

<script setup lang="ts">
import { WORLD_COUNTRIES } from '~/utils/worldMapGeo'

/** Default viewBox focuses on Europe for the homepage hero map. */
withDefaults(defineProps<{
  viewBox?: string
  preserveAspectRatio?: string
}>(), {
  viewBox: '455 25 140 110',
  preserveAspectRatio: 'xMidYMid slice',
})

const paths = WORLD_COUNTRIES.map(([name, d]) => [name, d] as const)
</script>
