# Як додати нову країну в Zeemler

## Чеклист — 6 кроків

---

### 1. `TARGET_COUNTRIES` — `/utils/countries.ts`

Додай новий запис в масив у алфавітному порядку:

```ts
{ code: 'XX', name: 'Country Name' }
```

---

### 2. `COUNTRY_META` — `/utils/countryMeta.ts`

Додай метадані країни:

```ts
XX: {
  languageKey:    'english',           // ключ з /locales/*/country.ts → languages
  currency:       'EUR',               // ISO код валюти
  climate:        ['sunny', 'rainy'],  // масив іконок погоди
  costLevel:      'medium',            // low | medium | high | very_high
  residencyMonths:'60',                // тільки цифра, без "міс."
  tax_employee:   '20–45%',           // ПДФО діапазон
  tax_corporate:  '19%',              // податок на прибуток
}
```

**Доступні значення `climate`:**
`sunny` ☀️ · `warm` 🌤️ · `rainy` 🌧️ · `cloudy` 🌥️ · `cold` ❄️ · `snow` 🌨️ · `windy` 💨 · `humid` 💧

**Доступні значення `costLevel`:**
`low` · `medium` · `high` · `very_high`

---

### 3. Регіон — `/utils/regions.ts`

```ts
XX: 'europe'  // або: asia | america | africa | oceania
```

---

### 4. Назви країни в локалях

Додай в кожен файл локалізації:

**`/locales/uk/countryNames.ts`**
```ts
XX: 'Назва українською',
```

**`/locales/en/countryNames.ts`**
```ts
XX: 'Name in English',
```

**`/locales/ru/countryNames.ts`**
```ts
XX: 'Название на русском',
```

---

### 5. Міста — Supabase SQL Editor

```sql
INSERT INTO cities (country, name_en, name_uk, name_ru, population, slug)
VALUES
  ('XX', 'City Name', 'Назва міста', 'Название города', 1000000, 'city-name'),
  ('XX', 'City Two',  'Місто два',   'Город два',        500000,  'city-two');

-- Перевірка
SELECT * FROM cities WHERE country = 'XX' ORDER BY population DESC;
```

**Правило для slug:** `name_en` в нижньому регістрі, пробіли замінити на `-`
- `"Ho Chi Minh City"` → `"ho-chi-minh-city"`
- `"New York"` → `"new-york"`

---

### 6. Нова мова (якщо потрібно)

Якщо `languageKey` якого ще **немає** в локалях — додай в усі три файли `/locales/*/country.ts` в секцію `languages`:

```ts
languages: {
  ...existing,
  your_new_key: 'Назва мови',  // uk
}
```

---

## Швидка перевірка після додавання

- [ ] Країна з'являється в списку країн `/countries`
- [ ] Країна з'являється у фільтрі "Європа" (або інший регіон)
- [ ] Сторінка країни `/country/xx` відкривається без помилок
- [ ] Сайдбар показує правильні дані (мова, валюта, клімат, податки)
- [ ] Міста доступні в AutoComplete форми відгуку
- [ ] Країна доступна в селекторі порівняння `/compare`

---

## Приклад — додавання Сербії (RS)

```ts
// countries.ts
{ code: 'RS', name: 'Serbia' }

// countryMeta.ts
RS: {
  languageKey:    'serbian',
  currency:       'RSD',
  climate:        ['warm', 'cold', 'rainy'],
  costLevel:      'low',
  residencyMonths:'60',
  tax_employee:   '10–20%',
  tax_corporate:  '15%',
}

// regions.ts
RS: 'europe'
```

```sql
-- cities
INSERT INTO cities (country, name_en, name_uk, name_ru, population, slug)
VALUES
  ('RS', 'Belgrade', 'Белград', 'Белград', 1700000, 'belgrade'),
  ('RS', 'Novi Sad', 'Нові Сад', 'Нови-Сад', 290000, 'novi-sad');
```
