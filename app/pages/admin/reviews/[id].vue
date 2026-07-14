<script setup lang="ts">
import type { ReviewRow } from '~/types/database.types'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const id = route.params.id as string

const { data: review, pending, refresh } = await useAsyncData(
  `admin-review-${id}`,
  () => useAdminFetch<ReviewRow>(`/api/admin/reviews/${id}`),
)

const editMode = ref(false)
const form = reactive({
  author_nationality: '',
  target_country: '',
  stay_purpose: '',
  still_there: false,
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
  form.ratings = (r.ratings as Record<string, number>) ?? {}
  form.comments = (r.comments as Record<string, string>) ?? {}
  form.climate = r.climate ?? []
}, { immediate: true })

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
    toast.add({ severity: 'success', summary: approve ? 'Одобрено' : 'Отклонено', life: 2500 })
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ severity: 'error', summary: err.data?.message ?? 'Ошибка', life: 4000 })
  }
}

async function remove() {
  if (!confirm('Удалить отзыв?')) return
  await useAdminFetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
  await router.push('/admin/reviews')
}
</script>

<template>
  <div>
    <div class="admin-toolbar">
      <NuxtLink to="/admin/reviews">
        <Button label="Назад" icon="pi pi-arrow-left" text />
      </NuxtLink>
      <Button v-if="review && !review.is_approved" label="Одобрить" icon="pi pi-check" @click="moderate(true)" />
      <Button label="Отклонить" icon="pi pi-times" severity="secondary" @click="moderate(false)" />
      <Button :label="editMode ? 'Отмена' : 'Редактировать'" icon="pi pi-pencil" severity="secondary" @click="editMode = !editMode" />
      <Button label="Удалить" icon="pi pi-trash" severity="danger" text @click="remove" />
    </div>

    <h1 class="admin-page-title">Отзыв</h1>

    <div v-if="pending"><Skeleton height="200px" /></div>
    <div v-else-if="review" class="admin-card">
      <p><strong>ID:</strong> {{ review.id }}</p>
      <p><strong>Дата:</strong> {{ formatAdminDate(review.created_at) }}</p>
      <p><strong>Статус:</strong> {{ review.is_approved ? 'Одобрен' : 'Ожидает' }}</p>
      <p v-if="review.city_name"><strong>Город:</strong> {{ review.city_name }}</p>

      <template v-if="editMode">
        <div class="admin-form-field">
          <label>Страна</label>
          <InputText v-model="form.target_country" class="w-full" />
        </div>
        <div class="admin-form-field">
          <label>Национальность</label>
          <InputText v-model="form.author_nationality" class="w-full" />
        </div>
        <div class="admin-form-field">
          <label>Цель</label>
          <InputText v-model="form.stay_purpose" class="w-full" />
        </div>
        <div class="admin-form-field">
          <Checkbox v-model="form.still_there" binary input-id="still" />
          <label for="still" style="margin-left: 8px">Сейчас там</label>
        </div>
        <RatingsEditor
          :ratings="form.ratings"
          :comments="form.comments"
          :climate="form.climate"
          @update:ratings="form.ratings = $event"
          @update:comments="form.comments = $event"
          @update:climate="form.climate = $event"
        />
        <Button label="Сохранить" @click="save" />
      </template>
      <template v-else>
        <pre style="white-space: pre-wrap; font-size: 12px; background: var(--color-bg-secondary); padding: 12px; border-radius: 8px">{{ JSON.stringify({ ratings: review.ratings, comments: review.comments, climate: review.climate }, null, 2) }}</pre>
      </template>
    </div>
  </div>
</template>
