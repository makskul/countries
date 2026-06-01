<template>
  <Select
    v-model="selected"
    :options="TARGET_COUNTRIES"
    optionLabel="name"
    optionValue="code"
    placeholder="Select a country"
    filter
    filterPlaceholder="Search..."
    class="w-full"
    @change="emit('update:modelValue', selected)"
  >
    <template #option="{ option }">
      <div class="flex align-items-center gap-2">
        <span>{{ option.name }}</span>
        <span class="text-color-secondary text-sm">({{ option.code }})</span>
      </div>
    </template>
  </Select>
</template>

<script setup lang="ts">
import { TARGET_COUNTRIES } from '~/utils/countries'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const selected = ref(props.modelValue)
watch(() => props.modelValue, v => { selected.value = v })
</script>
