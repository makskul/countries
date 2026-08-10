/**
 * Generate higher-detail WORLD_COUNTRIES SVG paths for Triplandr.
 * Source: Natural Earth 50m admin_0 countries.
 * Projection: equirectangular → 1000 × 507.
 * Simplify: denser for Europe, lighter elsewhere.
 *
 * Usage:
 *   NE_GEOJSON=/path/to/ne_50m_admin_0_countries.geojson node scripts/generate-world-map-geo.mjs
 * Requires: d3-geo (npm i d3-geo --no-save)
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { geoEquirectangular, geoArea, geoCentroid } from 'd3-geo'

const WIDTH = 1000
const HEIGHT = 507
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'app/utils/worldMapGeo.ts')
const GEOJSON = process.env.NE_GEOJSON
  || join('/tmp/worldmap-gen/ne_50m_admin_0_countries.geojson')

/** Reverse of MAP_NAME_TO_CODE — preferred map display names */
const CODE_TO_NAME = {
  AF: 'Afghanistan', AO: 'Angola', AL: 'Albania', AE: 'United Arab Emirates',
  AR: 'Argentina', AM: 'Armenia', AU: 'Australia', AT: 'Austria', AZ: 'Azerbaijan',
  BI: 'Burundi', BE: 'Belgium', BJ: 'Benin', BF: 'Burkina Faso', BD: 'Bangladesh',
  BG: 'Bulgaria', BS: 'The Bahamas', BA: 'Bosnia and Herzegovina', BY: 'Belarus',
  BZ: 'Belize', BO: 'Bolivia', BR: 'Brazil', BN: 'Brunei', BT: 'Bhutan', BW: 'Botswana',
  CF: 'Central African Republic', CA: 'Canada', CH: 'Switzerland', CL: 'Chile',
  CN: 'China', CI: 'Ivory Coast', CM: 'Cameroon', CD: 'Democratic Republic of the Congo',
  CG: 'Republic of the Congo', CO: 'Colombia', CR: 'Costa Rica', CU: 'Cuba',
  CY: 'Cyprus', CZ: 'Czech Republic', DE: 'Germany', DJ: 'Djibouti', DK: 'Denmark',
  DO: 'Dominican Republic', DZ: 'Algeria', EC: 'Ecuador', EG: 'Egypt', ER: 'Eritrea',
  ES: 'Spain', EE: 'Estonia', ET: 'Ethiopia', FI: 'Finland', FJ: 'Fiji',
  FK: 'Falkland Islands', FR: 'France', GA: 'Gabon', GB: 'England', GE: 'Georgia',
  GH: 'Ghana', GN: 'Guinea', GM: 'Gambia', GW: 'Guinea Bissau', GQ: 'Equatorial Guinea',
  GR: 'Greece', GL: 'Greenland', GT: 'Guatemala', GY: 'Guyana', HN: 'Honduras',
  HR: 'Croatia', HT: 'Haiti', HU: 'Hungary', ID: 'Indonesia', IN: 'India',
  IE: 'Ireland', IR: 'Iran', IQ: 'Iraq', IS: 'Iceland', IL: 'Israel', IT: 'Italy',
  JM: 'Jamaica', JO: 'Jordan', JP: 'Japan', KZ: 'Kazakhstan', KE: 'Kenya',
  KG: 'Kyrgyzstan', KH: 'Cambodia', KR: 'South Korea', XK: 'Kosovo', KW: 'Kuwait',
  LA: 'Laos', LB: 'Lebanon', LR: 'Liberia', LY: 'Libya', LK: 'Sri Lanka',
  LS: 'Lesotho', LT: 'Lithuania', LU: 'Luxembourg', LV: 'Latvia', MA: 'Morocco',
  MD: 'Moldova', MG: 'Madagascar', MX: 'Mexico', MK: 'Macedonia', ML: 'Mali',
  MM: 'Myanmar', ME: 'Montenegro', MN: 'Mongolia', MZ: 'Mozambique', MR: 'Mauritania',
  MW: 'Malawi', MY: 'Malaysia', NA: 'Namibia', NC: 'New Caledonia', NE: 'Niger',
  NG: 'Nigeria', NI: 'Nicaragua', NL: 'Netherlands', NO: 'Norway', NP: 'Nepal',
  NZ: 'New Zealand', OM: 'Oman', PK: 'Pakistan', PA: 'Panama', PE: 'Peru',
  PH: 'Philippines', PG: 'Papua New Guinea', PL: 'Poland', PR: 'Puerto Rico',
  KP: 'North Korea', PT: 'Portugal', PY: 'Paraguay', QA: 'Qatar', RO: 'Romania',
  RU: 'Russia', RW: 'Rwanda', EH: 'Western Sahara', SA: 'Saudi Arabia', SD: 'Sudan',
  SS: 'South Sudan', SN: 'Senegal', SB: 'Solomon Islands', SL: 'Sierra Leone',
  SV: 'El Salvador', SO: 'Somalia', RS: 'Republic of Serbia', SR: 'Suriname',
  SK: 'Slovakia', SI: 'Slovenia', SE: 'Sweden', SZ: 'Swaziland', SY: 'Syria',
  TD: 'Chad', TG: 'Togo', TH: 'Thailand', TJ: 'Tajikistan', TM: 'Turkmenistan',
  TL: 'East Timor', TT: 'Trinidad and Tobago', TN: 'Tunisia', TR: 'Turkey',
  TW: 'Taiwan', TZ: 'United Republic of Tanzania', UG: 'Uganda', UA: 'Ukraine',
  UY: 'Uruguay', US: 'USA', UZ: 'Uzbekistan', VE: 'Venezuela', VN: 'Vietnam',
  VU: 'Vanuatu', PS: 'West Bank', YE: 'Yemen', ZA: 'South Africa', ZM: 'Zambia',
  ZW: 'Zimbabwe',
}

const EUROPE_CODES = new Set([
  'AL','AT','BY','BE','BA','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU',
  'IS','IE','IT','XK','LV','LT','LU','MD','ME','NL','MK','NO','PL','PT','RO','RS',
  'SK','SI','ES','SE','CH','UA','GB','TR','GE','AM','AZ','IL','JO','LB','SY','IQ',
  'KW','QA','AE','PS','MT',
])

// --- Douglas–Peucker on projected rings ---
function distToSeg(p, a, b) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  if (dx === 0 && dy === 0) {
    const ex = p[0] - a[0]
    const ey = p[1] - a[1]
    return Math.hypot(ex, ey)
  }
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy))
}

function simplifyRing(ring, eps) {
  if (ring.length <= 4) return ring
  const keep = new Uint8Array(ring.length)
  keep[0] = 1
  keep[ring.length - 1] = 1
  const stack = [[0, ring.length - 1]]
  while (stack.length) {
    const [i, j] = stack.pop()
    let maxD = 0
    let maxI = -1
    for (let k = i + 1; k < j; k++) {
      const d = distToSeg(ring[k], ring[i], ring[j])
      if (d > maxD) {
        maxD = d
        maxI = k
      }
    }
    if (maxD > eps && maxI >= 0) {
      keep[maxI] = 1
      stack.push([i, maxI], [maxI, j])
    }
  }
  const out = []
  for (let i = 0; i < ring.length; i++) if (keep[i]) out.push(ring[i])
  return out
}

function round1(n) {
  return Math.round(n * 10) / 10
}

function ringToPath(ring) {
  if (ring.length < 3) return ''
  let d = `M${round1(ring[0][0])},${round1(ring[0][1])}`
  for (let i = 1; i < ring.length; i++) {
    d += `L${round1(ring[i][0])},${round1(ring[i][1])}`
  }
  return d + 'Z'
}

function projectCoords(coords, project) {
  return coords.map(([lon, lat]) => project([lon, lat]))
}

function geomToPath(geom, project, eps) {
  const parts = []
  const handlePolygon = (rings) => {
    for (const ring of rings) {
      const projected = projectCoords(ring, project)
      const simplified = simplifyRing(projected, eps)
      // Drop tiny rings (noise islands) after simplify
      if (simplified.length < 4) continue
      let area = 0
      for (let i = 0; i < simplified.length - 1; i++) {
        area += simplified[i][0] * simplified[i + 1][1] - simplified[i + 1][0] * simplified[i][1]
      }
      if (Math.abs(area) < 0.35) continue
      const p = ringToPath(simplified)
      if (p) parts.push(p)
    }
  }
  if (geom.type === 'Polygon') handlePolygon(geom.coordinates)
  else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates) handlePolygon(poly)
  }
  return parts.join('')
}

/** Clip France/Netherlands/Norway overseas territories that blow regional zooms */
function clipToMainlandBBox(feature, lonMin, lonMax, latMin, latMax) {
  const filterRing = (ring) => {
    // keep ring if any point inside bbox
    return ring.some(([lon, lat]) => lon >= lonMin && lon <= lonMax && lat >= latMin && lat <= latMax)
  }
  const filterPoly = (rings) => {
    if (!filterRing(rings[0])) return null
    return rings
  }
  const g = feature.geometry
  if (g.type === 'Polygon') {
    const r = filterPoly(g.coordinates)
    if (!r) return null
    return { ...feature, geometry: { type: 'Polygon', coordinates: r } }
  }
  if (g.type === 'MultiPolygon') {
    const polys = g.coordinates.map(filterPoly).filter(Boolean)
    if (!polys.length) return null
    return {
      ...feature,
      geometry: polys.length === 1
        ? { type: 'Polygon', coordinates: polys[0] }
        : { type: 'MultiPolygon', coordinates: polys },
    }
  }
  return feature
}

function isoOf(props) {
  const a2 = props.ISO_A2
  const eh = props.ISO_A2_EH
  // Prefer canonical 2-letter ISO (Natural Earth uses -99 / CN-TW quirks)
  if (eh && /^[A-Z]{2}$/.test(eh)) return eh
  if (a2 && /^[A-Z]{2}$/.test(a2)) return a2
  return null
}

if (!existsSync(GEOJSON)) {
  console.error('Missing Natural Earth GeoJSON at', GEOJSON)
  console.error('Download ne_50m_admin_0_countries.geojson and set NE_GEOJSON')
  process.exit(1)
}
const gj = JSON.parse(readFileSync(GEOJSON, 'utf8'))

// Match previous map framing: world in 1000×507, slight N padding like old (minY~13)
const projection = geoEquirectangular()
  .scale(WIDTH / (2 * Math.PI))
  .translate([WIDTH / 2, HEIGHT / 2])
  .precision(0.3)

const project = (lonlat) => projection(lonlat)

const byCode = new Map()
for (const f of gj.features) {
  const code = isoOf(f.properties)
  if (!code || !CODE_TO_NAME[code]) continue
  let feat = f
  // Clip overseas fragments for zoom-sensitive countries
  if (code === 'FR') feat = clipToMainlandBBox(f, -6, 10, 41, 52)
  else if (code === 'NL') feat = clipToMainlandBBox(f, 3, 8, 50, 54)
  else if (code === 'NO') feat = clipToMainlandBBox(f, 4, 32, 57, 72) // keep mainland+north, drop Svalbard far east? keep Svalbard via lat
  else if (code === 'US') feat = clipToMainlandBBox(f, -170, -65, 18, 72) // CONUS+AK, drop far pacific islands if needed
  else if (code === 'PT') feat = clipToMainlandBBox(f, -10, -6, 36, 43) // mainland only for Europe zoom
  else if (code === 'ES') feat = clipToMainlandBBox(f, -10, 5, 35, 44) // peninsula+balearics, drop Canaries for bbox? keep Canaries for map presence
  // Actually for Spain keep Canaries on map but viewBox excludes via maxDist — don't clip
  if (code === 'ES') feat = f
  if (code === 'PT') feat = f // keep Azores/Madeira on map
  if (!feat) continue

  // Prefer largest area if duplicates
  const area = Math.abs(geoArea(feat))
  const prev = byCode.get(code)
  if (!prev || area > prev.area) byCode.set(code, { feature: feat, area })
}

const countries = []
for (const [code, { feature }] of byCode) {
  const name = CODE_TO_NAME[code]
  // Pixel tolerance after projection (1000×507). Europe denser for region zoom.
  const eps = EUROPE_CODES.has(code) ? 0.08 : 0.35
  const path = geomToPath(feature.geometry, project, eps)
  if (!path) {
    console.warn('empty path', name, code)
    continue
  }
  const [cx, cy] = projection(geoCentroid(feature))
  countries.push([name, path, round1(cx), round1(cy)])
}

countries.sort((a, b) => a[0].localeCompare(b[0]))

console.log('generated', countries.length, 'countries')
const pathChars = countries.reduce((s, c) => s + c[1].length, 0)
console.log('path chars', pathChars, '≈', Math.round(pathChars / 1024), 'KB')

// Preserve RU_NAMES from existing file
const old = readFileSync(OUT, 'utf8')
const ruMatch = old.match(/export const RU_NAMES: Record<string, string> = (\{[\s\S]*?\})\n\n/)
if (!ruMatch) throw new Error('RU_NAMES not found')
const RU_NAMES = ruMatch[1]

const header = `export type WorldCountry = [name: string, path: string, cx: number, cy: number]

/** Higher-detail country outlines (Natural Earth 50m → equirectangular 1000×507, simplified). */
export const WORLD_COUNTRIES: WorldCountry[] = `

const footer = `

export const RU_NAMES: Record<string, string> = ${RU_NAMES}

const CODE_TO_MAP_NAME: Record<string, string> = {
  GB: 'England',
  US: 'USA',
}

export function codeToMapName(code: string, countryName: string): string {
  return CODE_TO_MAP_NAME[code.toUpperCase()] ?? countryName
}
`

const body = JSON.stringify(countries)
writeFileSync(OUT, header + body + footer)
console.log('wrote', OUT, 'size', Math.round(readFileSync(OUT).length / 1024), 'KB')

// Sanity: Europe centroids
for (const n of ['Germany', 'France', 'Poland', 'England', 'Ukraine', 'Spain', 'Italy', 'Netherlands']) {
  const c = countries.find(x => x[0] === n)
  console.log(n, c ? `${c[2]},${c[3]} path=${c[1].length}` : 'MISSING')
}
