<template>
  <Transition name="cb-slide">
    <div v-if="visible" class="cb-wrap">
      <div class="cb-inner">
        <div class="cb-text">
          <span class="cb-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
              <circle cx="8.5" cy="13.5" r="0.8" fill="currentColor"/>
              <circle cx="13" cy="16" r="0.8" fill="currentColor"/>
              <circle cx="15" cy="11" r="0.8" fill="currentColor"/>
            </svg>
          </span>
          <p>{{ $t('common.cookie.text') }}
            <NuxtLinkLocale to="/privacy" class="cb-link">{{ $t('common.cookie.policy') }}</NuxtLinkLocale>.
          </p>
        </div>
        <div class="cb-actions">
          <button class="cb-btn cb-btn--decline" @click="decline">{{ $t('common.cookie.decline') }}</button>
          <button class="cb-btn cb-btn--accept" @click="accept">{{ $t('common.cookie.accept') }}</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const COOKIE_KEY = 'cookie_consent'
const consent = useCookie(COOKIE_KEY, { maxAge: 60 * 60 * 24 * 365 })
const visible = ref(false)

onMounted(() => {
  if (!consent.value) visible.value = true
})

function accept() {
  consent.value = 'accepted'
  visible.value = false
}

function decline() {
  consent.value = 'declined'
  visible.value = false
}
</script>

<style scoped>
.cb-wrap {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 48px);
  max-width: 720px;
  z-index: 9999;
}
.cb-inner {
  background: #1e1b3a;
  color: #fff;
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.28);
  flex-wrap: wrap;
}
.cb-text {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}
.cb-icon {
  width: 36px; height: 36px; flex-shrink: 0;
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #9088E5;
}
.cb-text p {
  margin: 0;
  font-size: 13px;
  color: rgba(255,255,255,0.85);
  line-height: 1.5;
}
.cb-link {
  color: #9088E5;
  text-decoration: underline;
}
.cb-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.cb-btn {
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  border-radius: var(--radius-md);
  padding: 8px 18px;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s;
  white-space: nowrap;
}
.cb-btn:hover { opacity: 0.85; }
.cb-btn--decline {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.7);
}
.cb-btn--accept {
  background: #534AB7;
  color: #fff;
}

.cb-slide-enter-active,
.cb-slide-leave-active { transition: all 0.15s ease; }
.cb-slide-enter-from,
.cb-slide-leave-to { opacity: 0; transform: translateX(-50%) translateY(16px); }

@media (max-width: 600px) {
  .cb-wrap { bottom: 12px; width: calc(100% - 24px); }
  .cb-inner { flex-direction: column; align-items: flex-start; }
  .cb-actions { width: 100%; }
  .cb-btn { flex: 1; text-align: center; }
}
</style>
