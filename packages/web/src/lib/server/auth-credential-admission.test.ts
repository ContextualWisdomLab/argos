import { describe, expect, it } from 'vitest'

import { admitPasswordLoginCredentials } from './auth-credential-admission'

const EMAIL = 'person@example.com'

describe('admitPasswordLoginCredentials', () => {
  it('accepts a valid password at the bcrypt byte boundary', () => {
    const admitted = admitPasswordLoginCredentials({
      email: EMAIL,
      password: 'a'.repeat(72),
    })

    expect(admitted).toEqual({ email: EMAIL, password: 'a'.repeat(72) })
  })

  it('rejects ASCII input that bcrypt would truncate', () => {
    expect(
      admitPasswordLoginCredentials({
        email: EMAIL,
        password: 'a'.repeat(73),
      }),
    ).toBeNull()
  })

  it('rejects multibyte input by UTF-8 byte length rather than character count', () => {
    expect(
      admitPasswordLoginCredentials({
        email: EMAIL,
        password: '가'.repeat(25),
      }),
    ).toBeNull()
  })

  it('rejects oversized credential input before password verification', () => {
    expect(
      admitPasswordLoginCredentials({
        email: EMAIL,
        password: 'a'.repeat(1025),
      }),
    ).toBeNull()
  })
})
