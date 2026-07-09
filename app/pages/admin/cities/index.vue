<script setup lang="ts">
import type { CityRow } from '~/types/database.types'
import { TARGET_COUNTRIES } from '~/utils/countries'

definePageMeta({ layout: 'admin', middleware: 'admin-auth', i18n: false })
useSeoMeta({ robots: 'noindex, nofollow' })

const toast = useToast()
const countryFilter = ref('')
const showDialog = ref(false)
const editing = ref<CityRow | null>(null)

const form = reactive({
  country: 'PT',
  name_en: '',
  name_uk: '',
  name_ru: '',
  slug: '',
  population: 0,
})

const countryOptions = TARGET_COUNTRIES.map(c => ({ label: c.code, value: c.code }))

const { data, pending, refresh } = await useAsyncData(
  'admin-cities',
  () => useAdminFetch<{ items: CityRow[]; total: number }>('/api/admin/cities', {
    query: { country: countryFilter.value || undefined, pageSize: 100 },
  }),
  { watch: [countryFilter] },
)

function openCreate() {
  editing.value = null
  Object.assign(form, { country: countryFilter.value || 'PT', name_en: '', name_uk: '', name_ru: '', slug: '', population: 0 })
  showDialog.value = true
}

function openEdit(city: CityRow) {
  editing.value = city
  Object.assign(form, {
    country: city.country,
    name_en: city.name_en,
    name_uk: city.name_uk ?? '',
    name_ru: city.name_ru ?? '',
    slug: city.slug,
    population: city.population,
  })
  showDialog.value = true
}

async function save() {
  try {
    if (editing.value) {
      await useAdminFetch(`/api/admin/cities/${editing.value.id}`, { method: 'PATCH', body: form })
    } else {
      await useAdminFetch('/api/admin/cities', { method: 'POST', body: form })
    }
    showDialog.value = false
    toast.add({ severity: 'success', summary: 'Сохранено', life: 2500 })
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ severity: 'error', summary: err.data?.message ?? 'Ошибка', life: 4000 })
  }
}

async function remove(city: CityRow) {
  if (!confirm(`Удалить ${city.name_en}?`)) return
  await useAdminFetch(`/api/admin/cities/${city.id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <div>
    <h1 class="admin-page-title">Города</h1>
    <div class="admin-toolbar">
      <Select v-model="countryFilter" :options="[{ label: 'Все', value: '' }, ...countryOptions]" option-label="label" option-value="value" placeholder="Страна" />
      <Button label="Добавить город" icon="pi pi-plus" @click="openCreate" />
    </div>

    <div class="admin-card">
      <DataTable :value="data?.items ?? []" :loading="pending">
        <Column field="country" header="Страна" />
        <Column field="name_en" header="EN" />
        <Column field="name_uk" header="UK" />
        <Column field="name_ru" header="RU" />
        <Column field="slug" header="Slug" />
        <Column field="population" header="Население" />
        <Column header="">
          <template #body="{ data: row }">
            <Button icon="pi pi-pencil" size="small" text @click="openEdit(row)" />
            <Button icon="pi pi-trash" size="small" severity="danger" text @click="remove(row)" />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="showDialog" :header="editing ? 'Редактировать город' : 'Новый город'" modal style="width: 480px">
      <div class="admin-form-field">
        <label>Страна</label>
        <Select v-model="form.country" :options="countryOptions" option-label="label" option-value="value" class="w-full" />
      </div>
      <div class="admin-form-field">
        <label>name_en</label>
        <InputText v-model="form.name_en" class="w-full" />
      </div>
      <div class="admin-form-field">
        <label>name_uk</label>
        <InputText v-model="form.name_uk" class="w-full" />
      </div>
      <div class="admin-form-field">
        <label>name_ru</label>
        <InputText v-model="form.name_ru" class="w-full" />
      </div>
      <div class="admin-form-field">
        <label>slug</label>
        <InputText v-model="form.slug" class="w-full" placeholder="auto from name_en" />
      </div>
      <div class="admin-form-field">
        <label>population</label>
        <InputNumber v-model="form.population" class="w-full" />
      </div>
      <template #footer>
        <Button label="Отмена" severity="secondary" text @click="showDialog = false" />
        <Button label="Сохранить" @click="save" />
      </template>
    </Dialog>
  </div>
</template>
