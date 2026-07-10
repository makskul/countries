<script setup lang="ts">
import type { CountryRow } from '~/types/database.types'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()
const toast = useToast()
const code = (route.params.code as string).toUpperCase()

const { data: country, pending, refresh } = await useAsyncData(
  `admin-country-${code}`,
  () => useAdminFetch<CountryRow>(`/api/admin/countries/${code}`),
)

const form = reactive({
  region: '',
  is_active: true,
  language_key: '',
  currency: '',
  climate_key: '',
  cost_level: '',
  residency_months: '',
  tax_employee: '',
  tax_corporate: '',
  hero_image_url: '',
  visa_info_uk: '',
  visa_info_en: '',
  visa_info_ru: '',
  article_title_uk: '',
  article_title_en: '',
  article_title_ru: '',
  article_excerpt_uk: '',
  article_excerpt_en: '',
  article_excerpt_ru: '',
  article_body_uk: '',
  article_body_en: '',
  article_body_ru: '',
  article_published: true,
})

watch(country, (c) => {
  if (!c) return
  Object.assign(form, {
    region: c.region,
    is_active: c.is_active,
    language_key: c.language_key ?? '',
    currency: c.currency ?? '',
    climate_key: c.climate_key ?? '',
    cost_level: c.cost_level ?? '',
    residency_months: c.residency_months ?? '',
    tax_employee: c.tax_employee ?? '',
    tax_corporate: c.tax_corporate ?? '',
    hero_image_url: c.hero_image_url ?? '',
    visa_info_uk: c.visa_info_uk ?? '',
    visa_info_en: c.visa_info_en ?? '',
    visa_info_ru: c.visa_info_ru ?? '',
    article_title_uk: c.article_title_uk ?? '',
    article_title_en: c.article_title_en ?? '',
    article_title_ru: c.article_title_ru ?? '',
    article_excerpt_uk: c.article_excerpt_uk ?? '',
    article_excerpt_en: c.article_excerpt_en ?? '',
    article_excerpt_ru: c.article_excerpt_ru ?? '',
    article_body_uk: c.article_body_uk ?? '',
    article_body_en: c.article_body_en ?? '',
    article_body_ru: c.article_body_ru ?? '',
    article_published: c.article_published !== false,
  })
}, { immediate: true })

const costOptions = [
  { label: 'Низкий', value: 'low' },
  { label: 'Средний', value: 'medium' },
  { label: 'Высокий', value: 'high' },
  { label: 'Очень высокий', value: 'very_high' },
]
const regionOptions = [
  { label: 'Европа', value: 'europe' },
  { label: 'Азия', value: 'asia' },
  { label: 'Америка', value: 'americas' },
  { label: 'Африка', value: 'africa' },
  { label: 'Океания', value: 'oceania' },
  { label: 'Другое', value: 'other' },
]

const sitePreview = computed(() => `/country/${code.toLowerCase()}`)
const heroUploading = ref(false)
const heroInput = ref<HTMLInputElement | null>(null)

async function save() {
  try {
    await useAdminFetch(`/api/admin/countries/${code}`, { method: 'PATCH', body: form })
    toast.add({ severity: 'success', summary: 'Сохранено', life: 2500 })
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ severity: 'error', summary: err.data?.message ?? 'Ошибка', life: 4000 })
  }
}

async function onHeroSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  heroUploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await useAdminFetch<{ url: string }>(`/api/admin/countries/${code}/hero`, {
      method: 'POST',
      body: fd,
    })
    form.hero_image_url = res.url
    toast.add({ severity: 'success', summary: 'Картинка загружена', life: 2500 })
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ severity: 'error', summary: err.data?.message ?? 'Ошибка загрузки', life: 4000 })
  } finally {
    heroUploading.value = false
    input.value = ''
  }
}
</script>

<template>
  <div>
    <AdminBreadcrumb :items="[
      { label: 'Обзор', to: '/admin' },
      { label: 'Страны', to: '/admin/countries' },
      { label: code },
    ]" />
    <div class="admin-toolbar">
      <NuxtLink to="/admin/countries">
        <Button label="К списку стран" icon="pi pi-arrow-left" text />
      </NuxtLink>
      <a :href="sitePreview" target="_blank" rel="noopener">
        <Button label="Открыть на сайте" icon="pi pi-external-link" severity="secondary" outlined />
      </a>
      <Button label="Сохранить" icon="pi pi-save" @click="save" />
    </div>
    <h1 class="admin-page-title">Страна {{ code }}</h1>
    <p class="admin-page-lead">
      Здесь редактируются справка в сайдбаре, визовая подсказка и статья «О стране» на публичной странице.
    </p>

    <div v-if="pending"><Skeleton height="300px" /></div>
    <template v-else>
      <section class="admin-card admin-section">
        <h2 class="admin-section-title">Основные данные</h2>
        <p class="admin-section-hint">Показываются в блоке «Краткая справка» на странице страны.</p>

        <div class="admin-form-grid">
          <div class="admin-form-field">
            <label>Регион</label>
            <Select v-model="form.region" :options="regionOptions" option-label="label" option-value="value" class="w-full" />
          </div>
          <div class="admin-form-field admin-form-field--inline">
            <Checkbox v-model="form.is_active" binary input-id="active" />
            <label for="active">Страна активна (видна на сайте)</label>
          </div>
          <div class="admin-form-field">
            <label>Язык (ключ)</label>
            <InputText v-model="form.language_key" class="w-full" placeholder="например german, english" />
            <small class="admin-field-hint">Ключ из справочника языков сайта</small>
          </div>
          <div class="admin-form-field">
            <label>Валюта</label>
            <InputText v-model="form.currency" class="w-full" placeholder="EUR" />
          </div>
          <div class="admin-form-field">
            <label>Климат (ключ)</label>
            <InputText v-model="form.climate_key" class="w-full" placeholder="temperate, mediterranean…" />
          </div>
          <div class="admin-form-field">
            <label>Уровень цен</label>
            <Select v-model="form.cost_level" :options="costOptions" option-label="label" option-value="value" class="w-full" />
          </div>
          <div class="admin-form-field">
            <label>Срок ВНЖ (месяцев)</label>
            <InputText v-model="form.residency_months" class="w-full" placeholder="60" />
          </div>
          <div class="admin-form-field">
            <label>НДФЛ / налог на доход</label>
            <InputText v-model="form.tax_employee" class="w-full" />
          </div>
          <div class="admin-form-field">
            <label>Налог на прибыль</label>
            <InputText v-model="form.tax_corporate" class="w-full" />
          </div>
          <div class="admin-form-field admin-form-field--wide">
            <label>Картинка страны (hero)</label>
            <div class="admin-hero-row">
              <InputText v-model="form.hero_image_url" class="w-full" placeholder="https://… или загрузите файл" />
              <input
                ref="heroInput"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                class="admin-file-input"
                @change="onHeroSelected"
              >
              <Button
                label="Загрузить"
                icon="pi pi-upload"
                severity="secondary"
                :loading="heroUploading"
                @click="heroInput?.click()"
              />
            </div>
            <small class="admin-field-hint">JPEG / PNG / WebP / GIF, до 5 МБ</small>
            <img
              v-if="form.hero_image_url"
              :src="form.hero_image_url"
              alt=""
              class="admin-hero-preview"
            >
          </div>
        </div>
      </section>

      <section class="admin-card admin-section">
        <h2 class="admin-section-title">Виза</h2>
        <p class="admin-section-hint">Короткий текст в сайдбаре. Пишите отдельно для каждого языка.</p>
        <TabView>
          <TabPanel header="Українська">
            <Textarea v-model="form.visa_info_uk" rows="4" class="w-full" placeholder="Текст про візу…" />
          </TabPanel>
          <TabPanel header="English">
            <Textarea v-model="form.visa_info_en" rows="4" class="w-full" placeholder="Visa note…" />
          </TabPanel>
          <TabPanel header="Русский">
            <Textarea v-model="form.visa_info_ru" rows="4" class="w-full" placeholder="Текст про визу…" />
          </TabPanel>
        </TabView>
      </section>

      <AdminArticleEditor
        v-model="form"
        section-title="Статья о стране"
        section-hint="Блок «О стране» над отзывами. Абзацы разделяйте пустой строкой."
        :body-rows="14"
      />

      <div class="admin-toolbar">
        <Button label="Сохранить изменения" icon="pi pi-save" @click="save" />
      </div>
    </template>
  </div>
</template>
