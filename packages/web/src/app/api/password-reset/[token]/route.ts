import { ResetPasswordSchema } from '@argos/shared'
import { NextRequest, NextResponse } from 'next/server'

import { handleRouteError, jsonError } from '@/lib/server/error-helper'
import {
  getPasswordResetStatus,
  resetPasswordWithToken,
} from '@/lib/server/password-reset'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function statusToResponse(status: 'not_found' | 'expired' | 'used') {
  if (status === 'not_found') {
    return jsonError('RESET_LINK_NOT_FOUND', 'Reset link not found', 404)
  }
  if (status === 'expired') {
    return jsonError('RESET_LINK_EXPIRED', 'Reset link expired', 410)
  }
  return jsonError('RESET_LINK_ALREADY_USED', 'Reset link already used', 410)
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const status = await getPasswordResetStatus(token)
    if (status.status !== 'valid') return statusToResponse(status.status)

    return NextResponse.json({
      user: status.user,
      expiresAt: status.expiresAt,
    })
  } catch (err) {
    return handleRouteError(err)
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const input = ResetPasswordSchema.parse(await req.json())
    const result = await resetPasswordWithToken({
      token,
      password: input.password,
    })

    if (result !== 'success') return statusToResponse(result)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return handleRouteError(err)
  }
}
