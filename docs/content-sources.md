# Источники и план наполнения контента

Статьи и seed-отзывы опираются на **публичные агрегаты**, не на выдуманные «юридические гарантии». Тон: практический опыт эмигранта; цифры — ориентиры, не обещания.

## Источники (канон)

| Тема | Источник | URL | Как используем |
|------|----------|-----|----------------|
| Уровень цен EU/EEA | **Eurostat** PPP / comparative price levels 2025 | [News 2025](https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20260618-2), [Statistics Explained](https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Comparative_price_levels_of_consumer_goods_and_services) | `price_level_eu` (EU=100), жильё vs продукты |
| Качество жизни экспатов | **InterNations Expat Insider 2025** | [Best & worst](https://www.internations.org/expat-insider/2025/best-and-worst-countries-2025) | `internations_rank` (из 46), тон отзывов (финансы / бюрократия / settling in) |
| Временная защита UA | **EU Temporary Protection** (до 4 Mar 2027) + переход | [Consilium](https://www.consilium.europa.eu/en/press/press-releases/2025/09/16/protection-of-displaced-ukrainians-council-adopts-recommendation-about-transition-out-of-temporary-protection/), [EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52025PC0650) | блок легализации для EU; без гарантий статуса |
| Налоги / валюта / климат | внутренний CMS [`app/utils/countryMeta.ts`](../app/utils/countryMeta.ts) | — | факты в сайдбаре + статьи |
| Городской быт | обобщение экспат-форумов + Numbeo *как ориентир* (не копируем индексы) | [Numbeo](https://www.numbeo.com/cost-of-living/) | районы, транспорт, аренда — качественно |

**Не используем как единственный источник:** Mercer/EIU (платные), сырые форумы без сверки.

## План генерации

1. Курируемый файл [`supabase/seed/content-facts.json`](../supabase/seed/content-facts.json) — факты по стране + хуки по городам + `sources[]`.
2. [`scripts/generate-content.mjs`](../scripts/generate-content.mjs) читает факты → статьи uk/en/ru + отзывы с рейтингами, смещёнными под Eurostat/InterNations.
3. `npm run content:generate` → `supabase/seed/generated/*.json`
4. `npm run db:seed-content` → БД (`author_profile: 'seed'`).

## Правила текста

- Упоминать ориентиры («по Eurostat 2025 цены ~X% от среднего EU»), не выдавать за личный замер.
- Для UA в EU: temporary protection / переход на другие статусы — **проверить официально**, даты меняются.
- Отзывы: микс UA/DE/PL/DK/GB; конкретика города; без медицинских/визовых обещаний.

## Ключевые цифры (зафиксированы в facts)

- Eurostat 2025 HFCE: **DK 140**, **IE 136**, **LU 132** (дорого); **BG 63**, **RO 65**, **PL 73** (дешевле EU).
- Жильё: **IE ~190%** EU, **BG ~41%** EU.
- InterNations 2025 (из наших стран): **TH 4, VN 5, ID 8, ES 9** … **DE 42, FI 43**; Spain — единственная EU в top-10.
