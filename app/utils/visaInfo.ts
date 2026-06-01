// Simplified visa info: nationality → target country → visa type
// Returns a display string and a severity level for color coding

export type VisaSeverity = 'success' | 'warning' | 'danger' | 'neutral'

export interface VisaInfo {
  label: string
  severity: VisaSeverity
}

const VISA_MAP: Record<string, Record<string, VisaInfo>> = {
  UA: {
    PT: { label: 'Безвиз 90 дней', severity: 'success' },
    DE: { label: 'Безвиз 90 дней', severity: 'success' },
    PL: { label: 'Безвиз 90 дней', severity: 'success' },
    ES: { label: 'Безвиз 90 дней', severity: 'success' },
    FR: { label: 'Безвиз 90 дней', severity: 'success' },
    IT: { label: 'Безвиз 90 дней', severity: 'success' },
    CZ: { label: 'Безвиз 90 дней', severity: 'success' },
    NL: { label: 'Безвиз 90 дней', severity: 'success' },
    GB: { label: 'Виза требуется', severity: 'danger' },
    US: { label: 'Виза требуется', severity: 'danger' },
    CA: { label: 'eTA / виза', severity: 'warning' },
    AU: { label: 'Виза требуется', severity: 'danger' },
    TR: { label: 'Безвиз 30 дней', severity: 'success' },
    GE: { label: 'Безвиз 365 дней', severity: 'success' },
    TH: { label: 'Безвиз 30 дней', severity: 'success' },
    JP: { label: 'Виза требуется', severity: 'danger' },
    AE: { label: 'Безвиз 30 дней', severity: 'success' },
    ME: { label: 'Безвиз 30 дней', severity: 'success' },
    RS: { label: 'Безвиз 30 дней', severity: 'success' },
    AM: { label: 'Безвиз 180 дней', severity: 'success' },
  },
  RU: {
    TR: { label: 'Безвиз 60 дней', severity: 'success' },
    TH: { label: 'Безвиз 30 дней', severity: 'success' },
    AE: { label: 'Безвиз 90 дней', severity: 'success' },
    GE: { label: 'Безвиз 365 дней', severity: 'success' },
    AM: { label: 'Безвиз 180 дней', severity: 'success' },
    ME: { label: 'Безвиз 30 дней', severity: 'success' },
    RS: { label: 'Безвиз 30 дней', severity: 'success' },
    DE: { label: 'Виза требуется', severity: 'danger' },
    PT: { label: 'Виза требуется', severity: 'danger' },
    FR: { label: 'Виза требуется', severity: 'danger' },
    US: { label: 'Виза требуется', severity: 'danger' },
  },
}

const DEFAULT_VISA: VisaInfo = { label: 'Уточните в посольстве', severity: 'neutral' }

export function getVisaInfo(nationality: string, targetCountry: string): VisaInfo {
  return VISA_MAP[nationality.toUpperCase()]?.[targetCountry.toUpperCase()] ?? DEFAULT_VISA
}
