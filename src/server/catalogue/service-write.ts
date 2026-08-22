import { compactSteps, compactStrings } from "@/lib/catalogue-json";
import type { ServiceSaveInput } from "@/lib/validations/service";
import { toInputJson } from "@/server/actions/_resource";
import { emptyToNull, translationSeo } from "@/server/catalogue/seo-write";

export function serviceTranslationData(
  input: ServiceSaveInput,
  locale: "EN" | "AR",
  slug: string,
) {
  const isEn = locale === "EN";
  return {
    name: (isEn ? input.nameEn : input.nameAr) || input.nameEn,
    slug,
    shortDescription: isEn ? input.shortEn : input.shortAr,
    longDescription: toInputJson(isEn ? input.longEn : input.longAr),
    benefits: toInputJson(compactStrings(isEn ? (input.benefitsEn ?? []) : (input.benefitsAr ?? []))),
    processSteps: toInputJson(
      compactSteps(isEn ? (input.processStepsEn ?? []) : (input.processStepsAr ?? [])),
    ),
    heroHeading: emptyToNull(isEn ? input.heroHeadingEn : input.heroHeadingAr) ?? null,
    heroSubheading: emptyToNull(isEn ? input.heroSubheadingEn : input.heroSubheadingAr) ?? null,
    ctaLabel: emptyToNull(isEn ? input.ctaLabelEn : input.ctaLabelAr) ?? null,
    ...translationSeo(isEn ? input.seoEn : input.seoAr),
  };
}
