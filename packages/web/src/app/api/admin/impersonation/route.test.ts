import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

vi.mock("@/lib/server/admin-auth", () => ({
  createAdminImpersonationToken: vi.fn(() => "signed-token"),
  requireAdmin: vi.fn(),
}));

vi.mock("@/lib/server/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/server/error-helper", () => ({
  handleRouteError: vi.fn((err: unknown) =>
    NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: String(err) } },
      { status: 500 },
    ),
  ),
  jsonError: vi.fn((code: string, message: string, status: number) =>
    NextResponse.json({ error: { code, message } }, { status }),
  ),
}));

import { requireAdmin } from "@/lib/server/admin-auth";
import { db } from "@/lib/server/db";
import { POST } from "./route";

function makeRequest(userId = "user-1") {
  return new NextRequest("http://localhost/api/admin/impersonation", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ userId }),
  });
}

describe("POST /api/admin/impersonation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireAdmin).mockReturnValue(null);
  });

  it.each(["OWNER", "MANAGER"])(
    "rejects direct impersonation of a %s membership",
    async (role) => {
      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: "admin-user",
        memberships: [{ role }],
      } as never);

      const response = await POST(makeRequest("admin-user"));

      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({
        error: {
          code: "ADMIN_IMPERSONATION_FORBIDDEN",
          message: "Cannot impersonate admins",
        },
      });
      expect(db.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "admin-user" },
          select: expect.objectContaining({ memberships: expect.any(Object) }),
        }),
      );
    },
  );

  it("creates a token for a non-admin customer", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({
      id: "customer-1",
      memberships: [],
    } as never);

    const response = await POST(makeRequest("customer-1"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      impersonationUrl: "/admin/impersonate?token=signed-token",
      dashboardUrl: "/dashboard",
    });
  });
});
