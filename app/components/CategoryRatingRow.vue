<template>
  <div class="crr" :class="{ 'crr--expanded': expanded }">
    <!-- COLLAPSED STATE -->
    <div v-if="!expanded" class="crr-collapsed" @click="$emit('toggle')">
      <div class="crr-left">
        <div class="crr-icon">
          <slot name="icon" />
        </div>
        <div>
          <span class="crr-name">{{ $t(`categories.${category.key}.name`) }}</span>
          <span class="crr-hint">{{ $t(`categories.${category.key}.hint`) }}</span>
        </div>
      </div>
      <div class="crr-right">
        <div class="crr-stars-preview">
          <span v-for="i in 5" :key="i" class="crr-star-empty">☆</span>
        </div>
        <button class="crr-add-btn" @click.stop="$emit('toggle')">{{ $t('review.ratings.expand') }}</button>
      </div>
    </div>

    <!-- EXPANDED STATE -->
    <div v-else class="crr-expanded-body">
      <div class="crr-header">
        <div class="crr-left">
          <div class="crr-icon">
            <slot name="icon" />
          </div>
          <div>
            <span class="crr-name">{{ $t(`categories.${category.key}.name`) }}</span>
            <span class="crr-hint">{{ $t(`categories.${category.key}.hint`) }}</span>
          </div>
        </div>
        <div class="crr-right">
          <div class="crr-stars">
            <span
              v-for="i in 5"
              :key="i"
              class="crr-star"
              :class="{ 'crr-star--filled': i <= modelValue }"
              @click="$emit('update:modelValue', i)"
              @mouseenter="hovered = i"
              @mouseleave="hovered = 0"
            >{{ (hovered > 0 ? i <= hovered : i <= modelValue) ? '★' : '☆' }}</span>
          </div>
          <span class="crr-star-label" :class="{ 'crr-star-label--max': modelValue === 5 }">
            {{ (hovered || modelValue) > 0 ? $t(`review.ratings.stars.${hovered || modelValue}`) : '' }}
          </span>
        </div>
      </div>

      <div class="crr-textarea-wrap">
        <textarea
          :value="comment"
          @input="$emit('update:comment', ($event.target as HTMLTextAreaElement).value)"
          class="crr-textarea"
          :placeholder="$t('review.ratings.placeholder')"
          rows="2"
          maxlength="500"
        />
        <span class="crr-charcount">{{ comment.length }} / 500</span>
      </div>

      <button v-if="modelValue === 0" class="crr-collapse-btn" @click="$emit('toggle')">
        {{ $t('review.ratings.collapse') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  category: { key: string; icon?: string }
  modelValue: number
  comment: string
  expanded: boolean
}>()

defineEmits<{
  'update:modelValue': [v: number]
  'update:comment': [v: string]
  toggle: []
}>()

const hovered = ref(0)
</script>

<style scoped>
.crr {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
  transition: box-shadow 0.15s;
}
.crr:hover { box-shadow: var(--shadow-card); }

/* COLLAPSED */
.crr-collapsed {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  cursor: pointer;
  gap: 12px;
}

/* EXPANDED */
.crr-expanded-body { padding: 14px; }
.crr-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

/* Shared */
.crr-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
.crr-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.crr-icon {
  width: 28px; height: 28px; flex-shrink: 0;
  background: var(--color-primary-light);
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
}
.crr-name {
  display: block;
  font-size: 13px; font-weight: 500; color: var(--color-text);
}
.crr-hint {
  display: block;
  font-size: 11px; color: var(--color-text-muted);
}

/* Stars */
.crr-stars { display: flex; gap: 2px; }
.crr-star {
  font-size: 20px;
  cursor: pointer;
  color: var(--color-primary-mid);
  opacity: 0.35;
  transition: transform 0.1s, color 0.1s, opacity 0.1s;
  line-height: 1;
  user-select: none;
}
.crr-star--filled { color: var(--color-star); opacity: 1; }
.crr-star:hover { transform: scale(1.2); opacity: 0.8; }

.crr-stars-preview { display: flex; gap: 2px; }
.crr-star-empty { font-size: 16px; color: var(--color-primary-mid); opacity: 0.3; }

.crr-star-label {
  font-size: 12px;
  color: var(--color-text-muted);
  min-width: 52px;
}
.crr-star-label--max { color: var(--color-star); font-weight: 600; }

.crr-add-btn {
  font-size: 12px; font-weight: 500; color: var(--color-primary);
  background: none; border: none; cursor: pointer;
  font-family: inherit; padding: 0; white-space: nowrap;
}
.crr-add-btn:hover { text-decoration: underline; }

/* Textarea */
.crr-textarea-wrap { position: relative; }
.crr-textarea {
  width: 100%;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  font-size: 12px;
  font-family: inherit;
  color: var(--color-text);
  background: #fff;
  resize: none;
  outline: none;
  box-sizing: border-box;
  line-height: 1.5;
  transition: border-color 0.15s;
}
.crr-textarea:focus { border-color: var(--color-primary); }
.crr-textarea::placeholder { color: var(--color-text-muted); }
.crr-charcount {
  display: block;
  font-size: 11px;
  color: var(--color-text-muted);
  text-align: right;
  margin-top: 3px;
}

.crr-collapse-btn {
  font-size: 11px; color: var(--color-text-muted);
  background: none; border: none; cursor: pointer;
  font-family: inherit; padding: 4px 0 0; display: block;
}
.crr-collapse-btn:hover { color: var(--color-text-secondary); }
</style>
