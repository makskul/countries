<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ robots: 'noindex, nofollow' })

const { data, pending } = await useAsyncData('admin-leads', () =>
  useAdminFetch<{ items: {
    id: string
    country: string
    author_nationality: string
    email: string
    message: string | null
    source: string
    created_at: string
  }[] }>('/api/admin/leads'),
)
</script>

<template>
  <div>
    <h1 class="admin-page-title">Leads</h1>
    <div class="admin-toolbar">
      <Tag :value="`${data?.items.length ?? 0} лидов`" />
    </div>
    <div class="admin-card">
      <DataTable :value="data?.items ?? []" :loading="pending">
        <Column field="created_at" header="Дата">
          <template #body="{ data: row }">{{ formatAdminDate(row.created_at) }}</template>
        </Column>
        <Column field="country" header="Страна" />
        <Column field="author_nationality" header="Nat" />
        <Column field="email" header="Email" />
        <Column field="message" header="Сообщение">
          <template #body="{ data: row }">
            <span class="admin-muted">{{ row.message || '—' }}</span>
          </template>
        </Column>
        <Column field="source" header="Source" />
      </DataTable>
    </div>
  </div>
</template>
