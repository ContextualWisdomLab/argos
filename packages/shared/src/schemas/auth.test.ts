import { describe, expect, it } from 'vitest'
import {
  BCRYPT_MAX_PASSWORD_BYTES,
  ExchangeRequestSchema,
  LoginRequestSchema,
  RegisterRequestSchema,
  isPasswordWithinBcryptByteLimit,
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

  it('bcrypt UTF-8 바이트 경계에서 72바이트는 통과하고 73바이트는 실패한다', () => {
    expect(
      LoginRequestSchema.safeParse({
        email: 'a@b.com',
        password: 'a'.repeat(BCRYPT_MAX_PASSWORD_BYTES),
      }).success,
    ).toBe(true)
    expect(
      LoginRequestSchema.safeParse({
        email: 'a@b.com',
        password: 'a'.repeat(BCRYPT_MAX_PASSWORD_BYTES + 1),
      }).success,
    ).toBe(false)
  })

  it('문자 수가 아니라 UTF-8 바이트 수로 다국어 비밀번호를 검증한다', () => {
    expect(
      LoginRequestSchema.safeParse({ email: 'a@b.com', password: '한'.repeat(24) }).success,
    ).toBe(true)
    expect(
      LoginRequestSchema.safeParse({ email: 'a@b.com', password: '한'.repeat(25) }).success,
    ).toBe(false)
  })
})

describe('RegisterRequestSchema', () => {
  it('이름이 빈 문자열이면 실패한다', () => {
    expect(
      RegisterRequestSchema.safeParse({ email: 'a@b.com', password: '12345678', name: '' }).success,
    ).toBe(false)
  })

  it('이름이 1자면 통과한다', () => {
    expect(
      RegisterRequestSchema.safeParse({ email: 'a@b.com', password: '12345678', name: 'k' }).success,
    ).toBe(true)
  })

  it('bcrypt UTF-8 바이트 경계를 회원가입에도 동일하게 적용한다', () => {
    expect(
      RegisterRequestSchema.safeParse({
        email: 'a@b.com',
        password: 'a'.repeat(BCRYPT_MAX_PASSWORD_BYTES),
        name: 'k',
      }).success,
    ).toBe(true)
    expect(
      RegisterRequestSchema.safeParse({
        email: 'a@b.com',
        password: 'a'.repeat(BCRYPT_MAX_PASSWORD_BYTES + 1),
        name: 'k',
      }).success,
    ).toBe(false)
  })
})

describe('isPasswordWithinBcryptByteLimit', () => {
  it('rejects input only when its UTF-8 representation exceeds the bcrypt limit', () => {
    expect(isPasswordWithinBcryptByteLimit('a'.repeat(BCRYPT_MAX_PASSWORD_BYTES))).toBe(true)
    expect(isPasswordWithinBcryptByteLimit('a'.repeat(BCRYPT_MAX_PASSWORD_BYTES + 1))).toBe(false)
  })
})

describe('ExchangeRequestSchema', () => {
  it('onboardToken 이 빈 문자열이면 실패한다', () => {
    expect(ExchangeRequestSchema.safeParse({ onboardToken: '' }).success).toBe(false)
  })
})
