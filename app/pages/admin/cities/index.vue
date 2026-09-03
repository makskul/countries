<script setup lang="ts">
import type { CityRow } from '~/types/database.types'
import { TARGET_COUNTRIES } from '~/utils/countries'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ robots: 'noindex, nofollow' })

const countryFilter = ref('')
const page = ref(1)
const pageSize = 25

const toast = useToast()
const showDialog = ref(false)

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
    query: {
      country: countryFilter.value || undefined,
      page: page.value,
      pageSize,
    },
  }),
  { watch: [countryFilter, page] },
)

watch(countryFilter, () => { page.value = 1 })

function onPageChange(e: { page: number }) {
  page.value = e.page + 1
}

function openCreate() {
  Object.assign(form, {
    country: countryFilter.value || 'PT',
    name_en: '',
    name_uk: '',
    name_ru: '',
    slug: '',
    population: 0,
  })
  showDialog.value = true
}

async function saveCreate() {
  try {
    const created = await useAdminFetch<CityRow>('/api/admin/cities', { method: 'POST', body: form })
    showDialog.value = false
    toast.add({ severity: 'success', summary: 'Город создан', life: 2500 })
    await refresh()
    if (created?.id) {
      await navigateTo(`/admin/cities/${created.id}`)
    }
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ severity: 'error', summary: err.data?.message ?? 'Ошибка', life: 4000 })
  }
}

async function remove(city: CityRow) {
  if (!confirm(`Удалить ${city.name_en}?`)) return
  try {
    await useAdminFetch(`/api/admin/cities/${city.id}`, { method: 'DELETE' })
    toast.add({ severity: 'success', summary: 'Удалено', life: 2000 })
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ severity: 'error', summary: err.data?.message ?? 'Ошибка удаления', life: 4000 })
  }
}

function hasArticle(row: CityRow) {
  return Boolean(row.article_title_en || row.article_title_uk || row.article_title_ru)
}

function articleStatus(row: CityRow) {
  if (!hasArticle(row)) return { label: 'Нет', severity: 'secondary' as const }
  if (row.article_published === false) return { label: 'Черновик', severity: 'warn' as const }
  return { label: 'На сайте', severity: 'success' as const }
}
</script>

<template>
  <div>
    <AdminBreadcrumb :items="[
      { label: 'Обзор', to: '/admin' },
      { label: 'Города' },
    ]" />
    <h1 class="admin-page-title">Города</h1>
    <p class="admin-page-lead">
      Список городов. Откройте карточку, чтобы править названия и статью «О городе».
    </p>

    <div class="admin-toolbar">
      <Select
        v-model="countryFilter"
        :options="[{ label: 'Все страны', value: '' }, ...countryOptions]"
        option-label="label"
        option-value="value"
        placeholder="Страна"
      />
      <Button label="Добавить город" icon="pi pi-plus" @click="openCreate" />
      <Tag v-if="data" :value="`Всего: ${data.total}`" severity="secondary" />
    </div>

    <div class="admin-card">
      <DataTable
        :value="data?.items ?? []"
        :loading="pending"
        paginator
        lazy
        :rows="pageSize"
        :total-records="data?.total ?? 0"
        @page="onPageChange"
      >
        <template #empty>
          <div class="admin-empty">
            <p>{{ countryFilter ? 'Нет городов для этой страны.' : 'Городов пока нет.' }}</p>
            <Button label="Добавить город" text @click="openCreate" />
          </div>
        </template>
        <Column field="country" header="Страна" sortable />
        <Column field="name_ru" header="Название (RU)">
          <template #body="{ data: row }">{{ row.name_ru || row.name_en }}</template>
        </Column>
        <Column field="name_en" header="EN" />
        <Column field="name_uk" header="UK" />
        <Column field="slug" header="URL" />
        <Column field="population" header="Население" />
        <Column header="Статья">
          <template #body="{ data: row }">
            <Tag :value="articleStatus(row).label" :severity="articleStatus(row).severity" />
          </template>
        </Column>
        <Column header="">
          <template #body="{ data: row }">
            <div class="admin-actions">
              <NuxtLink :to="`/admin/cities/${row.id}`">
                <Button icon="pi pi-pencil" size="small" text title="Редактировать" />
              </NuxtLink>
              <a
                :href="`/country/${String(row.country).toLowerCase()}/${row.slug}`"
                target="_blank"
                rel="noopener"
              >
                <Button icon="pi pi-external-link" size="small" text severity="secondary" title="На сайте" />
              </a>
              <Button icon="pi pi-trash" size="small" severity="danger" text @click="remove(row)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="showDialog" header="Новый город" modal style="width: 480px">
      <p class="admin-section-hint">После создания откроется страница, где можно добавить статью.</p>
      <div class="admin-form-field">
        <label>Страна</label>
        <Select v-model="form.country" :options="countryOptions" option-label="label" option-value="value" class="w-full" />
      </div>
      <div class="admin-form-field">
        <label>Название (EN)</label>
        <InputText v-model="form.name_en" class="w-full" />
      </div>
      <div class="admin-form-field">
        <label>Название (UK)</label>
        <InputText v-model="form.name_uk" class="w-full" />
      </div>
      <div class="admin-form-field">
        <label>Название (RU)</label>
        <InputText v-model="form.name_ru" class="w-full" />
      </div>
      <div class="admin-form-field">
        <label>URL (slug), необязательно</label>
        <InputText v-model="form.slug" class="w-full" placeholder="авто из названия EN" />
      </div>
      <div class="admin-form-field">
        <label>Население</label>
        <InputNumber v-model="form.population" class="w-full" />
      </div>
      <template #footer>
        <Button label="Отмена" severity="secondary" text @click="showDialog = false" />
        <Button label="Создать" @click="saveCreate" />
      </template>
    </Dialog>
  </div>
</template>
