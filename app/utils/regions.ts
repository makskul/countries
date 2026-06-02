export const REGIONS: Record<string, string> = {
  // Europe
  AL: 'europe', AD: 'europe', AT: 'europe', BY: 'europe', BE: 'europe',
  BA: 'europe', BG: 'europe', HR: 'europe', CY: 'europe', CZ: 'europe',
  DK: 'europe', EE: 'europe', FI: 'europe', FR: 'europe', DE: 'europe',
  GR: 'europe', HU: 'europe', IS: 'europe', IE: 'europe', IT: 'europe',
  LV: 'europe', LI: 'europe', LT: 'europe', LU: 'europe', MT: 'europe',
  MD: 'europe', MC: 'europe', ME: 'europe', NL: 'europe', MK: 'europe',
  NO: 'europe', PL: 'europe', PT: 'europe', RO: 'europe', RU: 'europe',
  SM: 'europe', RS: 'europe', SK: 'europe', SI: 'europe', ES: 'europe',
  SE: 'europe', CH: 'europe', UA: 'europe', GB: 'europe', VA: 'europe',
  IM: 'europe', JE: 'europe', GG: 'europe',
  // Asia
  AF: 'asia', AM: 'asia', AZ: 'asia', BH: 'asia', BD: 'asia',
  BT: 'asia', BN: 'asia', KH: 'asia', CN: 'asia', GE: 'asia',
  IN: 'asia', ID: 'asia', IR: 'asia', IQ: 'asia', IL: 'asia',
  JP: 'asia', JO: 'asia', KZ: 'asia', KW: 'asia', KG: 'asia',
  LA: 'asia', LB: 'asia', MY: 'asia', MV: 'asia', MN: 'asia',
  MM: 'asia', NP: 'asia', KP: 'asia', OM: 'asia', PK: 'asia',
  PH: 'asia', QA: 'asia', SA: 'asia', SG: 'asia', KR: 'asia',
  LK: 'asia', SY: 'asia', TW: 'asia', TJ: 'asia', TH: 'asia',
  TL: 'asia', TR: 'asia', TM: 'asia', AE: 'asia', UZ: 'asia',
  VN: 'asia', YE: 'asia',
  // Americas
  AG: 'americas', AR: 'americas', BS: 'americas', BB: 'americas', BZ: 'americas',
  BO: 'americas', BR: 'americas', CA: 'americas', CL: 'americas', CO: 'americas',
  CR: 'americas', CU: 'americas', DM: 'americas', DO: 'americas', EC: 'americas',
  SV: 'americas', GD: 'americas', GT: 'americas', GY: 'americas', HT: 'americas',
  HN: 'americas', JM: 'americas', MX: 'americas', NI: 'americas', PA: 'americas',
  PY: 'americas', PE: 'americas', KN: 'americas', LC: 'americas', VC: 'americas',
  SR: 'americas', TT: 'americas', US: 'americas', UY: 'americas', VE: 'americas',
  // Africa
  DZ: 'africa', AO: 'africa', BJ: 'africa', BW: 'africa', BF: 'africa',
  BI: 'africa', CV: 'africa', CM: 'africa', CF: 'africa', TD: 'africa',
  KM: 'africa', CG: 'africa', CD: 'africa', CI: 'africa', DJ: 'africa',
  EG: 'africa', GQ: 'africa', ER: 'africa', SZ: 'africa', ET: 'africa',
  GA: 'africa', GM: 'africa', GH: 'africa', GN: 'africa', GW: 'africa',
  KE: 'africa', LS: 'africa', LR: 'africa', LY: 'africa', MG: 'africa',
  MW: 'africa', ML: 'africa', MR: 'africa', MU: 'africa', MA: 'africa',
  MZ: 'africa', NA: 'africa', NE: 'africa', NG: 'africa', RW: 'africa',
  ST: 'africa', SN: 'africa', SC: 'africa', SL: 'africa', SO: 'africa',
  ZA: 'africa', SS: 'africa', SD: 'africa', TZ: 'africa', TG: 'africa',
  TN: 'africa', UG: 'africa', ZM: 'africa', ZW: 'africa',
  // Oceania
  AU: 'oceania', FJ: 'oceania', KI: 'oceania', MH: 'oceania', FM: 'oceania',
  NR: 'oceania', NZ: 'oceania', PW: 'oceania', PG: 'oceania', WS: 'oceania',
  SB: 'oceania', TO: 'oceania', TV: 'oceania', VU: 'oceania',
}

export function getRegion(code: string): string {
  return REGIONS[code] ?? 'other'
}
