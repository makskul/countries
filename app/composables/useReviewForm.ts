import { useSupabaseClient } from '#imports'

export const FORM_CATEGORIES = [
  { key: 'legalization',     icon: 'shield'    },
  { key: 'cost_of_living',   icon: 'dollar'    },
  { key: 'safety',           icon: 'shield2'   },
  { key: 'bureaucracy',      icon: 'clipboard' },
  { key: 'weather',          icon: 'cloud'     },
  { key: 'language_barrier', icon: 'chat'      },
  { key: 'cleanliness',      icon: 'sparkle'   },
  { key: 'healthcare',       icon: 'heart'     },
  { key: 'overall',          icon: 'star'      },
] as const

export type FormCategoryKey = typeof FORM_CATEGORIES[number]['key']

export function useReviewForm() {
  const supabase = useSupabaseClient()
  const store = useUserStore()
  const user = useSupabaseUser()
  const router = useRouter()
  const route = useRoute()
  const toast = useToast()
  const localePath = useLocalePath()
  const { t } = useI18n()

  const form = reactive({
    country: (route.query.country as string) || '',
    nationality: store.effectiveNationality || '',
    stay_purpose: '' as string,
    still_there: false as boolean,
    climate: [] as string[],
    ratings: Object.fromEntries(FORM_CATEGORIES.map(c => [c.key, 0])) as Record<FormCategoryKey, number>,
    comments: Object.fromEntries(FORM_CATEGORIES.map(c => [c.key, ''])) as Record<FormCategoryKey, string>,
    /** Honeypot — hidden from users; bots often fill "website" fields. */
    website: '',
  })

  // Sync nationality with store when changed
  watch(() => store.effectiveNationality, (v) => {
    if (v && !form.nationality) form.nationality = v
  })

  watch(() => form.nationality, (v) => {
    if (v && !user.value) store.setNationality(v)
  })

  const isValid = computed(() =>
    form.country !== '' &&
    form.nationality !== '' &&
    form.stay_purpose !== '' &&
    (Object.entries(form.ratings).some(([key, r]) => key !== 'weather' && r > 0) || form.climate.length > 0)
  )

  function isCategoryFilled(key: FormCategoryKey): boolean {
    if (key === 'weather') return form.climate.length > 0
    return form.ratings[key] > 0
  }

  const step = computed(() => {
    if (form.country && form.nationality) return 2
    return 1
  })

  // Expanded state: first 3 expanded by default, last 3 collapsed
  const expanded = reactive(
    Object.fromEntries(FORM_CATEGORIES.map((c, i) => [c.key, i < 3])) as Record<FormCategoryKey, boolean>
  )

  function toggleExpand(key: FormCategoryKey) {
    if (expanded[key] && isCategoryFilled(key)) return
    expanded[key] = !expanded[key]
  }

  const submitting = ref(false)
  const submitSuccess = ref(false)
  const canClaimReview = ref(false)

  async function submit(cityName?: string, cityId?: number) {
    if (!isValid.value) {
      toast.add({
        severity: 'warn',
        summary: t('review.toast.validationSummary'),
        detail: t('review.toast.validationDetail'),
        life: 4000,
      })
      return
    }

    submitting.value = true
    try {
      const ratings: Record<string, number> = {}
      const comments: Record<string, string> = {}

      for (const cat of FORM_CATEGORIES) {
        if (cat.key === 'weather') {
          // Weather is stored in climate[], not ratings — still keep optional comment
          if (form.comments[cat.key].trim()) {
            comments[cat.key] = form.comments[cat.key].trim()
          }
          continue
        }
        if (form.ratings[cat.key] > 0) {
          ratings[cat.key] = form.ratings[cat.key]
          if (form.comments[cat.key].trim()) {
            comments[cat.key] = form.comments[cat.key].trim()
          }
        }
      }

      const result = await $fetch<{ ok: true; id: string; claim_token?: string }>('/api/reviews/submit', {
        method: 'POST',
        body: {
          author_nationality: form.nationality,
          target_country: form.country,
          stay_purpose: form.stay_purpose,
          still_there: form.still_there,
          climate: form.climate.length ? form.climate : null,
          ...(cityName ? { city_name: cityName, city_id: cityId } : {}),
          ratings,
          comments,
          website: form.website,
        },
        credentials: 'include',
      })

      if (result.claim_token && import.meta.client) {
        sessionStorage.setItem('nv_pending_claim', JSON.stringify({
          review_id: result.id,
          claim_token: result.claim_token,
        }))
        canClaimReview.value = true
      }

      submitSuccess.value = true
      const { trackEvent } = await import('~/utils/analytics')
      trackEvent('review_submit', {
        country: form.country,
        nationality: form.nationality,
        has_city: Boolean(cityName),
      })
      toast.add({
        severity: 'success',
        summary: t('review.toast.successSummary'),
        detail: t('review.toast.successDetail'),
        life: 3000,
      })
      // Keep anonymous users on the success screen so they can claim via sign-in.
      if (!canClaimReview.value) {
        setTimeout(() => {
          router.push(localePath(`/country/${form.country.toLowerCase()}`))
        }, 2000)
      }
    } catch (err: any) {
      const detail = err?.data?.message || err?.statusMessage || err?.message || t('review.toast.errorFallback')
      toast.add({
        severity: 'error',
        summary: t('review.toast.errorSummary'),
        detail,
        life: 4000,
      })
    } finally {
      submitting.value = false
    }
  }

  // Country stats for sidebar
  const { data: countryStats } = useLazyAsyncData(
    () => `reviewStats-${form.country}-${form.nationality}`,
    async () => {
      if (!form.country) return null
      const { data, error } = await supabase
        .from('reviews')
        .select('author_nationality')
        .eq('target_country', form.country)
        .eq('is_approved', true)
      if (error || !data) return null
      const total = data.length
      const natCount = data.filter((r: any) => r.author_nationality === form.nationality).length
      return { total, natCount }
    },
    { server: false, watch: [() => form.country, () => form.nationality] }
  )

  return { form, isValid, step, expanded, toggleExpand, isCategoryFilled, submitting, submitSuccess, canClaimReview, submit, countryStats, FORM_CATEGORIES }
}
