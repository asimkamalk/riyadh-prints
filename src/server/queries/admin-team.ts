import { parseTeamSkills, parseTeamSocials } from "@/lib/team-json";
import { prisma } from "@/server/db";
import type { Paginated } from "@/types/content";
import { pagination } from "@/server/queries/_shared";
import {
  adminMediaSelect,
  mapAdminMedia,
  type AdminMediaRecord,
} from "@/server/queries/media";
import type { AdminLocaleSeo } from "@/server/queries/admin-products";
import type { TeamSkill, TeamSocials } from "@/lib/team-json";

export type AdminTeamListItem = {
  id: string;
  name: string;
  slug: string;
  role: string;
  isVisible: boolean;
  sortOrder: number;
  thumbnailUrl: string | null;
  thumbnailAlt: string;
  updatedAt: string;
};

export type AdminTeamDetail = {
  id: string;
  slug: string;
  isVisible: boolean;
  sortOrder: number;
  email: string;
  phone: string;
  socials: TeamSocials;
  avatar: AdminMediaRecord | null;
  nameEn: string;
  nameAr: string;
  slugEn: string;
  slugAr: string;
  roleEn: string;
  roleAr: string;
  secondaryRoleEn: string;
  secondaryRoleAr: string;
  bioEn: string;
  bioAr: string;
  experienceEn: string;
  experienceAr: string;
  awardsEn: string;
  awardsAr: string;
  skillsEn: TeamSkill[];
  skillsAr: TeamSkill[];
  seoEn: AdminLocaleSeo;
  seoAr: AdminLocaleSeo;
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

export async function listAdminTeamMembers(input: {
  query?: string;
  visible?: boolean;
  page?: number;
  perPage?: number;
}): Promise<Paginated<AdminTeamListItem>> {
  const page = input.page ?? 1;
  const perPage = input.perPage ?? 20;
  const where = {
    ...(input.visible === undefined ? {} : { isVisible: input.visible }),
    ...(input.query
      ? {
          OR: [
            { slug: { contains: input.query, mode: "insensitive" as const } },
            {
              translations: {
                some: { name: { contains: input.query, mode: "insensitive" as const } },
              },
            },
          ],
        }
      : {}),
  };
  const total = await prisma.teamMember.count({ where });
  const pageInfo = pagination(total, page, perPage);
  const rows = await prisma.teamMember.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    skip: pageInfo.skip,
    take: pageInfo.perPage,
    select: {
      id: true,
      slug: true,
      isVisible: true,
      sortOrder: true,
      updatedAt: true,
      avatar: { select: adminMediaSelect },
      translations: {
        where: { locale: "EN" },
        select: { name: true, slug: true, role: true },
      },
    },
  });
  const items = rows.map((row) => {
    const en = row.translations[0];
    const avatar = row.avatar ? mapAdminMedia(row.avatar) : null;
    return {
      id: row.id,
      name: en?.name ?? row.slug,
      slug: en?.slug ?? row.slug,
      role: en?.role ?? "",
      isVisible: row.isVisible,
      sortOrder: row.sortOrder,
      thumbnailUrl: avatar?.url ?? null,
      thumbnailAlt: avatar?.altEn ?? en?.name ?? "",
      updatedAt: row.updatedAt.toISOString(),
    };
  });
  return { items, ...pageInfo };
}

export async function getAdminTeamMember(id: string): Promise<AdminTeamDetail | null> {
  const row = await prisma.teamMember.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      isVisible: true,
      sortOrder: true,
      email: true,
      phone: true,
      socials: true,
      avatar: { select: adminMediaSelect },
      translations: {
        select: {
          locale: true,
          name: true,
          slug: true,
          role: true,
          secondaryRole: true,
          bio: true,
          experience: true,
          awards: true,
          skills: true,
          metaTitle: true,
          metaDescription: true,
          ogTitle: true,
          ogDescription: true,
          ogImageId: true,
          canonicalUrl: true,
          noIndex: true,
          noFollow: true,
          focusKeyword: true,
        },
      },
    },
  });
  if (!row) {
    return null;
  }
  const en = row.translations.find((item) => item.locale === "EN");
  const ar = row.translations.find((item) => item.locale === "AR");
  return {
    id: row.id,
    slug: row.slug,
    isVisible: row.isVisible,
    sortOrder: row.sortOrder,
    email: row.email ?? "",
    phone: row.phone ?? "",
    socials: parseTeamSocials(row.socials),
    avatar: row.avatar ? mapAdminMedia(row.avatar) : null,
    nameEn: en?.name ?? "",
    nameAr: ar?.name ?? "",
    slugEn: en?.slug ?? row.slug,
    slugAr: ar?.slug ?? row.slug,
    roleEn: en?.role ?? "",
    roleAr: ar?.role ?? "",
    secondaryRoleEn: en?.secondaryRole ?? "",
    secondaryRoleAr: ar?.secondaryRole ?? "",
    bioEn: en?.bio ?? "",
    bioAr: ar?.bio ?? "",
    experienceEn: en?.experience ?? "",
    experienceAr: ar?.experience ?? "",
    awardsEn: en?.awards ?? "",
    awardsAr: ar?.awards ?? "",
    skillsEn: parseTeamSkills(en?.skills),
    skillsAr: parseTeamSkills(ar?.skills),
    seoEn: seoFrom(en),
    seoAr: seoFrom(ar),
  };
}
