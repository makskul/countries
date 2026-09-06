<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ robots: 'noindex, nofollow' })

const actionFilter = ref('')
const page = ref(1)
const pageSize = 30

const { data, pending } = await useAsyncData(
  'admin-mod-log',
  () => useAdminFetch<{ items: Record<string, unknown>[]; total: number }>('/api/admin/moderation-log', {
    query: { action: actionFilter.value || undefined, page: page.value, pageSize },
  }),
  { watch: [actionFilter, page] },
)

watch(actionFilter, () => { page.value = 1 })

function onPageChange(e: { page: number }) {
  page.value = e.page + 1
}

const actionOptions = [
  { label: 'Все', value: '' },
  { label: 'Одобрить отзыв', value: 'approve' },
  { label: 'Отклонить отзыв', value: 'reject' },
  { label: 'Правка отзыва', value: 'edit' },
  { label: 'Удалить отзыв', value: 'delete' },
  { label: 'Создать отзыв', value: 'create' },
  { label: 'Правка CMS', value: 'cms_edit' },
  { label: 'Публикация статьи', value: 'cms_publish' },
  { label: 'Медиа CMS', value: 'cms_media' },
]

const actionLabels: Record<string, string> = {
  approve: 'Одобрить',
  reject: 'Отклонить',
  edit: 'Правка отзыва',
  delete: 'Удалить',
  create: 'Создать',
  cms_edit: 'Правка CMS',
  cms_publish: 'Публикация',
  cms_media: 'Медиа',
}

function entityLink(row: Record<string, unknown>) {
  const type = String(row.entity_type ?? '')
  const ref = String(row.entity_ref ?? '')
  if (type === 'country' && ref) return `/admin/countries/${ref}`
  if (type === 'city' && ref) return `/admin/cities/${ref}`
  if (row.review_id) return `/admin/reviews/${row.review_id}`
  return null
}

function entityLabel(row: Record<string, unknown>) {
  const type = String(row.entity_type ?? '')
  const ref = String(row.entity_ref ?? '')
  if (type === 'country' && ref) return `Страна ${ref}`
  if (type === 'city' && ref) return `Город #${ref}`
  if (row.review_id) return `Отзыв ${String(row.review_id).slice(0, 8)}…`
  return '—'
}
</script>

<template>
  <div>
    <AdminBreadcrumb :items="[{ label: 'Обзор', to: '/admin' }, { label: 'Журнал' }]" />
    <h1 class="admin-page-title">Журнал изменений</h1>
    <p class="admin-page-lead">
      Модерация отзывов и правки стран / городов / медиа в CMS.
    </p>
    <div class="admin-toolbar">
      <Select v-model="actionFilter" :options="actionOptions" option-label="label" option-value="value" placeholder="Действие" />
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
            <p>Пока нет записей в журнале.</p>
          </div>
        </template>
        <Column field="created_at" header="Дата">
          <template #body="{ data: row }">{{ formatAdminDate(String(row.created_at)) }}</template>
        </Column>
        <Column field="action" header="Действие">
          <template #body="{ data: row }">
            {{ actionLabels[String(row.action)] ?? row.action }}
          </template>
        </Column>
        <Column header="Объект">
          <template #body="{ data: row }">
            <NuxtLink v-if="entityLink(row)" :to="entityLink(row)!">{{ entityLabel(row) }}</NuxtLink>
            <span v-else>{{ entityLabel(row) }}</span>
          </template>
        </Column>
        <Column header="Admin">
          <template #body="{ data: row }">
            {{ row.admin_id ? String(row.admin_id).slice(0, 8) + '…' : '—' }}
          </template>
        </Column>
        <Column field="note" header="Детали">
          <template #body="{ data: row }">
            <span class="admin-muted">{{ row.note || '—' }}</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
