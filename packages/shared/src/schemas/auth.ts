import { z } from 'zod'

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(1024),
})

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(1024),
  name: z.string().min(1),
})

export const ExchangeRequestSchema = z.object({
  onboardToken: z.string().min(1),
})
