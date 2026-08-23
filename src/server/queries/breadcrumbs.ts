import { tags } from "@/lib/cache-tags";
import { prisma } from "@/server/db";
import type { BreadcrumbEntityType, BreadcrumbItemDto } from "@/types/content";
import type { Locale } from "@/i18n/locales";
import {
  cachedQuery,
  categoryHref,
  pageHref,
  pickTranslation,
  published,
  translationLocales,
} from "./_shared";

function homeCrumb(locale: Locale): BreadcrumbItemDto {
  return {
    href: locale === "ar" ? "/ar" : "/",
    label: locale === "ar" ? "الرئيسية" : "Home",
    servedLocale: locale,
    isFallback: false,
  };
}

function current(
  label: string,
  servedLocale: Locale,
  isFallback: boolean,
): BreadcrumbItemDto {
  return { href: null, label, servedLocale, isFallback };
}

async function categoryAncestors(
  parentId: string | null,
  locale: Locale,
): Promise<BreadcrumbItemDto[]> {
  const crumbs: BreadcrumbItemDto[] = [];
  let currentId = parentId;
  while (currentId) {
    const row = await prisma.category.findFirst({
      where: { id: currentId, ...published },
      select: {
        parentId: true,
        slug: true,
        kind: true,
        translations: {
          where: { locale: { in: translationLocales(locale) } },
          select: { locale: true, name: true, slug: true },
        },
      },
    });
    if (!row) {
      break;
    }
    const picked = pickTranslation(row.translations, locale);
    if (picked) {
      crumbs.unshift({
        href: categoryHref(locale, row.kind, picked.value.slug),
        label: picked.value.name,
        servedLocale: picked.servedLocale,
        isFallback: picked.isFallback,
      });
    }
    currentId = row.parentId;
  }
  return crumbs;
}

async function pageAncestors(
  parentId: string | null,
  locale: Locale,
): Promise<BreadcrumbItemDto[]> {
  const chain: { slug: string; label: string; servedLocale: Locale; isFallback: boolean }[] =
    [];
  let currentId = parentId;
  while (currentId) {
    const row = await prisma.page.findFirst({
      where: { id: currentId, ...published },
      select: {
        parentId: true,
        slug: true,
        translations: {
          where: { locale: { in: translationLocales(locale) } },
          select: { locale: true, title: true, slug: true },
        },
      },
    });
    if (!row) {
      break;
    }
    const picked = pickTranslation(row.translations, locale);
    chain.unshift({
      slug: picked?.value.slug ?? row.slug,
      label: picked?.value.title ?? row.slug,
      servedLocale: picked?.servedLocale ?? "en",
      isFallback: picked?.isFallback ?? locale === "ar",
    });
    currentId = row.parentId;
  }
  return chain.map((item, index) => ({
    href: pageHref(
      locale,
      chain.slice(0, index + 1).map((node) => node.slug),
    ),
    label: item.label,
    servedLocale: item.servedLocale,
    isFallback: item.isFallback,
  }));
}

/**
 * `<Breadcrumbs>` on every content route.
 * Cache tags: entity tag plus `global`.
 */
export async function getBreadcrumbTrail(
  entityType: BreadcrumbEntityType,
  slug: string,
  locale: Locale,
): Promise<BreadcrumbItemDto[]> {
  return cachedQuery({
    key: ["breadcrumb-trail", entityType, slug, locale],
    tags: [
      tags.global(),
      entityType === "product"
        ? tags.product(slug)
        : entityType === "category"
          ? tags.category(slug)
          : entityType === "service"
            ? tags.service(slug)
            : entityType === "page"
              ? tags.page(slug)
              : entityType === "post"
                ? tags.post(slug)
                : entityType === "teamMember"
                  ? tags.teamMember(slug)
                  : tags.project(slug),
    ],
    fn: async () => {
      const home = homeCrumb(locale);
      const slugWhere = {
        OR: [{ slug }, { translations: { some: { slug } } }],
      };

      if (entityType === "product") {
        const product = await prisma.product.findFirst({
          where: { ...published, ...slugWhere },
          select: {
            categoryId: true,
            translations: {
              where: { locale: { in: translationLocales(locale) } },
              select: { locale: true, name: true },
            },
            category: {
              select: {
                parentId: true,
                slug: true,
                kind: true,
                translations: {
                  where: { locale: { in: translationLocales(locale) } },
                  select: { locale: true, name: true, slug: true },
                },
              },
            },
          },
        });
        if (!product) {
          return [home];
        }
        const picked = pickTranslation(product.translations, locale);
        const cat = product.category
          ? pickTranslation(product.category.translations, locale)
          : null;
        const ancestors = product.category
          ? await categoryAncestors(product.category.parentId, locale)
          : [];
        const categoryCrumb = cat && product.category
          ? [
              {
                href: categoryHref(
                  locale,
                  product.category.kind,
                  cat.value.slug,
                ),
                label: cat.value.name,
                servedLocale: cat.servedLocale,
                isFallback: cat.isFallback,
              },
            ]
          : [];
        return [
          home,
          ...ancestors,
          ...categoryCrumb,
          current(
            picked?.value.name ?? slug,
            picked?.servedLocale ?? locale,
            picked?.isFallback ?? false,
          ),
        ];
      }

      if (entityType === "category") {
        const category = await prisma.category.findFirst({
          where: { ...published, ...slugWhere },
          select: {
            parentId: true,
            translations: {
              where: { locale: { in: translationLocales(locale) } },
              select: { locale: true, name: true },
            },
          },
        });
        if (!category) {
          return [home];
        }
        const picked = pickTranslation(category.translations, locale);
        return [
          home,
          ...(await categoryAncestors(category.parentId, locale)),
          current(
            picked?.value.name ?? slug,
            picked?.servedLocale ?? locale,
            picked?.isFallback ?? false,
          ),
        ];
      }

      if (entityType === "service") {
        const service = await prisma.service.findFirst({
          where: { ...published, ...slugWhere },
          select: {
            translations: {
              where: { locale: { in: translationLocales(locale) } },
              select: { locale: true, name: true },
            },
          },
        });
        const picked = pickTranslation(service?.translations ?? [], locale);
        return [
          home,
          {
            href: locale === "ar" ? "/ar/services" : "/services",
            label: locale === "ar" ? "الخدمات" : "Services",
            servedLocale: locale,
            isFallback: false,
          },
          current(
            picked?.value.name ?? slug,
            picked?.servedLocale ?? locale,
            picked?.isFallback ?? false,
          ),
        ];
      }

      if (entityType === "page") {
        const segments = slug.split("/").filter(Boolean);
        const leaf = segments.at(-1) ?? slug;
        const page = await prisma.page.findFirst({
          where: {
            ...published,
            OR: [{ slug: leaf }, { translations: { some: { slug: leaf } } }],
          },
          select: {
            parentId: true,
            translations: {
              where: { locale: { in: translationLocales(locale) } },
              select: { locale: true, title: true },
            },
          },
        });
        if (!page) {
          return [home];
        }
        const picked = pickTranslation(page.translations, locale);
        return [
          home,
          ...(await pageAncestors(page.parentId, locale)),
          current(
            picked?.value.title ?? leaf,
            picked?.servedLocale ?? locale,
            picked?.isFallback ?? false,
          ),
        ];
      }

      if (entityType === "post") {
        const post = await prisma.post.findFirst({
          where: { ...published, ...slugWhere },
          select: {
            translations: {
              where: { locale: { in: translationLocales(locale) } },
              select: { locale: true, title: true },
            },
          },
        });
        const picked = pickTranslation(post?.translations ?? [], locale);
        return [
          home,
          {
            href: locale === "ar" ? "/ar/blogs" : "/blogs",
            label: locale === "ar" ? "المدونة" : "Blog",
            servedLocale: locale,
            isFallback: false,
          },
          current(
            picked?.value.title ?? slug,
            picked?.servedLocale ?? locale,
            picked?.isFallback ?? false,
          ),
        ];
      }

      if (entityType === "teamMember") {
        const member = await prisma.teamMember.findFirst({
          where: {
            isVisible: true,
            OR: [{ slug }, { translations: { some: { slug } } }],
          },
          select: {
            translations: {
              where: { locale: { in: translationLocales(locale) } },
              select: { locale: true, name: true, slug: true },
            },
          },
        });
        const picked = pickTranslation(member?.translations ?? [], locale);
        return [
          home,
          {
            href: pageHref(locale, ["about"]),
            label: locale === "ar" ? "من نحن" : "About",
            servedLocale: locale,
            isFallback: false,
          },
          current(
            picked?.value.name ?? slug,
            picked?.servedLocale ?? locale,
            picked?.isFallback ?? false,
          ),
        ];
      }

      const project = await prisma.project.findFirst({
        where: { ...published, ...slugWhere },
        select: {
          translations: {
            where: { locale: { in: translationLocales(locale) } },
            select: { locale: true, title: true },
          },
        },
      });
      const picked = pickTranslation(project?.translations ?? [], locale);
      return [
        home,
        {
          href: locale === "ar" ? "/ar/portfolio" : "/portfolio",
          label: locale === "ar" ? "أعمالنا" : "Portfolio",
          servedLocale: locale,
          isFallback: false,
        },
        current(
          picked?.value.title ?? slug,
          picked?.servedLocale ?? locale,
          picked?.isFallback ?? false,
        ),
      ];
    },
  });
}
