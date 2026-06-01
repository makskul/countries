<template>
  <nav class="app-navbar">
    <div class="nav-inner">
      <!-- Logo -->
      <NuxtLink to="/" class="nav-logo">
        <div class="nav-logo-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <span class="nav-logo-text">Nation<span class="nav-logo-accent">View</span></span>
      </NuxtLink>

      <!-- Center nav links -->
      <div class="nav-links">
        <NuxtLink to="/countries">{{ $t('nav.links.countries') }}</NuxtLink>
        <NuxtLink to="/categories">{{ $t('nav.links.categories') }}</NuxtLink>
        <NuxtLink to="/about">{{ $t('nav.links.about') }}</NuxtLink>
      </div>

      <!-- Lang switcher + Right CTA -->
      <LangSwitcher />
      <NuxtLink to="/review/new" class="nav-cta">{{ $t('nav.cta') }}</NuxtLink>
    </div>
  </nav>
</template>

<style scoped>
.app-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid var(--color-border);
  height: 58px;
  display: flex;
  align-items: center;
}
.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 28px;
  gap: 24px;
}
.nav-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;
}
.nav-logo-icon {
  width: 30px;
  height: 30px;
  background: var(--color-primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}
.nav-logo-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.01em;
}
.nav-logo-accent {
  color: var(--color-primary);
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
  flex: 1;
  justify-content: center;
}
.nav-links a {
  font-size: 13px;
  font-weight: 400;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.15s;
}
.nav-links a:hover {
  color: var(--color-primary);
}
.nav-cta {
  background: var(--color-primary);
  color: #fff !important;
  border-radius: var(--radius-pill);
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}
.nav-cta:hover {
  background: var(--color-primary-hover);
  color: #fff !important;
}
@media (max-width: 640px) {
  .nav-links { display: none; }
  .nav-inner { padding: 0 16px; }
}
</style>
