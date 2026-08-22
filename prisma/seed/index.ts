import { prisma } from "../../src/lib/db";

async function main() {
  // Seed data will be added when models exist.
}

main()
  .catch((error: unknown) => {
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
