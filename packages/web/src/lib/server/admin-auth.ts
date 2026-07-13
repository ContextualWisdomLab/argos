import 'server-only'

import { createHmac, createHash, randomBytes, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { getEnv } from './env'

const ADMIN_SESSION_COOKIE = 'argos_admin_session'
const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000
const ADMIN_IMPERSONATION_TTL_MS = 60 * 1000
const ADMIN_IMPERSONATION_PREFIX = 'argos_imp'
const MAX_PASSWORD_LENGTH = 1024

function getAdminCredentials() {
  const { ADMIN_USERNAME, ADMIN_PASSWORD } = getEnv()
  return { username: ADMIN_USERNAME, password: ADMIN_PASSWORD }
}

function sign(payload: string): string {
  return createHmac('sha256', getEnv().ADMIN_COOKIE_SECRET).update(payload).digest('base64url')
}

export async function verifyAdminCredentials(input: {
  username: string
  password: string
}): Promise<boolean> {
  const { username, password: expectedPassword } = getAdminCredentials()

  // Prevent CPU exhaustion (DoS) by short-circuiting on fast check first
  // and enforcing maximum input length.
  if (input.username !== username || input.password.length > MAX_PASSWORD_LENGTH) {
    return false
  }

  // Use fast uniform hash to prevent timing attacks without unnecessary slow derivation
  // on a plaintext in-memory secret.
  const inputPasswordHash = createHash('sha256').update(input.password).digest()
  const expectedPasswordHash = createHash('sha256').update(expectedPassword).digest()

  return timingSafeEqual(expectedPasswordHash, inputPasswordHash)
}

export function createAdminSessionCookieValue(): string {
  const { username } = getAdminCredentials()
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_MS
  const nonce = randomBytes(16).toString('base64url')
  const payload = `${username}.${expiresAt}.${nonce}`
  return `${payload}.${sign(payload)}`
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor(ADMIN_SESSION_TTL_MS / 1000),
  }
}

export function expiredAdminCookieOptions() {
  return {
    ...adminCookieOptions(),
    maxAge: 0,
  }
}

export function verifyAdminSessionCookie(value: string | undefined): boolean {
  if (!value) return false

  const parts = value.split('.')
  if (parts.length !== 4) return false

  const [username, expiresAtRaw, nonce, signature] = parts
  const payload = `${username}.${expiresAtRaw}.${nonce}`

  const expectedSignature = sign(payload)
  const signatureBytes = Buffer.from(signature)
  const expectedSignatureBytes = Buffer.from(expectedSignature)

  const signatureHash = createHash('sha256').update(signatureBytes).digest()
  const expectedSignatureHash = createHash('sha256').update(expectedSignatureBytes).digest()

  if (!timingSafeEqual(signatureHash, expectedSignatureHash)) return false

  if (username !== getAdminCredentials().username) return false

  const expiresAt = Number(expiresAtRaw)
  return Number.isFinite(expiresAt) && Date.now() <= expiresAt
}

export async function hasAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  return verifyAdminSessionCookie(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)
}

export function requireAdmin(req: NextRequest): NextResponse | null {
  if (verifyAdminSessionCookie(req.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return null
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export function createAdminImpersonationToken(userId: string): string {
  const expiresAt = Date.now() + ADMIN_IMPERSONATION_TTL_MS
  const nonce = randomBytes(16).toString('base64url')
  const payload = `${ADMIN_IMPERSONATION_PREFIX}.${userId}.${expiresAt}.${nonce}`
  return `${payload}.${sign(payload)}`
}

export function verifyAdminImpersonationToken(token: string): string | null {
  const parts = token.split('.')
  if (parts.length !== 5) return null

  const [prefix, userId, expiresAtRaw, nonce, signature] = parts
  const payload = `${prefix}.${userId}.${expiresAtRaw}.${nonce}`

  if (prefix !== ADMIN_IMPERSONATION_PREFIX) return null

  const expectedSignature = sign(payload)
  const signatureBytes = Buffer.from(signature)
  const expectedSignatureBytes = Buffer.from(expectedSignature)

  const signatureHash = createHash('sha256').update(signatureBytes).digest()
  const expectedSignatureHash = createHash('sha256').update(expectedSignatureBytes).digest()

  if (!timingSafeEqual(signatureHash, expectedSignatureHash)) return null

  const expiresAt = Number(expiresAtRaw)
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null

  return userId
}

export { ADMIN_SESSION_COOKIE }
