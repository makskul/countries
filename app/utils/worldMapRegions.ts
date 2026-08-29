import { WORLD_COUNTRIES } from '~/utils/worldMapGeo'
import { getRegion } from '~/utils/regions'

/** Map path name → ISO 3166-1 alpha-2 (best-effort for this SVG set). */
export const MAP_NAME_TO_CODE: Record<string, string> = {
  Afghanistan: 'AF',
  Angola: 'AO',
  Albania: 'AL',
  'United Arab Emirates': 'AE',
  Argentina: 'AR',
  Armenia: 'AM',
  Australia: 'AU',
  Austria: 'AT',
  Azerbaijan: 'AZ',
  Burundi: 'BI',
  Belgium: 'BE',
  Benin: 'BJ',
  'Burkina Faso': 'BF',
  Bangladesh: 'BD',
  Bulgaria: 'BG',
  'The Bahamas': 'BS',
  'Bosnia and Herzegovina': 'BA',
  Belarus: 'BY',
  Belize: 'BZ',
  Bolivia: 'BO',
  Brazil: 'BR',
  Brunei: 'BN',
  Bhutan: 'BT',
  Botswana: 'BW',
  'Central African Republic': 'CF',
  Canada: 'CA',
  Switzerland: 'CH',
  Chile: 'CL',
  China: 'CN',
  'Ivory Coast': 'CI',
  Cameroon: 'CM',
  'Democratic Republic of the Congo': 'CD',
  'Republic of the Congo': 'CG',
  Colombia: 'CO',
  'Costa Rica': 'CR',
  Cuba: 'CU',
  'Northern Cyprus': 'CY',
  Cyprus: 'CY',
  'Czech Republic': 'CZ',
  Germany: 'DE',
  Djibouti: 'DJ',
  Denmark: 'DK',
  'Dominican Republic': 'DO',
  Algeria: 'DZ',
  Ecuador: 'EC',
  Egypt: 'EG',
  Eritrea: 'ER',
  Spain: 'ES',
  Estonia: 'EE',
  Ethiopia: 'ET',
  Finland: 'FI',
  Fiji: 'FJ',
  'Falkland Islands': 'FK',
  France: 'FR',
  Gabon: 'GA',
  England: 'GB',
  Georgia: 'GE',
  Ghana: 'GH',
  Guinea: 'GN',
  Gambia: 'GM',
  'Guinea Bissau': 'GW',
  'Equatorial Guinea': 'GQ',
  Greece: 'GR',
  Greenland: 'GL',
  Guatemala: 'GT',
  Guyana: 'GY',
  Honduras: 'HN',
  Croatia: 'HR',
  Haiti: 'HT',
  Hungary: 'HU',
  Indonesia: 'ID',
  India: 'IN',
  Ireland: 'IE',
  Iran: 'IR',
  Iraq: 'IQ',
  Iceland: 'IS',
  Israel: 'IL',
  Italy: 'IT',
  Jamaica: 'JM',
  Jordan: 'JO',
  Japan: 'JP',
  Kazakhstan: 'KZ',
  Kenya: 'KE',
  Kyrgyzstan: 'KG',
  Cambodia: 'KH',
  'South Korea': 'KR',
  Kosovo: 'XK',
  Kuwait: 'KW',
  Laos: 'LA',
  Lebanon: 'LB',
  Liberia: 'LR',
  Libya: 'LY',
  'Sri Lanka': 'LK',
  Lesotho: 'LS',
  Lithuania: 'LT',
  Luxembourg: 'LU',
  Latvia: 'LV',
  Morocco: 'MA',
  Moldova: 'MD',
  Madagascar: 'MG',
  Mexico: 'MX',
  Macedonia: 'MK',
  Mali: 'ML',
  Myanmar: 'MM',
  Montenegro: 'ME',
  Mongolia: 'MN',
  Mozambique: 'MZ',
  Mauritania: 'MR',
  Malawi: 'MW',
  Malaysia: 'MY',
  Namibia: 'NA',
  'New Caledonia': 'NC',
  Niger: 'NE',
  Nigeria: 'NG',
  Nicaragua: 'NI',
  Netherlands: 'NL',
  Norway: 'NO',
  Nepal: 'NP',
  'New Zealand': 'NZ',
  Oman: 'OM',
  Pakistan: 'PK',
  Panama: 'PA',
  Peru: 'PE',
  Philippines: 'PH',
  'Papua New Guinea': 'PG',
  Poland: 'PL',
  'Puerto Rico': 'PR',
  'North Korea': 'KP',
  Portugal: 'PT',
  Paraguay: 'PY',
  Qatar: 'QA',
  Romania: 'RO',
  Russia: 'RU',
  Rwanda: 'RW',
  'Western Sahara': 'EH',
  'Saudi Arabia': 'SA',
  Sudan: 'SD',
  'South Sudan': 'SS',
  Senegal: 'SN',
  'Solomon Islands': 'SB',
  'Sierra Leone': 'SL',
  'El Salvador': 'SV',
  Somaliland: 'SO',
  Somalia: 'SO',
  'Republic of Serbia': 'RS',
  Suriname: 'SR',
  Slovakia: 'SK',
  Slovenia: 'SI',
  Sweden: 'SE',
  Swaziland: 'SZ',
  Syria: 'SY',
  Chad: 'TD',
  Togo: 'TG',
  Thailand: 'TH',
  Tajikistan: 'TJ',
  Turkmenistan: 'TM',
  'East Timor': 'TL',
  'Trinidad and Tobago': 'TT',
  Tunisia: 'TN',
  Turkey: 'TR',
  Taiwan: 'TW',
  'United Republic of Tanzania': 'TZ',
  Uganda: 'UG',
  Ukraine: 'UA',
  Uruguay: 'UY',
  USA: 'US',
  Uzbekistan: 'UZ',
  Venezuela: 'VE',
  Vietnam: 'VN',
  Vanuatu: 'VU',
  'West Bank': 'PS',
  Yemen: 'YE',
  'South Africa': 'ZA',
  Zambia: 'ZM',
  Zimbabwe: 'ZW',
}

/**
 * UN M49-style subregions for the homepage map.
 * Russia → Eastern Europe (not Asia) so Asia zoom stays on Asia.
 * Cyprus → Western Asia (UN); Kosovo → Southern Europe.
 * Mexico → Latin America and Caribbean (UN Central America).
 * Greenland → Northern America.
 */
export const MAP_CONTINENT_IDS = [
  'world',
  'europe',
  'asia',
  'americas',
  'africa',
  'oceania',
] as const

export type MapContinentId = (typeof MAP_CONTINENT_IDS)[number]

export const MAP_REGION_IDS = [
  'world',
  // Europe
  'eastern_europe',
  'western_europe',
  'northern_europe',
  'southern_europe',
  // Asia
  'central_asia',
  'eastern_asia',
  'southern_asia',
  'southeast_asia',
  'western_asia',
  // Americas
  'northern_america',
  'latin_america_caribbean',
  // Africa
  'northern_africa',
  'western_africa',
  'central_africa',
  'eastern_africa',
  'southern_africa',
  // Oceania
  'australia_new_zealand',
  'melanesia',
  'micronesia',
  'polynesia',
] as const

export type MapRegionId = (typeof MAP_REGION_IDS)[number]

export const SUBREGIONS_BY_CONTINENT: Record<Exclude<MapContinentId, 'world'>, MapRegionId[]> = {
  europe: ['eastern_europe', 'western_europe', 'northern_europe', 'southern_europe'],
  asia: ['central_asia', 'eastern_asia', 'southern_asia', 'southeast_asia', 'western_asia'],
  americas: ['northern_america', 'latin_america_caribbean'],
  africa: ['northern_africa', 'western_africa', 'central_africa', 'eastern_africa', 'southern_africa'],
  oceania: ['australia_new_zealand', 'melanesia', 'micronesia', 'polynesia'],
}

/** Default subregion when picking a continent tab. Eastern Europe for Triplandr (UA / CEE focus). */
export const DEFAULT_SUBREGION_BY_CONTINENT: Record<Exclude<MapContinentId, 'world'>, MapRegionId> = {
  europe: 'eastern_europe',
  asia: 'eastern_asia',
  americas: 'northern_america',
  africa: 'northern_africa',
  oceania: 'australia_new_zealand',
}

/**
 * Default map chip: Eastern Europe — Triplandr’s core audience (UA and neighbours).
 * Documented choice: not Western Europe; Eastern matches product focus.
 */
export const DEFAULT_MAP_REGION: MapRegionId = 'eastern_europe'
export const DEFAULT_MAP_CONTINENT: MapContinentId = 'europe'

export const WORLD_VIEWBOX = '0 0 1000 507'

/** ISO → map subregion (M49-aligned; only codes we care about on map / targets). */
const CODE_TO_SUBREGION: Record<string, MapRegionId> = {
  // Eastern Europe
  BG: 'eastern_europe', BY: 'eastern_europe', CZ: 'eastern_europe', HU: 'eastern_europe',
  MD: 'eastern_europe', PL: 'eastern_europe', RO: 'eastern_europe', RU: 'eastern_europe',
  SK: 'eastern_europe', UA: 'eastern_europe',
  // Western Europe
  AT: 'western_europe', BE: 'western_europe', FR: 'western_europe', DE: 'western_europe',
  LI: 'western_europe', LU: 'western_europe', MC: 'western_europe', NL: 'western_europe',
  CH: 'western_europe',
  // Northern Europe
  DK: 'northern_europe', EE: 'northern_europe', FI: 'northern_europe', IS: 'northern_europe',
  IE: 'northern_europe', LV: 'northern_europe', LT: 'northern_europe', NO: 'northern_europe',
  SE: 'northern_europe', GB: 'northern_europe', IM: 'northern_europe', JE: 'northern_europe',
  GG: 'northern_europe', AX: 'northern_europe', FO: 'northern_europe',
  // Southern Europe
  AL: 'southern_europe', AD: 'southern_europe', BA: 'southern_europe', HR: 'southern_europe',
  GR: 'southern_europe', IT: 'southern_europe', MT: 'southern_europe', ME: 'southern_europe',
  MK: 'southern_europe', PT: 'southern_europe', SM: 'southern_europe', RS: 'southern_europe',
  SI: 'southern_europe', ES: 'southern_europe', VA: 'southern_europe', XK: 'southern_europe',
  // Central Asia
  KZ: 'central_asia', KG: 'central_asia', TJ: 'central_asia', TM: 'central_asia', UZ: 'central_asia',
  // Eastern Asia
  CN: 'eastern_asia', HK: 'eastern_asia', MO: 'eastern_asia', JP: 'eastern_asia',
  KP: 'eastern_asia', KR: 'eastern_asia', MN: 'eastern_asia', TW: 'eastern_asia',
  // Southern Asia
  AF: 'southern_asia', BD: 'southern_asia', BT: 'southern_asia', IN: 'southern_asia',
  IR: 'southern_asia', MV: 'southern_asia', NP: 'southern_asia', PK: 'southern_asia',
  LK: 'southern_asia',
  // South-eastern Asia
  BN: 'southeast_asia', KH: 'southeast_asia', ID: 'southeast_asia', LA: 'southeast_asia',
  MY: 'southeast_asia', MM: 'southeast_asia', PH: 'southeast_asia', SG: 'southeast_asia',
  TH: 'southeast_asia', TL: 'southeast_asia', VN: 'southeast_asia',
  // Western Asia (UN; includes CY, Caucasus, TR)
  AM: 'western_asia', AZ: 'western_asia', BH: 'western_asia', CY: 'western_asia',
  GE: 'western_asia', IQ: 'western_asia', IL: 'western_asia', JO: 'western_asia',
  KW: 'western_asia', LB: 'western_asia', OM: 'western_asia', QA: 'western_asia',
  SA: 'western_asia', PS: 'western_asia', SY: 'western_asia', TR: 'western_asia',
  AE: 'western_asia', YE: 'western_asia',
  // Northern America
  BM: 'northern_america', CA: 'northern_america', GL: 'northern_america', US: 'northern_america',
  // Latin America and the Caribbean
  AG: 'latin_america_caribbean', AR: 'latin_america_caribbean', BS: 'latin_america_caribbean',
  BB: 'latin_america_caribbean', BZ: 'latin_america_caribbean', BO: 'latin_america_caribbean',
  BR: 'latin_america_caribbean', CL: 'latin_america_caribbean', CO: 'latin_america_caribbean',
  CR: 'latin_america_caribbean', CU: 'latin_america_caribbean', DM: 'latin_america_caribbean',
  DO: 'latin_america_caribbean', EC: 'latin_america_caribbean', SV: 'latin_america_caribbean',
  GD: 'latin_america_caribbean', GT: 'latin_america_caribbean', GY: 'latin_america_caribbean',
  HT: 'latin_america_caribbean', HN: 'latin_america_caribbean', JM: 'latin_america_caribbean',
  MX: 'latin_america_caribbean', NI: 'latin_america_caribbean', PA: 'latin_america_caribbean',
  PY: 'latin_america_caribbean', PE: 'latin_america_caribbean', KN: 'latin_america_caribbean',
  LC: 'latin_america_caribbean', VC: 'latin_america_caribbean', SR: 'latin_america_caribbean',
  TT: 'latin_america_caribbean', UY: 'latin_america_caribbean', VE: 'latin_america_caribbean',
  PR: 'latin_america_caribbean', FK: 'latin_america_caribbean',
  // Northern Africa
  DZ: 'northern_africa', EG: 'northern_africa', LY: 'northern_africa', MA: 'northern_africa',
  SD: 'northern_africa', TN: 'northern_africa', EH: 'northern_africa',
  // Western Africa
  BJ: 'western_africa', BF: 'western_africa', CV: 'western_africa', CI: 'western_africa',
  GM: 'western_africa', GH: 'western_africa', GN: 'western_africa', GW: 'western_africa',
  LR: 'western_africa', ML: 'western_africa', MR: 'western_africa', NE: 'western_africa',
  NG: 'western_africa', SN: 'western_africa', SL: 'western_africa', TG: 'western_africa',
  // Middle / Central Africa
  AO: 'central_africa', CM: 'central_africa', CF: 'central_africa', TD: 'central_africa',
  CG: 'central_africa', CD: 'central_africa', GQ: 'central_africa', GA: 'central_africa',
  ST: 'central_africa',
  // Eastern Africa
  BI: 'eastern_africa', KM: 'eastern_africa', DJ: 'eastern_africa', ER: 'eastern_africa',
  ET: 'eastern_africa', KE: 'eastern_africa', MG: 'eastern_africa', MW: 'eastern_africa',
  MU: 'eastern_africa', MZ: 'eastern_africa', RW: 'eastern_africa', SC: 'eastern_africa',
  SO: 'eastern_africa', SS: 'eastern_africa', UG: 'eastern_africa', TZ: 'eastern_africa',
  ZM: 'eastern_africa', ZW: 'eastern_africa',
  // Southern Africa
  BW: 'southern_africa', LS: 'southern_africa', NA: 'southern_africa', ZA: 'southern_africa',
  SZ: 'southern_africa',
  // Australia and New Zealand
  AU: 'australia_new_zealand', NZ: 'australia_new_zealand',
  // Melanesia
  FJ: 'melanesia', NC: 'melanesia', PG: 'melanesia', SB: 'melanesia', VU: 'melanesia',
  // Micronesia
  FM: 'micronesia', GU: 'micronesia', KI: 'micronesia', MH: 'micronesia',
  NR: 'micronesia', MP: 'micronesia', PW: 'micronesia',
  // Polynesia
  AS: 'polynesia', CK: 'polynesia', PF: 'polynesia', NU: 'polynesia', PN: 'polynesia',
  WS: 'polynesia', TK: 'polynesia', TO: 'polynesia', TV: 'polynesia', WF: 'polynesia',
}

/**
 * Small / dense countries that need enlarged invisible hit targets
 * (especially when zoomed to Europe on mobile).
 */
export const SMALL_HIT_MAP_NAMES = new Set([
  'Albania',
  'Armenia',
  'Austria',
  'Belgium',
  'Bosnia and Herzegovina',
  'Bulgaria',
  'Croatia',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Estonia',
  'Georgia',
  'Hungary',
  'Ireland',
  'Israel',
  'Jordan',
  'Kosovo',
  'Kuwait',
  'Latvia',
  'Lebanon',
  'Lithuania',
  'Luxembourg',
  'Macedonia',
  'Moldova',
  'Montenegro',
  'Netherlands',
  'Northern Cyprus',
  'Portugal',
  'Qatar',
  'Republic of Serbia',
  'Slovakia',
  'Slovenia',
  'Switzerland',
  'West Bank',
])

/**
 * Hand-tuned framing when auto-bbox is too wide or the region has few/no map paths.
 * Asia subregions are tightened so West Asia / Russia never blow out East Asia, etc.
 */
const VIEWBOX_OVERRIDE: Partial<Record<MapRegionId, string>> = {
  // CEE core (PL–UA–RO–BG), closer than full Russia-inclusive bbox
  eastern_europe: '520 88 95 72',
  western_europe: '448 95 78 72',
  northern_europe: '470 55 110 75',
  southern_europe: '470 118 105 55',
  // Asia — exclude Pacific / Siberian blowout; tight continental crops
  central_asia: '640 95 120 60',
  eastern_asia: '755 95 165 100',
  southern_asia: '655 135 140 115',
  // Include Myanmar→Philippines and down through Indonesia / Timor
  southeast_asia: '750 180 160 120',
  western_asia: '555 120 130 105',
  // Americas
  northern_america: '80 40 320 200',
  latin_america_caribbean: '200 140 220 280',
  // Africa
  northern_africa: '450 145 160 85',
  western_africa: '420 195 120 100',
  central_africa: '500 220 120 110',
  eastern_africa: '560 210 130 140',
  southern_africa: '530 290 100 90',
  // Oceania — tiny island groups need generous padding to stay readable
  australia_new_zealand: '800 270 180 140',
  melanesia: '880 250 120 80',
  micronesia: '900 220 95 70',
  polynesia: '920 280 80 70',
}

/**
 * Countries excluded from viewBox math (huge / wrap artifacts).
 * Still highlighted when the region is active.
 */
const VIEWBOX_EXCLUDE: Partial<Record<MapRegionId, string[]>> = {
  eastern_europe: ['Russia'],
  northern_europe: ['Iceland'],
  western_asia: ['Russia'],
  northern_america: ['Greenland'],
  latin_america_caribbean: ['Falkland Islands', 'Greenland'],
  eastern_asia: ['Russia'],
  southeast_asia: [],
  melanesia: ['Fiji'],
}

/** Max distance from country centroid when sampling path points for bbox. */
const VIEWBOX_MAX_DIST: Partial<Record<MapRegionId, number>> = {
  eastern_europe: 42,
  western_europe: 42,
  northern_europe: 48,
  southern_europe: 40,
  central_asia: 55,
  eastern_asia: 70,
  southern_asia: 70,
  southeast_asia: 55,
  western_asia: 48,
  northern_america: 120,
  latin_america_caribbean: 100,
  northern_africa: 70,
  western_africa: 55,
  central_africa: 55,
  eastern_africa: 70,
  southern_africa: 55,
  australia_new_zealand: 90,
  melanesia: 45,
  micronesia: 40,
  polynesia: 40,
}

const EXTRA_PAD: Partial<Record<MapRegionId, number>> = {
  micronesia: 0.22,
  polynesia: 0.22,
  melanesia: 0.14,
  australia_new_zealand: 0.1,
  northern_america: 0.08,
}

const viewBoxCache = new Map<MapRegionId, string>()

export function mapNameToCode(mapName: string): string | undefined {
  return MAP_NAME_TO_CODE[mapName]
}

export function getSubregionForCode(code: string): MapRegionId | 'other' {
  const upper = code.toUpperCase()
  return CODE_TO_SUBREGION[upper] ?? 'other'
}

export function getMapRegion(mapName: string): MapRegionId | 'other' {
  const code = MAP_NAME_TO_CODE[mapName]
  if (!code) return 'other'
  return getSubregionForCode(code)
}

export function getContinentForRegion(region: MapRegionId): MapContinentId {
  if (region === 'world') return 'world'
  for (const [continent, ids] of Object.entries(SUBREGIONS_BY_CONTINENT) as [Exclude<MapContinentId, 'world'>, MapRegionId[]][]) {
    if (ids.includes(region)) return continent
  }
  return 'world'
}

/** Coarse continent for a map path (falls back to legacy getRegion). */
export function getMapContinent(mapName: string): MapContinentId | 'other' {
  const sub = getMapRegion(mapName)
  if (sub === 'other') {
    const code = MAP_NAME_TO_CODE[mapName]
    if (!code) return 'other'
    const coarse = getRegion(code)
    if (
      coarse === 'europe'
      || coarse === 'asia'
      || coarse === 'americas'
      || coarse === 'africa'
      || coarse === 'oceania'
    ) {
      return coarse
    }
    return 'other'
  }
  return getContinentForRegion(sub)
}

function parsePathPointsNear(
  d: string,
  cx: number,
  cy: number,
  maxDist: number,
): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let count = 0
  const maxDistSq = maxDist * maxDist
  const nums: number[] = []

  const flush = () => {
    for (let j = 0; j + 1 < nums.length; j += 2) {
      const x = nums[j]!
      const y = nums[j + 1]!
      const dx = x - cx
      const dy = y - cy
      if (dx * dx + dy * dy > maxDistSq) continue
      count++
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
    nums.length = 0
  }

  for (let i = 0; i < d.length;) {
    const c = d[i]!
    if (/[MLZmlz]/.test(c)) {
      flush()
      i++
      continue
    }
    if (c === ',' || /\s/.test(c)) {
      i++
      continue
    }
    const nm = d.slice(i).match(/^-?\d*\.?\d+/)
    if (nm) {
      nums.push(+nm[0])
      i += nm[0].length
      continue
    }
    i++
  }
  flush()

  if (!count) {
    return { minX: cx - 5, minY: cy - 5, maxX: cx + 5, maxY: cy + 5 }
  }
  return { minX, minY, maxX, maxY }
}

function computeRegionViewBox(region: MapRegionId): string {
  if (region === 'world') return WORLD_VIEWBOX

  const exclude = new Set(VIEWBOX_EXCLUDE[region] ?? [])
  const maxDist = VIEWBOX_MAX_DIST[region] ?? 70
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const [name, path, cx, cy] of WORLD_COUNTRIES) {
    if (getMapRegion(name) !== region) continue
    if (exclude.has(name)) continue
    const b = parsePathPointsNear(path, cx, cy, maxDist)
    if (b.minX < minX) minX = b.minX
    if (b.minY < minY) minY = b.minY
    if (b.maxX > maxX) maxX = b.maxX
    if (b.maxY > maxY) maxY = b.maxY
  }

  if (!Number.isFinite(minX)) {
    // No paths (e.g. Micronesia / Polynesia on this SVG) — fall back to override or world
    return VIEWBOX_OVERRIDE[region] ?? WORLD_VIEWBOX
  }

  const padRatio = EXTRA_PAD[region] ?? 0.06
  let w = maxX - minX
  let h = maxY - minY
  const padX = Math.max(w * padRatio, 6)
  const padY = Math.max(h * padRatio, 6)
  let x = minX - padX
  let y = minY - padY
  w += 2 * padX
  h += 2 * padY

  const minAspect = region === 'latin_america_caribbean' || region === 'northern_america'
    ? 0.55
    : region.endsWith('_europe')
      ? 1.15
      : 0.9
  const maxAspect = region.endsWith('_europe') ? 1.85 : 2.2
  const aspect = w / h
  if (aspect < minAspect) {
    const nw = h * minAspect
    x -= (nw - w) / 2
    w = nw
  } else if (aspect > maxAspect) {
    const nh = w / maxAspect
    y -= (nh - h) / 2
    h = nh
  }

  const r = (n: number) => Math.round(n * 10) / 10
  return `${r(x)} ${r(y)} ${r(w)} ${r(h)}`
}

export function getRegionViewBox(region: MapRegionId): string {
  const cached = viewBoxCache.get(region)
  if (cached) return cached
  const override = VIEWBOX_OVERRIDE[region]
  const vb = override ?? computeRegionViewBox(region)
  viewBoxCache.set(region, vb)
  return vb
}

export function parseViewBox(vb: string): [number, number, number, number] {
  const parts = vb.trim().split(/\s+/).map(Number)
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 1000, parts[3] ?? 520]
}

export function formatViewBox(parts: [number, number, number, number]): string {
  return parts.map(n => Math.round(n * 100) / 100).join(' ')
}

/**
 * Soft focus frame around a single country (centroid + nearby path samples).
 * Padding scales with country size: micro-states get a tight crop (with a small
 * minimum frame so paths stay readable); large countries keep a slightly looser pad.
 */
export function getCountryFocusViewBox(mapName: string): string | null {
  const entry = WORLD_COUNTRIES.find(c => c[0] === mapName)
  if (!entry) return null
  const [, path, cx, cy] = entry
  const region = getMapRegion(mapName)
  const maxDist = region === 'other'
    ? 40
    : Math.min(VIEWBOX_MAX_DIST[region as MapRegionId] ?? 40, 36)
  const b = parsePathPointsNear(path, cx, cy, maxDist)
  const rawW = Math.max(b.maxX - b.minX, 0.4)
  const rawH = Math.max(b.maxY - b.minY, 0.4)
  const size = Math.max(rawW, rawH)

  // 0 = micro (LU/MT-scale), 1 = large (FR/DE-scale)
  const t = Math.min(1, Math.max(0, (size - 3) / 28))
  const padRatio = 0.25 + t * 0.11 // 0.25 → 0.36
  const minPad = 1.6 + t * 4.6 // 1.6 → 6.2
  const padX = Math.max(rawW * padRatio, minPad)
  const padY = Math.max(rawH * padRatio, minPad)

  let w = rawW + 2 * padX
  let h = rawH + 2 * padY
  let x = b.minX - padX
  let y = b.minY - padY

  // Readable floor for tiny paths — still much tighter than large-country frames
  const minW = 11 + t * 3 // 11 → 14
  const minH = 8 + t * 2 // 8 → 10
  if (w < minW) {
    x -= (minW - w) / 2
    w = minW
  }
  if (h < minH) {
    y -= (minH - h) / 2
    h = minH
  }

  // Keep a readable aspect so tiny countries don’t fill the panel oddly
  const aspect = w / h
  if (aspect < 1.1) {
    const nw = h * 1.1
    x -= (nw - w) / 2
    w = nw
  } else if (aspect > 1.9) {
    const nh = w / 1.9
    y -= (nh - h) / 2
    h = nh
  }
  const r = (n: number) => Math.round(n * 10) / 10
  return `${r(x)} ${r(y)} ${r(w)} ${r(h)}`
}
