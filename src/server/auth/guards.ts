import { notFound, redirect } from "next/navigation";

import type { UserRole } from "@/generated/prisma/enums";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
};

/** @deprecated Use `SessionUser`. Kept so action tests and helpers keep compiling. */
export type ActionUser = SessionUser;

export async function getCurrentUser(): Promise<SessionUser | null> {
  const { auth } = await import("./instance");
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.email || !user.role) {
    return null;
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    role: user.role,
  };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  return getCurrentUser();
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}

export async function requireRole(
  roles: readonly UserRole[],
): Promise<SessionUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    notFound();
  }
  return user;
}
