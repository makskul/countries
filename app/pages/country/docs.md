# Логіка відображення на сторінці країни `/country/[slug]`

## 1. Nationality вибрана + є відгуки для неї

- Показуємо `NatFilterNotice` (рядок з вибраною nationality + кнопка "Змінити")
- Показуємо `CategoryScoresCard` (рейтинги по категоріях для цієї nationality)
- Показуємо **таби міст** (тільки міста де є відгуки від цієї nationality)
- Показуємо **сітку міст** над відгуками (якщо є міста)
- Показуємо список відгуків

---

## 2. Nationality вибрана + немає відгуків для неї

- Показуємо `NatFilterNotice`
- Показуємо блок з двома кнопками:
  - **[Змінити nationality]** → відкриває діалог вибору nationality
  - **[🌍 Показати всі відгуки]** → активує `showAllOverride`
- Показуємо CTA "Написати перший відгук →"
- **НЕ показуємо**: CategoryScoresCard, таби міст, список відгуків

---

## 3. showAllOverride активований (після кліку "Показати всі")

- Показуємо `nat-override-bar` (рядок "🌍 Показати всі · Змінити ×")
- **Nationality зберігається в store** — не скидається
- Показуємо `CategoryScoresCard` (рейтинги по всіх nationality)
- Показуємо **таби міст** (всі міста де є відгуки, незалежно від nationality)
- Показуємо **сітку міст** над відгуками
- Показуємо **всі відгуки** без фільтра по nationality
- Клік "×" в override bar → скидає override, повертає до стану #2

---

## 4. Nationality не вибрана

- Показуємо `no-nat-bar` з кнопкою "Вибрати nationality"
- `NatFilterNotice` не показується
- Відгуки, CategoryScoresCard, таби міст — **не показуємо**

---

## 5. Країна без відгуків взагалі

- `countryHasAnyReviews = false`
- Показуємо повний empty state з кнопкою "Написати перший відгук →"
- Нічого іншого не показуємо

---

## Сторінка міста `/country/[slug]/[city]`

Та сама логіка що і для країни (пункти 1–4), але:
- Заголовок: `{Країна}, {Місто}`
- Рейтинги і відгуки фільтруються по `city_id`
- `showAllOverride` **shared** через Pinia store між country і city page
- Таби міст показують всі міста цієї країни (щоб можна було перемикатись)

---

## Ключові стани в store (`useUserStore`)

| Поле | Тип | Опис |
|---|---|---|
| `nationality` | `string` | ISO код nationality. Зберігається в localStorage |
| `showAllReviews` | `boolean` | Override для показу всіх відгуків. Скидається при зміні nationality |
| `selectedCityId` | `number\|null` | Для переходу на city page з homepage |
