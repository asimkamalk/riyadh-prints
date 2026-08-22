import type { ContentStatus } from "@/generated/prisma/enums";
import { prisma } from "@/server/db";
import type { JsonValue } from "@/types/content";
import type { AdminLocaleSeo } from "@/server/queries/admin-products";
import type { SectionType } from "@/generated/prisma/enums";

export type AdminPageNode = {
  id: string;
  title: string;
  slug: string;
  status: ContentStatus;
  parentId: string | null;
  sortOrder: number;
  path: string;
  children: AdminPageNode[];
};

export type AdminPageSection = {
  id: string;
  type: SectionType;
  sortOrder: number;
  isVisible: boolean;
  settings: JsonValue;
  dataEn: JsonValue;
  dataAr: JsonValue;
};

export type AdminPageDetail = {
  id: string;
  slug: string;
  status: ContentStatus;
  parentId: string | null;
  template: string;
  sortOrder: number;
  showInSitemap: boolean;
  priority: number | null;
  changeFrequency: string;
  publishedAt: string | null;
  titleEn: string;
  titleAr: string;
  slugEn: string;
  slugAr: string;
  excerptEn: string;
  excerptAr: string;
  contentEn: JsonValue | null;
  contentAr: JsonValue | null;
  seoEn: AdminLocaleSeo;
  seoAr: AdminLocaleSeo;
  pathEn: string;
  pathAr: string;
  sections: AdminPageSection[];
};

export type AdminPageOption = {
  id: string;
  title: string;
  parentId: string | null;
  path: string;
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

function publicPath(segments: string[]): string {
  const filtered = segments.filter((segment) => segment && segment !== "home");
  return filtered.length ? `/${filtered.join("/")}` : "/";
}

function toJson(value: unknown): JsonValue {
  return JSON.parse(JSON.stringify(value ?? {})) as JsonValue;
}

export async function listAdminPageTree(): Promise<AdminPageNode[]> {
  const rows = await prisma.page.findMany({
    where: { status: { not: "ARCHIVED" } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      slug: true,
      parentId: true,
      status: true,
      sortOrder: true,
      translations: {
        where: { locale: "EN" },
        select: { title: true, slug: true },
      },
    },
  });

  const byId = new Map<string, AdminPageNode>();
  for (const row of rows) {
    byId.set(row.id, {
      id: row.id,
      title: row.translations[0]?.title ?? row.slug,
      slug: row.translations[0]?.slug ?? row.slug,
      status: row.status,
      parentId: row.parentId,
      sortOrder: row.sortOrder,
      path: "/",
      children: [],
    });
  }

  const roots: AdminPageNode[] = [];
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  function assignPath(node: AdminPageNode, ancestors: string[]) {
    const segments = [...ancestors, node.slug];
    node.path = publicPath(segments);
    node.children.sort((a, b) => a.sortOrder - b.sortOrder);
    for (const child of node.children) {
      assignPath(child, segments);
    }
  }

  roots.sort((a, b) => a.sortOrder - b.sortOrder);
  for (const root of roots) {
    assignPath(root, []);
  }
  return roots;
}

export async function listAdminPageOptions(excludeId?: string): Promise<AdminPageOption[]> {
  const tree = await listAdminPageTree();
  const options: AdminPageOption[] = [];

  function walk(nodes: AdminPageNode[], skip = false) {
    for (const node of nodes) {
      const blocked = skip || node.id === excludeId;
      if (!blocked) {
        options.push({
          id: node.id,
          title: node.title,
          parentId: node.parentId,
          path: node.path,
        });
      }
      walk(node.children, blocked);
    }
  }

  walk(tree);
  return options;
}

export async function getAdminPage(id: string): Promise<AdminPageDetail | null> {
  const row = await prisma.page.findUnique({
    where: { id },
    include: {
      translations: true,
      sections: {
        orderBy: { sortOrder: "asc" },
        include: { translations: true },
      },
    },
  });
  if (!row) {
    return null;
  }
  const en = row.translations.find((item) => item.locale === "EN");
  const ar = row.translations.find((item) => item.locale === "AR");
  const tree = await listAdminPageTree();
  const pathEn = findPath(tree, row.id) ?? publicPath([en?.slug ?? row.slug]);
  const pathAr = publicPath(
    pathEn === "/" ? [] : pathEn.slice(1).split("/").slice(0, -1).concat(ar?.slug ?? en?.slug ?? row.slug),
  );

  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    parentId: row.parentId,
    template: row.template ?? "",
    sortOrder: row.sortOrder,
    showInSitemap: row.showInSitemap,
    priority: row.priority,
    changeFrequency: row.changeFrequency ?? "",
    publishedAt: row.publishedAt?.toISOString() ?? null,
    titleEn: en?.title ?? "",
    titleAr: ar?.title ?? "",
    slugEn: en?.slug ?? row.slug,
    slugAr: ar?.slug ?? row.slug,
    excerptEn: en?.excerpt ?? "",
    excerptAr: ar?.excerpt ?? "",
    contentEn: (en?.content as JsonValue | null) ?? null,
    contentAr: (ar?.content as JsonValue | null) ?? null,
    seoEn: seoFrom(en),
    seoAr: seoFrom(ar),
    pathEn,
    pathAr,
    sections: row.sections.map((section) => ({
      id: section.id,
      type: section.type,
      sortOrder: section.sortOrder,
      isVisible: section.isVisible,
      settings: toJson(section.settings),
      dataEn: toJson(section.translations.find((item) => item.locale === "EN")?.data),
      dataAr: toJson(section.translations.find((item) => item.locale === "AR")?.data),
    })),
  };
}

function findPath(nodes: AdminPageNode[], id: string): string | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node.path;
    }
    const nested = findPath(node.children, id);
    if (nested) {
      return nested;
    }
  }
  return null;
}
