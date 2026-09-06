<script setup lang="ts">
import type { ReviewRow } from '~/types/database.types'
import { CATEGORY_LABELS } from '~/utils/categories'

type AdminReviewDetail = ReviewRow & {
  author: { id: string; display_name: string | null } | null
}

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const id = route.params.id as string

const { data: review, pending, refresh } = await useAsyncData(
  `admin-review-${id}`,
  () => useAdminFetch<AdminReviewDetail>(`/api/admin/reviews/${id}`),
)

const authorLabel = computed(() => {
  const a = review.value?.author
  if (!a) return 'Аноним'
  if (a.display_name) return a.display_name
  return `${a.id.slice(0, 8)}…`
})

const editMode = ref(false)
const form = reactive({
  author_nationality: '',
  target_country: '',
  stay_purpose: '',
  still_there: false,
  city_name: '',
  ratings: {} as Record<string, number>,
  comments: {} as Record<string, string>,
  climate: [] as string[],
})

watch(review, (r) => {
  if (!r) return
  form.author_nationality = r.author_nationality
  form.target_country = r.target_country
  form.stay_purpose = r.stay_purpose ?? ''
  form.still_there = r.still_there ?? false
  form.city_name = r.city_name ?? ''
  form.ratings = { ...((r.ratings as Record<string, number>) ?? {}) }
  form.comments = { ...((r.comments as Record<string, string>) ?? {}) }
  form.climate = [...(r.climate ?? [])]
}, { immediate: true })

const ratingEntries = computed(() => {
  const ratings = editMode.value ? form.ratings : ((review.value?.ratings as Record<string, number>) ?? {})
  const comments = editMode.value ? form.comments : ((review.value?.comments as Record<string, string>) ?? {})
  const keys = new Set([...Object.keys(ratings), ...Object.keys(comments)])
  return [...keys].map(key => ({
    key,
    label: CATEGORY_LABELS[key] ?? key,
    rating: ratings[key],
    comment: comments[key],
  }))
})

const climateOptions: Record<string, { icon: string; label: string }> = {
  sunny: { icon: '☀️', label: 'Солнечно' },
  warm: { icon: '🌤️', label: 'Тепло' },
  rainy: { icon: '🌧️', label: 'Дождь' },
  cloudy: { icon: '🌥️', label: 'Облачно' },
  cold: { icon: '❄️', label: 'Холодно' },
  snow: { icon: '🌨️', label: 'Снег' },
  windy: { icon: '💨', label: 'Ветрено' },
  humid: { icon: '💧', label: 'Влажно' },
}
function climateIcon(key: string) {
  return climateOptions[key]?.icon ?? '🌡️'
}
function climateLabel(key: string) {
  return climateOptions[key]?.label ?? key
}

const siteLink = computed(() => {
  const r = review.value
  if (!r?.target_country) return null
  return `/country/${r.target_country.toLowerCase()}`
})

async function save() {
  try {
    await useAdminFetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      body: { ...form },
    })
    toast.add({ severity: 'success', summary: 'Сохранено', life: 2500 })
    editMode.value = false
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ severity: 'error', summary: err.data?.message ?? 'Ошибка', life: 4000 })
  }
}

async function moderate(approve: boolean) {
  try {
    await useAdminFetch(`/api/admin/reviews/${id}`, {
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

async function remove() {
  if (!confirm('Удалить отзыв безвозвратно?')) return
  try {
    await useAdminFetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
    toast.add({ severity: 'success', summary: 'Удалено', life: 2000 })
    await router.push('/admin/reviews')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ severity: 'error', summary: err.data?.message ?? 'Ошибка удаления', life: 4000 })
  }
}
</script>

<template>
  <div>
    <AdminBreadcrumb :items="[
      { label: 'Обзор', to: '/admin' },
      { label: 'Отзывы', to: '/admin/reviews' },
      { label: 'Карточка' },
    ]" />

    <div class="admin-toolbar">
      <NuxtLink to="/admin/reviews">
        <Button label="К списку" icon="pi pi-arrow-left" text />
      </NuxtLink>
      <a v-if="siteLink" :href="siteLink" target="_blank" rel="noopener">
        <Button label="Страна на сайте" icon="pi pi-external-link" severity="secondary" outlined />
      </a>
      <Button
        v-if="review && !review.is_approved"
        label="Опубликовать"
        icon="pi pi-check"
        @click="moderate(true)"
      />
      <Button
        v-if="review?.is_approved"
        label="Снять с публикации"
        icon="pi pi-eye-slash"
        severity="secondary"
        @click="moderate(false)"
      />
      <Button
        :label="editMode ? 'Отмена' : 'Редактировать'"
        icon="pi pi-pencil"
        severity="secondary"
        @click="editMode = !editMode"
      />
      <Button label="Удалить" icon="pi pi-trash" severity="danger" text @click="remove" />
    </div>

    <h1 class="admin-page-title">Отзыв</h1>

    <div v-if="pending"><Skeleton height="200px" /></div>
    <template v-else-if="review">
      <section class="admin-card admin-section">
        <div class="admin-actions" style="margin-bottom: 12px">
          <Tag
            :value="review.is_approved ? 'Опубликован' : 'Ожидает'"
            :severity="review.is_approved ? 'success' : 'warn'"
          />
          <Tag
            v-if="review.author_profile === 'seed'"
            value="Демо"
            severity="secondary"
          />
        </div>
        <div class="admin-meta-grid">
          <div><span class="admin-muted">Дата</span><div>{{ formatAdminDate(review.created_at) }}</div></div>
          <div><span class="admin-muted">Страна</span><div>{{ review.target_country }}</div></div>
          <div><span class="admin-muted">Город</span><div>{{ review.city_name || '—' }}</div></div>
          <div><span class="admin-muted">Национальность</span><div>{{ review.author_nationality }}</div></div>
          <div><span class="admin-muted">Цель</span><div>{{ review.stay_purpose || '—' }}</div></div>
          <div><span class="admin-muted">Сейчас там</span><div>{{ review.still_there ? 'Да' : 'Нет' }}</div></div>
          <div>
            <span class="admin-muted">Пользователь</span>
            <div>
              {{ authorLabel }}
              <span v-if="review.user_id" class="admin-muted" :title="review.user_id"> · {{ review.user_id.slice(0, 8) }}…</span>
            </div>
          </div>
        </div>
      </section>

      <section class="admin-card admin-section">
        <h2 class="admin-section-title">{{ editMode ? 'Редактирование' : 'Оценки и комментарии' }}</h2>

        <template v-if="editMode">
          <div class="admin-form-grid">
            <div class="admin-form-field">
              <label>Страна</label>
              <InputText v-model="form.target_country" class="w-full" />
            </div>
            <div class="admin-form-field">
              <label>Город</label>
              <InputText v-model="form.city_name" class="w-full" />
            </div>
            <div class="admin-form-field">
              <label>Национальность</label>
              <InputText v-model="form.author_nationality" class="w-full" />
            </div>
            <div class="admin-form-field">
              <label>Цель</label>
              <InputText v-model="form.stay_purpose" class="w-full" />
            </div>
            <div class="admin-form-field admin-form-field--inline">
              <Checkbox v-model="form.still_there" binary input-id="still" />
              <label for="still">Сейчас там живёт</label>
            </div>
          </div>
          <RatingsEditor
            :ratings="form.ratings"
            :comments="form.comments"
            :climate="form.climate"
            @update:ratings="form.ratings = $event"
            @update:comments="form.comments = $event"
            @update:climate="form.climate = $event"
          />
          <Button label="Сохранить" icon="pi pi-save" class="mt-2" @click="save" />
        </template>

        <div v-else class="admin-rating-list">
          <div v-for="item in ratingEntries" :key="item.key" class="admin-rating-row">
            <div class="admin-rating-head">
              <strong>{{ item.label }}</strong>
              <span v-if="item.rating != null">★ {{ item.rating }}</span>
            </div>
            <p v-if="item.comment" class="admin-rating-comment">{{ item.comment }}</p>
          </div>
          <p v-if="!ratingEntries.length && !review.climate?.length" class="admin-section-hint">Нет оценок и комментариев.</p>
          <div v-if="review.climate?.length" class="admin-climate-row">
            <strong>Климат / погода</strong>
            <span class="admin-climate-icons">
              <span v-for="key in review.climate" :key="key">{{ climateIcon(key) }} {{ climateLabel(key) }}</span>
            </span>
          </div>
        </div>
      </section>
    </template>
    <div v-else class="admin-card admin-empty">
      <p>Отзыв не найден.</p>
      <NuxtLink to="/admin/reviews"><Button label="К списку" text /></NuxtLink>
    </div>
  </div>
</template>
