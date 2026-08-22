import type { CategoryKind, Locale as PrismaLocale } from "@/generated/prisma/enums";
import { prisma } from "@/server/db";

export type MediaUsage = {
  entityType: string;
  entityId: string;
  label: string;
  field: string;
  href: string;
  locale?: PrismaLocale;
};

type NamedTranslation = { locale: PrismaLocale; name?: string; title?: string };

function pickLabel(rows: readonly NamedTranslation[], fallback = "Untitled"): string {
  const en = rows.find((row) => row.locale === "EN");
  const row = en ?? rows[0];
  const text = row?.name ?? row?.title;
  return text?.trim() || fallback;
}

function categoryHref(id: string, kind: CategoryKind): string {
  return kind === "POST" ? `/admin/blog-categories/${id}` : `/admin/categories/${id}`;
}

export async function getMediaUsages(mediaId: string): Promise<MediaUsage[]> {
  const [
    categories,
    services,
    serviceHeros,
    productImages,
    posts,
    authors,
    projects,
    projectImages,
    testimonials,
    partners,
    banners,
    bannerMobile,
    teamMembers,
    relatedFiles,
    categoryOg,
    tagOg,
    locationOg,
    teamOg,
    pageOg,
    serviceOg,
    productOg,
    authorOg,
    postOg,
    projectOg,
  ] = await Promise.all([
    prisma.category.findMany({
      where: { imageId: mediaId },
      select: {
        id: true,
        kind: true,
        translations: { select: { locale: true, name: true } },
      },
    }),
    prisma.service.findMany({
      where: { imageId: mediaId },
      select: { id: true, translations: { select: { locale: true, name: true } } },
    }),
    prisma.service.findMany({
      where: { heroImageId: mediaId },
      select: { id: true, translations: { select: { locale: true, name: true } } },
    }),
    prisma.productImage.findMany({
      where: { mediaId },
      select: {
        product: {
          select: { id: true, translations: { select: { locale: true, name: true } } },
        },
      },
    }),
    prisma.post.findMany({
      where: { coverImageId: mediaId },
      select: { id: true, translations: { select: { locale: true, title: true } } },
    }),
    prisma.author.findMany({
      where: { avatarId: mediaId },
      select: { id: true, translations: { select: { locale: true, name: true } } },
    }),
    prisma.project.findMany({
      where: { coverImageId: mediaId },
      select: { id: true, translations: { select: { locale: true, title: true } } },
    }),
    prisma.projectImage.findMany({
      where: { mediaId },
      select: {
        project: {
          select: { id: true, translations: { select: { locale: true, title: true } } },
        },
      },
    }),
    prisma.testimonial.findMany({
      where: { avatarId: mediaId },
      select: { id: true, authorName: true },
    }),
    prisma.partner.findMany({
      where: { logoId: mediaId },
      select: { id: true, name: true },
    }),
    prisma.banner.findMany({
      where: { imageId: mediaId },
      select: {
        id: true,
        placement: true,
        translations: { select: { locale: true, heading: true } },
      },
    }),
    prisma.banner.findMany({
      where: { mobileImageId: mediaId },
      select: {
        id: true,
        placement: true,
        translations: { select: { locale: true, heading: true } },
      },
    }),
    prisma.teamMember.findMany({
      where: { avatarId: mediaId },
      select: { id: true, translations: { select: { locale: true, name: true } } },
    }),
    prisma.relatedFile.findMany({
      where: { mediaId },
      select: {
        id: true,
        productId: true,
        serviceId: true,
        pageId: true,
        projectId: true,
        translations: { select: { locale: true, title: true } },
      },
    }),
    prisma.categoryTranslation.findMany({
      where: { ogImageId: mediaId },
      select: { categoryId: true, locale: true, name: true, category: { select: { kind: true } } },
    }),
    prisma.tagTranslation.findMany({
      where: { ogImageId: mediaId },
      select: { tagId: true, locale: true, name: true },
    }),
    prisma.locationTranslation.findMany({
      where: { ogImageId: mediaId },
      select: { locationId: true, locale: true, name: true },
    }),
    prisma.teamMemberTranslation.findMany({
      where: { ogImageId: mediaId },
      select: { teamMemberId: true, locale: true, name: true },
    }),
    prisma.pageTranslation.findMany({
      where: { ogImageId: mediaId },
      select: { pageId: true, locale: true, title: true },
    }),
    prisma.serviceTranslation.findMany({
      where: { ogImageId: mediaId },
      select: { serviceId: true, locale: true, name: true },
    }),
    prisma.productTranslation.findMany({
      where: { ogImageId: mediaId },
      select: { productId: true, locale: true, name: true },
    }),
    prisma.authorTranslation.findMany({
      where: { ogImageId: mediaId },
      select: { authorId: true, locale: true, name: true },
    }),
    prisma.postTranslation.findMany({
      where: { ogImageId: mediaId },
      select: { postId: true, locale: true, title: true },
    }),
    prisma.projectTranslation.findMany({
      where: { ogImageId: mediaId },
      select: { projectId: true, locale: true, title: true },
    }),
  ]);

  const usages: MediaUsage[] = [];

  for (const row of categories) {
    usages.push({
      entityType: "category",
      entityId: row.id,
      label: pickLabel(row.translations),
      field: "image",
      href: categoryHref(row.id, row.kind),
    });
  }
  for (const row of services) {
    usages.push({
      entityType: "service",
      entityId: row.id,
      label: pickLabel(row.translations),
      field: "image",
      href: `/admin/services/${row.id}`,
    });
  }
  for (const row of serviceHeros) {
    usages.push({
      entityType: "service",
      entityId: row.id,
      label: pickLabel(row.translations),
      field: "hero image",
      href: `/admin/services/${row.id}`,
    });
  }
  for (const row of productImages) {
    usages.push({
      entityType: "product",
      entityId: row.product.id,
      label: pickLabel(row.product.translations),
      field: "gallery",
      href: `/admin/products/${row.product.id}`,
    });
  }
  for (const row of posts) {
    usages.push({
      entityType: "post",
      entityId: row.id,
      label: pickLabel(row.translations),
      field: "cover",
      href: `/admin/posts/${row.id}`,
    });
  }
  for (const row of authors) {
    usages.push({
      entityType: "author",
      entityId: row.id,
      label: pickLabel(row.translations),
      field: "avatar",
      href: `/admin/authors/${row.id}`,
    });
  }
  for (const row of projects) {
    usages.push({
      entityType: "project",
      entityId: row.id,
      label: pickLabel(row.translations),
      field: "cover",
      href: `/admin/portfolio/${row.id}`,
    });
  }
  for (const row of projectImages) {
    usages.push({
      entityType: "project",
      entityId: row.project.id,
      label: pickLabel(row.project.translations),
      field: "gallery",
      href: `/admin/portfolio/${row.project.id}`,
    });
  }
  for (const row of testimonials) {
    usages.push({
      entityType: "testimonial",
      entityId: row.id,
      label: row.authorName,
      field: "avatar",
      href: `/admin/testimonials/${row.id}`,
    });
  }
  for (const row of partners) {
    usages.push({
      entityType: "partner",
      entityId: row.id,
      label: row.name,
      field: "logo",
      href: `/admin/partners/${row.id}`,
    });
  }
  for (const row of banners) {
    usages.push({
      entityType: "banner",
      entityId: row.id,
      label: row.translations.find((t) => t.locale === "EN")?.heading || row.placement,
      field: "image",
      href: `/admin/banners/${row.id}`,
    });
  }
  for (const row of bannerMobile) {
    usages.push({
      entityType: "banner",
      entityId: row.id,
      label: row.translations.find((t) => t.locale === "EN")?.heading || row.placement,
      field: "mobile image",
      href: `/admin/banners/${row.id}`,
    });
  }
  for (const row of teamMembers) {
    usages.push({
      entityType: "teamMember",
      entityId: row.id,
      label: pickLabel(row.translations),
      field: "avatar",
      href: `/admin/team/${row.id}`,
    });
  }
  for (const row of relatedFiles) {
    const href = row.productId
      ? `/admin/products/${row.productId}`
      : row.serviceId
        ? `/admin/services/${row.serviceId}`
        : row.pageId
          ? `/admin/pages/${row.pageId}`
          : row.projectId
            ? `/admin/portfolio/${row.projectId}`
            : `/admin/media`;
    usages.push({
      entityType: "relatedFile",
      entityId: row.id,
      label: pickLabel(row.translations, "Attached file"),
      field: "file",
      href,
    });
  }

  pushOg(usages, categoryOg, "category", "categoryId", (row) =>
    categoryHref(row.categoryId, row.category.kind),
  );
  pushOg(usages, tagOg, "tag", "tagId", (row) => `/admin/tags/${row.tagId}`);
  pushOg(usages, locationOg, "location", "locationId", (row) => `/admin/locations/${row.locationId}`);
  pushOg(usages, teamOg, "teamMember", "teamMemberId", (row) => `/admin/team/${row.teamMemberId}`);
  pushOg(usages, pageOg, "page", "pageId", (row) => `/admin/pages/${row.pageId}`);
  pushOg(usages, serviceOg, "service", "serviceId", (row) => `/admin/services/${row.serviceId}`);
  pushOg(usages, productOg, "product", "productId", (row) => `/admin/products/${row.productId}`);
  pushOg(usages, authorOg, "author", "authorId", (row) => `/admin/authors/${row.authorId}`);
  pushOg(usages, postOg, "post", "postId", (row) => `/admin/posts/${row.postId}`);
  pushOg(usages, projectOg, "project", "projectId", (row) => `/admin/portfolio/${row.projectId}`);

  return usages;
}

function pushOg<T extends { locale: PrismaLocale; name?: string; title?: string }>(
  usages: MediaUsage[],
  rows: T[],
  entityType: string,
  idKey: keyof T & string,
  href: (row: T) => string,
): void {
  for (const row of rows) {
    const entityId = String(row[idKey]);
    usages.push({
      entityType,
      entityId,
      label: row.name ?? row.title ?? "Untitled",
      field: "og image",
      href: href(row),
      locale: row.locale,
    });
  }
}
