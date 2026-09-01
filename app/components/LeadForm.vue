<template>
  <div class="lead-form">
    <div class="lead-form__header">
      <span class="section-label">{{ $t('country.lead.sectionLabel') }}</span>
      <h3 class="lead-form__title">{{ $t('country.lead.title', { country: countryName }) }}</h3>
      <p class="lead-form__subtitle">{{ $t('country.lead.subtitle') }}</p>
    </div>

    <form v-if="!submitted" class="lead-form__body" @submit.prevent="submit">
      <div class="lead-form__field">
        <label class="lead-form__label" for="lead-email">{{ $t('country.lead.email') }}</label>
        <InputText
          id="lead-email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          class="w-full"
          :placeholder="$t('country.lead.emailPlaceholder')"
        />
      </div>
      <div class="lead-form__field">
        <label class="lead-form__label" for="lead-message">{{ $t('country.lead.message') }}</label>
        <Textarea
          id="lead-message"
          v-model="message"
          rows="3"
          auto-resize
          class="w-full"
          :placeholder="$t('country.lead.messagePlaceholder')"
        />
      </div>
      <Button
        type="submit"
        :label="$t('country.lead.submit')"
        :loading="submitting"
        :disabled="!canSubmit"
      />
      <p class="lead-form__disclosure">{{ $t('country.lead.disclosure') }}</p>
    </form>

    <div v-else class="lead-form__success">
      <p>{{ $t('country.lead.success') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  countryCode: string
  nationalityCode: string
}>()

const { getCountryNameLocalized } = useLocalizedCountries()
const { t } = useI18n()
const toast = useToast()
const { trackLeadSubmit } = useAnalytics()

const countryName = computed(() => getCountryNameLocalized(props.countryCode))

const email = ref('')
const message = ref('')
const submitting = ref(false)
const submitted = ref(false)

const canSubmit = computed(() =>
  email.value.trim().length > 0 && !submitting.value,
)

async function submit() {
  if (!canSubmit.value) return

  submitting.value = true
  try {
    await $fetch('/api/leads', {
      method: 'POST',
      body: {
        country: props.countryCode,
        author_nationality: props.nationalityCode,
        email: email.value.trim(),
        message: message.value.trim() || undefined,
        source: 'country_page',
      },
    })

    submitted.value = true
    trackLeadSubmit({
      country: props.countryCode,
      source: 'country_page',
    })
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: t('country.lead.errorSummary'),
      detail: err?.data?.message ?? err?.message ?? t('country.lead.errorFallback'),
      life: 4000,
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.lead-form {
  background: var(--color-bg);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 20px;
}
.lead-form__title {
  margin: 4px 0 6px;
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
}
.lead-form__subtitle {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.45;
}
.lead-form__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.lead-form__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.lead-form__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
}
.lead-form__disclosure {
  margin: 0;
  font-size: 11px;
  color: var(--color-text-muted);
  line-height: 1.4;
}
.lead-form__success {
  padding: 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-success, #15803d);
}
</style>
