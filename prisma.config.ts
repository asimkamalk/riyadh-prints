import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed/index.ts",
  },
  datasource: {
    // Unpooled Neon host. Migrations cannot run through PgBouncer.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
