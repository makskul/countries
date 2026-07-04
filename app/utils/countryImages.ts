export const COUNTRY_IMAGES: Record<string, string> = {
  PT: 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?q=80&w=500&auto=format&fit=crop',
  ES: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=500&auto=format&fit=crop',
  DE: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=500&auto=format&fit=crop',
  PL: 'https://images.unsplash.com/photo-1519197924294-4ba991a11128?q=80&w=500&auto=format&fit=crop',
  NL: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?q=80&w=500&auto=format&fit=crop',
  FR: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=500&auto=format&fit=crop',
  IT: 'https://images.unsplash.com/photo-1523906839108-527294f1a8a7?q=80&w=500&auto=format&fit=crop',
}

export const DEFAULT_COUNTRY_IMAGE = COUNTRY_IMAGES.PT!

export function getCountryImage(code: string): string {
  return COUNTRY_IMAGES[code.toUpperCase()] ?? DEFAULT_COUNTRY_IMAGE
}
