<template>
  <div class="flex flex-column align-items-center justify-content-center py-8 gap-3">
    <i class="pi pi-inbox text-6xl text-color-secondary" />
    <h3 class="m-0">No reviews yet</h3>
    <p class="text-color-secondary m-0 text-center">
      Be the first to review {{ countryName }} from a {{ nationalityName }} perspective.
    </p>
    <NuxtLink :to="`/review/new?country=${countryCode}`">
      <Button label="Write a Review" icon="pi pi-pencil" />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { getCountryName } from '~/utils/countries'
const props = defineProps<{ countryCode: string; nationalityCode: string }>()
const countryName = computed(() => getCountryName(props.countryCode))
const nationalityName = computed(() => getCountryName(props.nationalityCode))
</script>
