import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// We duplicate the schema here for unit testing since it's not exported from the route
const ResetPasswordSchema = z
  .object({
    password: z.string().min(8).max(1024),
    passwordConfirmation: z.string().min(8).max(1024),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: 'Passwords do not match',
  })

describe('ResetPasswordSchema', () => {
  it('유효한 8자 이상 비밀번호와 일치하는 확인 비밀번호는 통과한다', () => {
    expect(
      ResetPasswordSchema.safeParse({ password: 'password123', passwordConfirmation: 'password123' }).success,
    ).toBe(true)
  })

  it('비밀번호와 확인 비밀번호가 다르면 실패한다', () => {
    expect(
      ResetPasswordSchema.safeParse({ password: 'password123', passwordConfirmation: 'password124' }).success,
    ).toBe(false)
  })

  it('비밀번호가 1024자를 초과하면 실패한다 (DoS 방지)', () => {
    const longPassword = 'a'.repeat(1025)
    expect(
      ResetPasswordSchema.safeParse({ password: longPassword, passwordConfirmation: longPassword }).success,
    ).toBe(false)
  })

  it('비밀번호가 정확히 1024자면 통과한다', () => {
    const maxPassword = 'a'.repeat(1024)
    expect(
      ResetPasswordSchema.safeParse({ password: maxPassword, passwordConfirmation: maxPassword }).success,
    ).toBe(true)
  })
})
