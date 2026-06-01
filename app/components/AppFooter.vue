<template>
  <footer class="footer">

    <!-- ── 1. STATS STRIP ────────────────────────────────── -->
    <div class="fstats">
      <div class="fstat">
        <span class="fstat-num">{{ fmt(stats?.totalReviews) }}</span>
        <span class="fstat-label">{{ $t('footer.stats.reviews') }}</span>
      </div>
      <div class="fstat-divider" />
      <div class="fstat">
        <span class="fstat-num">{{ fmt(stats?.totalCountries) }}</span>
        <span class="fstat-label">{{ $t('footer.stats.countries') }}</span>
      </div>
      <div class="fstat-divider" />
      <div class="fstat">
        <span class="fstat-num">{{ fmt(stats?.totalNationalities) }}</span>
        <span class="fstat-label">{{ $t('footer.stats.nationalities') }}</span>
      </div>
      <div class="fstat-divider" />
      <div class="fstat">
        <span class="fstat-num">{{ fmt(stats?.totalReviews ? Math.round(stats.totalReviews * 0.72) : undefined) }}</span>
        <span class="fstat-label">{{ $t('footer.stats.authors') }}</span>
      </div>
    </div>

    <!-- ── 2. FOOTER BODY ────────────────────────────────── -->
    <div class="fbody">

      <!-- Col 1 — Brand -->
      <div class="fcol fcol-brand">
        <div class="fbrand-logo">
          <div class="fbrand-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <span class="fbrand-name">Nation<span class="fbrand-accent">View</span></span>
        </div>
        <p class="fbrand-desc">{{ $t('footer.brand.description') }}</p>
        <div class="fnl">
          <span class="fnl-label">{{ $t('footer.newsletter.label') }}</span>
          <div class="fnl-row">
            <input
              v-model="email"
              class="fnl-input"
              type="email"
              :placeholder="$t('footer.newsletter.placeholder')"
              @keydown.enter="handleSubscribe"
            />
            <button class="fnl-btn" @click="handleSubscribe" :disabled="subscribing">
              {{ subscribing ? '...' : $t('footer.newsletter.button') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Col 2 — Popular countries -->
      <div class="fcol">
        <span class="fcol-title">{{ $t('footer.columns.popularCountries') }}</span>
        <div class="fcol-links">
          <template v-if="topCountries && topCountries.length">
            <NuxtLink
              v-for="code in topCountries"
              :key="code"
              :to="`/country/${code.toLowerCase()}`"
              class="fcol-link"
            >
              {{ getFlagEmoji(code) }} {{ getCountryNameLocalized(code) }}
            </NuxtLink>
          </template>
          <template v-else>
            <span v-for="i in 5" :key="i" class="fcol-link fcol-link--placeholder">
              &nbsp;
            </span>
          </template>
          <NuxtLink to="/countries" class="fcol-link fcol-link--dim">{{ $t('footer.links.allCountries') }}</NuxtLink>
        </div>
      </div>

      <!-- Col 3 — Categories -->
      <div class="fcol">
        <span class="fcol-title">{{ $t('footer.columns.categories') }}</span>
        <div class="fcol-links">
          <NuxtLink to="/countries?category=legalization" class="fcol-link">{{ $t('categories.legalization.name') }}</NuxtLink>
          <NuxtLink to="/countries?category=cost" class="fcol-link">{{ $t('categories.cost_of_living.name') }}</NuxtLink>
          <NuxtLink to="/countries?category=safety" class="fcol-link">{{ $t('categories.safety.name') }}</NuxtLink>
          <NuxtLink to="/countries?category=attitude" class="fcol-link">{{ $t('categories.attitude.name') }}</NuxtLink>
          <NuxtLink to="/countries?category=documents" class="fcol-link">
            {{ $t('categories.bureaucracy.name') }}
            <span class="fnew-badge">new</span>
          </NuxtLink>
          <NuxtLink to="/countries?category=weather" class="fcol-link">{{ $t('categories.weather.name') }}</NuxtLink>
        </div>
      </div>

      <!-- Col 4 — About -->
      <div class="fcol">
        <span class="fcol-title">{{ $t('footer.columns.about') }}</span>
        <div class="fcol-links">
          <NuxtLink to="/about" class="fcol-link">{{ $t('footer.links.howItWorks') }}</NuxtLink>
          <NuxtLink to="/review/new" class="fcol-link">{{ $t('footer.links.writeReview') }}</NuxtLink>
          <NuxtLink to="/rules" class="fcol-link">{{ $t('footer.links.rules') }}</NuxtLink>
          <NuxtLink to="/contact" class="fcol-link">{{ $t('footer.links.contact') }}</NuxtLink>
          <NuxtLink to="/privacy" class="fcol-link">{{ $t('footer.links.privacy') }}</NuxtLink>
        </div>
      </div>

    </div>

    <!-- ── 3. BOTTOM BAR ─────────────────────────────────── -->
    <div class="fbar">
      <span class="fbar-copy">
        © {{ year }} <span class="fbar-brand">NationView</span> — {{ $t('footer.copyright') }}
      </span>

      <div class="fbar-legal">
        <NuxtLink to="/terms" class="fbar-link">{{ $t('footer.links.terms') }}</NuxtLink>
        <NuxtLink to="/privacy" class="fbar-link">{{ $t('footer.links.privacy') }}</NuxtLink>
        <NuxtLink to="/privacy" class="fbar-link">{{ $t('footer.links.cookies') }}</NuxtLink>
      </div>

      <div class="fbar-social">
        <!-- Telegram -->
        <a href="https://t.me/nationview" target="_blank" rel="noopener" class="fsoc-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        </a>
        <!-- X / Twitter -->
        <a href="https://twitter.com/nationview" target="_blank" rel="noopener" class="fsoc-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
        <!-- Instagram -->
        <a href="https://instagram.com/nationview" target="_blank" rel="noopener" class="fsoc-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
      </div>
    </div>

    <!-- ── 4. DISCLAIMER ──────────────────────────────────── -->
    <div class="fdisclaimer">{{ $t('footer.disclaimer') }}</div>

    <Toast />
  </footer>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import { getFlagEmoji } from '~/utils/countries'
import { useFooterData } from '~/composables/useFooterData'

const { t } = useI18n()
const { getCountryNameLocalized } = useLocalizedCountries()
const toast = useToast()
const supabase = useSupabaseClient()
const { stats, topCountries, subscribeNewsletter } = useFooterData()

const year = new Date().getFullYear()
const email = ref('')
const subscribing = ref(false)

function fmt(n: number | undefined): string {
  if (n === undefined || n === null) return '—'
  return new Intl.NumberFormat('ru-RU').format(n)
}

async function handleSubscribe() {
  const val = email.value.trim()
  if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    toast.add({ severity: 'warn', summary: t('common.errors.invalidEmail'), life: 3000 })
    return
  }
  subscribing.value = true
  try {
    await subscribeNewsletter(val, supabase)
    email.value = ''
    toast.add({ severity: 'success', summary: t('common.success.subscribed'), life: 4000 })
  } catch (err: any) {
    if (err.message === 'already_subscribed') {
      toast.add({ severity: 'info', summary: t('common.success.alreadySubscribed'), life: 3000 })
    } else {
      toast.add({ severity: 'error', summary: t('common.errors.submitFailed'), life: 3000 })
    }
  } finally {
    subscribing.value = false
  }
}
</script>

<style scoped>
.footer {
  background: #1A1A2E;
  color: white;
  margin-top: auto;
}

/* ── Stats strip ─────────────────────────────────────────── */
.fstats {
  background: var(--color-primary);
  padding: 16px 32px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 12px;
  flex-wrap: wrap;
}
.fstat { text-align: center; }
.fstat-num { display: block; font-size: 22px; font-weight: 700; color: white; line-height: 1; }
.fstat-label { display: block; font-size: 11px; color: rgba(255,255,255,0.65); margin-top: 3px; }
.fstat-divider { width: 1px; height: 32px; background: rgba(255,255,255,0.2); flex-shrink: 0; }

/* ── Footer body ─────────────────────────────────────────── */
.fbody {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 32px;
  padding: 36px 32px 28px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.fcol { display: flex; flex-direction: column; }

/* Brand col */
.fbrand-logo { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.fbrand-icon {
  width: 30px; height: 30px;
  background: var(--color-primary);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.fbrand-name { font-size: 16px; font-weight: 700; color: white; }
.fbrand-accent { color: #9088E5; }
.fbrand-desc {
  font-size: 13px;
  color: rgba(255,255,255,0.5);
  line-height: 1.65;
  margin: 0 0 18px;
}

/* Newsletter */
.fnl {}
.fnl-label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.4);
  margin-bottom: 8px;
}
.fnl-row { display: flex; gap: 6px; }
.fnl-input {
  flex: 1;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  font-size: 13px;
  color: white;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
  min-width: 0;
}
.fnl-input::placeholder { color: rgba(255,255,255,0.3); }
.fnl-input:focus { border-color: rgba(255,255,255,0.3); }
.fnl-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: background 0.15s;
}
.fnl-btn:hover { background: var(--color-primary-hover); }
.fnl-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* Nav columns */
.fcol-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.4);
  margin-bottom: 14px;
}
.fcol-links { display: flex; flex-direction: column; gap: 9px; }
.fcol-link {
  font-size: 13px;
  color: rgba(255,255,255,0.55);
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s;
  display: flex;
  align-items: center;
  gap: 2px;
}
.fcol-link:hover { color: white; }
.fcol-link--dim { color: rgba(255,255,255,0.35) !important; }
.fcol-link--dim:hover { color: rgba(255,255,255,0.6) !important; }
.fcol-link--placeholder { color: transparent !important; user-select: none; }

.fnew-badge {
  font-size: 10px;
  font-weight: 600;
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-pill);
  padding: 1px 6px;
  margin-left: 5px;
  line-height: 1.6;
}

/* ── Bottom bar ──────────────────────────────────────────── */
.fbar {
  padding: 16px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}
.fbar-copy { font-size: 12px; color: rgba(255,255,255,0.3); }
.fbar-brand { color: rgba(255,255,255,0.5); }
.fbar-legal { display: flex; gap: 18px; }
.fbar-link {
  font-size: 12px;
  color: rgba(255,255,255,0.35);
  text-decoration: none;
  transition: opacity 0.15s;
}
.fbar-link:hover { opacity: 0.7; color: rgba(255,255,255,0.35); }
.fbar-social { display: flex; gap: 8px; }
.fsoc-btn {
  width: 30px; height: 30px;
  background: rgba(255,255,255,0.07);
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.5);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}
.fsoc-btn:hover { background: var(--color-primary); color: white; }

/* ── Disclaimer ──────────────────────────────────────────── */
.fdisclaimer {
  padding: 0 32px 16px;
  font-size: 11px;
  color: rgba(255,255,255,0.2);
  line-height: 1.6;
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 768px) {
  .fstats { gap: 16px; }
  .fstat-divider { display: none; }
  .fbody {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    padding: 24px 20px 20px;
  }
  .fcol-brand { grid-column: 1 / -1; }
  .fbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 20px;
  }
  .fdisclaimer { padding: 0 20px 16px; }
  .fstats { padding: 16px 20px; }
}
@media (max-width: 480px) {
  .fbody { grid-template-columns: 1fr; }
}
</style>
