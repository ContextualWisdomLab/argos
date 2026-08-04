import { describe, expect, it } from 'vitest'
import {
  ExchangeRequestSchema,
  LoginRequestSchema,
  PASSWORD_MAX_LENGTH,
  RegisterRequestSchema,
  ResetPasswordSchema,
} from './auth.js'

describe('LoginRequestSchema', () => {
  it('유효한 이메일과 8자 이상 비밀번호는 통과한다', () => {
    expect(
      LoginRequestSchema.safeParse({ email: 'a@b.com', password: '12345678' }).success,
    ).toBe(true)
  })

  it('이메일 형식이 아니면 실패한다', () => {
    expect(
      LoginRequestSchema.safeParse({ email: 'not-an-email', password: '12345678' }).success,
    ).toBe(false)
  })

  it('비밀번호가 7자면 실패한다 (min 8 경계)', () => {
    expect(
      LoginRequestSchema.safeParse({ email: 'a@b.com', password: '1234567' }).success,
    ).toBe(false)
  })

  it('비밀번호가 정확히 최대 길이면 통과한다', () => {
    expect(
      LoginRequestSchema.safeParse({
        email: 'a@b.com',
        password: 'A'.repeat(PASSWORD_MAX_LENGTH),
      }).success,
    ).toBe(true)
  })

  it('비밀번호가 최대 길이를 초과하면 실패한다', () => {
    expect(
      LoginRequestSchema.safeParse({
        email: 'a@b.com',
        password: 'A'.repeat(PASSWORD_MAX_LENGTH + 1),
      }).success,
    ).toBe(false)
  })
})

describe('RegisterRequestSchema', () => {
  it('이름이 빈 문자열이면 실패한다', () => {
    expect(
      RegisterRequestSchema.safeParse({ email: 'a@b.com', password: '12345678', name: '' })
        .success,
    ).toBe(false)
  })

  it('이름이 1자면 통과한다', () => {
    expect(
      RegisterRequestSchema.safeParse({ email: 'a@b.com', password: '12345678', name: 'k' })
        .success,
    ).toBe(true)
  })

  it('비밀번호가 정확히 최대 길이면 통과한다', () => {
    expect(
      RegisterRequestSchema.safeParse({
        email: 'a@b.com',
        password: 'A'.repeat(PASSWORD_MAX_LENGTH),
        name: 'k',
      }).success,
    ).toBe(true)
  })

  it('비밀번호가 최대 길이를 초과하면 실패한다', () => {
    expect(
      RegisterRequestSchema.safeParse({
        email: 'a@b.com',
        password: 'A'.repeat(PASSWORD_MAX_LENGTH + 1),
        name: 'k',
      }).success,
    ).toBe(false)
  })
})

describe('ResetPasswordSchema', () => {
  it('두 비밀번호가 정확히 최대 길이이고 일치하면 통과한다', () => {
    const password = 'A'.repeat(PASSWORD_MAX_LENGTH)
    expect(
      ResetPasswordSchema.safeParse({ password, passwordConfirmation: password }).success,
    ).toBe(true)
  })

  it('비밀번호가 최대 길이를 초과하면 실패한다', () => {
    const password = 'A'.repeat(PASSWORD_MAX_LENGTH + 1)
    expect(
      ResetPasswordSchema.safeParse({ password, passwordConfirmation: password }).success,
    ).toBe(false)
  })

  it('확인 비밀번호가 최대 길이를 초과하면 실패한다', () => {
    expect(
      ResetPasswordSchema.safeParse({
        password: 'A'.repeat(PASSWORD_MAX_LENGTH),
        passwordConfirmation: 'A'.repeat(PASSWORD_MAX_LENGTH + 1),
      }).success,
    ).toBe(false)
  })

  it('비밀번호와 확인 비밀번호가 다르면 실패한다', () => {
    expect(
      ResetPasswordSchema.safeParse({
        password: 'password123',
        passwordConfirmation: 'password124',
      }).success,
    ).toBe(false)
  })
})

describe('ExchangeRequestSchema', () => {
  it('onboardToken 이 빈 문자열이면 실패한다', () => {
    expect(ExchangeRequestSchema.safeParse({ onboardToken: '' }).success).toBe(false)
  })
})
