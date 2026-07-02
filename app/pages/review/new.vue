<template>
  <div class="rn-page">

    <!-- BREADCRUMB -->
    <div class="breadcrumb">
      <NuxtLinkLocale to="/" class="bc-link">{{ $t('nav.breadcrumbs.home') }}</NuxtLinkLocale>
      <span class="bc-sep">→</span>
      <span class="bc-current">{{ $t('review.breadcrumb') }}</span>
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
              <span class="step-label">{{ $t('review.steps.about') }}</span>
            </div>
            <div class="step-line" :class="step > 1 ? 'done' : ''" />
            <div class="step-item">
              <div class="step-circle" :class="submitSuccess ? 'done' : step >= 2 ? 'active' : 'pending'">
                <span v-if="submitSuccess">✓</span>
                <span v-else>2</span>
              </div>
              <span class="step-label">{{ $t('review.steps.ratings') }}</span>
            </div>
            <div class="step-line" :class="submitSuccess ? 'done' : ''" />
            <div class="step-item">
              <div class="step-circle" :class="submitSuccess ? 'done' : 'pending'">
                <span v-if="submitSuccess">✓</span>
                <span v-else>3</span>
              </div>
              <span class="step-label">{{ $t('review.steps.done') }}</span>
            </div>
          </div>

          <!-- Country + Nationality selectors -->
          <div class="selectors-grid">
            <div>
              <label class="field-label">{{ $t('review.fields.country') }}</label>
              <CountrySelector v-model="form.country" />
            </div>
            <div>
              <label class="field-label">{{ $t('review.fields.nationality') }}</label>
              <NationalitySelector v-model="form.nationality" />
            </div>
          </div>

          <!-- City + Profile selectors -->
          <div class="selectors-grid" style="margin-top: 10px">
            <div>
              <label class="field-label">{{ $t('review.fields.city') }}</label>
              <AutoComplete
                v-model="cityQuery"
                :suggestions="citySuggestions"
                optionLabel="name"
                :placeholder="$t('review.fields.cityPlaceholder')"
                :disabled="!form.country"
                forceSelection
                @complete="searchCities"
                @item-select="onCitySelect"
                @clear="selectedCity = null"
                :delay="300"
                class="w-full"
              />
              <small
                v-if="cityQuery && !selectedCity && form.country"
                style="color:var(--color-danger); font-size:11px; display:block; margin-top:4px"
              >
                {{ $t('review.fields.citySelectFromList') }}
              </small>
              <small style="color:var(--color-text-muted); font-size:11px; display:block; margin-top:4px">
                {{ $t('review.fields.cityDisabledHint') }}
              </small>
            </div>
            <div>
              <label class="field-label">{{ $t('review.fields.stayPurpose') }} *</label>
              <Select
                v-model="form.stay_purpose"
                :options="stayPurposeOptions"
                optionLabel="label"
                optionValue="key"
                :placeholder="$t('review.fields.stayPurposePlaceholder')"
                class="w-full"
              >
                <template #option="{ option }">
                  <div>
                    <span>{{ option.label }}</span>
                    <span v-if="option.hint" style="font-size:11px; color:var(--color-text-muted); margin-left:6px">{{ option.hint }}</span>
                  </div>
                </template>
              </Select>
              <div style="display:flex; align-items:center; gap:8px; margin-top:8px">
                <Checkbox v-model="form.still_there" :binary="true" inputId="still-there" />
                <label for="still-there" style="font-size:13px; cursor:pointer; color:var(--color-text-secondary)">
                  {{ $t('review.fields.stillThere') }}
                </label>
              </div>
            </div>
          </div>

        </div>

        <!-- SUCCESS STATE -->
        <div v-if="submitSuccess" class="success-card">
          <div class="success-icon">🎉</div>
          <h2 class="success-title">{{ $t('review.success.title') }}</h2>
          <p class="success-sub">{{ $t('review.success.subtitle') }}</p>
        </div>

        <!-- RATINGS CARD -->
        <div v-else class="ratings-card">
          <div class="ratings-header">
            <span class="ratings-title">{{ $t('review.ratings.title') }}</span>
            <span class="ratings-sub">{{ $t('review.ratings.subtitle') }}</span>
          </div>

          <CategoryRatingRow
            v-for="cat in FORM_CATEGORIES"
            :key="cat.key"
            :category="cat"
            :modelValue="(form.ratings as any)[cat.key]"
            :comment="(form.comments as any)[cat.key]"
            :expanded="(expanded as any)[cat.key]"
            :filled="isCategoryFilled(cat.key)"
            :climate-preview="cat.key === 'weather' ? form.climate : []"
            :climate-icon-map="climateIconMap"
            :show-stars="cat.key !== 'weather'"
            @update:modelValue="(form.ratings as any)[cat.key] = $event"
            @update:comment="(form.comments as any)[cat.key] = $event"
            @toggle="toggleExpand(cat.key)"
          >
            <template #icon>
              <i class="pi" :class="getCategoryPrimeIcon(cat.icon)" />
            </template>

            <!-- Cost buttons — only for 'cost_of_living' category -->
            <template v-if="cat.key === 'cost_of_living'" #rating>
              <div class="cost-grid">
                <div
                  v-for="opt in costOptions"
                  :key="opt.value"
                  class="cost-btn"
                  :class="{
                    active: (form.ratings as any)['cost_of_living'] === opt.value,
                    [`cost-${opt.value}`]: true
                  }"
                  @click="(form.ratings as any)['cost_of_living'] = opt.value"
                >
                  <span class="cost-icon">{{ opt.icon }}</span>
                  <span class="cost-label">{{ opt.label }}</span>
                </div>
              </div>
            </template>

            <!-- Weather climate buttons — only for 'weather' category -->
            <template v-if="cat.key === 'weather'" #rating>
              <div class="weather-section">
                <div class="weather-hint">{{ $t('review.fields.climateHint') }}</div>
                <div class="weather-grid">
                  <div
                    v-for="(opt, key) in weatherOptions"
                    :key="key"
                    class="w-btn"
                    :class="{ active: form.climate.includes(String(key)) }"
                    @click="toggleWeather(String(key))"
                  >
                    <span class="w-icon">{{ (opt as any).icon }}</span>
                    <span class="w-label">{{ (opt as any).label }}</span>
                  </div>
                </div>
              </div>
            </template>
          </CategoryRatingRow>

          <!-- Bottom actions -->
          <div class="actions-row">
            <div class="anon-notice">
              <span class="anon-check">✓</span>
              <span class="anon-text">{{ $t('review.actions.anonymous') }}</span>
            </div>
            <div class="actions-btns">
              <button class="btn-secondary" @click="router.back()">{{ $t('common.buttons.cancel') }}</button>
              <button
                class="btn-primary"
                :class="{ 'btn-disabled': !isValid }"
                :disabled="!isValid || submitting"
                @click="submit"
              >
                {{ submitting ? $t('review.actions.submitting') : $t('review.actions.submit') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════ SIDEBAR ═══════ -->
      <div class="rn-sidebar">

        <!-- Live preview -->
        <div class="preview-card">
          <div class="preview-title">{{ $t('review.preview.title') }}</div>

          <div v-if="form.country" class="preview-country">
            <span class="preview-flag">{{ getFlagEmoji(form.country) }}</span>
            <span class="preview-name">{{ getCountryNameLocalized(form.country) }}</span>
          </div>
          <div v-else class="preview-empty-row">{{ $t('review.preview.noCountry') }}</div>

          <div v-if="form.nationality" class="preview-nat">
            {{ getFlagEmoji(form.nationality) }}
            <span class="preview-nat-pill">{{ getCountryNameLocalized(form.nationality) }}</span>
          </div>

          <div class="preview-cats">
            <template v-if="hasAnyRating">
              <div v-for="cat in FORM_CATEGORIES" :key="cat.key" class="preview-cat-row">
                <template v-if="cat.key === 'weather' && form.climate.length">
                  <span class="preview-cat-name">{{ $t(`categories.${cat.key}.name`) }}</span>
                  <span class="preview-climate">
                    <span v-for="key in form.climate" :key="key">{{ climateIconMap[key] }}</span>
                  </span>
                </template>
                <template v-else-if="(form.ratings as any)[cat.key] > 0">
                  <span class="preview-cat-name">{{ $t(`categories.${cat.key}.name`) }}</span>
                  <span class="preview-stars">{{ '★'.repeat((form.ratings as any)[cat.key]) }}{{ '☆'.repeat(5 - (form.ratings as any)[cat.key]) }}</span>
                </template>
              </div>
            </template>
            <span v-else class="preview-hint">{{ $t('review.preview.empty') }}</span>
          </div>
        </div>

        <!-- Tips -->
        <div class="tips-card">
          <span class="tips-title">{{ $t('review.tips.title') }}</span>
          <div class="tips-list">
            <div v-for="(tip, i) in ($tm('review.tips.list') as string[])" :key="i" class="tip-row">
              <span class="tip-num">{{ i + 1 }}</span>
              <span class="tip-text">{{ tip }}</span>
            </div>
          </div>
        </div>

        <!-- Country stats -->
        <div v-if="form.country && countryStats" class="stats-card">
          <div class="stats-title">
            {{ getFlagEmoji(form.country) }} {{ $t('review.stats.title', { count: countryStats.total, country: getCountryNameLocalized(form.country) }) }}
          </div>
          <p class="stats-text">
            {{ $t('review.stats.subtitle', { natCount: countryStats.natCount, nationality: form.nationality ? getCountryNameLocalized(form.nationality) : '' }) }}
          </p>
        </div>
      </div>
    </div>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { APP_NAME, APP_URL } from '~/utils/appConfig'
import { useToast } from 'primevue/usetoast'
import { getFlagEmoji } from '~/utils/countries'
import { getCategoryPrimeIcon } from '~/utils/categoryIcons'
import { useReviewForm } from '~/composables/useReviewForm'

const { t } = useI18n()
const router = useRouter()
const { getCountryNameLocalized } = useLocalizedCountries()

useSeoMeta({
  title: () => t('seo.review.title'),
  description: () => t('seo.review.description'),
  ogTitle: () => t('seo.review.title'),
  ogDescription: () => t('seo.review.description'),
  ogImage: APP_URL + '/og/home.png',
  ogUrl: APP_URL + '/review/new',
  ogType: 'website',
  twitterCard: 'summary',
  robots: 'noindex, nofollow',
})

const {
  form,
  isValid: isValidBase,
  step,
  expanded,
  toggleExpand,
  isCategoryFilled,
  submitting,
  submitSuccess,
  submit: submitForm,
  countryStats,
  FORM_CATEGORIES,
} = useReviewForm()

// city is optional
const isValid = computed(() =>
  isValidBase.value
)

const hasAnyRating = computed(() =>
  Object.entries(form.ratings).some(([key, r]) => key !== 'weather' && r > 0) || form.climate.length > 0
)

const { tm, locale } = useI18n()
const supabase = useSupabaseClient()

const cityQuery = ref('')
const citySuggestions = ref<{ id: number; name: string }[]>([])
const selectedCity = ref<{ id: number; name: string } | null>(null)

const searchCities = async (event: { query: string }) => {
  if (!form.country || event.query.length < 1) {
    citySuggestions.value = []
    return
  }
  const col = locale.value === 'uk' ? 'name_uk'
            : locale.value === 'ru' ? 'name_ru'
            : 'name_en'
  const { data } = await supabase
    .from('cities')
    .select('id, name_en, name_uk, name_ru')
    .eq('country', form.country)
    .ilike(col, `${event.query}%`)
    .order('population', { ascending: false })
    .limit(10)
  citySuggestions.value = (data ?? []).map((c: any) => ({
    id: c.id,
    name: (c[col] ?? c.name_en) as string,
  }))
}

const onCitySelect = (e: { value: { id: number; name: string } }) => {
  selectedCity.value = e.value
}

watch(() => form.country, () => {
  cityQuery.value = ''
  selectedCity.value = null
  citySuggestions.value = []
})

// Stay purpose options from i18n
const stayPurposeOptions = computed(() =>
  Object.entries(tm('common.stayPurposes') as Record<string, any>).map(([key, val]) => ({
    key,
    label: val.label as string,
    hint:  val.hint as string,
  }))
)

// Weather multi-select
const weatherOptions = computed(() =>
  tm('common.weatherOptions') as Record<string, { label: string; icon: string }>
)

const climateIconMap = computed(() => {
  const opts = weatherOptions.value
  return Object.fromEntries(Object.entries(opts).map(([key, val]) => [key, val.icon]))
})

// Cost of living buttons
const costOptions = computed(() =>
  tm('common.costOptions') as Array<{ value: number; icon: string; label: string }>
)

function toggleWeather(key: string) {
  const idx = form.climate.indexOf(key)
  if (idx === -1) form.climate.push(key)
  else form.climate.splice(idx, 1)
}

function submit() {
  // city is optional — pass undefined if not selected
  submitForm(selectedCity.value?.name, selectedCity.value?.id)
}
</script>

<style scoped>
.rn-page { background: var(--color-bg-secondary); min-height: 100vh; }

/* Breadcrumb */
.breadcrumb { padding: 12px 24px; font-size: 12px; display: flex; align-items: center; gap: 6px; max-width: 1100px; margin: 0 auto; }
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
.ratings-title { display: block; font-size: 15px; font-weight: 600; color: var(--color-text); margin-bottom: 4px; font-family: var(--font-display); }
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
.preview-climate { display: flex; gap: 4px; font-size: 14px; line-height: 1; }
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
