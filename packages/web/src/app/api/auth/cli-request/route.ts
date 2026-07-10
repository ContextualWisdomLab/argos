import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { handleRouteError } from "@/lib/server/error-helper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/auth/cli-request
export async function POST() {
  try {
    const state = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15분

    await db.cliAuthRequest.create({ data: { state, expiresAt } });

    // 보안 수정: req.nextUrl.origin 대신 환경 변수를 사용하여 Host Header Injection을 방지합니다.
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://argos-ai.xyz";
    const authUrl = `${origin}/cli-auth?state=${state}`;
    return NextResponse.json({ state, authUrl });
  } catch (err) {
    return handleRouteError(err);
  }
}
