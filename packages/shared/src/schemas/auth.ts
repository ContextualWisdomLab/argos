import { z } from "zod";

/**
 * bcrypt only incorporates the first 72 UTF-8 bytes of a password.
 * Rejecting longer values keeps authentication behavior explicit and prevents
 * two visually different passwords from producing the same effective input.
 */
export const PasswordSchema = z
  .string()
  .min(8)
  .refine((password) => new TextEncoder().encode(password).length <= 72, {
    message: "Password must be at most 72 UTF-8 bytes",
  });

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: PasswordSchema,
});

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: PasswordSchema,
  name: z.string().min(1),
});

export const ExchangeRequestSchema = z.object({
  onboardToken: z.string().min(1),
});
