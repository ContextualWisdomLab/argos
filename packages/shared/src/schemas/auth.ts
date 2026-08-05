import { z } from 'zod'

/**
 * Maximum password length accepted before any expensive credential processing.
 *
 * This resource boundary is shared by every authentication entry point so UI,
 * API, and direct service callers cannot drift to different limits.
 */
export const MAX_PASSWORD_LENGTH = 1024

const UserPasswordSchema = z.string().min(8).max(MAX_PASSWORD_LENGTH)

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: UserPasswordSchema,
})

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: UserPasswordSchema,
  name: z.string().min(1),
})

export const ExchangeRequestSchema = z.object({
  onboardToken: z.string().min(1),
})
