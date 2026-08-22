"use server";

import { z } from "zod";

import { appLocaleSchema } from "@/lib/validations/common";
import { searchAll } from "@/server/queries/search";

import { createAction } from "./_helpers";

export const searchSite = createAction({
  input: z.object({
    query: z.string().trim().max(120),
    locale: appLocaleSchema,
  }),
  roles: "public",
  touchSitemap: false,
  rateLimit: {
    windowMs: 10_000,
    max: 20,
    key: (_input, ipHash) => `search:${ipHash}`,
  },
  revalidate: () => [],
  audit: false,
  handler: async ({ input }) => searchAll(input.query, input.locale),
});
