<script setup lang="ts">
import type { BlogPostRow } from '~/types/blog'
import { APP_NAME, APP_URL } from '~/utils/appConfig'

const { t } = useI18n()
const localePath = useLocalePath()
const supabase = useSupabaseClient()
const { pick, formatDate } = useBlogLocale()

const { data: posts } = await useAsyncData('blog-list', async () => {
  const { data } = await supabase
    .from('blog_posts')
    .select('id, slug, published_at, cover_image_url, cover_alt, title_uk, title_en, title_ru, excerpt_uk, excerpt_en, excerpt_ru')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(100)
  return (data ?? []) as unknown as BlogPostRow[]
})

const title = computed(() => `${t('blog.title')} — ${APP_NAME}`)
const canonical = computed(() => `${APP_URL}${localePath('/blog')}`)

useSeoMeta({
  title: () => title.value,
  description: () => t('blog.description'),
  ogTitle: () => title.value,
  ogDescription: () => t('blog.description'),
  ogImage: APP_URL + '/og/home.png',
  ogUrl: () => canonical.value,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})
useHead({ link: [{ rel: 'canonical', href: canonical }] })
</script>

<template>
  <div class="blog-wrap">
    <h1 class="blog-h1">{{ $t('blog.listHeading') }}</h1>
    <p class="blog-lead">{{ $t('blog.listLead') }}</p>

    <p v-if="!posts?.length" class="blog-empty">{{ $t('blog.empty') }}</p>

    <ul v-else class="blog-list">
      <li v-for="p in posts" :key="p.id" class="blog-card">
        <NuxtLink :to="localePath(`/blog/${p.slug}`)" class="blog-card-link">
          <img v-if="p.cover_image_url" :src="p.cover_image_url" :alt="p.cover_alt || ''" class="blog-card-cover" loading="lazy">
          <div class="blog-card-body">
            <time v-if="p.published_at" :datetime="p.published_at" class="blog-date">{{ formatDate(p.published_at) }}</time>
            <h2 class="blog-card-title">{{ pick(p, 'title') }}</h2>
            <p v-if="pick(p, 'excerpt')" class="blog-card-excerpt">{{ pick(p, 'excerpt') }}</p>
            <span class="blog-more">{{ $t('blog.readMore') }} →</span>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.blog-wrap { max-width: 860px; margin: 0 auto; padding: 32px 20px 64px; }
.blog-h1 { margin: 0 0 8px; font-size: 2rem; font-weight: 800; color: var(--color-text); }
.blog-lead { margin: 0 0 28px; color: var(--color-text-secondary); font-size: 16px; }
.blog-empty { color: var(--color-text-secondary); }
.blog-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 18px; }
.blog-card { border: 1px solid var(--color-border); border-radius: 14px; overflow: hidden; background: #fff; }
.blog-card-link { display: grid; grid-template-columns: 1fr; color: inherit; text-decoration: none; }
.blog-card-cover { width: 100%; max-height: 260px; object-fit: cover; display: block; }
.blog-card-body { padding: 18px 20px 20px; }
.blog-date { font-size: 13px; color: var(--color-text-secondary); }
.blog-card-title { margin: 6px 0 8px; font-size: 1.3rem; line-height: 1.3; color: var(--color-text); }
.blog-card-excerpt { margin: 0 0 12px; line-height: 1.55; color: var(--color-text-secondary); }
.blog-more { font-weight: 600; color: var(--color-primary, #534ab7); }
.blog-card:hover { border-color: var(--color-primary, #534ab7); }
@media (min-width: 720px) {
  .blog-card-link { grid-template-columns: 260px 1fr; }
  .blog-card-cover { height: 100%; max-height: none; }
}
</style>
