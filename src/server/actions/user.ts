"use server";

import { hash } from "bcryptjs";
import { z } from "zod";

import { tags } from "@/lib/cache-tags";
import {
  bulkIdsSchema,
  idSchema,
  reorderSchema,
  userRoleSchema,
} from "@/lib/validations/common";
import { prisma } from "@/server/db";

import { ActionError, ADMIN_ROLES, createAction } from "./_helpers";
import { notFound } from "./_resource";

const BCRYPT_ROUNDS = 12;

const userCreateSchema = z.object({
  email: z.email(),
  name: z.string().trim().min(1).max(120),
  password: z.string().min(10).max(200),
  role: userRoleSchema.optional(),
});

const userUpdateSchema = z.object({
  id: z.string().min(1),
  email: z.email().optional(),
  name: z.string().trim().min(1).max(120).optional(),
  password: z.string().min(10).max(200).optional(),
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),
});

async function assertNotLastAdmin(userId: string): Promise<void> {
  const remaining = await prisma.user.count({
    where: {
      id: { not: userId },
      role: "ADMIN",
      isActive: true,
    },
  });
  if (remaining === 0) {
    throw new ActionError("Cannot remove the last admin.", "CONFLICT");
  }
}

export const createUser = createAction({
  input: userCreateSchema,
  roles: ADMIN_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "user.create", entityType: "user", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const passwordHash = await hash(input.password, BCRYPT_ROUNDS);
    try {
      return await prisma.user.create({
        data: {
          email: input.email.toLowerCase().trim(),
          name: input.name,
          passwordHash,
          role: input.role ?? "VIEWER",
        },
        select: { id: true, email: true, role: true, isActive: true },
      });
    } catch {
      throw new ActionError("A user with that email already exists.", "CONFLICT");
    }
  },
});

export const updateUser = createAction({
  input: userUpdateSchema,
  roles: ADMIN_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "user.update", entityType: "user", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.user.findUnique({
      where: { id: input.id },
      select: { id: true, role: true, isActive: true },
    });
    if (!existing) {
      notFound("User");
    }
    const demotingAdmin =
      existing.role === "ADMIN" &&
      ((input.role && input.role !== "ADMIN") || input.isActive === false);
    if (demotingAdmin) {
      await assertNotLastAdmin(existing.id);
    }
    const passwordHash = input.password
      ? await hash(input.password, BCRYPT_ROUNDS)
      : undefined;
    try {
      return await prisma.user.update({
        where: { id: existing.id },
        data: {
          email: input.email?.toLowerCase().trim(),
          name: input.name,
          passwordHash,
          role: input.role,
          isActive: input.isActive,
        },
        select: { id: true, email: true, role: true, isActive: true },
      });
    } catch {
      throw new ActionError("A user with that email already exists.", "CONFLICT");
    }
  },
});

export const deleteUser = createAction({
  input: idSchema,
  roles: ADMIN_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "user.delete", entityType: "user", entityId: (i) => i.id },
  handler: async ({ input, user }) => {
    if (user?.id === input.id) {
      throw new ActionError("You cannot deactivate your own account.");
    }
    const existing = await prisma.user.findUnique({
      where: { id: input.id },
      select: { id: true, role: true, email: true },
    });
    if (!existing) {
      notFound("User");
    }
    if (existing.role === "ADMIN") {
      await assertNotLastAdmin(existing.id);
    }
    return prisma.user.update({
      where: { id: existing.id },
      data: { isActive: false },
      select: { id: true, email: true, isActive: true },
    });
  },
});

export const duplicateUser = createAction({
  input: idSchema,
  roles: ADMIN_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "user.duplicate", entityType: "user", entityId: () => "n/a" },
  handler: async () => {
    throw new ActionError("Users cannot be duplicated.");
  },
});

export const toggleUserStatus = createAction({
  input: idSchema,
  roles: ADMIN_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "user.toggleStatus", entityType: "user", entityId: (i) => i.id },
  handler: async ({ input, user }) => {
    if (user?.id === input.id) {
      throw new ActionError("You cannot deactivate your own account.");
    }
    const existing = await prisma.user.findUnique({
      where: { id: input.id },
      select: { id: true, role: true, isActive: true, email: true },
    });
    if (!existing) {
      notFound("User");
    }
    if (existing.isActive && existing.role === "ADMIN") {
      await assertNotLastAdmin(existing.id);
    }
    return prisma.user.update({
      where: { id: existing.id },
      data: { isActive: !existing.isActive },
      select: { id: true, email: true, isActive: true },
    });
  },
});

export const reorderUsers = createAction({
  input: reorderSchema,
  roles: ADMIN_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "user.reorder", entityType: "user", entityId: () => "batch" },
  handler: async () => {
    throw new ActionError("Users have no sort order.");
  },
});

export const bulkUpdateUserStatus = createAction({
  input: z.object({
    ids: z.array(z.string().min(1)).min(1).max(100),
    isActive: z.boolean(),
  }),
  roles: ADMIN_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "user.bulkUpdateStatus", entityType: "user", entityId: () => "batch" },
  handler: async ({ input, user }) => {
    const ids = input.ids.filter((id) => id !== user?.id);
    if (ids.length === 0) {
      throw new ActionError("You cannot deactivate your own account.");
    }
    if (!input.isActive) {
      const activeAdmins = await prisma.user.count({
        where: { role: "ADMIN", isActive: true, id: { notIn: ids } },
      });
      if (activeAdmins === 0) {
        throw new ActionError("Cannot remove the last admin.", "CONFLICT");
      }
    }
    const result = await prisma.user.updateMany({
      where: { id: { in: ids } },
      data: { isActive: input.isActive },
    });
    return { count: result.count };
  },
});

export const bulkDeleteUsers = createAction({
  input: bulkIdsSchema,
  roles: ADMIN_ROLES,
  revalidate: () => [tags.global()],
  audit: { action: "user.bulkDelete", entityType: "user", entityId: () => "batch" },
  handler: async ({ input, user }) => {
    const ids = input.ids.filter((id) => id !== user?.id);
    if (ids.length === 0) {
      throw new ActionError("You cannot deactivate your own account.");
    }
    const remainingAdmins = await prisma.user.count({
      where: { role: "ADMIN", isActive: true, id: { notIn: ids } },
    });
    if (remainingAdmins === 0) {
      throw new ActionError("Cannot remove the last admin.", "CONFLICT");
    }
    const result = await prisma.user.updateMany({
      where: { id: { in: ids } },
      data: { isActive: false },
    });
    return { count: result.count };
  },
});
