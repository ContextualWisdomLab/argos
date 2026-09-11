import { describe, expect, it } from 'vitest'
import {
  BCRYPT_PASSWORD_MAX_BYTES,
  ExchangeRequestSchema,
  LoginRequestSchema,
  PASSWORD_INPUT_MAX_CHARACTERS,
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

  it('72바이트 ASCII 비밀번호는 통과하고 73바이트는 실패한다', () => {
    expect(
      LoginRequestSchema.safeParse({
        email: 'a@b.com',
        password: 'A'.repeat(BCRYPT_PASSWORD_MAX_BYTES),
      }).success,
    ).toBe(true)
    expect(
      LoginRequestSchema.safeParse({
        email: 'a@b.com',
        password: 'A'.repeat(BCRYPT_PASSWORD_MAX_BYTES + 1),
      }).success,
    ).toBe(false)
  })

  it('UTF-8 2바이트 문자의 bcrypt 경계를 정확히 적용한다', () => {
    expect(
      LoginRequestSchema.safeParse({ email: 'a@b.com', password: 'é'.repeat(36) }).success,
    ).toBe(true)
    expect(
      LoginRequestSchema.safeParse({ email: 'a@b.com', password: 'é'.repeat(37) }).success,
    ).toBe(false)
  })

  it('UTF-8 3바이트 문자의 bcrypt 경계를 정확히 적용한다', () => {
    expect(
      LoginRequestSchema.safeParse({ email: 'a@b.com', password: '한'.repeat(24) }).success,
    ).toBe(true)
    expect(
      LoginRequestSchema.safeParse({ email: 'a@b.com', password: '한'.repeat(25) }).success,
    ).toBe(false)
  })

  it('UTF-8 4바이트 문자의 bcrypt 경계를 정확히 적용한다', () => {
    expect(
      LoginRequestSchema.safeParse({ email: 'a@b.com', password: '🔐'.repeat(18) }).success,
    ).toBe(true)
    expect(
      LoginRequestSchema.safeParse({ email: 'a@b.com', password: '🔐'.repeat(19) }).success,
    ).toBe(false)
  })

  it('거대한 입력은 coarse character cap에서 거부한다', () => {
    expect(
      LoginRequestSchema.safeParse({
        email: 'a@b.com',
        password: 'A'.repeat(PASSWORD_INPUT_MAX_CHARACTERS + 1),
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

  it('bcrypt 최대 바이트 경계를 공유한다', () => {
    expect(
      RegisterRequestSchema.safeParse({
        email: 'a@b.com',
        password: 'A'.repeat(BCRYPT_PASSWORD_MAX_BYTES),
        name: 'k',
      }).success,
    ).toBe(true)
    expect(
      RegisterRequestSchema.safeParse({
        email: 'a@b.com',
        password: 'A'.repeat(BCRYPT_PASSWORD_MAX_BYTES + 1),
        name: 'k',
      }).success,
    ).toBe(false)
  })
})

describe('ResetPasswordSchema', () => {
  it('두 비밀번호가 bcrypt 최대 바이트이고 일치하면 통과한다', () => {
    const password = 'A'.repeat(BCRYPT_PASSWORD_MAX_BYTES)
    expect(
      ResetPasswordSchema.safeParse({ password, passwordConfirmation: password }).success,
    ).toBe(true)
  })

  it('비밀번호가 bcrypt 최대 바이트를 초과하면 실패한다', () => {
    const password = 'A'.repeat(BCRYPT_PASSWORD_MAX_BYTES + 1)
    expect(
      ResetPasswordSchema.safeParse({ password, passwordConfirmation: password }).success,
    ).toBe(false)
  })

  it('확인 비밀번호가 bcrypt 최대 바이트를 초과하면 실패한다', () => {
    expect(
      ResetPasswordSchema.safeParse({
        password: 'A'.repeat(BCRYPT_PASSWORD_MAX_BYTES),
        passwordConfirmation: 'A'.repeat(BCRYPT_PASSWORD_MAX_BYTES + 1),
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
