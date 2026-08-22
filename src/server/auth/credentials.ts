import { compare } from "bcryptjs";

import { loginSchema } from "@/lib/validations/auth";
import { prisma } from "@/server/db";

/** Generic copy — never reveal whether the email exists. */
export const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";

/**
 * Precomputed bcrypt hash so we always run `compare`, even when the email
 * is unknown. Cost 12 matches real password hashes from seed/user actions.
 */
const DUMMY_PASSWORD_HASH =
  "$2b$12$GNdApJ3uN2kBF43y7ZQEz.97GUpyeDxDEAjbbNRlmW3mOIHshe/vC";

export type AuthorizedUser = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "EDITOR" | "VIEWER";
};

export async function authorizeCredentials(
  raw: unknown,
): Promise<AuthorizedUser | null> {
  const parsed = loginSchema.pick({ email: true, password: true }).safeParse(raw);
  if (!parsed.success) {
    await compare("invalid-credentials", DUMMY_PASSWORD_HASH);
    return null;
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
      isActive: true,
    },
  });

  const hash = user?.passwordHash ?? DUMMY_PASSWORD_HASH;
  const passwordOk = await compare(parsed.data.password, hash);

  if (!user || !user.isActive || !user.passwordHash || !passwordOk) {
    return null;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
