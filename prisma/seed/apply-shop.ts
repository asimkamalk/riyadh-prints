import { pointHeaderProductsToShop } from "./menus";
import { seedShopPage } from "./pages";
import { seedRedirects } from "./redirects";
import { prisma } from "./helpers";

/**
 * Patches a live database without a full `db:seed` (which rebuilds menus and home).
 * Safe to re-run: existing Shop CMS sections are left as-is.
 */
async function main() {
  const shop = await prisma.page.findUnique({
    where: { slug: "shop" },
    select: { id: true, sections: { select: { id: true }, take: 1 } },
  });
  if (!shop || shop.sections.length === 0) {
    await seedShopPage();
  }
  await seedRedirects();
  await pointHeaderProductsToShop();
}

main()
  .then(async () => {
    process.stdout.write("Shop page, Products menu, and /products redirects are in place.\n");
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    await prisma.$disconnect();
    throw error;
  });
