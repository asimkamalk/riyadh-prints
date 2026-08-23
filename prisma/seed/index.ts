import { seedCategories } from "./categories";
import { seedFaqs } from "./faqs";
import { prisma } from "./helpers";
import { seedMediaAssets } from "./media";
import { seedMenus } from "./menus";
import { seedPages } from "./pages";
import { seedProducts } from "./products";
import { seedRedirects } from "./redirects";
import { seedServices } from "./services";
import { seedSettings } from "./settings";
import { seedUsers } from "./users";

async function main() {
  await seedUsers();
  process.stdout.write("Seeded users\n");
  const media = await seedMediaAssets();
  process.stdout.write("Seeded homepage and catalogue media\n");
  await seedSettings(media);
  process.stdout.write("Seeded settings, location, stats, partners, testimonials\n");
  await seedCategories(media);
  process.stdout.write("Seeded categories\n");
  await seedServices();
  process.stdout.write("Seeded services\n");
  await seedProducts();
  process.stdout.write("Seeded products\n");
  await seedFaqs();
  process.stdout.write("Seeded FAQs\n");
  await seedPages(media);
  process.stdout.write("Seeded pages and home sections\n");
  await seedMenus();
  process.stdout.write("Seeded menus\n");
  await seedRedirects();
  process.stdout.write("Seeded /products → /shop redirects\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    await prisma.$disconnect();
    throw error;
  });
