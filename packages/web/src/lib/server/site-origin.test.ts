import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { getPublicSiteOrigin } from './site-origin'

const ORIGINAL_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

afterEach(() => {
  if (ORIGINAL_SITE_URL === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_SITE_URL
  }
})

describe('getPublicSiteOrigin', () => {
  it('uses the configured public site origin', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://app.argos.example/path?ignored=true'

    expect(getPublicSiteOrigin()).toBe('https://app.argos.example')
  })

  it('falls back to the production origin only when no site URL is configured', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL

    expect(getPublicSiteOrigin()).toBe('https://argos-ai.xyz')
  })

  it('rejects non-http public site URLs instead of silently falling back', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'javascript:alert(1)'

    expect(() => getPublicSiteOrigin()).toThrow('NEXT_PUBLIC_SITE_URL must use http or https')
  })

  it('rejects relative public site URLs', () => {
    process.env.NEXT_PUBLIC_SITE_URL = '/cli-auth'

    expect(() => getPublicSiteOrigin()).toThrow('NEXT_PUBLIC_SITE_URL must be an absolute http(s) URL')
  })
})
