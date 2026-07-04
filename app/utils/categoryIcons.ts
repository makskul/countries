export const CATEGORY_PRIME_ICONS: Record<string, string> = {
  shield: 'pi-shield',
  dollar: 'pi-dollar',
  shield2: 'pi-shield',
  clipboard: 'pi-clipboard',
  cloud: 'pi-cloud',
  chat: 'pi-comments',
  sparkle: 'pi-sun',
  heart: 'pi-heart',
  star: 'pi-star',
}

export function getCategoryPrimeIcon(iconKey: string): string {
  return CATEGORY_PRIME_ICONS[iconKey] ?? 'pi-circle'
}
