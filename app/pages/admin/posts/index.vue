<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ robots: 'noindex, nofollow' })

type PostListItem = {
  id: string
  slug: string
  status: 'draft' | 'published'
  published_at: string | null
  updated_at: string
  title_uk: string | null
  title_en: string | null
  title_ru: string | null
}

const status = ref<'' | 'draft' | 'published'>('')
const search = ref('')
const page = ref(1)
const pageSize = 30

const statusOptions = [
  { label: 'Все', value: '' },
  { label: 'Черновики', value: 'draft' },
  { label: 'Опубликованные', value: 'published' },
]

const { data, pending, error, refresh } = await useAsyncData(
  'admin-posts',
  () => useAdminFetch<{ items: PostListItem[]; total: number }>('/api/admin/posts', {
    query: {
      status: status.value || undefined,
      q: search.value || undefined,
      page: page.value,
      pageSize,
    },
  }),
  { watch: [status, search, page] },
)

watch([status, search], () => { page.value = 1 })

function onPageChange(e: { page: number }) {
  page.value = e.page + 1
}

function postTitle(p: PostListItem) {
  return p.title_uk || p.title_en || p.title_ru || '(без заголовка)'
}
</script>

<template>
  <div>
    <AdminBreadcrumb :items="[{ label: 'Обзор', to: '/admin' }, { label: 'Блог' }]" />
    <h1 class="admin-page-title">Блог</h1>
    <p class="admin-page-lead">
      Отдельные статьи для читателей: они не связаны со страницами стран и городов и показываются в разделе «Блог».
    </p>

    <div class="admin-toolbar">
      <NuxtLink to="/admin/posts/new">
        <Button label="Новая статья" icon="pi pi-plus" />
      </NuxtLink>
      <Select v-model="status" :options="statusOptions" option-label="label" option-value="value" style="width: 180px" />
      <InputText v-model="search" placeholder="Заголовок или slug…" style="min-width: 220px" />
      <Tag v-if="data" :value="`Всего: ${data.total}`" severity="secondary" />
      <Button v-if="error" label="Повторить" icon="pi pi-refresh" size="small" text @click="refresh()" />
    </div>

    <Message v-if="error" severity="error" :closable="false" class="mb-3">
      {{ (error as { data?: { message?: string } }).data?.message ?? error.message ?? 'Не удалось загрузить статьи' }}
    </Message>

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
            <p v-if="status || search">Нет статей по текущим фильтрам.</p>
            <p v-else>Пока нет статей. Создайте первую кнопкой «Новая статья».</p>
          </div>
        </template>
        <Column header="Заголовок">
          <template #body="{ data: row }">
            <NuxtLink :to="`/admin/posts/${row.id}`">{{ postTitle(row) }}</NuxtLink>
          </template>
        </Column>
        <Column field="slug" header="Slug" />
        <Column header="Статус">
          <template #body="{ data: row }">
            <Tag :value="row.status === 'published' ? 'Опубликовано' : 'Черновик'" :severity="row.status === 'published' ? 'success' : 'secondary'" />
          </template>
        </Column>
        <Column header="Дата публикации">
          <template #body="{ data: row }">{{ row.published_at ? formatAdminDate(row.published_at) : '—' }}</template>
        </Column>
        <Column header="Изменено">
          <template #body="{ data: row }">{{ formatAdminDate(row.updated_at) }}</template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
