<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()
const toast = useToast()
const rawId = String(route.params.id)
const isNew = rawId === 'new'

type PostRow = Record<string, string | null> & { id: string; slug: string; status: 'draft' | 'published'; published_at: string | null }

const { data: post, pending } = await useAsyncData(
  `admin-post-${rawId}`,
  () => (isNew ? Promise.resolve(null) : useAdminFetch<PostRow>(`/api/admin/posts/${rawId}`)),
)

const langs = [
  { code: 'uk', label: 'Українська' },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
] as const

const form = reactive<Record<string, string>>({
  slug: '',
  status: 'draft',
  published_at: '',
  author_name: '',
  cover_image_url: '',
  cover_alt: '',
  og_image_url: '',
  ...Object.fromEntries(
    langs.flatMap(l => ['title', 'excerpt', 'body', 'seo_title', 'seo_description'].map(f => [`${f}_${l.code}`, ''])),
  ),
})

function toLocalInput(iso: string | null | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fillForm(p: PostRow) {
  for (const key of Object.keys(form)) {
    form[key] = String(p[key] ?? '')
  }
  form.published_at = toLocalInput(p.published_at)
}
watch(post, (p) => { if (p) fillForm(p) }, { immediate: true })

const statusOptions = [
  { label: 'Черновик', value: 'draft' },
  { label: 'Опубликовано', value: 'published' },
]

function slugFromEnglishTitle() {
  const s = form.title_en
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (!s) {
    toast.add({ severity: 'warn', summary: 'Заполните английский заголовок или введите slug вручную', life: 3500 })
    return
  }
  form.slug = s
}

const saving = ref(false)

function payload() {
  return {
    ...form,
    published_at: form.published_at ? new Date(form.published_at).toISOString() : null,
  }
}

async function save() {
  saving.value = true
  try {
    if (isNew) {
      const created = await useAdminFetch<{ id: string }>('/api/admin/posts', { method: 'POST', body: payload() })
      toast.add({ severity: 'success', summary: 'Статья создана', life: 2500 })
      await navigateTo(`/admin/posts/${created.id}`)
    } else {
      const updated = await useAdminFetch<PostRow>(`/api/admin/posts/${rawId}`, { method: 'PATCH', body: payload() })
      fillForm(updated)
      toast.add({ severity: 'success', summary: 'Сохранено', life: 2500 })
    }
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ severity: 'error', summary: err.data?.message ?? 'Ошибка', life: 4500 })
  } finally {
    saving.value = false
  }
}

async function remove() {
  if (isNew) return
  if (!window.confirm('Удалить статью безвозвратно?')) return
  try {
    await useAdminFetch(`/api/admin/posts/${rawId}`, { method: 'DELETE' })
    toast.add({ severity: 'success', summary: 'Статья удалена', life: 2500 })
    await navigateTo('/admin/posts')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ severity: 'error', summary: err.data?.message ?? 'Ошибка', life: 4000 })
  }
}

const sitePreview = computed(() => `/blog/${form.slug}`)

/** Effective meta that the public page will use for a language (override → title / excerpt). */
function effective(lang: string) {
  return {
    title: form[`seo_title_${lang}`] || form[`title_${lang}`] || form.title_en || form.title_uk || form.title_ru,
    description: form[`seo_description_${lang}`] || form[`excerpt_${lang}`] || form.excerpt_en || form.excerpt_uk || form.excerpt_ru,
  }
}
</script>

<template>
  <div>
    <AdminBreadcrumb :items="[
      { label: 'Обзор', to: '/admin' },
      { label: 'Блог', to: '/admin/posts' },
      { label: isNew ? 'Новая статья' : (form.slug || 'Статья') },
    ]" />
    <div class="admin-toolbar">
      <NuxtLink to="/admin/posts">
        <Button label="К списку" icon="pi pi-arrow-left" text />
      </NuxtLink>
      <a v-if="!isNew && form.status === 'published'" :href="sitePreview" target="_blank" rel="noopener">
        <Button label="Открыть на сайте" icon="pi pi-external-link" severity="secondary" outlined />
      </a>
      <Button label="Сохранить" icon="pi pi-save" :loading="saving" @click="save" />
      <Button v-if="!isNew" label="Удалить" icon="pi pi-trash" severity="danger" text @click="remove" />
    </div>
    <h1 class="admin-page-title">{{ isNew ? 'Новая статья' : 'Редактирование статьи' }}</h1>

    <div v-if="pending"><Skeleton height="300px" /></div>
    <template v-else>
      <section class="admin-card admin-section">
        <h2 class="admin-section-title">Основное</h2>
        <div class="admin-form-grid">
          <div class="admin-form-field">
            <label>Slug (адрес статьи)</label>
            <div style="display: flex; gap: 8px">
              <InputText v-model="form.slug" class="w-full" placeholder="my-first-post" />
              <Button label="Из EN" severity="secondary" outlined @click="slugFromEnglishTitle" />
            </div>
            <small class="admin-field-hint">Латиница, цифры и дефисы. Адрес: /blog/{{ form.slug || 'slug' }}</small>
          </div>
          <div class="admin-form-field">
            <label>Статус</label>
            <Select v-model="form.status" :options="statusOptions" option-label="label" option-value="value" class="w-full" />
            <small class="admin-field-hint">Черновик не виден на сайте.</small>
          </div>
          <div class="admin-form-field">
            <label>Дата публикации</label>
            <input v-model="form.published_at" type="datetime-local" class="p-inputtext p-component w-full">
            <small class="admin-field-hint">Пусто — подставится момент публикации. Будущая дата скрывает статью до этого времени.</small>
          </div>
          <div class="admin-form-field">
            <label>Автор</label>
            <InputText v-model="form.author_name" class="w-full" placeholder="Необязательно" />
          </div>
          <div class="admin-form-field">
            <label>Обложка (URL)</label>
            <InputText v-model="form.cover_image_url" class="w-full" placeholder="https://… или /images/…" />
          </div>
          <div class="admin-form-field">
            <label>Alt-текст обложки</label>
            <InputText v-model="form.cover_alt" class="w-full" />
          </div>
        </div>
      </section>

      <section class="admin-card admin-section">
        <h2 class="admin-section-title">Текст статьи</h2>
        <p class="admin-section-hint">
          Достаточно одного языка: если другого нет, сайт покажет доступный. Форматирование Markdown:
          <code>## Заголовок</code>, <code>**жирный**</code>, <code>*курсив*</code>, <code>- список</code>,
          <code>[текст](https://…)</code>, <code>![alt](https://…)</code>. Абзацы разделяйте пустой строкой.
        </p>
        <TabView>
          <TabPanel v-for="l in langs" :key="l.code" :header="l.label">
            <div class="admin-form-field">
              <label>Заголовок</label>
              <InputText v-model="form[`title_${l.code}`]" class="w-full" />
            </div>
            <div class="admin-form-field">
              <label>Краткое описание (анонс)</label>
              <Textarea v-model="form[`excerpt_${l.code}`]" rows="3" class="w-full" />
              <small class="admin-field-hint">Показывается в списке блога и используется как meta description, если SEO-описание не задано.</small>
            </div>
            <div class="admin-form-field">
              <label>Текст</label>
              <Textarea v-model="form[`body_${l.code}`]" rows="18" class="w-full" auto-resize />
            </div>
          </TabPanel>
        </TabView>
      </section>

      <section class="admin-card admin-section">
        <h2 class="admin-section-title">SEO (title / description)</h2>
        <p class="admin-section-hint">
          Если поля пустые, используются заголовок и анонс статьи. Здесь можно задать отдельные мета-данные для поисковиков и соцсетей.
        </p>
        <div class="admin-form-field">
          <label>Картинка для соцсетей (og:image, URL)</label>
          <InputText v-model="form.og_image_url" class="w-full" placeholder="Пусто — берётся обложка" />
        </div>
        <TabView>
          <TabPanel v-for="l in langs" :key="l.code" :header="l.label">
            <div class="admin-form-field">
              <label>SEO title <span class="admin-muted">({{ form[`seo_title_${l.code}`].length }}/70, оптимально до ~60)</span></label>
              <InputText v-model="form[`seo_title_${l.code}`]" class="w-full" maxlength="70" />
            </div>
            <div class="admin-form-field">
              <label>SEO description <span class="admin-muted">({{ form[`seo_description_${l.code}`].length }}/160, оптимально до ~155)</span></label>
              <Textarea v-model="form[`seo_description_${l.code}`]" rows="3" class="w-full" maxlength="160" />
            </div>
            <div class="admin-form-field">
              <label>Так будет в выдаче</label>
              <div class="admin-card" style="padding: 12px">
                <div style="color: #1a0dab; font-size: 18px">{{ effective(l.code).title || '—' }}</div>
                <div class="admin-muted" style="font-size: 13px">triplandr.com/blog/{{ form.slug || 'slug' }}</div>
                <div style="font-size: 14px">{{ effective(l.code).description || '—' }}</div>
              </div>
            </div>
          </TabPanel>
        </TabView>
      </section>

      <div class="admin-toolbar">
        <Button label="Сохранить изменения" icon="pi pi-save" :loading="saving" @click="save" />
      </div>
    </template>
  </div>
</template>
