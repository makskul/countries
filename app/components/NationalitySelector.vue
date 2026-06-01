<template>
  <Select
    :key="locale"
    v-model="selected"
    :options="nationalityList"
    optionLabel="name"
    optionValue="code"
    :placeholder="$t('homepage.hero.selectNationality')"
    filter
    :filterPlaceholder="$t('countries.filters.search')"
    class="w-full"
    @change="emit('update:modelValue', selected)"
  >
    <template #option="{ option }">
      <div class="flex align-items-center gap-2">
        <span>{{ option.flag }}</span>
        <span>{{ option.name }}</span>
      </div>
    </template>
    <template #value="{ value }">
      <div v-if="value" class="flex align-items-center gap-2">
        <span>{{ getFlagEmoji(value) }}</span>
        <span>{{ getCountryNameLocalized(value) }}</span>
      </div>
      <span v-else>{{ $t('homepage.hero.selectNationality') }}</span>
    </template>
  </Select>
</template>

<script setup lang="ts">
import { getFlagEmoji } from '~/utils/countries'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const selected = ref(props.modelValue)
watch(() => props.modelValue, v => { selected.value = v })

const { locale } = useI18n()
const { nationalityList, getCountryNameLocalized } = useLocalizedCountries()
</script>
