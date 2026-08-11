import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  createAdminImpersonationToken,
  requireAdmin,
} from "@/lib/server/admin-auth";
import { db } from "@/lib/server/db";
import { handleRouteError, jsonError } from "@/lib/server/error-helper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CreateImpersonationSchema = z.object({
  userId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const input = CreateImpersonationSchema.parse(await req.json());
    const user = await db.user.findUnique({
      where: { id: input.userId },
      select: {
        id: true,
        memberships: {
          where: { role: { in: ["OWNER", "MANAGER"] } },
          select: { role: true },
          take: 1,
        },
      },
    });
    if (!user) {
      return jsonError("USER_NOT_FOUND", "User not found", 404);
    }
    if (user.memberships.length > 0) {
      return jsonError(
        "ADMIN_IMPERSONATION_FORBIDDEN",
        "Cannot impersonate admins",
        403,
      );
    }

    const token = createAdminImpersonationToken(user.id);
    return NextResponse.json({
      impersonationUrl: `/admin/impersonate?token=${encodeURIComponent(token)}`,
      dashboardUrl: "/dashboard",
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
