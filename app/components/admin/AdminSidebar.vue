<template>
  <nav class="admin-nav">
    <NuxtLink to="/admin" class="admin-nav-link">
      <i class="pi pi-chart-bar" /> Обзор
    </NuxtLink>

    <div class="admin-nav-group">Контент</div>
    <NuxtLink to="/admin/countries" class="admin-nav-link">
      <i class="pi pi-globe" /> Страны и статьи
    </NuxtLink>
    <NuxtLink to="/admin/cities" class="admin-nav-link">
      <i class="pi pi-map-marker" /> Города
    </NuxtLink>

    <div class="admin-nav-group">Модерация</div>
    <NuxtLink to="/admin/reviews" class="admin-nav-link">
      <i class="pi pi-comments" /> Отзывы
    </NuxtLink>
    <NuxtLink to="/admin/moderation-log" class="admin-nav-link">
      <i class="pi pi-history" /> Журнал
    </NuxtLink>

    <div class="admin-nav-group">Прочее</div>
    <NuxtLink to="/admin/newsletter" class="admin-nav-link">
      <i class="pi pi-envelope" /> Рассылка
    </NuxtLink>
  </nav>
</template>
