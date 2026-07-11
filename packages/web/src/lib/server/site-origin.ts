import 'server-only'

const DEFAULT_PUBLIC_SITE_ORIGIN = 'https://argos-ai.xyz'
const ALLOWED_PUBLIC_SITE_PROTOCOLS = new Set(['https:', 'http:'])

export function getPublicSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (!configured) return DEFAULT_PUBLIC_SITE_ORIGIN

  let url: URL
  try {
    url = new URL(configured)
  } catch {
    throw new Error('NEXT_PUBLIC_SITE_URL must be an absolute http(s) URL')
  }

  if (!ALLOWED_PUBLIC_SITE_PROTOCOLS.has(url.protocol) || !url.hostname) {
    throw new Error('NEXT_PUBLIC_SITE_URL must use http or https')
  }

  return url.origin
}
