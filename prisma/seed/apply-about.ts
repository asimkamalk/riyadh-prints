import { seedAboutPage } from "./pages";
import { prisma } from "./helpers";

/**
 * Patches a live database without a full `db:seed` (which rebuilds menus and home).
 * Safe to re-run: About CMS sections are replaced with the designed layout.
 */
async function main() {
  await seedAboutPage();
}

main()
  .then(async () => {
    process.stdout.write("About page sections are in place.\n");
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    await prisma.$disconnect();
    throw error;
  });
