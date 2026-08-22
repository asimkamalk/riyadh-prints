import type { FaqScope } from "@/generated/prisma/enums";
import type { Locale } from "@/i18n/locales";
import { tags } from "@/lib/cache-tags";
import { tiptapToPlainText } from "@/lib/tiptap-text";
import { prisma } from "@/server/db";
import { cachedQuery } from "@/server/queries/_shared";

export type AdminMediaItem = {
  id: string;
  url: string;
  pathname: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  folder: string | null;
  altEn: string;
  altAr: string;
  createdAt: string;
};

export function listAdminMedia(args: {
  query?: string;
  folder?: string;
}): Promise<AdminMediaItem[]> {
  const q = args.query?.trim() ?? "";
  const folder = args.folder?.trim() ?? "";
  return cachedQuery({
    key: ["admin-media", q, folder],
    tags: [tags.global()],
    revalidate: 30,
    fn: async () => {
      const rows = await prisma.media.findMany({
        where: {
          ...(folder ? { folder } : {}),
          ...(q
            ? {
                OR: [
                  { pathname: { contains: q, mode: "insensitive" } },
                  {
                    translations: {
                      some: { alt: { contains: q, mode: "insensitive" } },
                    },
                  },
                ],
              }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 60,
        select: {
          id: true,
          url: true,
          pathname: true,
          mimeType: true,
          width: true,
          height: true,
          folder: true,
          createdAt: true,
          translations: { select: { locale: true, alt: true } },
        },
      });
      return rows.map((row) => ({
        id: row.id,
        url: row.url,
        pathname: row.pathname,
        mimeType: row.mimeType,
        width: row.width,
        height: row.height,
        folder: row.folder,
        altEn: row.translations.find((t) => t.locale === "EN")?.alt ?? "",
        altAr: row.translations.find((t) => t.locale === "AR")?.alt ?? "",
        createdAt: row.createdAt.toISOString(),
      }));
    },
  });
}

export function listMediaFolders(): Promise<string[]> {
  return cachedQuery({
    key: ["admin-media-folders"],
    tags: [tags.global()],
    revalidate: 60,
    fn: async () => {
      const rows = await prisma.media.findMany({
        distinct: ["folder"],
        select: { folder: true },
      });
      return rows
        .map((row) => row.folder)
        .filter((folder): folder is string => Boolean(folder))
        .sort();
    },
  });
}

export type AdminSearchHit = {
  id: string;
  title: string;
  href: string;
  type: string;
};

export async function searchAdminEntities(
  query: string,
  _locale: Locale,
): Promise<AdminSearchHit[]> {
  const q = query.trim();
  if (q.length < 2) {
    return [];
  }
  const contains = { contains: q, mode: "insensitive" as const };
  const [products, pages, posts, services, inquiries] = await Promise.all([
    prisma.product.findMany({
      where: { translations: { some: { name: contains } } },
      take: 6,
      select: {
        id: true,
        translations: {
          where: { locale: "EN" },
          select: { name: true },
          take: 1,
        },
      },
    }),
    prisma.page.findMany({
      where: { translations: { some: { title: contains } } },
      take: 6,
      select: {
        id: true,
        translations: {
          where: { locale: "EN" },
          select: { title: true },
          take: 1,
        },
      },
    }),
    prisma.post.findMany({
      where: { translations: { some: { title: contains } } },
      take: 6,
      select: {
        id: true,
        translations: {
          where: { locale: "EN" },
          select: { title: true },
          take: 1,
        },
      },
    }),
    prisma.service.findMany({
      where: { translations: { some: { name: contains } } },
      take: 6,
      select: {
        id: true,
        translations: {
          where: { locale: "EN" },
          select: { name: true },
          take: 1,
        },
      },
    }),
    prisma.inquiry.findMany({
      where: { OR: [{ name: contains }, { email: contains }] },
      take: 4,
      select: { id: true, name: true, email: true },
    }),
  ]);

  return [
    ...products.map((row) => ({
      id: row.id,
      title: row.translations[0]?.name ?? "Product",
      href: `/admin/products/${row.id}`,
      type: "Product",
    })),
    ...pages.map((row) => ({
      id: row.id,
      title: row.translations[0]?.title ?? "Page",
      href: `/admin/pages/${row.id}`,
      type: "Page",
    })),
    ...posts.map((row) => ({
      id: row.id,
      title: row.translations[0]?.title ?? "Post",
      href: `/admin/posts/${row.id}`,
      type: "Post",
    })),
    ...services.map((row) => ({
      id: row.id,
      title: row.translations[0]?.name ?? "Service",
      href: `/admin/services/${row.id}`,
      type: "Service",
    })),
    ...inquiries.map((row) => ({
      id: row.id,
      title: `${row.name} · ${row.email}`,
      href: `/admin/inquiries/${row.id}`,
      type: "Inquiry",
    })),
  ];
}

export type AdminFaqRow = {
  id: string;
  sortOrder: number;
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
};

export function listAdminFaqs(args: {
  scope: FaqScope;
  entityId?: string;
}): Promise<AdminFaqRow[]> {
  const entityId = args.entityId ?? "";
  return cachedQuery({
    key: ["admin-faqs", args.scope, entityId],
    tags: [tags.faqs(args.scope, args.entityId)],
    revalidate: 30,
    fn: async () => {
      const rows = await prisma.faqItem.findMany({
        where: {
          scope: args.scope,
          ...(args.scope === "PRODUCT" ? { productId: args.entityId } : {}),
          ...(args.scope === "PAGE" ? { pageId: args.entityId } : {}),
          ...(args.scope === "POST" ? { postId: args.entityId } : {}),
          ...(args.scope === "SERVICE" ? { serviceId: args.entityId } : {}),
          ...(args.scope === "CATEGORY" ? { categoryId: args.entityId } : {}),
          ...(args.scope === "PROJECT" ? { projectId: args.entityId } : {}),
        },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          sortOrder: true,
          translations: { select: { locale: true, question: true, answer: true } },
        },
      });
      return rows.map((row) => {
        const en = row.translations.find((t) => t.locale === "EN");
        const ar = row.translations.find((t) => t.locale === "AR");
        return {
          id: row.id,
          sortOrder: row.sortOrder,
          questionEn: en?.question ?? "",
          questionAr: ar?.question ?? "",
          answerEn: tiptapToPlainText(en?.answer),
          answerAr: tiptapToPlainText(ar?.answer),
        };
      });
    },
  });
}
