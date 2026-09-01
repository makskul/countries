<template>
  <div v-if="partners.length" class="affiliate-block">
    <div v-if="title" class="affiliate-title">{{ title }}</div>
    <div class="affiliate-links">
      <a
        v-for="partner in partners"
        :key="partner.slug"
        :href="resolvePartnerUrl(partner, context)"
        target="_blank"
        rel="noopener sponsored"
        class="affiliate-link"
        @click="onClick(partner)"
      >
        <span class="affiliate-link-label">{{ $t(partner.labelKey) }}</span>
        <span class="affiliate-link-cta">{{ $t(partner.ctaKey) }} →</span>
      </a>
    </div>
    <PartnerDisclosure :compact="compact" />
  </div>
</template>

<script setup lang="ts">
import {
  getPrimaryPartners,
  resolvePartnerUrl,
  type PartnerContext,
  type PartnerConfig,
} from '~/utils/partners'

const props = withDefaults(defineProps<{
  partnerSlot: PartnerContext['slot']
  country?: string
  nat?: string
  title?: string
  limit?: number
  compact?: boolean
  /** Override partner list (e.g. compare winner single CTA) */
  partnersOverride?: PartnerConfig[]
}>(), {
  limit: 2,
  compact: false,
})

const { trackAffiliateClick } = useAnalytics()
const { abVariant } = useAffiliateAb()

const context = computed<PartnerContext>(() => ({
  slot: props.partnerSlot,
  country: props.country,
  nat: props.nat,
}))

const partners = computed(() =>
  props.partnersOverride?.length
    ? props.partnersOverride
    : getPrimaryPartners(context.value, props.limit),
)

function onClick(partner: PartnerConfig) {
  trackAffiliateClick({
    partner: partner.slug,
    slot: props.partnerSlot,
    country: props.country,
    nat: props.nat,
    vertical: partner.vertical,
    ab_variant: abVariant.value,
  })
}
</script>

<style scoped>
.affiliate-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.affiliate-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 2px;
}
.affiliate-links {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.affiliate-link {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  text-decoration: none;
  transition: border-color 0.15s, background 0.15s;
}
.affiliate-link:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}
.affiliate-link-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
}
.affiliate-link-cta {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-primary);
}
</style>
