"use server";

import { z } from "zod";

import { appLocaleSchema } from "@/lib/validations/common";
import {
  listAdminMedia,
  listMediaFolders,
  searchAdminEntities,
} from "@/server/queries/admin";

import { CONTENT_ROLES, createAction } from "./_helpers";
import { isSlugAvailable, type SlugModel } from "./_slug";

const slugModelSchema = z.enum([
  "product",
  "category",
  "service",
  "page",
  "post",
  "project",
  "author",
  "teamMember",
  "location",
  "tag",
]);

const readLimit = {
  windowMs: 60_000,
  max: 60,
} as const;

export const checkSlug = createAction({
  input: z.object({
    model: slugModelSchema,
    locale: appLocaleSchema,
    slug: z.string().trim().min(1).max(200),
    excludeId: z.string().min(1).optional(),
  }),
  roles: CONTENT_ROLES,
  revalidate: () => [],
  audit: false,
  touchSitemap: false,
  rateLimit: { ...readLimit, key: (_i, ip) => `slug.check:${ip}` },
  handler: async ({ input }) => {
    const available = await isSlugAvailable(
      input.model as SlugModel,
      input.locale,
      input.slug,
      input.excludeId,
    );
    return { available };
  },
});

export const searchAdminCommand = createAction({
  input: z.object({ query: z.string().trim().max(120) }),
  roles: ["ADMIN", "EDITOR", "VIEWER"],
  revalidate: () => [],
  audit: false,
  touchSitemap: false,
  rateLimit: { ...readLimit, key: (_i, ip) => `admin.search:${ip}` },
  handler: async ({ input }) => searchAdminEntities(input.query, "en"),
});

export const searchAdminMedia = createAction({
  input: z.object({
    query: z.string().trim().max(120).optional(),
    folder: z.string().trim().max(80).optional(),
  }),
  roles: CONTENT_ROLES,
  revalidate: () => [],
  audit: false,
  touchSitemap: false,
  rateLimit: { ...readLimit, key: (_i, ip) => `media.search:${ip}` },
  handler: async ({ input }) =>
    listAdminMedia({ query: input.query, folder: input.folder }),
});

export const listAdminMediaFolders = createAction({
  input: z.object({}),
  roles: CONTENT_ROLES,
  revalidate: () => [],
  audit: false,
  touchSitemap: false,
  handler: async () => listMediaFolders(),
});
