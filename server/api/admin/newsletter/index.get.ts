export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const format = String(query.format ?? 'json')

  const { supabaseAdmin } = await requireAdmin(event, { roles: ['editor'] })

  const { data, error } = await supabaseAdmin
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, message: error.message })

  if (format === 'csv') {
    const rows = data ?? []
    const header = 'email,created_at,source'
    const lines = rows.map(r =>
      `${escapeCsv(r.email)},${r.created_at},${escapeCsv(r.source)}`,
    )
    setHeader(event, 'Content-Type', 'text/csv; charset=utf-8')
    setHeader(event, 'Content-Disposition', 'attachment; filename="newsletter.csv"')
    return [header, ...lines].join('\n')
  }

  return { items: data ?? [] }
})

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
