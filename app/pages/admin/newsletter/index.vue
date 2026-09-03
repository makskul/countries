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

const { data, pending, error, refresh } = await useAsyncData('admin-newsletter', () =>
  useAdminFetch<{ items: { id: string; email: string; created_at: string; source: string }[] }>('/api/admin/newsletter'),
)

const previewOpen = ref(false)
const previewLoading = ref(false)
const sendLoading = ref(false)
const preview = ref<DigestPreview | null>(null)
const toast = useToast()

async function exportCsv() {
  try {
    const csv = await useAdminFetch<string>('/api/admin/newsletter', {
      query: { format: 'csv' },
      responseType: 'text',
    })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'newsletter.csv'
    a.click()
    URL.revokeObjectURL(url)
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка экспорта',
      detail: err?.data?.message ?? err?.message,
      life: 5000,
    })
  }
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
      summary: 'Не удалось собрать превью',
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
      summary: 'Тестовое письмо отправлено',
      detail: `${result.subject} → ${result.to}`,
      life: 6000,
    })
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Ошибка отправки',
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
    <AdminBreadcrumb :items="[{ label: 'Обзор', to: '/admin' }, { label: 'Рассылка' }]" />
    <h1 class="admin-page-title">Рассылка</h1>
    <p class="admin-page-lead">
      Подписчики и тест еженедельного дайджеста (uk) на ADMIN_EMAIL.
    </p>

    <div class="admin-toolbar">
      <Button label="Экспорт CSV" icon="pi pi-download" @click="exportCsv" />
      <Button
        label="Превью дайджеста"
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
      <Tag v-if="data" :value="`${data.items.length} подписчиков`" />
      <Button v-if="error" label="Повторить" icon="pi pi-refresh" size="small" text @click="refresh()" />
    </div>

    <Message v-if="error" severity="error" :closable="false" class="mb-3">
      {{ (error as { data?: { message?: string } }).data?.message ?? error.message ?? 'Не удалось загрузить подписчиков' }}
    </Message>

    <div class="admin-card">
      <DataTable :value="data?.items ?? []" :loading="pending" paginator :rows="25">
        <template #empty>
          <div class="admin-empty">
            <p>Пока нет подписчиков. Они появятся после формы рассылки на сайте.</p>
          </div>
        </template>
        <Column field="email" header="Email">
          <template #body="{ data: row }">
            <a :href="`mailto:${row.email}`">{{ row.email }}</a>
          </template>
        </Column>
        <Column field="source" header="Источник" />
        <Column field="created_at" header="Дата">
          <template #body="{ data: row }">{{ formatAdminDate(row.created_at) }}</template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="previewOpen"
      header="Превью дайджеста (uk)"
      modal
      :style="{ width: 'min(720px, 96vw)' }"
    >
      <template v-if="preview">
        <p class="preview-subject"><strong>Тема:</strong> {{ preview.subject }}</p>
        <div class="preview-meta">
          <span>{{ preview.compareLinks.length }} сравнений</span>
          <span>{{ preview.reviews.length }} отзывов</span>
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
