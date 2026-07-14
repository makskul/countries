<script setup lang="ts">
import type { ReviewRow } from '~/types/database.types'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()
const router = useRouter()
const toast = useToast()

const status = ref(String(route.query.status ?? 'pending'))
const countryFilter = ref('')
const page = ref(1)
const selected = ref<ReviewRow[]>([])

const { data, pending, refresh } = await useAsyncData(
  'admin-reviews',
  () => useAdminFetch<{ items: ReviewRow[]; total: number; pending: number }>('/api/admin/reviews', {
    query: {
      status: status.value,
      country: countryFilter.value || undefined,
      page: page.value,
      pageSize: 20,
    },
  }),
  { watch: [status, countryFilter, page] },
)

watch(status, () => { page.value = 1; router.replace({ query: { status: status.value } }) })

function onPageChange(e: { page: number }) {
  page.value = e.page + 1
}

async function moderate(review: ReviewRow, approve: boolean) {
  try {
    await useAdminFetch(`/api/admin/reviews/${review.id}`, {
      method: 'PATCH',
      body: { is_approved: approve },
    })
    toast.add({ severity: 'success', summary: approve ? 'Одобрено' : 'Отклонено', life: 2500 })
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ severity: 'error', summary: err.data?.message ?? 'Ошибка', life: 4000 })
  }
}

async function bulkModerate(approve: boolean) {
  for (const review of selected.value) {
    await useAdminFetch(`/api/admin/reviews/${review.id}`, {
      method: 'PATCH',
      body: { is_approved: approve },
    })
  }
  selected.value = []
  toast.add({ severity: 'success', summary: 'Готово', life: 2500 })
  await refresh()
}

function parseRatings(row: ReviewRow): Record<string, number> {
  const r = row.ratings
  return typeof r === 'object' && r !== null ? r as Record<string, number> : {}
}
</script>

<template>
  <div>
    <h1 class="admin-page-title">Отзывы</h1>

    <div class="admin-toolbar">
      <Select
        v-model="status"
        :options="[
          { label: 'Ожидают', value: 'pending' },
          { label: 'Одобренные', value: 'approved' },
          { label: 'Все', value: 'all' },
        ]"
        option-label="label"
        option-value="value"
        placeholder="Статус"
      />
      <InputText v-model="countryFilter" placeholder="Код страны (PT)" style="width: 120px" />
      <Button v-if="selected.length" label="Одобрить выбранные" size="small" @click="bulkModerate(true)" />
      <Button v-if="selected.length" label="Отклонить выбранные" size="small" severity="secondary" @click="bulkModerate(false)" />
      <Tag v-if="data" :value="`Pending: ${data.pending}`" severity="warn" />
    </div>

    <div class="admin-card">
      <DataTable
        v-model:selection="selected"
        :value="data?.items ?? []"
        :loading="pending"
        data-key="id"
        paginator
        :rows="20"
        :total-records="data?.total ?? 0"
        lazy
        @page="onPageChange"
      >
        <Column selection-mode="multiple" header-style="width: 3rem" />
        <Column field="created_at" header="Дата">
          <template #body="{ data: row }">{{ formatAdminDate(row.created_at) }}</template>
        </Column>
        <Column field="target_country" header="Страна" />
        <Column field="author_nationality" header="Нац." />
        <Column field="stay_purpose" header="Цель" />
        <Column header="Рейтинг">
          <template #body="{ data: row }">{{ avgRating(parseRatings(row)) }}</template>
        </Column>
        <Column header="Статус">
          <template #body="{ data: row }">
            <Tag :value="row.is_approved ? 'OK' : 'Pending'" :severity="row.is_approved ? 'success' : 'warn'" />
          </template>
        </Column>
        <Column header="Действия">
          <template #body="{ data: row }">
            <div class="admin-actions">
              <NuxtLink :to="`/admin/reviews/${row.id}`">
                <Button icon="pi pi-eye" size="small" text />
              </NuxtLink>
              <Button v-if="!row.is_approved" icon="pi pi-check" size="small" severity="success" text @click="moderate(row, true)" />
              <Button icon="pi pi-times" size="small" severity="danger" text @click="moderate(row, false)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
