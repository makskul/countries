<template>
  <div class="flex flex-column align-items-center justify-content-center py-8 gap-3">
    <i class="pi pi-inbox text-6xl text-color-secondary" />
    <h3 class="m-0">No reviews yet</h3>
    <p class="text-color-secondary m-0 text-center">
      Be the first to review {{ countryName }} from a {{ nationalityName }} perspective.
    </p>
    <NuxtLinkLocale :to="`/review/new?country=${countryCode}`" style="text-decoration:none">
      <Button label="Write a Review" icon="pi pi-pencil" tag="span" />
    </NuxtLinkLocale>
  </div>
</template>

<script setup lang="ts">
const { getCountryNameLocalized } = useLocalizedCountries()
const props = defineProps<{ countryCode: string; nationalityCode: string }>()
const countryName = computed(() => getCountryNameLocalized(props.countryCode))
const nationalityName = computed(() => getCountryNameLocalized(props.nationalityCode))
</script>
