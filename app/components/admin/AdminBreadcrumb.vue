<script setup lang="ts">
defineProps<{
  items: { label: string; to?: string }[]
}>()
</script>

<template>
  <nav class="admin-breadcrumb" aria-label="Навигация">
    <template v-for="(item, i) in items" :key="i">
      <span v-if="i > 0" class="admin-breadcrumb-sep">/</span>
      <NuxtLink v-if="item.to" :to="item.to" class="admin-breadcrumb-link">{{ item.label }}</NuxtLink>
      <span v-else class="admin-breadcrumb-current">{{ item.label }}</span>
    </template>
  </nav>
</template>
