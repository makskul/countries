export type BlogPostRow = {
  id: string
  slug: string
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
  author_name: string | null
  cover_image_url: string | null
  cover_alt: string | null
  og_image_url: string | null
  title_uk: string | null
  title_en: string | null
  title_ru: string | null
  excerpt_uk: string | null
  excerpt_en: string | null
  excerpt_ru: string | null
  body_uk: string | null
  body_en: string | null
  body_ru: string | null
  seo_title_uk: string | null
  seo_title_en: string | null
  seo_title_ru: string | null
  seo_description_uk: string | null
  seo_description_en: string | null
  seo_description_ru: string | null
}
