<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ robots: 'noindex, nofollow' })

const countryFilter = ref('')
const search = ref('')
const page = ref(1)
const pageSize = 30

const { data, pending, error, refresh } = await useAsyncData(
  'admin-leads',
  () => useAdminFetch<{
    items: {
      id: string
      country: string
      author_nationality: string
      email: string
      message: string | null
      source: string
      created_at: string
    }[]
    total: number
  }>('/api/admin/leads', {
    query: {
      country: countryFilter.value || undefined,
      q: search.value || undefined,
      page: page.value,
      pageSize,
    },
  }),
  { watch: [countryFilter, search, page] },
)

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch([countryFilter, search], () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1 }, 300)
})

function onPageChange(e: { page: number }) {
  page.value = e.page + 1
}

function resetFilters() {
  countryFilter.value = ''
  search.value = ''
  page.value = 1
}
</script>

<template>
  <div>
    <AdminBreadcrumb :items="[{ label: 'Обзор', to: '/admin' }, { label: 'Лиды' }]" />
    <h1 class="admin-page-title">Лиды</h1>
    <p class="admin-page-lead">
      Заявки с форм на сайте (консультация / виза). Новые сверху.
    </p>

    <div class="admin-toolbar">
      <InputText v-model="countryFilter" placeholder="Страна (DE)" style="width: 100px" />
      <InputText v-model="search" placeholder="Email, сообщение, source…" style="min-width: 220px" />
      <Tag v-if="data" :value="`Всего: ${data.total}`" severity="secondary" />
      <Button v-if="error" label="Повторить" icon="pi pi-refresh" size="small" text @click="refresh()" />
    </div>

    <Message v-if="error" severity="error" :closable="false" class="mb-3">
      {{ (error as { data?: { message?: string } }).data?.message ?? error.message ?? 'Не удалось загрузить лиды' }}
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
            <p v-if="countryFilter || search">Нет лидов по текущим фильтрам.</p>
            <p v-else>Пока нет заявок. Они появятся здесь после отправки формы на сайте.</p>
            <Button
              v-if="countryFilter || search"
              label="Сбросить фильтры"
              text
              @click="resetFilters"
            />
          </div>
        </template>
        <Column field="created_at" header="Дата">
          <template #body="{ data: row }">{{ formatAdminDate(row.created_at) }}</template>
        </Column>
        <Column field="country" header="Страна" />
        <Column field="author_nationality" header="Нац." />
        <Column field="email" header="Email">
          <template #body="{ data: row }">
            <a :href="`mailto:${row.email}`">{{ row.email }}</a>
          </template>
        </Column>
        <Column field="message" header="Сообщение">
          <template #body="{ data: row }">
            <span class="admin-muted" :title="row.message || undefined">
              {{ row.message ? (row.message.length > 120 ? `${row.message.slice(0, 120)}…` : row.message) : '—' }}
            </span>
          </template>
        </Column>
        <Column field="source" header="Источник" />
      </DataTable>
    </div>
  </div>
</template>
