<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth', i18n: false })
useSeoMeta({ robots: 'noindex, nofollow' })

const actionFilter = ref('')
const page = ref(1)

const { data, pending } = await useAsyncData(
  'admin-mod-log',
  () => useAdminFetch<{ items: Record<string, unknown>[]; total: number }>('/api/admin/moderation-log', {
    query: { action: actionFilter.value || undefined, page: page.value },
  }),
  { watch: [actionFilter, page] },
)

const actionOptions = [
  { label: 'Все', value: '' },
  { label: 'approve', value: 'approve' },
  { label: 'reject', value: 'reject' },
  { label: 'edit', value: 'edit' },
  { label: 'delete', value: 'delete' },
  { label: 'create', value: 'create' },
]
</script>

<template>
  <div>
    <h1 class="admin-page-title">Журнал модерации</h1>
    <div class="admin-toolbar">
      <Select v-model="actionFilter" :options="actionOptions" option-label="label" option-value="value" placeholder="Действие" />
    </div>
    <div class="admin-card">
      <DataTable :value="data?.items ?? []" :loading="pending">
        <Column field="created_at" header="Дата">
          <template #body="{ data: row }">{{ formatAdminDate(String(row.created_at)) }}</template>
        </Column>
        <Column field="action" header="Действие" />
        <Column field="review_id" header="Review ID">
          <template #body="{ data: row }">
            <NuxtLink v-if="row.review_id" :to="`/admin/reviews/${row.review_id}`">{{ String(row.review_id).slice(0, 8) }}…</NuxtLink>
          </template>
        </Column>
        <Column header="Admin">
          <template #body="{ data: row }">
            {{ row.admin_id ? String(row.admin_id).slice(0, 8) + '…' : '—' }}
          </template>
        </Column>
        <Column field="note" header="Note" />
      </DataTable>
    </div>
  </div>
</template>
