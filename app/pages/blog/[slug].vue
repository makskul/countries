<script setup lang="ts">
import type { BlogPostRow } from '~/types/blog'
import { APP_NAME, APP_URL } from '~/utils/appConfig'
import { renderMarkdown } from '~/utils/markdown'

const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const supabase = useSupabaseClient()
const { pick, formatDate, readingMinutes } = useBlogLocale()

const slug = computed(() => String(route.params.slug ?? '').toLowerCase())

const { data: post } = await useAsyncData(`blog-post-${slug.value}`, async () => {
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug.value)
    .eq('status', 'published')
    .maybeSingle()
  return (data ?? null) as unknown as BlogPostRow | null
})

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: t('blog.notFound'), fatal: true })
}

const title = computed(() => (post.value ? pick(post.value, 'title') : ''))
const excerpt = computed(() => (post.value ? pick(post.value, 'excerpt') : ''))
const bodyHtml = computed(() => (post.value ? renderMarkdown(pick(post.value, 'body')) : ''))
const minutes = computed(() => (post.value ? readingMinutes(pick(post.value, 'body')) : 1))

// Meta: explicit SEO override → post title / excerpt
const seoTitle = computed(() => (post.value ? pick(post.value, 'seo_title') : '') || title.value)
const seoDescription = computed(() => (post.value ? pick(post.value, 'seo_description') : '') || excerpt.value)
const ogImage = computed(() => {
  const img = post.value?.og_image_url || post.value?.cover_image_url || '/og/home.png'
  return img.startsWith('http') ? img : APP_URL + img
})
const canonical = computed(() => `${APP_URL}${localePath(`/blog/${slug.value}`)}`)

useSeoMeta({
  title: () => `${seoTitle.value} — ${APP_NAME}`,
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogImage: () => ogImage.value,
  ogUrl: () => canonical.value,
  ogType: 'article',
  articlePublishedTime: () => post.value?.published_at ?? undefined,
  articleModifiedTime: () => post.value?.updated_at ?? undefined,
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: canonical }],
  script: [{
    type: 'application/ld+json',
    innerHTML: computed(() => JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: seoTitle.value,
      description: seoDescription.value,
      image: ogImage.value,
      datePublished: post.value?.published_at,
      dateModified: post.value?.updated_at,
      author: { '@type': post.value?.author_name ? 'Person' : 'Organization', name: post.value?.author_name || APP_NAME },
      publisher: { '@type': 'Organization', name: APP_NAME, url: APP_URL },
      mainEntityOfPage: canonical.value,
    })).value,
  }],
})
</script>

<template>
  <article v-if="post" class="post-wrap">
    <NuxtLinkLocale to="/blog" class="post-back">← {{ $t('blog.back') }}</NuxtLinkLocale>
    <h1 class="post-title">{{ title }}</h1>
    <p class="post-meta">
      <time v-if="post.published_at" :datetime="post.published_at">{{ formatDate(post.published_at) }}</time>
      <span v-if="post.author_name"> · {{ $t('blog.by', { name: post.author_name }) }}</span>
      <span> · {{ $t('blog.minRead', { n: minutes }) }}</span>
    </p>
    <img v-if="post.cover_image_url" :src="post.cover_image_url" :alt="post.cover_alt || title" class="post-cover">
    <p v-if="excerpt" class="post-excerpt">{{ excerpt }}</p>
    <!-- eslint-disable-next-line vue/no-v-html -- output of renderMarkdown(): input is HTML-escaped, URLs are allow-listed -->
    <div class="post-body" v-html="bodyHtml" />
  </article>
</template>

<style scoped>
.post-wrap { max-width: 760px; margin: 0 auto; padding: 28px 20px 72px; }
.post-back { display: inline-block; margin-bottom: 18px; color: var(--color-text-secondary); text-decoration: none; font-size: 14px; }
.post-title { margin: 0 0 10px; font-size: 2.1rem; line-height: 1.2; font-weight: 800; color: var(--color-text); }
.post-meta { margin: 0 0 20px; font-size: 14px; color: var(--color-text-secondary); }
.post-cover { width: 100%; border-radius: 14px; margin-bottom: 22px; display: block; }
.post-excerpt { font-size: 1.1rem; line-height: 1.6; color: var(--color-text-secondary); margin: 0 0 22px; }
.post-body :deep(p), .post-body :deep(ul), .post-body :deep(ol), .post-body :deep(blockquote) { margin: 0 0 16px; line-height: 1.75; font-size: 16px; color: var(--color-text); }
.post-body :deep(h2) { margin: 32px 0 12px; font-size: 1.5rem; line-height: 1.3; }
.post-body :deep(h3) { margin: 26px 0 10px; font-size: 1.25rem; }
.post-body :deep(h4) { margin: 22px 0 8px; font-size: 1.1rem; }
.post-body :deep(ul), .post-body :deep(ol) { padding-left: 22px; }
.post-body :deep(li) { margin-bottom: 6px; }
.post-body :deep(a) { color: var(--color-primary, #534ab7); text-decoration: underline; }
.post-body :deep(img) { max-width: 100%; border-radius: 10px; margin: 8px 0 16px; }
.post-body :deep(blockquote) { padding: 4px 16px; border-left: 3px solid var(--color-border); color: var(--color-text-secondary); }
.post-body :deep(code) { background: #f3f3f7; padding: 1px 5px; border-radius: 4px; font-size: 0.92em; }
</style>
