import { z } from 'zod'

/** Maximum number of characters accepted before password hashing. */
export const PASSWORD_MAX_LENGTH = 1024

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(PASSWORD_MAX_LENGTH),
})

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(PASSWORD_MAX_LENGTH),
  name: z.string().min(1),
})

/** Shared password-reset contract used by every transport and client. */
export const ResetPasswordSchema = z
  .object({
    password: z.string().min(8).max(PASSWORD_MAX_LENGTH),
    passwordConfirmation: z.string().min(8).max(PASSWORD_MAX_LENGTH),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    path: ['passwordConfirmation'],
    message: 'Passwords do not match',
  })

export const ExchangeRequestSchema = z.object({
  onboardToken: z.string().min(1),
})
