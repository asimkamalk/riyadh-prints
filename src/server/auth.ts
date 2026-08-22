import type { UserRole } from "@/generated/prisma/enums";

export type ActionUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
};

export async function getSessionUser(): Promise<ActionUser | null> {
  const { auth } = await import("@/auth");
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
