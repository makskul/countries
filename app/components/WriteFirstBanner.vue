<template>
  <div class="write-first-banner" :class="{ 'write-first-banner--campaign': campaign }">
    <div class="write-first-banner__body">
      <span v-if="campaign" class="write-first-banner__badge">{{ $t('country.empty.badge') }}</span>
      <p class="write-first-banner__text">
        {{ $t('country.empty.banner', { country: countryName, nationality: nationalityName }) }}
      </p>
    </div>
    <NuxtLinkLocale :to="reviewLink" class="write-first-banner__btn">
      {{ $t('country.empty.cta') }}
    </NuxtLinkLocale>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  countryCode: string
  nationalityCode: string
  campaign?: boolean
}>()

const { getCountryNameLocalized } = useLocalizedCountries()
const countryName = computed(() => getCountryNameLocalized(props.countryCode))
const nationalityName = computed(() => getCountryNameLocalized(props.nationalityCode))
const reviewLink = computed(() => `/review/new?country=${props.countryCode}`)
</script>

<style scoped>
.write-first-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 14px 18px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #F3F0FF 0%, #EDE8FA 100%);
  border: 1.5px solid #C8BFE8;
  border-radius: var(--radius-lg);
}
.write-first-banner--campaign {
  background: linear-gradient(135deg, #FFF8E6 0%, #FFF3D0 100%);
  border-color: #E8C97A;
}
.write-first-banner__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 200px;
}
.write-first-banner__badge {
  display: inline-block;
  align-self: flex-start;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-warning, #B8860B);
  background: rgba(255, 255, 255, 0.7);
  padding: 2px 8px;
  border-radius: var(--radius-pill);
}
.write-first-banner__text {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.4;
}
.write-first-banner__btn {
  flex-shrink: 0;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  padding: 11px 20px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  font-family: inherit;
  transition: background 0.15s;
  white-space: nowrap;
}
.write-first-banner__btn:hover {
  background: var(--color-primary-hover);
}
</style>
