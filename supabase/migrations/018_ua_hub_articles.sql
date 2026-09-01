-- EPIC-2.4: UA×country content hub articles (8 destinations)
-- Full body: PL, DE, CZ | Excerpt scaffold: ES, PT, GE, TR, TH

-- Ensure GE/TR exist for hub pages (used in compare + nat landings)
INSERT INTO countries (code, region, is_active, language_key, currency, climate_key, cost_level, residency_months, tax_employee, tax_corporate)
VALUES
  ('GE', 'europe', true, 'english', 'GEL', 'temperate', 'low', '12', '20%', '15%'),
  ('TR', 'europe', true, 'english', 'TRY', 'mediterranean', 'medium', '12', '15–40%', '25%')
ON CONFLICT (code) DO UPDATE SET
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- PL — full hub
UPDATE countries SET
  article_published = true,
  article_title_uk = 'Українці в Польщі: легалізація, житло та повсякденність',
  article_title_en = 'Ukrainians in Poland: legalization, housing, and daily life',
  article_title_ru = 'Украинцы в Польше: легализация, жильё и повседневность',
  article_excerpt_uk = 'Найпопularніший EU-напрям для українців: тимчасовий захист, PESEL ukraiński, конкуренція за житло у Варшаві та Кракові.',
  article_excerpt_en = 'The most popular EU destination for Ukrainians: temporary protection, PESEL ukraiński, and tight housing in Warsaw and Kraków.',
  article_excerpt_ru = 'Самое популярное EU-направление для украинцев: временная защита, PESEL ukraiński и конкуренция за жильё в Варшаве и Кракове.',
  article_body_uk = E'Польща залишається головною країною першого контакту для українців у EU: близькість, спількордонні регіони та велика diaspora роблять перехід м’якшим, ніж у більш віддалених країнах.\n\nЛегалізація. Громадяни України можуть користуватися тимчасовим захистом (Temporary Protection) щонайменше до 4 березня 2027 року. PESEL ukraiński відкриває доступ до ринку праці, освіти та медицини. Подайте заяву в voivodeship або через MOS — терміни залежать від воєводства, тому закладайте запас часу.\n\nЖитло та робота. Варшава і Краків — найдорожчі ринки; Wrocław, Poznań, Gdańsk часто дешевші. Оренда через OLX/Otodom; депозит 1–2 місяці — норма. IT і логістика активно наймають, але без базової польської в установах буде складніше.\n\nЩо далі. Якщо вагаєте між Польщею та сусідами — порівняйте реальні оцінки українців у наших compare-сторінках нижче. Умови й документи завжди перевіряйте на офіційних сайтах — це не юридична консультація.',
  article_body_en = E'Poland remains the main first-stop country for Ukrainians in the EU: proximity, cross-border regions, and a large diaspora make the transition softer than in more distant destinations.\n\nLegalization. Ukrainian citizens can use Temporary Protection at least until 4 March 2027. PESEL ukraiński opens access to work, education, and healthcare. Apply at the voivodeship or via MOS — timelines vary by region, so build buffer time.\n\nHousing and work. Warsaw and Kraków are the priciest markets; Wrocław, Poznań, and Gdańsk are often cheaper. Rent via OLX/Otodom; a 1–2 month deposit is standard. IT and logistics hire actively, but basic Polish helps in offices.\n\nNext steps. If you are weighing Poland against neighbours, compare real Ukrainian ratings on our compare pages below. Always verify rules on official sites — this is not legal advice.',
  article_body_ru = E'Польша остаётся главной страной первого контакта для украинцев в EU: близость, приграничные регионы и большая diaspora смягчают переезд по сравнению с более удалёнными направлениями.\n\nЛегализация. Граждане Украины могут пользоваться временной защитой (Temporary Protection) как минимум до 4 марта 2027 года. PESEL ukraiński открывает доступ к работе, образованию и медицине. Подавайте заявление в voivodeship или через MOS — сроки зависят от воеводства.\n\nЖильё и работа. Варшава и Краков — самые дорогие рынки; Wrocław, Poznań, Gdańsk часто дешевле. Аренда через OLX/Otodom; депозит 1–2 месяца — норма. IT и логистика активно нанимают, но базовый польский в учреждениях помогает.\n\nДальше. Если выбираете между Польшей и соседями — сравните реальные оценки украинцев на compare-страницах ниже. Условия проверяйте на официальных сайтах — это не юридическая консультация.',
  updated_at = now()
WHERE code = 'PL';

-- DE — full hub
UPDATE countries SET
  article_published = true,
  article_title_uk = 'Українці в Німеччині: тимчасовий захист, Anmeldung і робота',
  article_title_en = 'Ukrainians in Germany: temporary protection, Anmeldung, and work',
  article_title_ru = 'Украинцы в Германии: временная защита, Anmeldung и работа',
  article_excerpt_uk = 'Сильна інфраструктура, але жорстка бюрократія: Anmeldung, пошук житла та німецька в повсякденні установах.',
  article_excerpt_en = 'Strong infrastructure but strict bureaucracy: Anmeldung, flat hunting, and German in daily offices.',
  article_excerpt_ru = 'Сильная инфраструктура, но жёсткая бюрократия: Anmeldung, поиск жилья и немецкий в повседневных учреждениях.',
  article_body_uk = E'Німеччина — другий за популярністю напрям для українців у EU після Польщі. Тут сильні соціальні гарантії та ринок праці, але бюрократія й оренда часто стають головним стресом.\n\nЛегалізація. Temporary Protection діє в Німеччині; після реєстрації отримуєте Aufenthaltstitel і доступ до соціальних послуг. Anmeldung (реєстрація за адресою) — обов’язковий перший крок; без нього ускладнюються банк, договори та дитячі садки.\n\nЖитло. Конкуренція за Wohnung висока: Schufa, Mietschuldenfreiheitsbescheinigung, іноді три місяці Kaution. Berlin, München, Hamburg — найскладніші ринки; східні землі іноді швидші за документами.\n\nПорівняйте з Польщею та Чехією в compare-блоках нижче, якщо ще обираєте країну. Офіційні правила — на сайтах BAMF та місцевих Ausländerbehörde.',
  article_body_en = E'Germany is the second most popular EU destination for Ukrainians after Poland. Social safety nets and the job market are strong, but bureaucracy and rent are often the main stress.\n\nLegalization. Temporary Protection applies in Germany; after registration you receive Aufenthaltstitel and access to services. Anmeldung (address registration) is the mandatory first step — without it, banking, contracts, and childcare get harder.\n\nHousing. Flat competition is intense: Schufa, Mietschuldenfreiheitsbescheinigung, sometimes three months Kaution. Berlin, Munich, and Hamburg are toughest; eastern Länder can be faster for paperwork.\n\nCompare with Poland and Czechia in the compare block below if you are still choosing. Official rules live on BAMF and local Ausländerbehörde sites.',
  article_body_ru = E'Германия — второе по популярности EU-направление для украинцев после Польши. Соцгарантии и рынок труда сильные, но бюрократия и аренда часто главный стресс.\n\nЛегализация. Temporary Protection действует; после регистрации — Aufenthaltstitel и доступ к услугам. Anmeldung (регистрация адреса) обязателен; без него сложнее с банком, договорами и садами.\n\nЖильё. Конкуренция за Wohnung высокая: Schufa, Mietschuldenfreiheitsbescheinigung, иногда три месяца Kaution. Berlin, München, Hamburg — самые сложные рынки.\n\nСравните с Польшей и Чехией в compare-блоке ниже. Официальные правила — на сайтах BAMF и Ausländerbehörde.',
  updated_at = now()
WHERE code = 'DE';

-- CZ — full hub
UPDATE countries SET
  article_published = true,
  article_title_uk = 'Українці в Чехії: Прага, документи та вартість життя',
  article_title_en = 'Ukrainians in Czechia: Prague, paperwork, and cost of living',
  article_title_ru = 'Украинцы в Чехии: Прага, документы и стоимость жизни',
  article_excerpt_uk = 'Центральна Європа з доступнішими цінами, ніж DE/AT: головний виклик — житло в Празі та чеська в установах.',
  article_excerpt_en = 'Central Europe with lower prices than DE/AT: main challenge is Prague housing and Czech in offices.',
  article_excerpt_ru = 'Центральная Европа с ценами ниже DE/AT: главный вызов — жильё в Праге и чешский в учреждениях.',
  article_body_uk = E'Чехія — популярна альтернатива Польщі та Німеччині: менші міста часто дешевші за Прагу, а Temporary Protection діє на тих самих EU-умовах.\n\nЛегалізація. Після прибуття зареєструйтеся в MOI (Ministerstvo vnitra) або через допоміжні центри для біженців. Отримайте тимчасовий захист і номер для доступу до медицини та праці. Терміни в Празі довші, ніж у регіонах.\n\nЖитло та робота. Прага — найконкурентніший ринок; Brno, Ostrava, Plzeň часто простіші. IT і виробництво наймають українців; чеська потрібна для банку, поліклініки та дитсадків.\n\nПорівняйте Чехію з Польщею та Словаччиною через compare-посилання нижче. Документи перевіряйте на офіційних сайтах MOI.',
  article_body_en = E'Czechia is a popular alternative to Poland and Germany: smaller cities are often cheaper than Prague, and Temporary Protection applies on the same EU terms.\n\nLegalization. After arrival, register with MOI (Ministry of Interior) or through refugee assistance centres. Obtain temporary protection and insurance access for work and healthcare. Prague queues are longer than in regions.\n\nHousing and work. Prague is the most competitive market; Brno, Ostrava, and Plzeň are often easier. IT and manufacturing hire Ukrainians; Czech helps for banks, clinics, and kindergartens.\n\nCompare Czechia with Poland and Slovakia via the compare links below. Verify documents on official MOI sites.',
  article_body_ru = E'Чехия — популярная альтернатива Польше и Германии: регионы часто дешевле Праги, Temporary Protection действует на тех же EU-условиях.\n\nЛегализация. После прибытия регистрация в MOI или через центры помощи. Временная защита и доступ к медицине и работе. В Праге очереди длиннее, чем в регионах.\n\nЖильё и работа. Прага — самый конкурентный рынок; Brno, Ostrava, Plzeň проще. IT и производство нанимают; чешский нужен для банка и поликлиники.\n\nСравните Чехию с Польшей и Словакией через compare-ссылки ниже. Документы — на сайтах MOI.',
  updated_at = now()
WHERE code = 'CZ';

-- ES — excerpt scaffold (admin: expand body in CMS)
UPDATE countries SET
  article_published = true,
  article_title_uk = 'Українці в Іспанії: стиль життя, оренда та документи',
  article_title_en = 'Ukrainians in Spain: lifestyle, rent, and paperwork',
  article_title_ru = 'Украинцы в Испании: стиль жизни, аренда и документы',
  article_excerpt_uk = 'InterNations top-10 за якістю життя; Madrid/Barcelona — дорога оренда, іспанська для довгострокової інтеграції.',
  article_excerpt_en = 'InterNations top-10 for quality of life; Madrid/Barcelona rent is steep — Spanish helps long-term.',
  article_excerpt_ru = 'InterNations top-10 по качеству жизни; аренда в Madrid/Barcelona высокая — испанский для интеграции.',
  article_body_uk = NULL,
  article_body_en = NULL,
  article_body_ru = NULL,
  updated_at = now()
WHERE code = 'ES';

-- PT — excerpt scaffold
UPDATE countries SET
  article_published = true,
  article_title_uk = 'Українці в Португалії: клімат, AIMA та житло в Лісабоні',
  article_title_en = 'Ukrainians in Portugal: climate, AIMA, and Lisbon housing',
  article_title_ru = 'Украинцы в Португалии: климат, AIMA и жильё в Лиссабоне',
  article_excerpt_uk = 'М’який клімат і expat-спільнота; AIMA/SEF терміни та конкуренція за оренду в Лісабоні.',
  article_excerpt_en = 'Mild climate and expat community; AIMA/SEF timelines and Lisbon rent competition.',
  article_excerpt_ru = 'Мягкий климат и expat-сообщество; сроки AIMA/SEF и конкуренция за аренду в Лиссабоне.',
  article_body_uk = NULL,
  article_body_en = NULL,
  article_body_ru = NULL,
  updated_at = now()
WHERE code = 'PT';

-- GE — excerpt scaffold
UPDATE countries SET
  article_published = true,
  article_title_uk = 'Українці в Грузії: безвіз, житло та повсякденність',
  article_title_en = 'Ukrainians in Georgia: visa-free stay, housing, and daily life',
  article_title_ru = 'Украинцы в Грузии: безвиз, жильё и повседневность',
  article_excerpt_uk = 'Безвіз і низькі ціни привели тисячі українців; Tbilisi/Batumi — головні хаби, грузинська/російська в сервісах.',
  article_excerpt_en = 'Visa-free entry and low costs drew thousands of Ukrainians; Tbilisi/Batumi hubs — Georgian/Russian in services.',
  article_excerpt_ru = 'Безвиз и низкие цены привлекли тысячи украинцев; Tbilisi/Batumi — главные хабы.',
  article_body_uk = NULL,
  article_body_en = NULL,
  article_body_ru = NULL,
  updated_at = now()
WHERE code = 'GE';

-- TR — excerpt scaffold
UPDATE countries SET
  article_published = true,
  article_title_uk = 'Українці в Туреччині: ikamet, оренда та робота',
  article_title_en = 'Ukrainians in Turkey: ikamet, rent, and work',
  article_title_ru = 'Украинцы в Турции: ikamet, аренда и работа',
  article_excerpt_uk = 'Популярний напрям поза EU: ikamet, оренда в Antalya/Istanbul, турецька для договорів.',
  article_excerpt_en = 'Popular non-EU destination: ikamet, rent in Antalya/Istanbul, Turkish for contracts.',
  article_excerpt_ru = 'Популярное направление вне EU: ikamet, аренда в Antalya/Istanbul, турецкий для договоров.',
  article_body_uk = NULL,
  article_body_en = NULL,
  article_body_ru = NULL,
  updated_at = now()
WHERE code = 'TR';

-- TH — excerpt scaffold
UPDATE countries SET
  article_published = true,
  article_title_uk = 'Українці в Таїланді: візи, оренда та remote-формат',
  article_title_en = 'Ukrainians in Thailand: visas, rent, and remote life',
  article_title_ru = 'Украинцы в Таиланде: визы, аренда и remote-формат',
  article_excerpt_uk = 'Digital-nomad і туристичний напрям: візові правила змінюються — перевіряйте офіційні джерела перед переїздом.',
  article_excerpt_en = 'Digital-nomad and tourism hub: visa rules change — verify official sources before moving.',
  article_excerpt_ru = 'Digital-nomad и туристический хаб: визовые правила меняются — проверяйте официальные источники.',
  article_body_uk = NULL,
  article_body_en = NULL,
  article_body_ru = NULL,
  updated_at = now()
WHERE code = 'TH';
