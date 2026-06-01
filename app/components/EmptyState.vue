<template>
  <div class="flex flex-column align-items-center justify-content-center py-8 gap-3">
    <i class="pi pi-inbox text-6xl text-color-secondary" />
    <h3 class="m-0">{{ $t('country.empty.title') }}</h3>
    <p class="text-color-secondary m-0 text-center">
      {{ $t('country.empty.subtitle', { country: countryName }) }}
    </p>
    <NuxtLinkLocale :to="`/review/new?country=${countryCode}`" style="text-decoration:none">
      <Button :label="$t('country.empty.cta')" icon="pi pi-pencil" tag="span" />
    </NuxtLinkLocale>
  </div>
</template>

<script setup lang="ts">
const { getCountryNameLocalized } = useLocalizedCountries()
const props = defineProps<{ countryCode: string; nationalityCode: string }>()
const countryName = computed(() => getCountryNameLocalized(props.countryCode))
const nationalityName = computed(() => getCountryNameLocalized(props.nationalityCode))
</script>
