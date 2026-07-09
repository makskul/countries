<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth', i18n: false })
useSeoMeta({ robots: 'noindex, nofollow' })

const { data, pending } = await useAsyncData('admin-newsletter', () =>
  useAdminFetch<{ items: { id: string; email: string; created_at: string; source: string }[] }>('/api/admin/newsletter'),
)

function exportCsv() {
  window.open('/api/admin/newsletter?format=csv', '_blank')
}
</script>

<template>
  <div>
    <h1 class="admin-page-title">Newsletter</h1>
    <div class="admin-toolbar">
      <Button label="Экспорт CSV" icon="pi pi-download" @click="exportCsv" />
      <Tag :value="`${data?.items.length ?? 0} подписчиков`" />
    </div>
    <div class="admin-card">
      <DataTable :value="data?.items ?? []" :loading="pending">
        <Column field="email" header="Email" />
        <Column field="source" header="Source" />
        <Column field="created_at" header="Дата">
          <template #body="{ data: row }">{{ formatAdminDate(row.created_at) }}</template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
