<script setup lang="ts">
export type ArticleFields = {
  article_title_uk: string
  article_title_en: string
  article_title_ru: string
  article_excerpt_uk: string
  article_excerpt_en: string
  article_excerpt_ru: string
  article_body_uk: string
  article_body_en: string
  article_body_ru: string
}

const model = defineModel<ArticleFields & Record<string, unknown>>({ required: true })

const props = withDefaults(defineProps<{
  sectionTitle?: string
  sectionHint?: string
  bodyRows?: number
}>(), {
  sectionTitle: 'Статья',
  sectionHint: 'Абзацы разделяйте пустой строкой. Так текст появится на сайте.',
  bodyRows: 12,
})

const toast = useToast()
const previewLang = ref<'uk' | 'en' | 'ru'>('ru')
const showPreview = ref(true)

function paragraphs(body: string) {
  return body
    .split(/\n{2,}/)
    .map(b => b.replace(/^#{1,3}\s+/gm, '').replace(/\n+/g, ' ').trim())
    .filter(Boolean)
}

const preview = computed(() => {
  const m = model.value
  const lang = previewLang.value
  const title = String(m[`article_title_${lang}` as keyof ArticleFields] ?? '')
  const excerpt = String(m[`article_excerpt_${lang}` as keyof ArticleFields] ?? '')
  const body = String(m[`article_body_${lang}` as keyof ArticleFields] ?? '')
  return { title, excerpt, paragraphs: paragraphs(body) }
})

function translationStatus(lang: 'uk' | 'en' | 'ru') {
  const m = model.value
  const has = Boolean(
    m[`article_title_${lang}` as keyof ArticleFields]
    || m[`article_excerpt_${lang}` as keyof ArticleFields]
    || m[`article_body_${lang}` as keyof ArticleFields],
  )
  return has ? 'есть' : 'пусто'
}

function copyFromEn(target: 'uk' | 'ru') {
  const m = model.value
  if (!m.article_title_en && !m.article_excerpt_en && !m.article_body_en) {
    toast.add({ severity: 'warn', summary: 'Сначала заполните English', life: 2500 })
    return
  }
  const titleKey = `article_title_${target}` as keyof ArticleFields
  const excerptKey = `article_excerpt_${target}` as keyof ArticleFields
  const bodyKey = `article_body_${target}` as keyof ArticleFields
  const overwrite = Boolean(m[titleKey] || m[excerptKey] || m[bodyKey])
  if (overwrite && !confirm(`Заменить ${target.toUpperCase()} текст копией из English?`)) return
  ;(m as ArticleFields)[titleKey] = m.article_title_en
  ;(m as ArticleFields)[excerptKey] = m.article_excerpt_en
  ;(m as ArticleFields)[bodyKey] = m.article_body_en
  toast.add({ severity: 'success', summary: `Скопировано в ${target.toUpperCase()}`, life: 2000 })
}
</script>

<template>
  <section class="admin-card admin-section">
    <div class="admin-section-head">
      <div>
        <h2 class="admin-section-title">{{ sectionTitle }}</h2>
        <p class="admin-section-hint">{{ sectionHint }}</p>
      </div>
      <div class="admin-actions">
        <Button label="EN → UK" size="small" severity="secondary" outlined @click="copyFromEn('uk')" />
        <Button label="EN → RU" size="small" severity="secondary" outlined @click="copyFromEn('ru')" />
        <Button
          :label="showPreview ? 'Скрыть превью' : 'Превью'"
          size="small"
          text
          @click="showPreview = !showPreview"
        />
      </div>
    </div>

    <div class="admin-translation-status">
      <Tag :value="`UK: ${translationStatus('uk')}`" :severity="translationStatus('uk') === 'есть' ? 'success' : 'secondary'" />
      <Tag :value="`EN: ${translationStatus('en')}`" :severity="translationStatus('en') === 'есть' ? 'success' : 'secondary'" />
      <Tag :value="`RU: ${translationStatus('ru')}`" :severity="translationStatus('ru') === 'есть' ? 'success' : 'secondary'" />
    </div>

    <div class="admin-article-layout">
      <div>
        <TabView>
          <TabPanel header="Українська">
            <div class="admin-form-field">
              <label>Заголовок</label>
              <InputText v-model="model.article_title_uk" class="w-full" />
            </div>
            <div class="admin-form-field">
              <label>Короткий лид</label>
              <Textarea v-model="model.article_excerpt_uk" rows="3" class="w-full" />
            </div>
            <div class="admin-form-field">
              <label>Текст статьи</label>
              <Textarea v-model="model.article_body_uk" :rows="bodyRows" class="w-full" />
            </div>
          </TabPanel>
          <TabPanel header="English">
            <div class="admin-form-field">
              <label>Title</label>
              <InputText v-model="model.article_title_en" class="w-full" />
            </div>
            <div class="admin-form-field">
              <label>Excerpt</label>
              <Textarea v-model="model.article_excerpt_en" rows="3" class="w-full" />
            </div>
            <div class="admin-form-field">
              <label>Body</label>
              <Textarea v-model="model.article_body_en" :rows="bodyRows" class="w-full" />
            </div>
          </TabPanel>
          <TabPanel header="Русский">
            <div class="admin-form-field">
              <label>Заголовок</label>
              <InputText v-model="model.article_title_ru" class="w-full" />
            </div>
            <div class="admin-form-field">
              <label>Короткий лид</label>
              <Textarea v-model="model.article_excerpt_ru" rows="3" class="w-full" />
            </div>
            <div class="admin-form-field">
              <label>Текст статьи</label>
              <Textarea v-model="model.article_body_ru" :rows="bodyRows" class="w-full" />
            </div>
          </TabPanel>
        </TabView>
      </div>

      <aside v-if="showPreview" class="admin-article-preview">
        <div class="admin-preview-toolbar">
          <span class="admin-preview-label">Как на сайте</span>
          <div class="admin-actions">
            <Button
              v-for="opt in (['uk', 'en', 'ru'] as const)"
              :key="opt"
              :label="opt.toUpperCase()"
              size="small"
              :severity="previewLang === opt ? undefined : 'secondary'"
              :outlined="previewLang !== opt"
              @click="previewLang = opt"
            />
          </div>
        </div>
        <div v-if="preview.title || preview.excerpt || preview.paragraphs.length" class="admin-preview-body">
          <h3 v-if="preview.title">{{ preview.title }}</h3>
          <p v-if="preview.excerpt" class="admin-preview-excerpt">{{ preview.excerpt }}</p>
          <p v-for="(p, i) in preview.paragraphs" :key="i">{{ p }}</p>
        </div>
        <p v-else class="admin-section-hint">Пока пусто — начните с English или нужного языка.</p>
      </aside>
    </div>
  </section>
</template>
