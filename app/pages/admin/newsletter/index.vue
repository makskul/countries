<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ robots: 'noindex, nofollow' })

type DigestPreview = {
  dryRun: true
  subject: string
  html: string
  text: string
  compareLinks: { slug: string; label: string; url: string }[]
  reviews: { targetCountryName: string; authorNationalityName: string; snippet: string }[]
}

const { data, pending } = await useAsyncData('admin-newsletter', () =>
  useAdminFetch<{ items: { id: string; email: string; created_at: string; source: string }[] }>('/api/admin/newsletter'),
)

const previewOpen = ref(false)
const previewLoading = ref(false)
const sendLoading = ref(false)
const preview = ref<DigestPreview | null>(null)
const toast = useToast()

function exportCsv() {
  window.open('/api/admin/newsletter?format=csv', '_blank')
}

async function loadPreview() {
  previewLoading.value = true
  try {
    preview.value = await useAdminFetch<DigestPreview>('/api/admin/newsletter/send-test', {
      method: 'POST',
      body: { dryRun: true },
    })
    previewOpen.value = true
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Не вдалося зібрати превʼю',
      detail: err?.data?.message ?? err?.message,
      life: 5000,
    })
  } finally {
    previewLoading.value = false
  }
}

async function sendTest() {
  sendLoading.value = true
  try {
    const result = await useAdminFetch<{ sent: boolean; to: string; messageId: string; subject: string }>(
      '/api/admin/newsletter/send-test',
      { method: 'POST', body: { dryRun: false } },
    )
    toast.add({
      severity: 'success',
      summary: 'Тестовий лист надіслано',
      detail: `${result.subject} → ${result.to}`,
      life: 6000,
    })
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Помилка відправки',
      detail: err?.data?.message ?? err?.message,
      life: 6000,
    })
  } finally {
    sendLoading.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="admin-page-title">Newsletter</h1>
    <div class="admin-toolbar">
      <Button label="Экспорт CSV" icon="pi pi-download" @click="exportCsv" />
      <Button
        label="Превʼю дайджеста"
        icon="pi pi-eye"
        severity="secondary"
        :loading="previewLoading"
        @click="loadPreview"
      />
      <Button
        label="Тест на ADMIN_EMAIL"
        icon="pi pi-send"
        :loading="sendLoading"
        @click="sendTest"
      />
      <Tag :value="`${data?.items.length ?? 0} подписчиков`" />
    </div>
    <div class="admin-card">
      <DataTable :value="data?.items ?? []" :loading="pending">
        <Column field="email" header="Email" />
        <Column field="source" header="Source" />
        <Column field="created_at" header="Дата">
          <template #body="{ data: row }">{{ formatAdminDate(row.created_at) }}</template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="previewOpen"
      header="Превʼю дайджеста (uk)"
      modal
      :style="{ width: 'min(720px, 96vw)' }"
    >
      <template v-if="preview">
        <p class="preview-subject"><strong>Subject:</strong> {{ preview.subject }}</p>
        <div class="preview-meta">
          <span>{{ preview.compareLinks.length }} порівнянь</span>
          <span>{{ preview.reviews.length }} відгуків</span>
        </div>
        <iframe
          class="preview-frame"
          :srcdoc="preview.html"
          title="Digest preview"
          sandbox=""
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.preview-subject {
  margin: 0 0 8px;
  font-size: 14px;
}
.preview-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--text-color-secondary);
}
.preview-frame {
  width: 100%;
  height: 480px;
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  background: #fff;
}
</style>
