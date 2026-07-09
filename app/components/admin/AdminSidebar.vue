<template>
  <nav class="admin-nav">
    <NuxtLink to="/admin" class="admin-nav-link">
      <i class="pi pi-chart-bar" /> Dashboard
    </NuxtLink>
    <NuxtLink to="/admin/reviews" class="admin-nav-link">
      <i class="pi pi-comments" /> Отзывы
    </NuxtLink>
    <NuxtLink to="/admin/cities" class="admin-nav-link">
      <i class="pi pi-map-marker" /> Города
    </NuxtLink>
    <NuxtLink to="/admin/countries" class="admin-nav-link">
      <i class="pi pi-globe" /> Страны
    </NuxtLink>
    <NuxtLink to="/admin/newsletter" class="admin-nav-link">
      <i class="pi pi-envelope" /> Newsletter
    </NuxtLink>
    <NuxtLink to="/admin/moderation-log" class="admin-nav-link">
      <i class="pi pi-history" /> Журнал
    </NuxtLink>
  </nav>
</template>
