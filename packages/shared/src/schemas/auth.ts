import { z } from 'zod'

/**
 * Maximum request-level password length accepted before credential processing.
 *
 * This protects parsers and service boundaries from attacker-controlled
 * megabyte-sized values. Algorithm-specific limits may be stricter.
 */
export const MAX_PASSWORD_LENGTH = 1024

/** Maximum UTF-8 input size that legacy bcrypt verifies without truncation. */
export const BCRYPT_MAX_PASSWORD_BYTES = 72

const utf8Encoder = new TextEncoder()

/**
 * Return whether bcrypt will consume the complete password without truncation.
 *
 * bcrypt limits are measured in UTF-8 bytes, not JavaScript string length, so
 * multilingual passwords must be encoded before the boundary is evaluated.
 */
export function isPasswordWithinBcryptByteLimit(password: string): boolean {
  return utf8Encoder.encode(password).byteLength <= BCRYPT_MAX_PASSWORD_BYTES
}

/** Password schema for the repository's current legacy bcrypt storage layer. */
export const BcryptPasswordSchema = z
  .string()
  .min(8)
  .max(MAX_PASSWORD_LENGTH)
  .refine(isPasswordWithinBcryptByteLimit, {
    message: `Password must not exceed ${BCRYPT_MAX_PASSWORD_BYTES} UTF-8 bytes`,
  })

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: BcryptPasswordSchema,
})

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: BcryptPasswordSchema,
  name: z.string().min(1),
})

export const ExchangeRequestSchema = z.object({
  onboardToken: z.string().min(1),
})
