<script setup lang="ts">
const props = defineProps<{
  title?: string | null
  excerpt?: string | null
  body?: string | null
  sectionLabel?: string
}>()

const paragraphs = computed(() => {
  const raw = (props.body ?? '').trim()
  if (!raw) return [] as string[]
  // Split on blank lines; strip simple markdown headings / bold markers
  return raw
    .split(/\n{2,}/)
    .map((block) => block
      .replace(/^#{1,3}\s+/gm, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/\n+/g, ' ')
      .trim())
    .filter(Boolean)
})

const hasContent = computed(() =>
  Boolean(props.title || props.excerpt || paragraphs.value.length),
)
</script>

<template>
  <section v-if="hasContent" class="content-article">
    <span v-if="sectionLabel" class="section-label">{{ sectionLabel }}</span>
    <h2 v-if="title" class="ca-title">{{ title }}</h2>
    <p v-if="excerpt" class="ca-excerpt">{{ excerpt }}</p>
    <div v-if="paragraphs.length" class="ca-body">
      <p v-for="(p, i) in paragraphs" :key="i">{{ p }}</p>
    </div>
  </section>
</template>

<style scoped>
.content-article {
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
}

.ca-title {
  margin: 6px 0 10px;
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.3;
  color: var(--color-text);
}

.ca-excerpt {
  margin: 0 0 14px;
  font-size: 15px;
  line-height: 1.55;
  color: var(--color-text-secondary);
}

.ca-body p {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.65;
  color: var(--color-text);
}

.ca-body p:last-child {
  margin-bottom: 0;
}
</style>
