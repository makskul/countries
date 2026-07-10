<script setup lang="ts">
import type { CountryRow } from '~/types/database.types'

definePageMeta({ layout: 'admin', middleware: 'admin-auth', i18n: false })
useSeoMeta({ robots: 'noindex, nofollow' })

const { data, pending } = await useAsyncData('admin-countries', () =>
  useAdminFetch<{ items: (CountryRow & { review_count: number })[] }>('/api/admin/countries'),
)
</script>

<template>
  <div>
    <h1 class="admin-page-title">Страны</h1>
    <div class="admin-card">
      <DataTable :value="data?.items ?? []" :loading="pending">
        <Column field="code" header="Код" />
        <Column field="region" header="Регион" />
        <Column field="cost_level" header="Cost" />
        <Column field="currency" header="Валюта" />
        <Column header="Отзывы">
          <template #body="{ data: row }">{{ row.review_count }}</template>
        </Column>
        <Column header="Активна">
          <template #body="{ data: row }">
            <Tag :value="row.is_active ? 'Да' : 'Нет'" :severity="row.is_active ? 'success' : 'secondary'" />
          </template>
        </Column>
        <Column header="">
          <template #body="{ data: row }">
            <NuxtLink :to="`/admin/countries/${row.code}`">
              <Button icon="pi pi-pencil" size="small" text />
            </NuxtLink>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
