<template>
  <nav class="app-navbar">
    <div class="nav-inner">
      <!-- Logo -->
      <NuxtLinkLocale to="/" class="nav-logo">
        <div class="nav-logo-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <span class="nav-logo-text">Triplan<span class="nav-logo-accent">dr</span></span>
      </NuxtLinkLocale>

      <!-- Desktop nav links (hidden ≤800px) -->
      <div class="nav-links">
        <NuxtLinkLocale to="/countries">{{ $t('nav.links.countries') }}</NuxtLinkLocale>
        <NuxtLinkLocale to="/categories">{{ $t('nav.links.categories') }}</NuxtLinkLocale>
        <NuxtLinkLocale to="/compare">{{ $t('nav.links.compare') }}</NuxtLinkLocale>
        <NuxtLinkLocale to="/about">{{ $t('nav.links.about') }}</NuxtLinkLocale>
      </div>

      <!-- Right side -->
      <div class="nav-right">
        <!-- LangSwitcher: visible >600px, moves to mobile menu ≤600px -->
        <div class="nav-lang-desktop">
          <LangSwitcher />
        </div>
        <!-- CTA: always visible -->
        <NuxtLinkLocale to="/review/new" class="nav-cta">{{ $t('nav.cta') }}</NuxtLinkLocale>
        <!-- Hamburger: visible ≤800px -->
        <button class="nav-burger" @click="toggleMenu">
          <i :class="menuOpen ? 'pi pi-times' : 'pi pi-bars'" />
        </button>
      </div>
    </div>

    <!-- Dark overlay -->
    <Transition name="fade">
      <div v-if="menuOpen" class="nav-overlay" @click="closeMenu" />
    </Transition>

    <!-- Mobile dropdown -->
    <Transition name="slide">
      <div v-if="menuOpen" class="nav-mobile">
        <div class="nav-mobile-inner">
          <NuxtLinkLocale to="/countries" class="nav-mobile-link" @click="closeMenu">
            <i class="pi pi-globe" />{{ $t('nav.links.countries') }}
          </NuxtLinkLocale>
          <NuxtLinkLocale to="/categories" class="nav-mobile-link" @click="closeMenu">
            <i class="pi pi-list" />{{ $t('nav.links.categories') }}
          </NuxtLinkLocale>
          <NuxtLinkLocale to="/compare" class="nav-mobile-link" @click="closeMenu">
            <i class="pi pi-chart-bar" />{{ $t('nav.links.compare') }}
          </NuxtLinkLocale>
          <NuxtLinkLocale to="/about" class="nav-mobile-link" @click="closeMenu">
            <i class="pi pi-info-circle" />{{ $t('nav.links.about') }}
          </NuxtLinkLocale>

          <!-- LangSwitcher: only in mobile menu ≤600px -->
          <div class="nav-mobile-lang">
            <div class="nav-mobile-divider" />
            <div class="nav-mobile-lang-row">
              <span class="nav-mobile-lang-label">{{ $t('nav.language') }}</span>
              <LangSwitcher />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
const menuOpen = ref(false)
const route = useRoute()

function toggleMenu() {
  menuOpen.value = !menuOpen.value
  if (import.meta.client) {
    document.body.style.overflow = menuOpen.value ? 'hidden' : ''
  }
}

function closeMenu() {
  menuOpen.value = false
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
}

// Close on route change
watch(() => route.path, () => closeMenu())

// Cleanup on unmount
onUnmounted(() => {
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<style scoped>
/* Navbar sits above everything */
.app-navbar {
  position: sticky;
  top: 0;
  z-index: 200;
  background: #fff;
  border-bottom: 1px solid var(--color-border);
}

.nav-inner {
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 28px;
  gap: 16px;
  position: relative;
  z-index: 201; /* above overlay */
}

/* Logo */
.nav-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; flex-shrink: 0; }
.nav-logo-icon {
  width: 30px; height: 30px; background: var(--color-primary);
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
}
.nav-logo-text { font-size: 16px; font-weight: 600; color: var(--color-text); letter-spacing: -0.01em; }
.nav-logo-accent { color: var(--color-primary); }

/* Desktop nav links */
.nav-links { display: flex; align-items: center; gap: 28px; flex: 1; justify-content: center; }
.nav-links a {
  font-size: 13px; font-weight: 400;
  color: var(--color-text-secondary); text-decoration: none; transition: color 0.15s;
}
.nav-links a:hover { color: var(--color-primary); }

/* Right side */
.nav-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

/* CTA */
.nav-cta {
  background: var(--color-primary); color: #fff !important;
  border-radius: var(--radius-pill); padding: 7px 16px;
  font-size: 13px; font-weight: 500; text-decoration: none;
  transition: background 0.15s; white-space: nowrap;
}
.nav-cta:hover { background: var(--color-primary-hover); color: #fff !important; }

/* Hamburger */
.nav-burger {
  display: none;
  background: none; border: none; cursor: pointer;
  padding: 6px 8px; color: var(--color-text);
  font-size: 18px; border-radius: var(--radius-sm);
  transition: background 0.15s; flex-shrink: 0;
}
.nav-burger:hover { background: var(--color-bg-secondary); }

/* Dark overlay — sits between navbar and page content */
.nav-overlay {
  position: fixed;
  top: 58px; /* starts below navbar */
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 46, 0.45);
  z-index: 198;
  cursor: pointer;
}

/* Mobile dropdown — above overlay */
.nav-mobile {
  position: absolute;
  top: 58px;
  left: 0;
  right: 0;
  background: #fff;
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 8px 24px rgba(83, 74, 183, 0.12);
  z-index: 199;
}
.nav-mobile-inner {
  max-width: 1200px; margin: 0 auto;
  padding: 8px 20px 16px;
  display: flex; flex-direction: column;
}
.nav-mobile-link {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 10px;
  font-size: 15px; font-weight: 500;
  color: var(--color-text-secondary); text-decoration: none;
  border-radius: var(--radius-md);
  transition: background 0.15s, color 0.15s;
}
.nav-mobile-link i { font-size: 16px; color: var(--color-primary-mid); width: 20px; }
.nav-mobile-link:hover { background: var(--color-bg-secondary); color: var(--color-primary); }

/* Lang in mobile — hidden by default, shown ≤600px */
.nav-mobile-lang { display: none; }
.nav-mobile-divider { height: 1px; background: var(--color-border); margin: 4px 0 8px; }
.nav-mobile-lang-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; }
.nav-mobile-lang-label { font-size: 13px; color: var(--color-text-muted); }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }

/* ≤800px: hamburger appears, desktop nav links hide */
@media (max-width: 800px) {
  .nav-links { display: none; }
  .nav-burger { display: flex; align-items: center; justify-content: center; }
}

/* ≤600px: LangSwitcher moves from header to mobile menu */
@media (max-width: 600px) {
  .nav-lang-desktop { display: none; }
  .nav-mobile-lang { display: block; }
  .nav-inner { padding: 0 16px; }
}
</style>
