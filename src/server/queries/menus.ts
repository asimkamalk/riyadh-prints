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
    return slug ? postHref(locale, slug) : localizeHref(locale, "/blog");
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
    key: ["menu", location, locale],
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

      const dtos: MenuItemDto[] = [];
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
          children: [],
          servedLocale: picked.servedLocale,
          isFallback: picked.isFallback,
        };
        byId.set(row.id, item);
        dtos.push(item);
      }

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
