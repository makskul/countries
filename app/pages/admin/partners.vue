<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ robots: 'noindex, nofollow' })

type Status = 'ok' | 'no-id' | 'placeholder'

interface PartnerRow {
  name: string
  kind: string
  url: string
  where: string
  idInfo: string
  status: Status
  note: string
}

// Reference list so nothing gets forgotten. Update together with app/utils/partners.ts
// and the head script in nuxt.config.ts.
const partners: PartnerRow[] = [
  {
    name: 'Travelpayouts (Emerald / LinkSwitcher)',
    kind: 'Сеть партнёрок',
    url: 'https://www.travelpayouts.com',
    where: 'Все страницы сайта (скрипт в nuxt.config.ts)',
    idInfo: 'Скрипт emrld.ltd/NTQ1NzIx.js, t=545721',
    status: 'ok',
    note: 'Сам превращает подходящие ссылки на сайте в партнёрские. Статистика — в кабинете Travelpayouts.',
  },
  {
    name: 'SafetyWing',
    kind: 'Страхование для путешественников',
    url: 'https://safetywing.com',
    where: 'Блоки партнёров на странице страны, в сравнении и на карте',
    idInfo: 'referenceID=triplandr',
    status: 'ok',
    note: '',
  },
  {
    name: 'Wise',
    kind: 'Денежные переводы',
    url: 'https://wise.com',
    where: 'Блок партнёров на странице страны',
    idInfo: 'wise.com/invite/triplandr',
    status: 'ok',
    note: 'Реферальная ссылка-приглашение.',
  },
  {
    name: 'iVisa',
    kind: 'Визовые документы онлайн',
    url: 'https://www.ivisa.com',
    where: 'Блоки партнёров на странице страны, в сравнении и на карте',
    idInfo: 'Нет партнёрского ID',
    status: 'no-id',
    note: 'В ссылке только UTM-метки. Нужно зарегистрироваться в партнёрской программе и вставить свою ссылку в app/utils/partners.ts.',
  },
  {
    name: 'HousingAnywhere',
    kind: 'Аренда жилья',
    url: 'https://housinganywhere.com',
    where: 'Блоки партнёров на странице страны и на карте',
    idInfo: 'Нет партнёрского ID',
    status: 'no-id',
    note: 'В ссылке только UTM-метки. Нужна партнёрская ссылка.',
  },
  {
    name: 'UA visa agent (заглушка)',
    kind: 'Визовый агент для граждан Украины',
    url: 'https://example.com/ua-visa-agent',
    where: 'Только для национальности UA: страница страны, сравнение, карта',
    idInfo: 'Адрес example.com',
    status: 'placeholder',
    note: 'Это не настоящий партнёр. Нужно подставить реального агента или убрать запись из app/utils/partners.ts.',
  },
]

const statusMeta: Record<Status, { label: string; severity: 'success' | 'warn' | 'danger' }> = {
  ok: { label: 'Работает', severity: 'success' },
  'no-id': { label: 'Нет ID', severity: 'warn' },
  placeholder: { label: 'Заглушка', severity: 'danger' },
}
</script>

<template>
  <div>
    <AdminBreadcrumb :items="[{ label: 'Обзор', to: '/admin' }, { label: 'Партнёрки' }]" />
    <h1 class="admin-page-title">Партнёрки</h1>
    <p class="admin-page-lead">
      Какие партнёрские программы подключены к сайту и куда ведут ссылки. Список справочный: меняется в коде
      (<code>app/utils/partners.ts</code> и скрипт в <code>nuxt.config.ts</code>).
    </p>

    <div class="admin-card">
      <DataTable :value="partners" data-key="name">
        <Column header="Партнёр">
          <template #body="{ data: row }">
            <a :href="row.url" target="_blank" rel="noopener noreferrer"><strong>{{ row.name }}</strong></a>
            <div class="partner-kind">{{ row.kind }}</div>
          </template>
        </Column>
        <Column field="where" header="Где показывается" />
        <Column field="idInfo" header="Партнёрский ID" />
        <Column header="Статус">
          <template #body="{ data: row }">
            <Tag :value="statusMeta[row.status as Status].label" :severity="statusMeta[row.status as Status].severity" />
          </template>
        </Column>
        <Column field="note" header="Заметка" />
      </DataTable>
    </div>
  </div>
</template>

<style scoped>
.partner-kind { font-size: 12px; color: var(--color-text-muted); margin-top: 2px; }
code { font-size: 12px; background: var(--color-bg-tertiary); padding: 1px 5px; border-radius: 4px; }
</style>
