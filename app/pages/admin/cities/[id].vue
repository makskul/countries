<script setup lang="ts">
import type { CityRow } from '~/types/database.types'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()
const toast = useToast()
const id = Number(route.params.id)

const { data: city, pending, refresh } = await useAsyncData(
  `admin-city-${id}`,
  () => useAdminFetch<CityRow>(`/api/admin/cities/${id}`),
)

const form = reactive({
  country: '',
  name_en: '',
  name_uk: '',
  name_ru: '',
  slug: '',
  population: 0,
  article_title_uk: '',
  article_title_en: '',
  article_title_ru: '',
  article_excerpt_uk: '',
  article_excerpt_en: '',
  article_excerpt_ru: '',
  article_body_uk: '',
  article_body_en: '',
  article_body_ru: '',
})

watch(city, (c) => {
  if (!c) return
  Object.assign(form, {
    country: c.country,
    name_en: c.name_en,
    name_uk: c.name_uk ?? '',
    name_ru: c.name_ru ?? '',
    slug: c.slug,
    population: c.population,
    article_title_uk: c.article_title_uk ?? '',
    article_title_en: c.article_title_en ?? '',
    article_title_ru: c.article_title_ru ?? '',
    article_excerpt_uk: c.article_excerpt_uk ?? '',
    article_excerpt_en: c.article_excerpt_en ?? '',
    article_excerpt_ru: c.article_excerpt_ru ?? '',
    article_body_uk: c.article_body_uk ?? '',
    article_body_en: c.article_body_en ?? '',
    article_body_ru: c.article_body_ru ?? '',
  })
}, { immediate: true })

const sitePreview = computed(() => {
  if (!form.country || !form.slug) return null
  return `/country/${form.country.toLowerCase()}/${form.slug}`
})

async function save() {
  try {
    await useAdminFetch(`/api/admin/cities/${id}`, { method: 'PATCH', body: form })
    toast.add({ severity: 'success', summary: 'Сохранено', life: 2500 })
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ severity: 'error', summary: err.data?.message ?? 'Ошибка', life: 4000 })
  }
}
</script>

<template>
  <div>
    <div class="admin-toolbar">
      <NuxtLink to="/admin/cities">
        <Button label="К списку городов" icon="pi pi-arrow-left" text />
      </NuxtLink>
      <a v-if="sitePreview" :href="sitePreview" target="_blank" rel="noopener">
        <Button label="Открыть на сайте" icon="pi pi-external-link" severity="secondary" outlined />
      </a>
      <Button label="Сохранить" icon="pi pi-save" @click="save" />
    </div>

    <h1 class="admin-page-title">
      Город {{ form.name_ru || form.name_en || id }}
    </h1>
    <p class="admin-page-lead">
      Названия на языках сайта и статья «О городе» на публичной странице.
    </p>

    <div v-if="pending"><Skeleton height="300px" /></div>
    <template v-else-if="city">
      <section class="admin-card admin-section">
        <h2 class="admin-section-title">Основные данные</h2>
        <div class="admin-form-grid">
          <div class="admin-form-field">
            <label>Страна (код)</label>
            <InputText v-model="form.country" class="w-full" />
          </div>
          <div class="admin-form-field">
            <label>Название (EN)</label>
            <InputText v-model="form.name_en" class="w-full" />
          </div>
          <div class="admin-form-field">
            <label>Название (UK)</label>
            <InputText v-model="form.name_uk" class="w-full" />
          </div>
          <div class="admin-form-field">
            <label>Название (RU)</label>
            <InputText v-model="form.name_ru" class="w-full" />
          </div>
          <div class="admin-form-field">
            <label>Адрес в URL (slug)</label>
            <InputText v-model="form.slug" class="w-full" />
            <small class="admin-field-hint">Латиница, без пробелов. Пример: berlin</small>
          </div>
          <div class="admin-form-field">
            <label>Население (примерно)</label>
            <InputNumber v-model="form.population" class="w-full" />
          </div>
        </div>
      </section>

      <section class="admin-card admin-section">
        <h2 class="admin-section-title">Статья о городе</h2>
        <p class="admin-section-hint">
          Блок над отзывами на странице города. Абзацы разделяйте пустой строкой.
        </p>
        <TabView>
          <TabPanel header="Українська">
            <div class="admin-form-field">
              <label>Заголовок</label>
              <InputText v-model="form.article_title_uk" class="w-full" />
            </div>
            <div class="admin-form-field">
              <label>Короткий лид</label>
              <Textarea v-model="form.article_excerpt_uk" rows="3" class="w-full" />
            </div>
            <div class="admin-form-field">
              <label>Текст статьи</label>
              <Textarea v-model="form.article_body_uk" rows="12" class="w-full" />
            </div>
          </TabPanel>
          <TabPanel header="English">
            <div class="admin-form-field">
              <label>Title</label>
              <InputText v-model="form.article_title_en" class="w-full" />
            </div>
            <div class="admin-form-field">
              <label>Excerpt</label>
              <Textarea v-model="form.article_excerpt_en" rows="3" class="w-full" />
            </div>
            <div class="admin-form-field">
              <label>Body</label>
              <Textarea v-model="form.article_body_en" rows="12" class="w-full" />
            </div>
          </TabPanel>
          <TabPanel header="Русский">
            <div class="admin-form-field">
              <label>Заголовок</label>
              <InputText v-model="form.article_title_ru" class="w-full" />
            </div>
            <div class="admin-form-field">
              <label>Короткий лид</label>
              <Textarea v-model="form.article_excerpt_ru" rows="3" class="w-full" />
            </div>
            <div class="admin-form-field">
              <label>Текст статьи</label>
              <Textarea v-model="form.article_body_ru" rows="12" class="w-full" />
            </div>
          </TabPanel>
        </TabView>
      </section>

      <div class="admin-toolbar">
        <Button label="Сохранить изменения" icon="pi pi-save" @click="save" />
      </div>
    </template>
    <div v-else class="admin-card">
      <p>Город не найден.</p>
    </div>
  </div>
</template>
