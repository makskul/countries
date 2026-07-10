#!/usr/bin/env node
/**
 * Generates articles + reviews from curated public-source facts.
 * Sources: docs/content-sources.md + supabase/seed/content-facts.json
 *
 * Usage: node scripts/generate-content.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CITIES_PATH = join(ROOT, 'supabase/seed/cities.json')
const FACTS_PATH = join(ROOT, 'supabase/seed/content-facts.json')
const OUT_DIR = join(ROOT, 'supabase/seed/generated')

const COUNTRY_NAMES = {
  AT: { en: 'Austria', uk: 'Австрія', ru: 'Австрия' },
  BE: { en: 'Belgium', uk: 'Бельгія', ru: 'Бельгия' },
  BG: { en: 'Bulgaria', uk: 'Болгарія', ru: 'Болгария' },
  HR: { en: 'Croatia', uk: 'Хорватія', ru: 'Хорватия' },
  CY: { en: 'Cyprus', uk: 'Кіпр', ru: 'Кипр' },
  CZ: { en: 'Czechia', uk: 'Чехія', ru: 'Чехия' },
  DK: { en: 'Denmark', uk: 'Данія', ru: 'Дания' },
  EE: { en: 'Estonia', uk: 'Естонія', ru: 'Эстония' },
  FI: { en: 'Finland', uk: 'Фінляндія', ru: 'Финляндия' },
  FR: { en: 'France', uk: 'Франція', ru: 'Франция' },
  DE: { en: 'Germany', uk: 'Німеччина', ru: 'Германия' },
  GR: { en: 'Greece', uk: 'Греція', ru: 'Греция' },
  HU: { en: 'Hungary', uk: 'Угорщина', ru: 'Венгрия' },
  IS: { en: 'Iceland', uk: 'Ісландія', ru: 'Исландия' },
  IE: { en: 'Ireland', uk: 'Ірландія', ru: 'Ирландия' },
  IL: { en: 'Israel', uk: 'Ізраїль', ru: 'Израиль' },
  IT: { en: 'Italy', uk: 'Італія', ru: 'Италия' },
  LV: { en: 'Latvia', uk: 'Латвія', ru: 'Латвия' },
  LT: { en: 'Lithuania', uk: 'Литва', ru: 'Литва' },
  LU: { en: 'Luxembourg', uk: 'Люксембург', ru: 'Люксембург' },
  MD: { en: 'Moldova', uk: 'Молдова', ru: 'Молдова' },
  MT: { en: 'Malta', uk: 'Мальта', ru: 'Мальта' },
  NL: { en: 'Netherlands', uk: 'Нідерланди', ru: 'Нидерланды' },
  NO: { en: 'Norway', uk: 'Норвегія', ru: 'Норвегия' },
  PL: { en: 'Poland', uk: 'Польща', ru: 'Польша' },
  PT: { en: 'Portugal', uk: 'Португалія', ru: 'Португалия' },
  RO: { en: 'Romania', uk: 'Румунія', ru: 'Румыния' },
  SK: { en: 'Slovakia', uk: 'Словаччина', ru: 'Словакия' },
  SI: { en: 'Slovenia', uk: 'Словенія', ru: 'Словения' },
  ES: { en: 'Spain', uk: 'Іспанія', ru: 'Испания' },
  SE: { en: 'Sweden', uk: 'Швеція', ru: 'Швеция' },
  CH: { en: 'Switzerland', uk: 'Швейцарія', ru: 'Швейцария' },
  GB: { en: 'United Kingdom', uk: 'Велика Британія', ru: 'Великобритания' },
  IM: { en: 'Isle of Man', uk: 'Острів Мен', ru: 'Остров Мэн' },
  JE: { en: 'Jersey', uk: 'Джерсі', ru: 'Джерси' },
  GG: { en: 'Guernsey', uk: 'Гернсі', ru: 'Гернси' },
  TH: { en: 'Thailand', uk: 'Таїланд', ru: 'Таиланд' },
  VN: { en: 'Vietnam', uk: 'В\'єтнам', ru: 'Вьетнам' },
  ID: { en: 'Indonesia', uk: 'Індонезія', ru: 'Индонезия' },
}

const NATIONALITIES = ['UA', 'UA', 'UA', 'UA', 'DE', 'PL', 'DK', 'GB']
const PURPOSES = ['tourism', 'short_term', 'long_term', 'permanent', 'long_term', 'short_term']
const CLIMATES = [
  ['sunny', 'warm'], ['rainy', 'cloudy'], ['cold', 'windy'],
  ['warm', 'humid'], ['sunny'], ['cloudy', 'rainy'],
]
const RATING_KEYS = [
  'legalization', 'cost_of_living', 'bureaucracy', 'cleanliness',
  'safety', 'healthcare', 'language_barrier', 'overall',
]

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)]
}

function clampRating(v) {
  return Math.max(1, Math.min(5, Math.round(v)))
}

function toneBase(tone, map) {
  return map[tone] ?? map.medium
}

function ratingBases(fact) {
  const cost = toneBase(fact.cost_tone, { low: 4.2, medium: 3.4, high: 2.6, very_high: 2.1 })
  const bureau = toneBase(fact.bureaucracy_tone, { low: 4.0, medium: 3.2, high: 2.3 })
  const safety = toneBase(fact.safety_tone, { low: 2.8, medium: 3.5, high: 4.3 })
  let overall = 3.4
  if (fact.internations_rank != null) {
    // 1..46 → ~4.6 .. ~2.4
    overall = 4.7 - (fact.internations_rank - 1) * (2.3 / 45)
  } else if (fact.price_level_eu != null) {
    overall = fact.price_level_eu < 80 ? 3.8 : fact.price_level_eu > 120 ? 3.1 : 3.5
  }
  return {
    legalization: fact.tpd_available ? 3.8 : 3.0,
    cost_of_living: cost,
    bureaucracy: bureau,
    cleanliness: 3.5,
    safety,
    healthcare: fact.eu_member ? 3.7 : 3.3,
    language_barrier: 3.2,
    overall,
  }
}

function priceParagraph(fact, lang) {
  if (fact.price_level_eu == null) {
    if (lang === 'uk') return 'Офіційного Eurostat-індексу для цієї країни в нашому наборі немає — орієнтуйтеся на локальні ціни оренди й кошик продуктів.'
    if (lang === 'ru') return 'Официального Eurostat-индекса для этой страны в нашем наборе нет — ориентируйтесь на локальные цены аренды и продуктов.'
    return 'No Eurostat price-level figure in our dataset for this country — use local rent and grocery baskets as your compass.'
  }
  const p = fact.price_level_eu
  if (lang === 'uk') {
    return `За Eurostat 2025 рівень цін домогосподарств близько ${p}% від середнього EU (100 = середнє). Це орієнтир PPP, не ваш особистий бюджет: зарплати й оренда в конкретному місті можуть відрізнятися.`
  }
  if (lang === 'ru') {
    return `По Eurostat 2025 уровень цен домохозяйств около ${p}% от среднего EU (100 = среднее). Это ориентир PPP, не ваш личный бюджет: зарплаты и аренда в конкретном городе могут отличаться.`
  }
  return `Eurostat 2025 household price level is about ${p}% of the EU average (100 = average). Treat it as a PPP compass, not your personal budget — city rents and wages still diverge.`
}

function visaParagraph(fact, lang) {
  if (fact.tpd_available) {
    if (lang === 'uk') {
      return 'Для громадян України в країнах EU діє режим тимчасового захисту (Temporary Protection), продовжений щонайменше до 4 березня 2027; Рада EU також готує перехід на інші статуси. Умови й документи перевіряйте на офіційних сайтах країни — це не юридична консультація.'
    }
    if (lang === 'ru') {
      return 'Для граждан Украины в странах EU действует режим временной защиты (Temporary Protection), продлённый как минимум до 4 марта 2027; Совет EU также готовит переход на другие статусы. Условия и документы проверяйте на официальных сайтах страны — это не юридическая консультация.'
    }
    return 'For Ukrainians in EU member states, Temporary Protection remains in place at least until 4 March 2027, with EU guidance on transitioning to other statuses. Always verify documents on official national sites — this is not legal advice.'
  }
  if (lang === 'uk') {
    return 'Ця країна поза схемою EU Temporary Protection: візи, ВНЖ і work permit залежать від національних правил. Плануйте запас часу на подання й продовження.'
  }
  if (lang === 'ru') {
    return 'Эта страна вне схемы EU Temporary Protection: визы, ВНЖ и work permit зависят от национальных правил. Заложите запас времени на подачу и продление.'
  }
  return 'This destination is outside EU Temporary Protection: visas and work permits follow national rules. Build buffer time for applications and renewals.'
}

function internationsLine(fact, lang) {
  if (fact.internations_rank == null) return null
  const r = fact.internations_rank
  if (lang === 'uk') {
    return `У опитуванні InterNations Expat Insider 2025 країна на ${r}-му місці з 46 напрямків (суб’єктивні оцінки експатів: фінанси, адаптація, QoL).`
  }
  if (lang === 'ru') {
    return `В опросе InterNations Expat Insider 2025 страна на ${r}-м месте из 46 направлений (субъективные оценки экспатов: финансы, адаптация, QoL).`
  }
  return `In InterNations Expat Insider 2025 this destination ranks #${r} of 46 (expat self-reports on finance, settling in, QoL).`
}

function countryArticle(code, names, fact) {
  const n = names
  const inLine = {
    en: internationsLine(fact, 'en'),
    uk: internationsLine(fact, 'uk'),
    ru: internationsLine(fact, 'ru'),
  }
  return {
    code,
    article_title_en: `Living in ${n.en}: costs, paperwork, and daily reality`,
    article_title_uk: `Життя в ${n.uk}: ціни, папери та повсякденність`,
    article_title_ru: `Жизнь в ${n.ru}: цены, бумаги и повседневность`,
    article_excerpt_en: fact.hook_en,
    article_excerpt_uk: fact.hook_uk,
    article_excerpt_ru: fact.hook_ru,
    article_body_en: [
      fact.hook_en,
      priceParagraph(fact, 'en'),
      inLine.en,
      visaParagraph(fact, 'en'),
      fact.language_en,
      'Who it fits: people who budget for housing first, accept that bureaucracy timelines slip, and verify rules on official sites before moving.',
    ].filter(Boolean).join('\n\n'),
    article_body_uk: [
      fact.hook_uk,
      priceParagraph(fact, 'uk'),
      inLine.uk,
      visaParagraph(fact, 'uk'),
      fact.language_uk,
      'Кому підходить: тим, хто спочатку рахує житло, закладає запас на бюрократію й перевіряє правила на офіційних сайтах до переїзду.',
    ].filter(Boolean).join('\n\n'),
    article_body_ru: [
      fact.hook_ru,
      priceParagraph(fact, 'ru'),
      inLine.ru,
      visaParagraph(fact, 'ru'),
      fact.language_ru,
      'Кому подходит: тем, кто сначала считает жильё, закладывает запас на бюрократию и проверяет правила на официальных сайтах до переезда.',
    ].filter(Boolean).join('\n\n'),
  }
}

function cityArticle(city, names, fact) {
  const cn = names
  const cityEn = city.name_en
  const cityUk = city.name_uk || city.name_en
  const cityRu = city.name_ru || city.name_en
  const tip = fact.cities?.[city.slug] || null
  const tipEn = tip?.en || `Neighborhood choice in ${cityEn} changes rent, commute, and how “expat-friendly” daily errands feel.`
  const tipUk = tip?.uk || `Вибір району в ${cityUk} змінює оренду, дорогу й те, наскільки «експатськи» зручний побут.`
  const tipRu = tip?.ru || `Выбор района в ${cityRu} меняет аренду, дорогу и то, насколько «экспатски» удобен быт.`

  return {
    country: city.country,
    slug: city.slug,
    article_title_en: `${cityEn}: where expats actually settle`,
    article_title_uk: `${cityUk}: де реально селяться емігранти`,
    article_title_ru: `${cityRu}: где реально селятся эмигранты`,
    article_excerpt_en: tipEn,
    article_excerpt_uk: tipUk,
    article_excerpt_ru: tipRu,
    article_body_en: [
      `${cityEn} is a common shortlist city when people look at ${cn.en}.`,
      tipEn,
      fact.housing_note_en || 'Housing is usually the largest budget line; compare districts before signing.',
      `Language on the ground: ${fact.language_en}`,
      `Context for the country: ${fact.hook_en}`,
      'Best approach: visit for 2–4 weeks, test a commute, and only then sign a longer lease.',
    ].join('\n\n'),
    article_body_uk: [
      `${cityUk} часто потрапляє в шортліст при переїзді до ${cn.uk}.`,
      tipUk,
      fact.housing_note_uk || 'Житло зазвичай найбільша стаття бюджету; порівнюйте райони перед договором.',
      `Мова на місці: ${fact.language_uk}`,
      `Контекст країни: ${fact.hook_uk}`,
      'Найкращий підхід: 2–4 тижні на місці, перевірка дороги на роботу, і лише потім довгий договір оренди.',
    ].join('\n\n'),
    article_body_ru: [
      `${cityRu} часто попадает в шортлист при переезде в ${cn.ru}.`,
      tipRu,
      fact.housing_note_ru || 'Жильё обычно самая большая статья бюджета; сравнивайте районы перед договором.',
      `Язык на месте: ${fact.language_ru}`,
      `Контекст страны: ${fact.hook_ru}`,
      'Лучший подход: 2–4 недели на месте, проверка дороги на работу, и только потом длинный договор аренды.',
    ].join('\n\n'),
  }
}

function commentPack(fact, city, lang) {
  const cityName = lang === 'uk' ? (city.name_uk || city.name_en) : lang === 'ru' ? (city.name_ru || city.name_en) : city.name_en
  const tip = fact.cities?.[city.slug]
  const tipLine = tip ? (tip[lang] || tip.en) : null

  if (lang === 'uk') {
    return {
      legalization: fact.tpd_available
        ? [`Тимчасовий захист у ${fact.eu_member ? 'EU' : 'країні'} спростив старт, але черги й довідки все одно були.`, 'Запис на подання — головне вузьке місце; скани всіх сторінок паспорта тримайте під рукою.']
        : ['Візовий трек зайняв довше, ніж очікував — без запасу часу ніяк.', 'Національні правила тут жорсткіші за EU TPD; перевіряв офіційний сайт двічі.'],
      cost_of_living: fact.price_level_eu != null
        ? [`Ціни відчуваються близько до орієнтира Eurostat (~${fact.price_level_eu}% EU): оренда б’є сильніше за продукти.`, `У ${cityName} оренда з’їла більшість бюджету; продукти терпимі, якщо готувати вдома.`]
        : [`У ${cityName} головний удар — житло; локальна їжа рятує бюджет.`, 'Якщо дохід у «твердій» валюті — жити легше; на локальній зарплаті тісніше.'],
      bureaucracy: fact.bureaucracy_tone === 'high'
        ? ['Бюрократія важка: один відсутній штамп = ще тиждень.', 'Онлайн є, але фінал майже завжди офлайн.']
        : ['Папери відносно структуровані, якщо є чекліст.', 'Портали допомагають, але копії все одно беріть.'],
      cleanliness: ['Вулиці загалом охайні, залежить від району.', 'Туристичний центр брудніший у пік сезону.'],
      safety: fact.safety_tone === 'high'
        ? [`У ${cityName} ввечері почуваюся спокійно в житлових районах.`, 'Звичайна міська обережність достатня.']
        : ['У центрі ок, уночі обираю освітлені маршрути.', 'Дрібні крадіжки — основний ризик.'],
      healthcare: ['До сімейного лікаря чекати довго; приватне швидше.', 'Екстрена допомога була на рівні, коли знадобилась.'],
      language_barrier: [fact.language_uk, 'Базові фрази дуже допомогли з орендодавцем і клінікою.'],
      overall: [
        tipLine || `Після 2–3 місяців у ${cityName} побут став передбачуваним.`,
        fact.internations_rank != null && fact.internations_rank <= 15
          ? 'Суб’єктивно збігається з високими оцінками експатів у InterNations — якщо бюджет реалістичний.'
          : fact.internations_rank != null && fact.internations_rank >= 37
            ? 'Інфраструктура сильна, але адаптація й витрати важчі, ніж очікував — як у низьких місцях InterNations.'
            : 'Рекомендую пробний період перед довгим контрактом оренди.',
      ],
    }
  }

  if (lang === 'ru') {
    return {
      legalization: fact.tpd_available
        ? ['Временная защита упростила старт, но очереди и справки всё равно были.', 'Запись на подачу — узкое место; сканы паспорта держите под рукой.']
        : ['Визовый трек занял дольше, чем ждал.', 'Национальные правила жёстче EU TPD — сверял официальный сайт.'],
      cost_of_living: fact.price_level_eu != null
        ? [`Цены ощущаются около ориентира Eurostat (~${fact.price_level_eu}% EU): аренда бьёт сильнее продуктов.`, `В ${cityName} аренда съела большую часть бюджета.`]
        : [`В ${cityName} главный удар — жильё.`, 'С доходом в твёрдой валюте легче.'],
      bureaucracy: fact.bureaucracy_tone === 'high'
        ? ['Бюрократия тяжёлая: один штамп — и ещё неделя.', 'Онлайн есть, финал почти всегда офлайн.']
        : ['Бумаги относительно структурированы с чеклистом.', 'Порталы помогают, копии всё равно берите.'],
      cleanliness: ['Улицы в целом опрятные, зависит от района.', 'Туристический центр грязнее в сезон.'],
      safety: fact.safety_tone === 'high'
        ? [`В ${cityName} вечером спокойно в жилых районах.`, 'Обычная городская осторожность достаточна.']
        : ['В центре ок, ночью выбираю освещённые маршруты.', 'Мелкие кражи — основной риск.'],
      healthcare: ['К семейному врачу ждать долго; частное быстрее.', 'Экстренная помощь была на уровне.'],
      language_barrier: [fact.language_ru, 'Базовые фразы помогли с арендодателем.'],
      overall: [
        tipLine || `Через 2–3 месяца в ${cityName} быт стал предсказуемым.`,
        fact.internations_rank != null && fact.internations_rank <= 15
          ? 'Субъективно совпадает с высокими оценками InterNations — при реалистичном бюджете.'
          : fact.internations_rank != null && fact.internations_rank >= 37
            ? 'Инфраструктура сильная, но адаптация и расходы тяжелее — как в низких местах InterNations.'
            : 'Рекомендую пробный период перед длинной арендой.',
      ],
    }
  }

  return {
    legalization: fact.tpd_available
      ? ['Temporary protection made the start easier, but queues and certificates still took time.', 'Booking the appointment was the bottleneck — keep passport scans ready.']
      : ['The visa track took longer than expected.', 'National rules are stricter than EU TPD — I double-checked the official site.'],
    cost_of_living: fact.price_level_eu != null
      ? [`Prices feel close to the Eurostat compass (~${fact.price_level_eu}% of EU): rent hits harder than groceries.`, `In ${cityName} rent ate most of the budget.`]
      : [`In ${cityName} housing is the main hit.`, 'Hard-currency income makes daily life easier.'],
    bureaucracy: fact.bureaucracy_tone === 'high'
      ? ['Bureaucracy is heavy: one missing stamp costs another week.', 'Portals help, but the final step is usually in person.']
      : ['Paperwork is manageable with a checklist.', 'Bring printed copies anyway.'],
    cleanliness: ['Streets are generally tidy; depends on the district.', 'Tourist cores get messier in peak season.'],
    safety: fact.safety_tone === 'high'
      ? [`I feel safe in residential parts of ${cityName} at night.`, 'Normal city caution is enough.']
      : ['Fine in the center; I stick to lit streets late.', 'Petty theft is the main risk.'],
    healthcare: ['GP waits are long; private is faster if you can pay.', 'Emergency care was solid when needed.'],
    language_barrier: [fact.language_en, 'Basic phrases helped a lot with landlords and clinics.'],
    overall: [
      tipLine || `After 2–3 months in ${cityName}, daily life became predictable.`,
      fact.internations_rank != null && fact.internations_rank <= 15
        ? 'Matches the strong InterNations vibe — if your budget is realistic.'
        : fact.internations_rank != null && fact.internations_rank >= 37
          ? 'Infrastructure is strong, but settling-in and costs bite — consistent with lower InterNations ranks.'
          : 'Do a trial stay before a long lease.',
    ],
  }
}

function makeReview(rng, city, fact, index) {
  const nat = pick(rng, NATIONALITIES)
  const purpose = pick(rng, PURPOSES)
  const still = rng() > 0.35
  const climate = pick(rng, CLIMATES)
  const lang = nat === 'UA' ? 'uk' : nat === 'PL' ? 'uk' : 'en'
  const pack = commentPack(fact, city, lang)
  const bases = ratingBases(fact)

  const ratings = {}
  const comments = {}
  for (const key of RATING_KEYS) {
    if (rng() > 0.12) {
      const jitter = (rng() - 0.45) * 1.8
      ratings[key] = clampRating((bases[key] ?? 3.4) + jitter)
      if (rng() > 0.2) {
        comments[key] = pick(rng, pack[key])
      }
    }
  }
  if (!ratings.overall) ratings.overall = clampRating(bases.overall)
  if (!comments.overall) comments.overall = pick(rng, pack.overall)

  const daysAgo = Math.floor(rng() * 320) + 5
  const created = new Date(Date.now() - daysAgo * 86400000)

  return {
    author_nationality: nat,
    target_country: city.country,
    city_slug: city.slug,
    city_name: city.name_en,
    ratings,
    comments,
    stay_purpose: purpose,
    still_there: still,
    climate,
    is_approved: true,
    author_profile: 'seed',
    created_at: created.toISOString(),
    _seed_index: index,
  }
}

function main() {
  const cities = JSON.parse(readFileSync(CITIES_PATH, 'utf8'))
  const factsFile = JSON.parse(readFileSync(FACTS_PATH, 'utf8'))
  const defaults = factsFile.defaults || {}
  const countriesFacts = factsFile.countries || {}

  const codes = [...new Set(cities.map(c => c.country))].sort()
  const missing = codes.filter(c => !countriesFacts[c])
  if (missing.length) {
    console.warn(`[generate-content] missing facts for: ${missing.join(', ')}`)
  }

  const countryArticles = codes.map((code) => {
    const fact = { ...defaults, ...(countriesFacts[code] || {}) }
    return countryArticle(code, COUNTRY_NAMES[code] || { en: code, uk: code, ru: code }, fact)
  })

  const cityArticles = cities.map((city) => {
    const fact = { ...defaults, ...(countriesFacts[city.country] || {}) }
    return cityArticle(city, COUNTRY_NAMES[city.country] || { en: city.country, uk: city.country, ru: city.country }, fact)
  })

  const rng = mulberry32(20260710)
  const reviews = []
  let i = 0
  for (const city of cities) {
    const fact = { ...defaults, ...(countriesFacts[city.country] || {}) }
    reviews.push(makeReview(rng, city, fact, i++))
  }
  while (reviews.length < 130) {
    const city = pick(rng, cities)
    const fact = { ...defaults, ...(countriesFacts[city.country] || {}) }
    reviews.push(makeReview(rng, city, fact, i++))
  }

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(join(OUT_DIR, 'country-articles.json'), JSON.stringify(countryArticles, null, 2))
  writeFileSync(join(OUT_DIR, 'city-articles.json'), JSON.stringify(cityArticles, null, 2))
  writeFileSync(join(OUT_DIR, 'reviews.json'), JSON.stringify(reviews, null, 2))

  console.log(`[generate-content] sources: docs/content-sources.md`)
  console.log(`[generate-content] countries: ${countryArticles.length}`)
  console.log(`[generate-content] cities: ${cityArticles.length}`)
  console.log(`[generate-content] reviews: ${reviews.length}`)
  console.log(`[generate-content] wrote ${OUT_DIR}`)
}

main()
