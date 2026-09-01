<template>
  <ComparePageView />
</template>

<script setup lang="ts">
import { toCompareSlug } from '~/utils/compareSlug'

const route = useRoute()
const localePath = useLocalePath()

if (route.query.a && route.query.b) {
  const slug = toCompareSlug(String(route.query.a), String(route.query.b))
  const query: Record<string, string> = {}
  if (route.query.nat) query.nat = String(route.query.nat)
  if (route.query.c) query.c = String(route.query.c)
  await navigateTo({ path: localePath(`/compare/${slug}`), query }, { redirectCode: 301 })
}
</script>
