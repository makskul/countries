<template>
  <Select
    v-model="selected"
    :options="NATIONALITIES"
    optionLabel="name"
    optionValue="code"
    placeholder="Select your nationality"
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
import { NATIONALITIES } from '~/utils/countries'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const selected = ref(props.modelValue)
watch(() => props.modelValue, v => { selected.value = v })
</script>
