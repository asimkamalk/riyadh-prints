import type { CategoryKind, ContentStatus } from "@/generated/prisma/enums";
import { prisma } from "@/server/db";
import {
  adminMediaSelect,
  mapAdminMedia,
  type AdminMediaRecord,
} from "@/server/queries/media";
import type { AdminLocaleSeo } from "@/server/queries/admin-products";

export type AdminCategoryNode = {
  id: string;
  name: string;
  slug: string;
  status: ContentStatus;
  isFeatured: boolean;
  parentId: string | null;
  sortOrder: number;
  productCount: number;
  children: AdminCategoryNode[];
};

export type AdminCategoryDetail = {
  id: string;
  slug: string;
  kind: CategoryKind;
  status: ContentStatus;
  isFeatured: boolean;
  parentId: string | null;
  sortOrder: number;
  iconName: string;
  image: AdminMediaRecord | null;
  productCount: number;
  nameEn: string;
  nameAr: string;
  slugEn: string;
  slugAr: string;
  shortEn: string;
  shortAr: string;
  longEn: string;
  longAr: string;
  heroHeadingEn: string;
  heroHeadingAr: string;
  heroSubheadingEn: string;
  heroSubheadingAr: string;
  seoEn: AdminLocaleSeo;
  seoAr: AdminLocaleSeo;
};

export type AdminCategoryOption = {
  id: string;
  name: string;
  parentId: string | null;
  kind: CategoryKind;
};

function emptySeo(): AdminLocaleSeo {
  return {
    metaTitle: "",
    metaDescription: "",
    ogTitle: "",
    ogDescription: "",
    ogImageId: null,
    canonicalUrl: "",
    noIndex: false,
    noFollow: false,
    focusKeyword: "",
  };
}

function seoFrom(row: {
  metaTitle: string | null;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageId: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  noFollow: boolean;
  focusKeyword: string | null;
} | undefined): AdminLocaleSeo {
  if (!row) {
    return emptySeo();
  }
  return {
    metaTitle: row.metaTitle ?? "",
    metaDescription: row.metaDescription ?? "",
    ogTitle: row.ogTitle ?? "",
    ogDescription: row.ogDescription ?? "",
    ogImageId: row.ogImageId,
    canonicalUrl: row.canonicalUrl ?? "",
    noIndex: row.noIndex,
    noFollow: row.noFollow,
    focusKeyword: row.focusKeyword ?? "",
  };
}

export async function listAdminCategoryTree(
  kind: CategoryKind = "PRODUCT",
): Promise<AdminCategoryNode[]> {
  const rows = await prisma.category.findMany({
    where: { kind },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      status: true,
      isFeatured: true,
      parentId: true,
      sortOrder: true,
      translations: { where: { locale: "EN" }, select: { name: true } },
      _count: { select: { products: true } },
    },
  });
  const nodes = new Map<string, AdminCategoryNode>();
  for (const row of rows) {
    nodes.set(row.id, {
      id: row.id,
      name: row.translations[0]?.name ?? row.slug,
      slug: row.slug,
      status: row.status,
      isFeatured: row.isFeatured,
      parentId: row.parentId,
      sortOrder: row.sortOrder,
      productCount: row._count.products,
      children: [],
    });
  }
  const roots: AdminCategoryNode[] = [];
  for (const node of nodes.values()) {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  const sortTree = (list: AdminCategoryNode[]) => {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    list.forEach((child) => sortTree(child.children));
  };
  sortTree(roots);
  return roots;
}

export async function listAdminCategoryOptions(
  kind: CategoryKind = "PRODUCT",
): Promise<AdminCategoryOption[]> {
  const rows = await prisma.category.findMany({
    where: { kind, status: { not: "ARCHIVED" } },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      parentId: true,
      kind: true,
      translations: { where: { locale: "EN" }, select: { name: true } },
    },
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.translations[0]?.name ?? row.id,
    parentId: row.parentId,
    kind: row.kind,
  }));
}

export async function getAdminCategory(id: string): Promise<AdminCategoryDetail | null> {
  const row = await prisma.category.findUnique({
    where: { id },
    include: {
      translations: true,
      image: { select: adminMediaSelect },
      _count: { select: { products: true } },
    },
  });
  if (!row) {
    return null;
  }
  const en = row.translations.find((t) => t.locale === "EN");
  const ar = row.translations.find((t) => t.locale === "AR");
  return {
    id: row.id,
    slug: row.slug,
    kind: row.kind,
    status: row.status,
    isFeatured: row.isFeatured,
    parentId: row.parentId,
    sortOrder: row.sortOrder,
    iconName: row.iconName ?? "",
    image: row.image ? mapAdminMedia(row.image) : null,
    productCount: row._count.products,
    nameEn: en?.name ?? "",
    nameAr: ar?.name ?? "",
    slugEn: en?.slug ?? row.slug,
    slugAr: ar?.slug ?? "",
    shortEn: en?.shortDescription ?? "",
    shortAr: ar?.shortDescription ?? "",
    longEn: en?.longDescription ?? "",
    longAr: ar?.longDescription ?? "",
    heroHeadingEn: en?.heroHeading ?? "",
    heroHeadingAr: ar?.heroHeading ?? "",
    heroSubheadingEn: en?.heroSubheading ?? "",
    heroSubheadingAr: ar?.heroSubheading ?? "",
    seoEn: seoFrom(en),
    seoAr: seoFrom(ar),
  };
}
