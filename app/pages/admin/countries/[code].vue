<script setup lang="ts">
import type { CountryRow } from '~/types/database.types'

definePageMeta({ layout: 'admin', middleware: 'admin-auth', i18n: false })
useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()
const toast = useToast()
const code = (route.params.code as string).toUpperCase()

const { data: country, pending, refresh } = await useAsyncData(
  `admin-country-${code}`,
  () => useAdminFetch<CountryRow>(`/api/admin/countries/${code}`),
)

const form = reactive({
  region: '',
  is_active: true,
  language_key: '',
  currency: '',
  climate_key: '',
  cost_level: '',
  residency_months: '',
  tax_employee: '',
  tax_corporate: '',
  hero_image_url: '',
  visa_info_uk: '',
  visa_info_en: '',
  visa_info_ru: '',
})

watch(country, (c) => {
  if (!c) return
  Object.assign(form, {
    region: c.region,
    is_active: c.is_active,
    language_key: c.language_key ?? '',
    currency: c.currency ?? '',
    climate_key: c.climate_key ?? '',
    cost_level: c.cost_level ?? '',
    residency_months: c.residency_months ?? '',
    tax_employee: c.tax_employee ?? '',
    tax_corporate: c.tax_corporate ?? '',
    hero_image_url: c.hero_image_url ?? '',
    visa_info_uk: c.visa_info_uk ?? '',
    visa_info_en: c.visa_info_en ?? '',
    visa_info_ru: c.visa_info_ru ?? '',
  })
}, { immediate: true })

const costOptions = ['low', 'medium', 'high', 'very_high']
const regionOptions = ['europe', 'asia', 'americas', 'africa', 'oceania', 'other']

async function save() {
  try {
    await useAdminFetch(`/api/admin/countries/${code}`, { method: 'PATCH', body: form })
    toast.add({ severity: 'success', summary: 'Сохранено', life: 2500 })
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ severity: 'error', summary: err.data?.message ?? 'Ошибка', life: 4000 })
  }
}
</script>

<template>
  <div>
    <div class="admin-toolbar">
      <NuxtLink to="/admin/countries">
        <Button label="Назад" icon="pi pi-arrow-left" text />
      </NuxtLink>
    </div>
    <h1 class="admin-page-title">Страна {{ code }}</h1>

    <div v-if="pending"><Skeleton height="300px" /></div>
    <div v-else class="admin-card">
      <div class="admin-form-field">
        <label>Регион</label>
        <Select v-model="form.region" :options="regionOptions" class="w-full" />
      </div>
      <div class="admin-form-field">
        <Checkbox v-model="form.is_active" binary input-id="active" />
        <label for="active" style="margin-left: 8px">Активна</label>
      </div>
      <div class="admin-form-field">
        <label>language_key</label>
        <InputText v-model="form.language_key" class="w-full" />
      </div>
      <div class="admin-form-field">
        <label>currency</label>
        <InputText v-model="form.currency" class="w-full" />
      </div>
      <div class="admin-form-field">
        <label>climate_key</label>
        <InputText v-model="form.climate_key" class="w-full" />
      </div>
      <div class="admin-form-field">
        <label>cost_level</label>
        <Select v-model="form.cost_level" :options="costOptions" class="w-full" />
      </div>
      <div class="admin-form-field">
        <label>residency_months</label>
        <InputText v-model="form.residency_months" class="w-full" />
      </div>
      <div class="admin-form-field">
        <label>tax_employee</label>
        <InputText v-model="form.tax_employee" class="w-full" />
      </div>
      <div class="admin-form-field">
        <label>tax_corporate</label>
        <InputText v-model="form.tax_corporate" class="w-full" />
      </div>
      <div class="admin-form-field">
        <label>hero_image_url</label>
        <InputText v-model="form.hero_image_url" class="w-full" />
      </div>

      <TabView>
        <TabPanel header="Visa UK">
          <Textarea v-model="form.visa_info_uk" rows="4" class="w-full" />
        </TabPanel>
        <TabPanel header="Visa EN">
          <Textarea v-model="form.visa_info_en" rows="4" class="w-full" />
        </TabPanel>
        <TabPanel header="Visa RU">
          <Textarea v-model="form.visa_info_ru" rows="4" class="w-full" />
        </TabPanel>
      </TabView>

      <Button label="Сохранить" class="mt-4" @click="save" />
    </div>
  </div>
</template>

<style scoped>
.mt-4 { margin-top: 16px; }
</style>
