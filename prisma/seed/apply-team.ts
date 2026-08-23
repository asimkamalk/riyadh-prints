import { seedTeamMembers } from "./team-members";
import { prisma } from "./helpers";

/**
 * Patches a live database with team profile records.
 * Safe to re-run: Hamza Raza and Asim Kamal are upserted by slug.
 */
async function main() {
  await seedTeamMembers();
}

main()
  .then(async () => {
    process.stdout.write("Team members are in place.\n");
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    await prisma.$disconnect();
    throw error;
  });
