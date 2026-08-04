import { z } from 'zod'

/**
 * Coarse character cap applied before UTF-8 byte measurement.
 *
 * This bounds parsing and encoding work for hostile multi-megabyte inputs. The
 * lower bcrypt byte limit remains the effective compatibility boundary.
 */
export const PASSWORD_INPUT_MAX_CHARACTERS = 1024

/** Maximum UTF-8 input accepted by the repository's current bcrypt verifier. */
export const BCRYPT_PASSWORD_MAX_BYTES = 72

/** Return the number of bytes produced by standard UTF-8 encoding. */
function utf8ByteLength(value: string): number {
  let byteLength = 0
  for (const symbol of value) {
    const codePoint = symbol.codePointAt(0)!
    if (codePoint <= 0x7f) {
      byteLength += 1
    } else if (codePoint <= 0x7ff) {
      byteLength += 2
    } else if (codePoint <= 0xffff) {
      byteLength += 3
    } else {
      byteLength += 4
    }
  }
  return byteLength
}

/**
 * Shared password contract for every bcrypt-backed authentication transport.
 *
 * The character cap prevents oversized-input work, while the UTF-8 byte check
 * rejects values that bcrypt would otherwise truncate silently after 72 bytes.
 */
export const PasswordSchema = z
  .string()
  .min(8)
  .max(PASSWORD_INPUT_MAX_CHARACTERS)
  .superRefine((value, context) => {
    if (value.length > PASSWORD_INPUT_MAX_CHARACTERS) return
    if (utf8ByteLength(value) > BCRYPT_PASSWORD_MAX_BYTES) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Password must be at most ${BCRYPT_PASSWORD_MAX_BYTES} UTF-8 bytes`,
      })
    }
  })

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: PasswordSchema,
})

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: PasswordSchema,
  name: z.string().min(1),
})

/** Shared password-reset contract used by every transport and client. */
export const ResetPasswordSchema = z
  .object({
    password: PasswordSchema,
    passwordConfirmation: PasswordSchema,
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: 'Passwords do not match',
  })

export const ExchangeRequestSchema = z.object({
  onboardToken: z.string().min(1),
})
