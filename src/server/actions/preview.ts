"use server";

import { z } from "zod";

import { PREVIEW_TYPES } from "@/lib/preview-token";
import { signPreviewToken } from "@/lib/preview-token";
import { withLocalePath } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/utils/site-url";
import { prisma } from "@/server/db";
import { entityPublicPath } from "@/server/actions/_redirects";
import { pageHref } from "@/server/queries/_shared";

import { createAction } from "./_helpers";
import { notFound } from "./_resource";

const previewInputSchema = z.object({
  type: z.enum(PREVIEW_TYPES),
  id: z.string().min(1),
  locale: z.enum(["en", "ar"]).optional(),
  variant: z.enum(["public", "frame"]).optional(),
});

export const createPreviewUrl = createAction({
  input: previewInputSchema,
  roles: ["ADMIN", "EDITOR", "VIEWER"],
  touchSitemap: false,
  revalidate: () => [],
  audit: false,
  handler: async ({ input }) => {
    const token = signPreviewToken({ type: input.type, id: input.id });
    const locale = input.locale ?? "en";
    if (input.type === "product") {
      const row = await prisma.product.findUnique({
        where: { id: input.id },
        select: {
          slug: true,
          translations: { where: { locale: "EN" }, select: { slug: true } },
        },
      });
      if (!row) {
        notFound("Product");
      }
      const slug = row.translations[0]?.slug ?? row.slug;
      return { url: `${getSiteUrl()}${entityPublicPath("product", slug, locale)}?preview=${token}` };
    }
    if (input.type === "category") {
      const row = await prisma.category.findUnique({
        where: { id: input.id },
        select: {
          slug: true,
          kind: true,
          translations: { where: { locale: "EN" }, select: { slug: true } },
        },
      });
      if (!row) {
        notFound("Category");
      }
      const slug = row.translations[0]?.slug ?? row.slug;
      return {
        url: `${getSiteUrl()}${entityPublicPath("category", slug, locale, { kind: row.kind })}?preview=${token}`,
      };
    }
    if (input.type === "service") {
      const row = await prisma.service.findUnique({
        where: { id: input.id },
        select: {
          slug: true,
          translations: { where: { locale: "EN" }, select: { slug: true } },
        },
      });
      if (!row) {
        notFound("Service");
      }
      const slug = row.translations[0]?.slug ?? row.slug;
      return { url: `${getSiteUrl()}${entityPublicPath("service", slug, locale)}?preview=${token}` };
    }
    const page = await prisma.page.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!page) {
      notFound("Page");
    }
    if (input.variant === "frame") {
      return {
        url: `${getSiteUrl()}${withLocalePath(locale, `/preview/page/${page.id}`)}?preview=${token}`,
      };
    }
    const prismaLocale = locale === "ar" ? "AR" : "EN";
    const segments: string[] = [];
    let current: string | null = page.id;
    while (current) {
      const row = await prisma.page.findUnique({
        where: { id: current },
        select: {
          slug: true,
          parentId: true,
          translations: { where: { locale: prismaLocale }, select: { slug: true } },
        },
      });
      if (!row) {
        break;
      }
      segments.unshift(row.translations[0]?.slug ?? row.slug);
      current = row.parentId;
    }
    return {
      url: `${getSiteUrl()}${pageHref(locale, segments)}?preview=${token}`,
    };
  },
});
