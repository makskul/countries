<template>
  <div class="rn-page">

    <!-- BREADCRUMB -->
    <div class="breadcrumb">
      <NuxtLink to="/" class="bc-link">Главная</NuxtLink>
      <span class="bc-sep">→</span>
      <span class="bc-current">Написать отзыв</span>
    </div>

    <div class="rn-body">

      <!-- ═══════ MAIN COLUMN ═══════ -->
      <div class="rn-main">

        <!-- STEP INDICATOR + SELECTORS -->
        <div class="step-card">
          <!-- Steps -->
          <div class="steps">
            <div class="step-item">
              <div class="step-circle" :class="step > 1 || submitSuccess ? 'done' : step === 1 ? 'active' : 'pending'">
                <span v-if="step > 1 || submitSuccess">✓</span>
                <span v-else>1</span>
              </div>
              <span class="step-label">О себе</span>
            </div>
            <div class="step-line" :class="step > 1 ? 'done' : ''" />
            <div class="step-item">
              <div class="step-circle" :class="submitSuccess ? 'done' : step >= 2 ? 'active' : 'pending'">
                <span v-if="submitSuccess">✓</span>
                <span v-else>2</span>
              </div>
              <span class="step-label">Оценки</span>
            </div>
            <div class="step-line" :class="submitSuccess ? 'done' : ''" />
            <div class="step-item">
              <div class="step-circle" :class="submitSuccess ? 'done' : 'pending'">
                <span v-if="submitSuccess">✓</span>
                <span v-else>3</span>
              </div>
              <span class="step-label">Готово</span>
            </div>
          </div>

          <!-- Country + Nationality selectors -->
          <div class="selectors-grid">
            <div>
              <label class="field-label">Страна о которой пишешь *</label>
              <CountrySelector v-model="form.country" />
            </div>
            <div>
              <label class="field-label">Твоя национальность *</label>
              <NationalitySelector v-model="form.nationality" />
            </div>
          </div>
        </div>

        <!-- SUCCESS STATE -->
        <div v-if="submitSuccess" class="success-card">
          <div class="success-icon">🎉</div>
          <h2 class="success-title">Отзыв отправлен!</h2>
          <p class="success-sub">Перенаправляем на страницу страны...</p>
        </div>

        <!-- RATINGS CARD -->
        <div v-else class="ratings-card">
          <div class="ratings-header">
            <span class="ratings-title">Оцени по категориям</span>
            <span class="ratings-sub">Хотя бы одна категория обязательна. Остальные — по желанию.</span>
          </div>

          <CategoryRatingRow
            v-for="cat in FORM_CATEGORIES"
            :key="cat.key"
            :category="cat"
            :modelValue="(form.ratings as any)[cat.key]"
            :comment="(form.comments as any)[cat.key]"
            :expanded="(expanded as any)[cat.key]"
            @update:modelValue="(form.ratings as any)[cat.key] = $event"
            @update:comment="(form.comments as any)[cat.key] = $event"
            @toggle="toggleExpand(cat.key)"
          >
            <template #icon>
              <!-- shield: legalization -->
              <svg v-if="cat.icon === 'shield'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
              <!-- users: attitude -->
              <svg v-else-if="cat.icon === 'users'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <!-- dollar: cost_of_living -->
              <svg v-else-if="cat.icon === 'dollar'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <!-- shield2: safety -->
              <svg v-else-if="cat.icon === 'shield2'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <!-- clipboard: bureaucracy -->
              <svg v-else-if="cat.icon === 'clipboard'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
              <!-- cloud: weather -->
              <svg v-else-if="cat.icon === 'cloud'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
              <!-- chat: language_barrier -->
              <svg v-else-if="cat.icon === 'chat'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <!-- sparkle: cleanliness -->
              <svg v-else-if="cat.icon === 'sparkle'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
              <!-- heart: healthcare -->
              <svg v-else-if="cat.icon === 'heart'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <!-- star: overall -->
              <svg v-else-if="cat.icon === 'star'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <!-- fallback -->
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8"><circle cx="12" cy="12" r="10"/></svg>
            </template>
          </CategoryRatingRow>

          <!-- Bottom actions -->
          <div class="actions-row">
            <div class="anon-notice">
              <span class="anon-check">✓</span>
              <span class="anon-text">Отзыв анонимный — имя не публикуется</span>
            </div>
            <div class="actions-btns">
              <button class="btn-secondary" @click="router.back()">Отмена</button>
              <button
                class="btn-primary"
                :class="{ 'btn-disabled': !isValid }"
                :disabled="!isValid || submitting"
                @click="submit"
              >
                {{ submitting ? 'Отправка...' : 'Отправить отзыв →' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════ SIDEBAR ═══════ -->
      <div class="rn-sidebar">

        <!-- Live preview -->
        <div class="preview-card">
          <div class="preview-title">👁 Предпросмотр</div>

          <div v-if="form.country" class="preview-country">
            <span class="preview-flag">{{ getFlagEmoji(form.country) }}</span>
            <span class="preview-name">{{ getCountryName(form.country) }}</span>
          </div>
          <div v-else class="preview-empty-row">Страна не выбрана</div>

          <div v-if="form.nationality" class="preview-nat">
            {{ getFlagEmoji(form.nationality) }}
            <span class="preview-nat-pill">{{ getCountryName(form.nationality) }}</span>
          </div>

          <div class="preview-cats">
            <template v-if="hasAnyRating">
              <div v-for="cat in FORM_CATEGORIES" :key="cat.key" class="preview-cat-row">
                <template v-if="(form.ratings as any)[cat.key] > 0">
                  <span class="preview-cat-name">{{ cat.name }}</span>
                  <span class="preview-stars">{{ '★'.repeat((form.ratings as any)[cat.key]) }}{{ '☆'.repeat(5 - (form.ratings as any)[cat.key]) }}</span>
                </template>
              </div>
            </template>
            <span v-else class="preview-hint">Начни оценивать →</span>
          </div>
        </div>

        <!-- Tips -->
        <div class="tips-card">
          <span class="tips-title">Советы</span>
          <div class="tips-list">
            <div v-for="(tip, i) in TIPS" :key="i" class="tip-row">
              <span class="tip-num">{{ i + 1 }}</span>
              <span class="tip-text">{{ tip }}</span>
            </div>
          </div>
        </div>

        <!-- Country stats -->
        <div v-if="form.country && countryStats" class="stats-card">
          <div class="stats-title">
            {{ getFlagEmoji(form.country) }} {{ countryStats.total }} отзывов о {{ getCountryName(form.country) }}
          </div>
          <p class="stats-text">
            Уже есть {{ countryStats.natCount }} отзывов от
            {{ form.nationality ? getCountryName(form.nationality) : 'твоей нации' }}.
            Твой опыт будет ценным дополнением.
          </p>
        </div>
      </div>
    </div>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import { getFlagEmoji, getCountryName } from '~/utils/countries'
import { useReviewForm } from '~/composables/useReviewForm'

const router = useRouter()

const {
  form,
  isValid,
  step,
  expanded,
  toggleExpand,
  submitting,
  submitSuccess,
  submit,
  countryStats,
  FORM_CATEGORIES,
} = useReviewForm()

const hasAnyRating = computed(() => Object.values(form.ratings).some(r => r > 0))

const TIPS = [
  "Пиши конкретно — «4 месяца» лучше чем «долго»",
  "Не обязательно заполнять все категории",
  "Отзыв анонимный — имя нигде не появится",
  "Отзыв появится сразу после отправки",
]
</script>

<style scoped>
.rn-page { background: var(--color-bg-secondary); min-height: 100vh; }

/* Breadcrumb */
.breadcrumb { padding: 12px 24px; font-size: 12px; display: flex; align-items: center; gap: 6px; }
.bc-link { color: var(--color-primary); text-decoration: none; }
.bc-link:hover { text-decoration: underline; }
.bc-sep { color: var(--color-text-muted); }
.bc-current { color: var(--color-text-secondary); }

/* Layout */
.rn-body {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 16px;
  padding: 0 24px 32px;
  align-items: start;
  max-width: 1100px;
  margin: 0 auto;
}

/* STEP CARD */
.step-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  margin-bottom: 14px;
}
.steps {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.step-item { display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0; }
.step-circle {
  width: 24px; height: 24px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 600;
}
.step-circle.done    { background: var(--color-success); color: #fff; }
.step-circle.active  { background: var(--color-primary); color: #fff; }
.step-circle.pending { background: var(--color-bg-tertiary); color: var(--color-text-muted); }
.step-label { font-size: 11px; font-weight: 500; color: var(--color-text-muted); white-space: nowrap; }
.step-line { flex: 1; height: 1px; background: var(--color-border); margin: 0 8px; margin-bottom: 16px; }
.step-line.done { background: var(--color-success); }

.selectors-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.field-label {
  display: block;
  font-size: 12px; font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 5px;
}

/* RATINGS CARD */
.ratings-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
}
.ratings-header { margin-bottom: 18px; }
.ratings-title { display: block; font-size: 15px; font-weight: 600; color: var(--color-text); margin-bottom: 4px; }
.ratings-sub { font-size: 12px; color: var(--color-text-muted); }

/* Actions */
.actions-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid var(--color-border);
  padding-top: 14px;
  margin-top: 6px;
  flex-wrap: wrap;
}
.anon-notice { display: flex; align-items: center; gap: 6px; }
.anon-check {
  width: 16px; height: 16px;
  background: var(--color-success-light);
  color: var(--color-success);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 9px; font-weight: 700; flex-shrink: 0;
}
.anon-text { font-size: 12px; color: var(--color-text-muted); }
.actions-btns { display: flex; gap: 8px; }
.btn-secondary {
  background: #fff; color: var(--color-text-secondary);
  border: 1px solid var(--color-border); border-radius: var(--radius-md);
  padding: 9px 18px; font-size: 13px; cursor: pointer; font-family: inherit;
  transition: background 0.15s;
}
.btn-secondary:hover { background: var(--color-bg-secondary); }
.btn-primary {
  background: var(--color-primary); color: #fff;
  border: none; border-radius: var(--radius-md);
  padding: 9px 20px; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: inherit; transition: background 0.15s;
  white-space: nowrap;
}
.btn-primary:hover:not(.btn-disabled) { background: var(--color-primary-hover); }
.btn-disabled { opacity: 0.5; cursor: not-allowed; }

/* SUCCESS */
.success-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 48px 24px;
  text-align: center;
}
.success-icon { font-size: 48px; margin-bottom: 16px; }
.success-title { font-size: 22px; font-weight: 600; color: var(--color-text); margin: 0 0 8px; }
.success-sub { font-size: 14px; color: var(--color-text-secondary); margin: 0; }

/* SIDEBAR */
.rn-sidebar { display: flex; flex-direction: column; gap: 12px; }

/* Preview */
.preview-card {
  background: var(--color-primary-light);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 14px;
}
.preview-title { font-size: 12px; font-weight: 600; color: var(--color-primary-dark); margin-bottom: 10px; }
.preview-country { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.preview-flag { font-size: 20px; }
.preview-name { font-size: 13px; font-weight: 600; color: var(--color-text); }
.preview-empty-row { font-size: 12px; color: var(--color-text-muted); margin-bottom: 6px; }
.preview-nat { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; font-size: 14px; }
.preview-nat-pill {
  background: #fff;
  color: var(--color-primary-dark);
  font-size: 11px; font-weight: 500;
  border-radius: var(--radius-pill);
  padding: 2px 8px;
}
.preview-cats { display: flex; flex-direction: column; gap: 5px; }
.preview-cat-row { display: flex; justify-content: space-between; align-items: center; }
.preview-cat-name { font-size: 11px; color: var(--color-text-secondary); }
.preview-stars { font-size: 11px; color: var(--color-star); letter-spacing: 1px; }
.preview-hint { font-size: 12px; color: var(--color-text-muted); font-style: italic; }

/* Tips */
.tips-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px;
}
.tips-title { display: block; font-size: 13px; font-weight: 600; color: var(--color-text); margin-bottom: 12px; }
.tips-list { display: flex; flex-direction: column; gap: 10px; }
.tip-row { display: flex; align-items: flex-start; gap: 8px; }
.tip-num {
  width: 18px; height: 18px; flex-shrink: 0;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700;
}
.tip-text { font-size: 12px; color: var(--color-text-secondary); line-height: 1.5; }

/* Stats */
.stats-card {
  background: var(--color-success-light);
  border: 1px solid #A8DCC8;
  border-radius: var(--radius-lg);
  padding: 14px;
}
.stats-title { font-size: 13px; font-weight: 600; color: var(--color-success); margin-bottom: 6px; }
.stats-text { font-size: 12px; color: #2D7A5E; margin: 0; line-height: 1.5; }

/* Responsive */
@media (max-width: 768px) {
  .rn-body { grid-template-columns: 1fr; padding: 0 16px 32px; }
  .selectors-grid { grid-template-columns: 1fr; }
  .actions-row { flex-direction: column; align-items: flex-start; }
  .rn-sidebar { order: -1; }
}
</style>
