<script setup lang="ts">
import type { CountryRow } from '~/types/database.types'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ robots: 'noindex, nofollow' })

const search = ref('')

const { data, pending } = await useAsyncData('admin-countries', () =>
  useAdminFetch<{ items: (CountryRow & { review_count: number })[] }>('/api/admin/countries'),
)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const items = data.value?.items ?? []
  if (!q) return items
  return items.filter(c =>
    c.code.toLowerCase().includes(q)
    || (c.region ?? '').toLowerCase().includes(q)
    || (c.currency ?? '').toLowerCase().includes(q)
    || (c.article_title_en ?? '').toLowerCase().includes(q)
    || (c.article_title_uk ?? '').toLowerCase().includes(q)
    || (c.article_title_ru ?? '').toLowerCase().includes(q),
  )
})

const costLabel: Record<string, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  very_high: 'Очень высокий',
}
</script>

<template>
  <div>
    <AdminBreadcrumb :items="[
      { label: 'Обзор', to: '/admin' },
      { label: 'Страны' },
    ]" />
    <h1 class="admin-page-title">Страны</h1>
    <p class="admin-page-lead">
      Редактируйте справку, визу и статью о стране. Нажмите карандаш, чтобы открыть карточку.
    </p>

    <div class="admin-toolbar">
      <InputText v-model="search" placeholder="Поиск по коду, региону, статье…" style="min-width: 260px" />
    </div>

    <div class="admin-card">
      <DataTable :value="filtered" :loading="pending" paginator :rows="20">
        <template #empty>
          <div class="admin-empty">
            <p>{{ search ? 'Ничего не найдено по поиску.' : 'Стран пока нет в базе.' }}</p>
          </div>
        </template>
        <Column field="code" header="Код" sortable />
        <Column field="region" header="Регион" sortable />
        <Column header="Уровень цен">
          <template #body="{ data: row }">{{ costLabel[row.cost_level ?? ''] ?? row.cost_level ?? '—' }}</template>
        </Column>
        <Column field="currency" header="Валюта" />
        <Column header="Отзывы">
          <template #body="{ data: row }">{{ row.review_count }}</template>
        </Column>
        <Column header="Статья">
          <template #body="{ data: row }">
            <Tag
              v-if="!(row.article_title_en || row.article_title_uk || row.article_title_ru)"
              value="Нет"
              severity="secondary"
            />
            <Tag
              v-else-if="row.article_published === false"
              value="Черновик"
              severity="warn"
            />
            <Tag
              v-else
              value="На сайте"
              severity="success"
            />
          </template>
        </Column>
        <Column header="На сайте">
          <template #body="{ data: row }">
            <Tag :value="row.is_active ? 'Да' : 'Нет'" :severity="row.is_active ? 'success' : 'secondary'" />
          </template>
        </Column>
        <Column header="">
          <template #body="{ data: row }">
            <div class="admin-actions">
              <NuxtLink :to="`/admin/countries/${row.code}`">
                <Button icon="pi pi-pencil" size="small" text title="Редактировать" />
              </NuxtLink>
              <a :href="`/country/${String(row.code).toLowerCase()}`" target="_blank" rel="noopener">
                <Button icon="pi pi-external-link" size="small" text severity="secondary" title="Открыть на сайте" />
              </a>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
