/**
 * Minimal, dependency-free Markdown → HTML for blog posts.
 * All input is HTML-escaped first; only a fixed set of tags is produced and link/image
 * URLs are restricted to http(s) and site-relative paths, so the result is safe for v-html.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const SAFE_URL = /^(https?:\/\/[^\s"'<>]+|\/[^\s"'<>]*|mailto:[^\s"'<>]+)$/i

function inline(escaped: string): string {
  return escaped
    // images first: ![alt](url)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt: string, url: string) =>
      SAFE_URL.test(url) && !url.startsWith('mailto:')
        ? `<img src="${url}" alt="${alt}" loading="lazy">`
        : m)
    // links: [text](url)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text: string, url: string) => {
      if (!SAFE_URL.test(url)) return m
      const external = /^https?:\/\//i.test(url)
      return `<a href="${url}"${external ? ' rel="noopener nofollow" target="_blank"' : ''}>${text}</a>`
    })
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*(?!\*)/g, '$1<em>$2</em>')
}

export function renderMarkdown(source: string | null | undefined): string {
  const text = (source ?? '').replace(/\r\n?/g, '\n').trim()
  if (!text) return ''

  const out: string[] = []
  for (const block of text.split(/\n{2,}/)) {
    const lines = block.split('\n').map(l => l.trimEnd()).filter(l => l.trim() !== '')
    if (!lines.length) continue

    const first = lines[0]!
    const heading = /^(#{1,3})\s+(.+)$/.exec(first)
    if (heading && lines.length === 1) {
      // #/## → h2, ### → h3 (the page title is the only h1)
      const level = Math.max(2, heading[1]!.length)
      out.push(`<h${level}>${inline(escapeHtml(heading[2]!))}</h${level}>`)
      continue
    }

    if (lines.every(l => /^\s*[-*]\s+/.test(l))) {
      const items = lines.map(l => `<li>${inline(escapeHtml(l.replace(/^\s*[-*]\s+/, '')))}</li>`)
      out.push(`<ul>${items.join('')}</ul>`)
      continue
    }

    if (lines.every(l => /^\s*\d+[.)]\s+/.test(l))) {
      const items = lines.map(l => `<li>${inline(escapeHtml(l.replace(/^\s*\d+[.)]\s+/, '')))}</li>`)
      out.push(`<ol>${items.join('')}</ol>`)
      continue
    }

    if (lines.every(l => /^>\s?/.test(l))) {
      out.push(`<blockquote>${inline(escapeHtml(lines.map(l => l.replace(/^>\s?/, '')).join(' ')))}</blockquote>`)
      continue
    }

    out.push(`<p>${inline(escapeHtml(lines.join(' ')))}</p>`)
  }
  return out.join('\n')
}
