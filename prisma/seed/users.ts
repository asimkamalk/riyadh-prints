import { hash } from "bcryptjs";

import { prisma, requireEnv } from "./helpers";

export async function seedUsers() {
  const email = requireEnv("SEED_ADMIN_EMAIL").toLowerCase();
  const password = requireEnv("SEED_ADMIN_PASSWORD");
  const passwordHash = await hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: "Riyadh Prints Admin",
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
    update: {
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });
}
