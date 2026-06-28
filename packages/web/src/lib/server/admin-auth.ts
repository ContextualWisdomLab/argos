import 'server-only'

import { createHmac, randomBytes, timingSafeEqual, pbkdf2Sync, pbkdf2 } from 'crypto'
import { promisify } from 'util'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { env } from './env'

export const ADMIN_USERNAME = env.ADMIN_USERNAME
export const ADMIN_PASSWORD = env.ADMIN_PASSWORD

const ADMIN_SESSION_COOKIE = 'argos_admin_session'
const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000
const ADMIN_IMPERSONATION_TTL_MS = 60 * 1000
const ADMIN_IMPERSONATION_PREFIX = 'argos_imp'

// Security parameters for PBKDF2
const PBKDF2_ITERATIONS = 100000
const PBKDF2_KEYLEN = 64
const PBKDF2_DIGEST = 'sha512'
// Pre-computed salt for the admin password hashing (in-memory)
const ADMIN_SALT = randomBytes(16)

let _adminPasswordHash: Buffer | null = null

// Lazy initialization of the target hash to prevent build errors when env vars are missing
function getAdminPasswordHash(): Buffer {
  if (!_adminPasswordHash) {
    _adminPasswordHash = pbkdf2Sync(
      ADMIN_PASSWORD,
      ADMIN_SALT,
      PBKDF2_ITERATIONS,
      PBKDF2_KEYLEN,
      PBKDF2_DIGEST
    )
  }
  return _adminPasswordHash
}

const pbkdf2Async = promisify(pbkdf2)

function verifyHmac(a: string, b: string): boolean {
  const aBytes = Buffer.from(a)
  const bBytes = Buffer.from(b)

  if (aBytes.length !== bBytes.length) {
    return false
  }

  return timingSafeEqual(aBytes, bBytes)
}

function sign(payload: string): string {
  return createHmac('sha256', env.ADMIN_COOKIE_SECRET).update(payload).digest('base64url')
}

export async function verifyAdminCredentials(input: {
  username: string
  password: string
}): Promise<boolean> {
  // Early return for username to prevent DoS (skip slow hash if username is wrong)
  if (input.username !== ADMIN_USERNAME) {
    return false
  }

  const targetHash = getAdminPasswordHash()
  const inputHash = await pbkdf2Async(
    input.password,
    ADMIN_SALT,
    PBKDF2_ITERATIONS,
    PBKDF2_KEYLEN,
    PBKDF2_DIGEST
  )

  return timingSafeEqual(inputHash, targetHash)
}

export function createAdminSessionCookieValue(): string {
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_MS
  const nonce = randomBytes(16).toString('base64url')
  const payload = `${ADMIN_USERNAME}.${expiresAt}.${nonce}`
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

  if (username !== ADMIN_USERNAME) return false

  const payload = `${username}.${expiresAtRaw}.${nonce}`
  if (!verifyHmac(signature, sign(payload))) return false

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

  if (prefix !== ADMIN_IMPERSONATION_PREFIX) return null

  const payload = `${prefix}.${userId}.${expiresAtRaw}.${nonce}`
  if (!verifyHmac(signature, sign(payload))) return null

  const expiresAt = Number(expiresAtRaw)
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null

  return userId
}

export { ADMIN_SESSION_COOKIE }
