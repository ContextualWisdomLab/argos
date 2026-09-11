import { z } from 'zod'

// 서버 전용 환경변수 (NextAuth용 AUTH_SECRET은 별도로 next-auth 내부에서 처리)
const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  // Separate secret for admin HMAC cookie signing.
  // Falls back to JWT_SECRET if unset (backwards compat), but should be rotated independently.
  ADMIN_COOKIE_SECRET: z.string().min(32).optional(),
  ADMIN_USERNAME: z.string().min(1).max(128).refine((value) => !value.includes('.'), {
    message: 'ADMIN_USERNAME must not contain "."',
  }),
  ADMIN_PASSWORD: z.string().min(16).max(512),
})

type RuntimeEnv = z.infer<typeof EnvSchema> & {
  ADMIN_COOKIE_SECRET: string
}

let cachedEnv: RuntimeEnv | null = null

export function getEnv(): RuntimeEnv {
  if (!cachedEnv) {
    const parsed = EnvSchema.parse(process.env)

    // Resolve admin cookie secret once so admin-auth.ts has no JWT_SECRET reference.
    cachedEnv = {
      ...parsed,
      ADMIN_COOKIE_SECRET: parsed.ADMIN_COOKIE_SECRET ?? parsed.JWT_SECRET,
    }
  }

  return cachedEnv
}

export const env = new Proxy({} as RuntimeEnv, {
  get(_target, prop: keyof RuntimeEnv) {
    return getEnv()[prop]
  },
})
