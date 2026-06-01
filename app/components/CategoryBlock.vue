<template>
  <div class="mb-4">
    <div class="flex align-items-center justify-content-between mb-2">
      <span class="font-semibold">{{ group.label }}</span>
      <div class="flex align-items-center gap-2">
        <Rating :modelValue="group.avgRating" readonly :cancel="false" />
        <Badge :value="group.avgRating.toFixed(1)" severity="info" />
      </div>
    </div>
    <ProgressBar :value="(group.avgRating / 5) * 100" class="mb-3" style="height: 8px" />
    <DataView :value="group.reviews" v-if="group.reviews.length">
      <template #list="{ items }">
        <ReviewCard v-for="r in items" :key="r.id" :review="r" />
      </template>
    </DataView>
    <p v-else class="text-color-secondary text-sm">No reviews in this category yet.</p>
  </div>
</template>

<script setup lang="ts">
import type { GroupedReviews } from '~/types/review'
defineProps<{ group: GroupedReviews }>()
</script>
