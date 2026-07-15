<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

useSeoMeta({ robots: 'noindex, nofollow' })

const { data: stats, pending } = await useAsyncData('admin-stats', () =>
  useAdminFetch<{
    pending: number
    reviewsToday: number
    reviewsWeek: number
    reviewsMonth: number
    newsletterCount: number
    topCountries: { code: string; count: number }[]
  }>('/api/admin/stats'),
)
</script>

<template>
  <div>
    <h1 class="admin-page-title">Обзор</h1>
    <p class="admin-page-lead">
      Краткая статистика и быстрые ссылки для ведения сайта без кода.
    </p>

    <div v-if="pending" class="admin-stats-grid">
      <Skeleton v-for="i in 5" :key="i" height="90px" />
    </div>
    <div v-else-if="stats" class="admin-stats-grid">
      <div class="admin-stat-card">
        <div class="admin-stat-label">Ожидают модерации</div>
        <div class="admin-stat-value">{{ stats.pending }}</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-label">Отзывы сегодня</div>
        <div class="admin-stat-value">{{ stats.reviewsToday }}</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-label">За 7 дней</div>
        <div class="admin-stat-value">{{ stats.reviewsWeek }}</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-label">За 30 дней</div>
        <div class="admin-stat-value">{{ stats.reviewsMonth }}</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-label">Подписчики</div>
        <div class="admin-stat-value">{{ stats.newsletterCount }}</div>
      </div>
    </div>

    <div v-if="stats?.pending" class="admin-card mb-4">
      <p style="margin: 0 0 12px">
        {{ stats.pending }} отзыв(ов) ждут модерации.
      </p>
      <NuxtLink to="/admin/reviews?status=pending">
        <Button label="Открыть очередь" icon="pi pi-arrow-right" icon-pos="right" />
      </NuxtLink>
    </div>

    <div class="admin-card admin-help-card">
      <h2 style="font-size: 15px; margin: 0 0 12px">Что править</h2>
      <ul>
        <li>
          <NuxtLink to="/admin/countries">Страны и статьи</NuxtLink>
          — справка, виза, текст «О стране»
        </li>
        <li>
          <NuxtLink to="/admin/cities">Города</NuxtLink>
          — названия и статья «О городе»
        </li>
        <li>
          <NuxtLink to="/admin/reviews">Отзывы</NuxtLink>
          — одобрить, отклонить или отредактировать
        </li>
        <li>
          <NuxtLink to="/admin/newsletter">Рассылка</NuxtLink>
          — список подписчиков
        </li>
      </ul>
    </div>

    <div v-if="stats?.topCountries.length" class="admin-card" style="margin-top: 20px">
      <h2 style="font-size: 15px; margin: 0 0 12px">Топ стран по отзывам</h2>
      <ul style="margin: 0; padding-left: 18px">
        <li v-for="c in stats.topCountries" :key="c.code">
          <NuxtLink :to="`/admin/countries/${c.code}`">{{ c.code }}</NuxtLink> — {{ c.count }}
        </li>
      </ul>
    </div>
  </div>
</template>
