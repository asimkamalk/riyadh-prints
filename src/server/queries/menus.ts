import type { LinkType, MenuLocation } from "@/generated/prisma/enums";
import { tags } from "@/lib/cache-tags";
import { prisma } from "@/server/db";
import type { MenuItemDto } from "@/types/content";
import type { Locale } from "@/i18n/locales";
import {
  authorHref,
  cachedQuery,
  categoryHref,
  localizeHref,
  mapMedia,
  mediaSelect,
  pageHref,
  pickTranslation,
  postHref,
  productHref,
  projectHref,
  serviceHref,
  translationLocales,
} from "./_shared";

type MenuRow = {
  id: string;
  parentId: string | null;
  sortOrder: number;
  linkType: LinkType;
  targetId: string | null;
  externalUrl: string | null;
  internalPath: string | null;
  openInNewTab: boolean;
  iconName: string | null;
  isMegaMenu: boolean;
  highlight: boolean;
  translations: {
    locale: "EN" | "AR";
    label: string;
    description: string | null;
  }[];
};

async function resolveHref(row: MenuRow, locale: Locale): Promise<string> {
  if (row.linkType === "EXTERNAL" && row.externalUrl) {
    return row.externalUrl;
  }
  if (row.linkType === "INTERNAL" && row.internalPath) {
    return localizeHref(locale, row.internalPath);
  }
  if (!row.targetId) {
    return localizeHref(locale, "/");
  }

  if (row.linkType === "PAGE") {
    const slugs: string[] = [];
    let currentId: string | null = row.targetId;
    while (currentId) {
      const page: {
        parentId: string | null;
        slug: string;
        translations: { locale: "EN" | "AR"; slug: string }[];
      } | null = await prisma.page.findFirst({
        where: { id: currentId },
        select: {
          parentId: true,
          slug: true,
          translations: {
            where: { locale: { in: translationLocales(locale) } },
            select: { locale: true, slug: true },
          },
        },
      });
      if (!page) {
        break;
      }
      const picked = pickTranslation(page.translations, locale);
      slugs.unshift(picked?.value.slug ?? page.slug);
      currentId = page.parentId;
    }
    return pageHref(locale, slugs);
  }

  if (row.linkType === "PRODUCT") {
    const product = await prisma.product.findFirst({
      where: { id: row.targetId },
      select: {
        slug: true,
        translations: {
          where: { locale: { in: translationLocales(locale) } },
          select: { locale: true, slug: true },
        },
      },
    });
    const slug =
      pickTranslation(product?.translations ?? [], locale)?.value.slug ??
      product?.slug;
    return slug ? productHref(locale, slug) : localizeHref(locale, "/");
  }

  if (row.linkType === "CATEGORY") {
    const category = await prisma.category.findFirst({
      where: { id: row.targetId },
      select: {
        slug: true,
        kind: true,
        translations: {
          where: { locale: { in: translationLocales(locale) } },
          select: { locale: true, slug: true },
        },
      },
    });
    const slug =
      pickTranslation(category?.translations ?? [], locale)?.value.slug ??
      category?.slug;
    return slug && category
      ? categoryHref(locale, category.kind, slug)
      : localizeHref(locale, "/");
  }

  if (row.linkType === "SERVICE") {
    const service = await prisma.service.findFirst({
      where: { id: row.targetId },
      select: {
        slug: true,
        translations: {
          where: { locale: { in: translationLocales(locale) } },
          select: { locale: true, slug: true },
        },
      },
    });
    const slug =
      pickTranslation(service?.translations ?? [], locale)?.value.slug ??
      service?.slug;
    return slug ? serviceHref(locale, slug) : localizeHref(locale, "/services");
  }

  if (row.linkType === "POST") {
    const post = await prisma.post.findFirst({
      where: { id: row.targetId },
      select: {
        slug: true,
        translations: {
          where: { locale: { in: translationLocales(locale) } },
          select: { locale: true, slug: true },
        },
      },
    });
    const slug =
      pickTranslation(post?.translations ?? [], locale)?.value.slug ??
      post?.slug;
    return slug ? postHref(locale, slug) : localizeHref(locale, "/blogs");
  }

  if (row.linkType === "PROJECT") {
    const project = await prisma.project.findFirst({
      where: { id: row.targetId },
      select: {
        slug: true,
        translations: {
          where: { locale: { in: translationLocales(locale) } },
          select: { locale: true, slug: true },
        },
      },
    });
    const slug =
      pickTranslation(project?.translations ?? [], locale)?.value.slug ??
      project?.slug;
    return slug ? projectHref(locale, slug) : localizeHref(locale, "/portfolio");
  }

  if (row.linkType === "AUTHOR") {
    const author = await prisma.author.findFirst({
      where: { id: row.targetId },
      select: {
        slug: true,
        translations: {
          where: { locale: { in: translationLocales(locale) } },
          select: { locale: true, slug: true },
        },
      },
    });
    const slug =
      pickTranslation(author?.translations ?? [], locale)?.value.slug ??
      author?.slug;
    return slug ? authorHref(locale, slug) : localizeHref(locale, "/");
  }

  return localizeHref(locale, "/");
}

/**
 * Header, footer, and mobile navigation.
 * Cache tags: `menu:{location}`, `global`.
 */
export async function getMenu(
  location: MenuLocation,
  locale: Locale,
): Promise<MenuItemDto[]> {
  return cachedQuery({
    key: ["menu", location, locale, "v2"],
    tags: [tags.menu(location), tags.global()],
    fn: async () => {
      const rows = await prisma.menuItem.findMany({
        where: { location, isVisible: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          parentId: true,
          sortOrder: true,
          linkType: true,
          targetId: true,
          externalUrl: true,
          internalPath: true,
          openInNewTab: true,
          iconName: true,
          isMegaMenu: true,
          highlight: true,
          translations: {
            where: { locale: { in: translationLocales(locale) } },
            select: { locale: true, label: true, description: true },
          },
        },
      });

      const byId = new Map<string, MenuItemDto>();

      for (const row of rows) {
        const picked = pickTranslation(row.translations, locale);
        if (!picked) {
          continue;
        }
        const item: MenuItemDto = {
          id: row.id,
          label: picked.value.label,
          description: picked.value.description,
          href: await resolveHref(row, locale),
          openInNewTab: row.openInNewTab,
          iconName: row.iconName,
          isMegaMenu: row.isMegaMenu,
          highlight: row.highlight,
          image: null,
          children: [],
          servedLocale: picked.servedLocale,
          isFallback: picked.isFallback,
        };
        byId.set(row.id, item);
      }

      await decorateMenuMedia(rows, byId, locale);
      const roots: MenuItemDto[] = [];
      for (const row of rows) {
        const item = byId.get(row.id);
        if (!item) {
          continue;
        }
        if (row.parentId && byId.has(row.parentId)) {
          byId.get(row.parentId)?.children.push(item);
        } else {
          roots.push(item);
        }
      }
      return roots;
    },
  });
}

async function decorateMenuMedia(
  rows: MenuRow[],
  byId: Map<string, MenuItemDto>,
  locale: Locale,
) {
  const categoryIds = rows
    .filter((row): row is MenuRow & { targetId: string } =>
      row.linkType === "CATEGORY" && Boolean(row.targetId),
    )
    .map((row) => row.targetId);
  const serviceIds = rows
    .filter((row): row is MenuRow & { targetId: string } =>
      row.linkType === "SERVICE" && Boolean(row.targetId),
    )
    .map((row) => row.targetId);
  if (categoryIds.length === 0 && serviceIds.length === 0) {
    return;
  }

  const [categories, services] = await Promise.all([
    categoryIds.length
      ? prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: {
            id: true,
            image: { select: mediaSelect(locale) },
            translations: {
              where: { locale: { in: translationLocales(locale) } },
              select: { locale: true, shortDescription: true },
            },
          },
        })
      : [],
    serviceIds.length
      ? prisma.service.findMany({
          where: { id: { in: serviceIds } },
          select: {
            id: true,
            image: { select: mediaSelect(locale) },
            translations: {
              where: { locale: { in: translationLocales(locale) } },
              select: { locale: true, shortDescription: true },
            },
          },
        })
      : [],
  ]);

  const extras = new Map<
    string,
    { image: MenuItemDto["image"]; description: string | null }
  >();
  for (const row of categories) {
    const picked = pickTranslation(row.translations, locale);
    extras.set(row.id, {
      image: mapMedia(row.image, locale),
      description: picked?.value.shortDescription ?? null,
    });
  }
  for (const row of services) {
    const picked = pickTranslation(row.translations, locale);
    extras.set(row.id, {
      image: mapMedia(row.image, locale),
      description: picked?.value.shortDescription ?? null,
    });
  }

  for (const row of rows) {
    if (!row.targetId) {
      continue;
    }
    const extra = extras.get(row.targetId);
    const item = byId.get(row.id);
    if (!extra || !item) {
      continue;
    }
    item.image = extra.image;
    if (!item.description) {
      item.description = extra.description;
    }
  }
}

