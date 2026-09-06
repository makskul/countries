<template>
  <ComparePageView :fixed-pair="fixedPair" :ssr="true" />
</template>

<script setup lang="ts">
import { isCanonicalCompareSlug, parseCompareSlugLenient, toCompareSlug } from '~/utils/compareSlug'
import { isDestinationAllowed } from '~/utils/countries'

const route = useRoute()
const localePath = useLocalePath()

const pairParam = route.params.pair as string
const parsed = parseCompareSlugLenient(pairParam)

if (!parsed) {
  throw createError({ statusCode: 404, statusMessage: 'Compare pair not found' })
}

if (!isDestinationAllowed(parsed.a) || !isDestinationAllowed(parsed.b)) {
  throw createError({ statusCode: 404, statusMessage: 'Compare pair not found' })
}

if (!isCanonicalCompareSlug(pairParam)) {
  const slug = toCompareSlug(parsed.a, parsed.b)
  await navigateTo({ path: localePath(`/compare/${slug}`), query: route.query }, { redirectCode: 301 })
}

const fixedPair = { a: parsed.a, b: parsed.b }
</script>
