/** Canonical alpha ISO order: lower code first in slug (e.g. DE + PL → de-vs-pl). */
export function canonicalCompareCodes(a: string, b: string): [string, string] {
  const x = a.toUpperCase()
  const y = b.toUpperCase()
  if (x === y) return [x, y]
  return x < y ? [x, y] : [y, x]
}

export function toCompareSlug(a: string, b: string): string {
  const [first, second] = canonicalCompareCodes(a, b)
  return `${first.toLowerCase()}-vs-${second.toLowerCase()}`
}

export function parseCompareSlug(pair: string): { a: string; b: string } | null {
  const m = /^([a-z]{2})-vs-([a-z]{2})$/i.exec(pair.trim())
  if (!m) return null
  const a = m[1].toUpperCase()
  const b = m[2].toUpperCase()
  if (a === b) return null
  const [first, second] = canonicalCompareCodes(a, b)
  if (first.toLowerCase() !== m[1].toLowerCase() || second.toLowerCase() !== m[2].toLowerCase()) {
    return null
  }
  return { a: first, b: second }
}

/** Accept any ISO pair order; use before canonical redirect. */
export function parseCompareSlugLenient(pair: string): { a: string; b: string } | null {
  const m = /^([a-z]{2})-vs-([a-z]{2})$/i.exec(pair.trim())
  if (!m) return null
  const a = m[1].toUpperCase()
  const b = m[2].toUpperCase()
  if (a === b) return null
  const [first, second] = canonicalCompareCodes(a, b)
  return { a: first, b: second }
}

export function isCanonicalCompareSlug(pair: string): boolean {
  const m = /^([a-z]{2})-vs-([a-z]{2})$/i.exec(pair.trim())
  if (!m) return false
  const [first, second] = canonicalCompareCodes(m[1], m[2])
  return first.toLowerCase() === m[1].toLowerCase() && second.toLowerCase() === m[2].toLowerCase()
}
