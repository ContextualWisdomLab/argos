/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'

import { resolveImpersonationNavigationTarget } from './admin-dashboard'

describe('resolveImpersonationNavigationTarget', () => {
  const origin = 'https://admin.example.com'

  it('accepts only the same-origin impersonation route', () => {
    expect(resolveImpersonationNavigationTarget('/admin/impersonate?token=abc123', origin)).toBe(
      'https://admin.example.com/admin/impersonate?token=abc123'
    )
    expect(
      resolveImpersonationNavigationTarget(
        'https://admin.example.com/admin/impersonate?token=abc123',
        origin
      )
    ).toBe('https://admin.example.com/admin/impersonate?token=abc123')
  })

  it('rejects cross-origin, protocol-relative, credentialed, and unexpected routes', () => {
    expect(
      resolveImpersonationNavigationTarget(
        'https://attacker.example/phishing-admin-login',
        origin
      )
    ).toBeNull()
    expect(resolveImpersonationNavigationTarget('//attacker.example/admin/impersonate', origin)).toBeNull()
    expect(
      resolveImpersonationNavigationTarget(
        'https://user:password@admin.example.com/admin/impersonate?token=abc123',
        origin
      )
    ).toBeNull()
    expect(resolveImpersonationNavigationTarget('/dashboard', origin)).toBeNull()
    expect(resolveImpersonationNavigationTarget('javascript:alert(1)', origin)).toBeNull()
    expect(
      resolveImpersonationNavigationTarget(
        '/admin/impersonate?token=abc123&next=https://attacker.example',
        origin
      )
    ).toBeNull()
    expect(
      resolveImpersonationNavigationTarget('/admin/impersonate?token=abc123#/phishing', origin)
    ).toBeNull()
    expect(resolveImpersonationNavigationTarget('/admin/impersonate', origin)).toBeNull()
    expect(resolveImpersonationNavigationTarget('/admin/impersonate?token=', origin)).toBeNull()
    expect(resolveImpersonationNavigationTarget('/admin/impersonate?token=%20', origin)).toBeNull()
    expect(resolveImpersonationNavigationTarget('/admin/impersonate?token=+', origin)).toBeNull()
    expect(
      resolveImpersonationNavigationTarget('/admin/impersonate?token=abc%20def', origin)
    ).toBeNull()
  })

  it('rejects malformed or non-string response values', () => {
    expect(resolveImpersonationNavigationTarget('', origin)).toBeNull()
    expect(resolveImpersonationNavigationTarget('https://[invalid', origin)).toBeNull()
    expect(resolveImpersonationNavigationTarget(null, origin)).toBeNull()
    expect(resolveImpersonationNavigationTarget({ path: '/admin/impersonate' }, origin)).toBeNull()
  })
})
