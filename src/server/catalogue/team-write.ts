import { compactTeamSkills, compactTeamSocials } from "@/lib/team-json";
import type { TeamMemberSaveInput } from "@/lib/validations/team-member";
import { Prisma } from "@/generated/prisma/client";
import { toInputJson } from "@/server/actions/_resource";
import { emptyToNull, translationSeo } from "@/server/catalogue/seo-write";

export function teamTranslationData(
  input: TeamMemberSaveInput,
  locale: "EN" | "AR",
  slug: string,
) {
  const isEn = locale === "EN";
  const skills = compactTeamSkills(isEn ? (input.skillsEn ?? []) : (input.skillsAr ?? []));
  return {
    name: (isEn ? input.nameEn : input.nameAr) || input.nameEn,
    slug,
    role: emptyToNull(isEn ? input.roleEn : input.roleAr) ?? null,
    secondaryRole: emptyToNull(isEn ? input.secondaryRoleEn : input.secondaryRoleAr) ?? null,
    bio: emptyToNull(isEn ? input.bioEn : input.bioAr) ?? null,
    experience: emptyToNull(isEn ? input.experienceEn : input.experienceAr) ?? null,
    awards: emptyToNull(isEn ? input.awardsEn : input.awardsAr) ?? null,
    skills: skills.length ? toInputJson(skills) : undefined,
    ...translationSeo(isEn ? input.seoEn : input.seoAr),
  };
}

export function teamCoreData(input: TeamMemberSaveInput) {
  const socials = input.socials ? compactTeamSocials(input.socials) : undefined;
  return {
    email: emptyToNull(input.email) ?? null,
    phone: emptyToNull(input.phone) ?? null,
    isVisible: input.isVisible,
    sortOrder: input.sortOrder,
    avatarId: input.avatarId === undefined ? undefined : input.avatarId,
    socials:
      socials === undefined
        ? undefined
        : socials
          ? toInputJson(socials)
          : Prisma.JsonNull,
  };
}
