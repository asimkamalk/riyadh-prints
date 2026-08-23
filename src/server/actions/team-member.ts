"use server";

import { tags } from "@/lib/cache-tags";
import { bulkIdsSchema, idSchema, reorderSchema } from "@/lib/validations/common";
import { teamMemberSaveSchema } from "@/lib/validations/team-member";
import { teamCoreData, teamTranslationData } from "@/server/catalogue/team-write";
import { prisma } from "@/server/db";

import { CONTENT_ROLES, createAction } from "./_helpers";
import { notFound, reorderTransaction } from "./_resource";
import { generateUniqueSlug } from "./_slug";

function teamTags(slug: string) {
  return [tags.teamMember(slug), tags.teamMembers(), tags.pages(), tags.global()];
}

export const saveTeamMember = createAction({
  input: teamMemberSaveSchema,
  roles: CONTENT_ROLES,
  revalidate: (_i, r) => teamTags(r.slug),
  audit: {
    action: "teamMember.save",
    entityType: "teamMember",
    entityId: (_i, r) => r.id,
  },
  handler: async ({ input }) => {
    const slug = await generateUniqueSlug(
      "teamMember",
      "en",
      input.slugEn || input.nameEn,
      input.id,
    );
    const slugAr = await generateUniqueSlug(
      "teamMember",
      "ar",
      input.slugAr || input.nameAr || input.nameEn,
      input.id,
    );
    const core = teamCoreData(input);

    if (!input.id) {
      const created = await prisma.teamMember.create({
        data: {
          slug,
          email: core.email ?? null,
          phone: core.phone ?? null,
          isVisible: core.isVisible ?? true,
          sortOrder: core.sortOrder ?? 0,
          avatarId: core.avatarId ?? null,
          socials: core.socials ?? undefined,
          translations: {
            create: [
              { locale: "EN", ...teamTranslationData(input, "EN", slug) },
              {
                locale: "AR",
                ...teamTranslationData(input, "AR", slugAr),
              },
            ],
          },
        },
        select: { id: true, slug: true },
      });
      return created;
    }

    const existing = await prisma.teamMember.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!existing) {
      notFound("Team member");
    }

    await prisma.teamMember.update({
      where: { id: existing.id },
      data: {
        slug,
        email: core.email,
        phone: core.phone,
        isVisible: core.isVisible,
        sortOrder: core.sortOrder,
        avatarId: core.avatarId,
        socials: core.socials,
      },
    });

    for (const [locale, memberSlug] of [
      ["EN", slug],
      ["AR", slugAr],
    ] as const) {
      await prisma.teamMemberTranslation.upsert({
        where: { teamMemberId_locale: { teamMemberId: existing.id, locale } },
        create: {
          teamMemberId: existing.id,
          locale,
          ...teamTranslationData(input, locale, memberSlug),
        },
        update: teamTranslationData(input, locale, memberSlug),
      });
    }

    return { id: existing.id, slug };
  },
});

export const deleteTeamMember = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.teamMembers(), tags.pages(), tags.global()],
  audit: { action: "teamMember.delete", entityType: "teamMember", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.teamMember.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!existing) {
      notFound("Team member");
    }
    await prisma.teamMember.delete({ where: { id: existing.id } });
    return { id: existing.id };
  },
});

export const toggleTeamMemberVisible = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.teamMembers(), tags.pages(), tags.global()],
  audit: {
    action: "teamMember.toggleVisible",
    entityType: "teamMember",
    entityId: (i) => i.id,
  },
  handler: async ({ input }) => {
    const existing = await prisma.teamMember.findUnique({
      where: { id: input.id },
      select: { id: true, isVisible: true, slug: true },
    });
    if (!existing) {
      notFound("Team member");
    }
    return prisma.teamMember.update({
      where: { id: existing.id },
      data: { isVisible: !existing.isVisible },
      select: { id: true, isVisible: true, slug: true },
    });
  },
});

export const reorderTeamMembers = createAction({
  input: reorderSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.teamMembers(), tags.pages(), tags.global()],
  audit: { action: "teamMember.reorder", entityType: "teamMember", entityId: () => "batch" },
  handler: async ({ input }) => {
    await reorderTransaction(input.items, (id, sortOrder) =>
      prisma.teamMember.update({ where: { id }, data: { sortOrder } }),
    );
    return { count: input.items.length };
  },
});

export const bulkDeleteTeamMembers = createAction({
  input: bulkIdsSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.teamMembers(), tags.pages(), tags.global()],
  audit: { action: "teamMember.bulkDelete", entityType: "teamMember", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.teamMember.deleteMany({ where: { id: { in: input.ids } } });
    return { count: result.count };
  },
});

export const duplicateTeamMember = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [tags.teamMembers(), tags.global()],
  audit: {
    action: "teamMember.duplicate",
    entityType: "teamMember",
    entityId: (_i, r) => r.id,
  },
  handler: async ({ input }) => {
    const existing = await prisma.teamMember.findUnique({
      where: { id: input.id },
      include: { translations: true },
    });
    if (!existing) {
      notFound("Team member");
    }
    const baseSlug = `${existing.slug}-copy`;
    const slug = await generateUniqueSlug("teamMember", "en", baseSlug);
    const slugAr = await generateUniqueSlug("teamMember", "ar", `${baseSlug}-ar`);
    return prisma.teamMember.create({
      data: {
        slug,
        email: existing.email,
        phone: existing.phone,
        socials: existing.socials ?? undefined,
        avatarId: existing.avatarId,
        isVisible: false,
        sortOrder: existing.sortOrder + 1,
        translations: {
          create: existing.translations.map((row) => ({
            locale: row.locale,
            name: `${row.name} (copy)`,
            slug: row.locale === "EN" ? slug : slugAr,
            role: row.role,
            secondaryRole: row.secondaryRole,
            bio: row.bio,
            experience: row.experience,
            awards: row.awards,
            skills: row.skills ?? undefined,
            metaTitle: row.metaTitle,
            metaDescription: row.metaDescription,
            ogTitle: row.ogTitle,
            ogDescription: row.ogDescription,
            ogImageId: row.ogImageId,
            canonicalUrl: row.canonicalUrl,
            noIndex: row.noIndex,
            noFollow: row.noFollow,
            focusKeyword: row.focusKeyword,
          })),
        },
      },
      select: { id: true, slug: true },
    });
  },
});