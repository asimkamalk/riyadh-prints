import { prisma } from "./helpers";

const rows = [
  { source: "/products", destination: "/shop" },
  { source: "/ar/products", destination: "/ar/shop" },
  { source: "/product-tag", destination: "/shop" },
] as const;

export async function seedRedirects() {
  for (const row of rows) {
    await prisma.redirect.upsert({
      where: { source: row.source },
      create: {
        source: row.source,
        destination: row.destination,
        type: "PERMANENT",
        isActive: true,
        note: "WordPress shop alias",
      },
      update: {
        destination: row.destination,
        type: "PERMANENT",
        isActive: true,
      },
    });
  }
}
