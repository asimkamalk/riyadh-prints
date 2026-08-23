import type { AdminLocaleSeo } from "@/server/queries/admin-products";
import type { AdminTeamDetail } from "@/server/queries/admin-team";
import type { TeamSkill, TeamSocials } from "@/lib/team-json";
import type { AdminMediaRecord } from "@/server/queries/media";

export type TeamFormState = {
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
  email: string;
  phone: string;
  socials: TeamSocials;
  isVisible: boolean;
  sortOrder: number;
  avatar: AdminMediaRecord | null;
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

export function initialTeamForm(member: AdminTeamDetail | null): TeamFormState {
  if (!member) {
    return {
      nameEn: "",
      nameAr: "",
      slugEn: "",
      slugAr: "",
      roleEn: "",
      roleAr: "",
      secondaryRoleEn: "",
      secondaryRoleAr: "",
      bioEn: "",
      bioAr: "",
      experienceEn: "",
      experienceAr: "",
      awardsEn: "",
      awardsAr: "",
      skillsEn: [],
      skillsAr: [],
      email: "",
      phone: "",
      socials: {},
      isVisible: true,
      sortOrder: 0,
      avatar: null,
      seoEn: emptySeo(),
      seoAr: emptySeo(),
    };
  }
  return {
    nameEn: member.nameEn,
    nameAr: member.nameAr,
    slugEn: member.slugEn,
    slugAr: member.slugAr,
    roleEn: member.roleEn,
    roleAr: member.roleAr,
    secondaryRoleEn: member.secondaryRoleEn,
    secondaryRoleAr: member.secondaryRoleAr,
    bioEn: member.bioEn,
    bioAr: member.bioAr,
    experienceEn: member.experienceEn,
    experienceAr: member.experienceAr,
    awardsEn: member.awardsEn,
    awardsAr: member.awardsAr,
    skillsEn: member.skillsEn,
    skillsAr: member.skillsAr,
    email: member.email,
    phone: member.phone,
    socials: member.socials,
    isVisible: member.isVisible,
    sortOrder: member.sortOrder,
    avatar: member.avatar,
    seoEn: member.seoEn,
    seoAr: member.seoAr,
  };
}

export function teamFormToPayload(id: string | undefined, form: TeamFormState) {
  return {
    id,
    nameEn: form.nameEn,
    nameAr: form.nameAr,
    slugEn: form.slugEn,
    slugAr: form.slugAr,
    roleEn: form.roleEn,
    roleAr: form.roleAr,
    secondaryRoleEn: form.secondaryRoleEn,
    secondaryRoleAr: form.secondaryRoleAr,
    bioEn: form.bioEn,
    bioAr: form.bioAr,
    experienceEn: form.experienceEn,
    experienceAr: form.experienceAr,
    awardsEn: form.awardsEn,
    awardsAr: form.awardsAr,
    skillsEn: form.skillsEn,
    skillsAr: form.skillsAr,
    email: form.email,
    phone: form.phone,
    socials: form.socials,
    isVisible: form.isVisible,
    sortOrder: form.sortOrder,
    avatarId: form.avatar?.id ?? null,
    seoEn: form.seoEn,
    seoAr: form.seoAr,
  };
}
