import { LoginRequestSchema } from '@argos/shared'

export interface AdmittedPasswordLoginCredentials {
  email: string
  password: string
}

/**
 * Admit password credentials through the shared bcrypt-compatible contract.
 *
 * NextAuth credentials are untrusted adapter input. Reusing the shared schema
 * keeps the coarse character ceiling and the 72-byte UTF-8 bcrypt boundary
 * identical to the API and registration transports before password hashing or
 * comparison is attempted.
 */
export function admitPasswordLoginCredentials(
  credentials: Record<string, unknown> | undefined,
): AdmittedPasswordLoginCredentials | null {
  const parsed = LoginRequestSchema.safeParse({
    email: credentials?.email,
    password: credentials?.password,
  })

  return parsed.success ? parsed.data : null
}
