const FAKE_ORIGIN = 'https://redirect.invalid'
const MAX_LENGTH = 2048

// Returns a path inside the site, or the fallback (tech.md, section 18).
export function safeRedirect(target: unknown, fallback = '/'): string {
  if (typeof target !== 'string' || target === '' || target.length > MAX_LENGTH) return fallback
  if (/[\u0000-\u001f\u007f\\]/.test(target)) return fallback
  if (!target.startsWith('/') || target.startsWith('//')) return fallback
  let url: URL
  try {
    url = new URL(target, FAKE_ORIGIN)
  } catch {
    return fallback
  }
  if (url.origin !== FAKE_ORIGIN) return fallback
  // Dot segments can collapse "/..//host" into "//host", which a browser reads as another site.
  const result = `${url.pathname}${url.search}`
  return result.startsWith('//') ? fallback : result
}
