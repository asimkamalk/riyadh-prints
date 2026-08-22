import { z } from "zod";
import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.fn();
const getSessionUser = vi.fn();
const auditCreate = vi.fn();

vi.mock("next/cache", () => ({
  revalidateTag: (...args: unknown[]) => revalidateTag(...args),
}));

vi.mock("next/headers", () => ({
  headers: async () =>
    new Headers({
      "x-forwarded-for": "203.0.113.10",
      "user-agent": "vitest",
    }),
}));

vi.mock("@/server/auth", () => ({
  getSessionUser: (...args: unknown[]) => getSessionUser(...args),
}));

vi.mock("@/server/db", () => ({
  prisma: {
    auditLog: { create: (...args: unknown[]) => auditCreate(...args) },
  },
}));

import { tags } from "@/lib/cache-tags";
import type { ActionUser } from "@/server/auth";

import {
  CONTENT_ROLES,
  createAction,
  requireRole,
  resetRateLimitForTests,
} from "./_helpers";

const admin: ActionUser = {
  id: "u-admin",
  email: "admin@riyadhprints.com",
  name: "Admin",
  role: "ADMIN",
};

const editor: ActionUser = {
  id: "u-editor",
  email: "editor@riyadhprints.com",
  name: "Editor",
  role: "EDITOR",
};

const viewer: ActionUser = {
  id: "u-viewer",
  email: "viewer@riyadhprints.com",
  name: "Viewer",
  role: "VIEWER",
};

const ping = createAction({
  input: z.object({ name: z.string().min(1) }),
  roles: CONTENT_ROLES,
  revalidate: () => ["products"],
  audit: { action: "test.ping", entityType: "test", entityId: () => "n/a" },
  handler: async ({ input, user }) => ({
    hello: input.name,
    role: user?.role ?? null,
  }),
});

const publicPing = createAction({
  input: z.object({ name: z.string().min(1) }),
  roles: "public",
  revalidate: () => ["inquiries"],
  audit: { action: "test.public", entityType: "test", entityId: () => "public" },
  handler: async ({ input, user }) => ({
    hello: input.name,
    userId: user?.id ?? null,
  }),
});

describe("requireRole", () => {
  beforeEach(() => {
    getSessionUser.mockReset();
  });

  it("rejects anonymous users", async () => {
    getSessionUser.mockResolvedValue(null);
    await expect(requireRole(CONTENT_ROLES)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("rejects VIEWER for editor/admin content roles", async () => {
    getSessionUser.mockResolvedValue(viewer);
    await expect(requireRole(CONTENT_ROLES)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("allows EDITOR and ADMIN for content roles", async () => {
    getSessionUser.mockResolvedValue(editor);
    await expect(requireRole(CONTENT_ROLES)).resolves.toEqual(editor);
    getSessionUser.mockResolvedValue(admin);
    await expect(requireRole(CONTENT_ROLES)).resolves.toEqual(admin);
  });
});

describe("createAction role enforcement", () => {
  beforeEach(() => {
    getSessionUser.mockReset();
    revalidateTag.mockReset();
    auditCreate.mockReset();
    auditCreate.mockResolvedValue({ id: "log" });
    resetRateLimitForTests();
  });

  it("returns a FORBIDDEN action result for VIEWER", async () => {
    getSessionUser.mockResolvedValue(viewer);
    const result = await ping({ name: "x" });
    expect(result).toEqual({
      ok: false,
      error: "You do not have permission to do that.",
    });
    expect(auditCreate).not.toHaveBeenCalled();
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("returns UNAUTHORIZED when there is no session", async () => {
    getSessionUser.mockResolvedValue(null);
    const result = await ping({ name: "x" });
    expect(result).toEqual({ ok: false, error: "Please sign in." });
  });

  it("runs the handler for ADMIN and writes AuditLog + cache tags", async () => {
    getSessionUser.mockResolvedValue(admin);
    const result = await ping({ name: "Riyadh" });
    expect(result).toEqual({
      ok: true,
      data: { hello: "Riyadh", role: "ADMIN" },
    });
    expect(auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "u-admin",
        action: "test.ping",
        entityType: "test",
      }),
    });
    expect(revalidateTag).toHaveBeenCalledWith("products");
    expect(revalidateTag).toHaveBeenCalledWith(tags.sitemap());
  });

  it("skips requireRole for public actions, including anonymous callers", async () => {
    getSessionUser.mockResolvedValue(null);
    const result = await publicPing({ name: "Guest" });
    expect(result).toEqual({
      ok: true,
      data: { hello: "Guest", userId: null },
    });
    expect(auditCreate).toHaveBeenCalled();
  });

  it("returns field errors instead of running the handler", async () => {
    getSessionUser.mockResolvedValue(admin);
    const result = await ping({ name: "" });
    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("expected validation failure");
    }
    expect(result.error).toBe("Invalid input.");
    expect(result.fieldErrors).toBeDefined();
    expect(getSessionUser).not.toHaveBeenCalled();
  });
});
