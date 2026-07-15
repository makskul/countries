<script setup lang="ts">
import type { ReviewRow } from '~/types/database.types'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()
const router = useRouter()
const toast = useToast()

const status = ref(String(route.query.status ?? 'all'))
const profile = ref(String(route.query.profile ?? 'all'))
const countryFilter = ref(String(route.query.country ?? ''))
const nationalityFilter = ref(String(route.query.nationality ?? ''))
const search = ref(String(route.query.q ?? ''))
const page = ref(Number(route.query.page ?? 1) || 1)
const selected = ref<ReviewRow[]>([])

const { data, pending, refresh } = await useAsyncData(
  'admin-reviews',
  () => useAdminFetch<{ items: ReviewRow[]; total: number; pending: number }>('/api/admin/reviews', {
    query: {
      status: status.value,
      profile: profile.value,
      country: countryFilter.value || undefined,
      nationality: nationalityFilter.value || undefined,
      q: search.value || undefined,
      page: page.value,
      pageSize: 20,
    },
  }),
  { watch: [status, profile, countryFilter, nationalityFilter, search, page] },
)

function syncQuery() {
  page.value = 1
  router.replace({
    query: {
      status: status.value !== 'all' ? status.value : undefined,
      profile: profile.value !== 'all' ? profile.value : undefined,
      country: countryFilter.value || undefined,
      nationality: nationalityFilter.value || undefined,
      q: search.value || undefined,
    },
  })
}

watch([status, profile], syncQuery)

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch([search, countryFilter, nationalityFilter], () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(syncQuery, 350)
})

function onPageChange(e: { page: number }) {
  page.value = e.page + 1
}

async function moderate(review: ReviewRow, approve: boolean) {
  try {
    await useAdminFetch(`/api/admin/reviews/${review.id}`, {
      method: 'PATCH',
      body: { is_approved: approve },
    })
    toast.add({ severity: 'success', summary: approve ? 'Опубликован' : 'Снят с публикации', life: 2500 })
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

async function seedAction(action: 'unpublish' | 'delete') {
  const msg = action === 'delete'
    ? 'Удалить ВСЕ демо-отзывы безвозвратно?'
    : 'Снять с публикации все демо-отзывы?'
  if (!confirm(msg)) return
  try {
    const res = await useAdminFetch<{ affected: number }>('/api/admin/reviews/seed', {
      method: 'POST',
      body: { action },
    })
    toast.add({
      severity: 'success',
      summary: action === 'delete' ? `Удалено: ${res.affected}` : `Скрыто: ${res.affected}`,
      life: 3000,
    })
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ severity: 'error', summary: err.data?.message ?? 'Ошибка', life: 4000 })
  }
}

function parseRatings(row: ReviewRow): Record<string, number> {
  const r = row.ratings
  return typeof r === 'object' && r !== null ? r as Record<string, number> : {}
}

function commentPreview(row: ReviewRow): string {
  const c = row.comments
  if (!c || typeof c !== 'object') return ''
  const vals = Object.values(c as Record<string, string>).filter(Boolean)
  const text = vals[0] ?? ''
  return text.length > 80 ? `${text.slice(0, 80)}…` : text
}
</script>

<template>
  <div>
    <AdminBreadcrumb :items="[{ label: 'Обзор', to: '/admin' }, { label: 'Отзывы' }]" />
    <h1 class="admin-page-title">Отзывы</h1>
    <p class="admin-page-lead">
      Одобряйте новые отзывы и правьте опубликованные. Демо-отзывы помечены отдельно.
    </p>

    <div class="admin-toolbar">
      <Select
        v-model="status"
        :options="[
          { label: 'Все статусы', value: 'all' },
          { label: 'Ожидают', value: 'pending' },
          { label: 'Опубликованы', value: 'approved' },
        ]"
        option-label="label"
        option-value="value"
      />
      <Select
        v-model="profile"
        :options="[
          { label: 'Все источники', value: 'all' },
          { label: 'Только демо', value: 'seed' },
          { label: 'Без демо', value: 'real' },
        ]"
        option-label="label"
        option-value="value"
      />
      <InputText v-model="countryFilter" placeholder="Страна (DE)" style="width: 100px" />
      <InputText v-model="nationalityFilter" placeholder="Нац. (UA)" style="width: 100px" />
      <InputText v-model="search" placeholder="Поиск: город, код…" style="min-width: 180px" />
      <Tag v-if="data" :value="`Ожидают: ${data.pending}`" severity="warn" />
      <Tag v-if="data" :value="`Найдено: ${data.total}`" severity="secondary" />
    </div>

    <div v-if="selected.length" class="admin-toolbar">
      <Button label="Опубликовать выбранные" size="small" @click="bulkModerate(true)" />
      <Button label="Снять с публикации" size="small" severity="secondary" @click="bulkModerate(false)" />
      <span class="admin-section-hint" style="margin: 0">Выбрано: {{ selected.length }}</span>
    </div>

    <div class="admin-toolbar">
      <Button
        label="Скрыть все демо"
        size="small"
        severity="secondary"
        outlined
        @click="seedAction('unpublish')"
      />
      <Button
        label="Удалить все демо"
        size="small"
        severity="danger"
        outlined
        @click="seedAction('delete')"
      />
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
        <template #empty>
          <div class="admin-empty">
            <p>Нет отзывов по текущим фильтрам.</p>
            <Button label="Сбросить фильтры" text @click="status = 'all'; profile = 'all'; countryFilter = ''; nationalityFilter = ''; search = ''; syncQuery()" />
          </div>
        </template>
        <Column selection-mode="multiple" header-style="width: 3rem" />
        <Column field="created_at" header="Дата">
          <template #body="{ data: row }">{{ formatAdminDate(row.created_at) }}</template>
        </Column>
        <Column header="О чём">
          <template #body="{ data: row }">
            <div class="admin-review-about">
              <strong>{{ row.target_country }}</strong>
              <span v-if="row.city_name" class="admin-muted"> · {{ row.city_name }}</span>
            </div>
            <div v-if="commentPreview(row)" class="admin-review-snippet">{{ commentPreview(row) }}</div>
          </template>
        </Column>
        <Column field="author_nationality" header="От кого" />
        <Column header="Рейтинг">
          <template #body="{ data: row }">★ {{ avgRating(parseRatings(row)) }}</template>
        </Column>
        <Column header="Статус">
          <template #body="{ data: row }">
            <div class="admin-actions">
              <Tag
                :value="row.is_approved ? 'Опубликован' : 'Ожидает'"
                :severity="row.is_approved ? 'success' : 'warn'"
              />
              <Tag
                v-if="row.author_profile === 'seed'"
                value="Демо"
                severity="secondary"
                title="Сгенерированный демо-отзыв"
              />
            </div>
          </template>
        </Column>
        <Column header="Действия">
          <template #body="{ data: row }">
            <div class="admin-actions">
              <NuxtLink :to="`/admin/reviews/${row.id}`">
                <Button icon="pi pi-eye" size="small" text title="Открыть" />
              </NuxtLink>
              <Button
                v-if="!row.is_approved"
                icon="pi pi-check"
                size="small"
                severity="success"
                text
                title="Опубликовать"
                @click="moderate(row, true)"
              />
              <Button
                v-else
                icon="pi pi-eye-slash"
                size="small"
                severity="secondary"
                text
                title="Снять с публикации"
                @click="moderate(row, false)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
