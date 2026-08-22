import { compactKvRows, compactStrings } from "@/lib/catalogue-json";
import type { ProductSaveInput } from "@/lib/validations/product";
import { prisma } from "@/server/db";
import { toInputJson } from "@/server/actions/_resource";
import { slugFromTitle } from "@/lib/slug";
import { translationSeo } from "@/server/catalogue/seo-write";

export function productTranslationData(
  input: ProductSaveInput,
  locale: "EN" | "AR",
  slug: string,
) {
  const isEn = locale === "EN";
  return {
    name: (isEn ? input.nameEn : input.nameAr) || input.nameEn,
    slug,
    shortDescription: isEn ? input.shortEn : input.shortAr,
    longDescription: toInputJson(isEn ? input.longEn : input.longAr),
    specifications: toInputJson(
      compactKvRows(isEn ? (input.specificationsEn ?? []) : (input.specificationsAr ?? [])),
    ),
    materials: toInputJson(
      compactStrings(isEn ? (input.materialsEn ?? []) : (input.materialsAr ?? [])),
    ),
    useCases: toInputJson(
      compactStrings(isEn ? (input.useCasesEn ?? []) : (input.useCasesAr ?? [])),
    ),
    ...translationSeo(isEn ? input.seoEn : input.seoAr),
  };
}

export async function syncProductNested(productId: string, input: ProductSaveInput): Promise<void> {
  if (input.images) {
    await syncImages(productId, input.images);
  }
  if (input.priceTiers) {
    await syncTiers(productId, input.priceTiers);
  }
  if (input.options) {
    await syncOptions(productId, input.options);
  }
  if (input.relatedProductIds) {
    await syncRelated(productId, input.relatedProductIds);
  }
}

async function syncImages(
  productId: string,
  images: NonNullable<ProductSaveInput["images"]>,
) {
  const mediaIds = images.map((image) => image.mediaId);
  if (mediaIds.length === 0) {
    await prisma.productImage.deleteMany({ where: { productId } });
    return;
  }
  await prisma.productImage.deleteMany({
    where: { productId, mediaId: { notIn: mediaIds } },
  });
  for (const image of images) {
    await prisma.productImage.upsert({
      where: { productId_mediaId: { productId, mediaId: image.mediaId } },
      create: {
        productId,
        mediaId: image.mediaId,
        sortOrder: image.sortOrder,
        isPrimary: image.isPrimary,
      },
      update: { sortOrder: image.sortOrder, isPrimary: image.isPrimary },
    });
  }
}

async function syncTiers(
  productId: string,
  tiers: NonNullable<ProductSaveInput["priceTiers"]>,
) {
  await prisma.productPriceTier.deleteMany({ where: { productId } });
  if (tiers.length === 0) {
    return;
  }
  await prisma.productPriceTier.createMany({
    data: tiers.map((tier) => ({
      productId,
      minQty: tier.minQty,
      maxQty: tier.maxQty ?? null,
      unitPrice: tier.unitPrice,
    })),
  });
}

async function syncRelated(productId: string, relatedIds: string[]) {
  const unique = [...new Set(relatedIds.filter((id) => id !== productId))];
  await prisma.productRelation.deleteMany({ where: { productId } });
  if (unique.length === 0) {
    return;
  }
  await prisma.productRelation.createMany({
    data: unique.map((relatedProductId, sortOrder) => ({
      productId,
      relatedProductId,
      sortOrder,
    })),
  });
}

function uniqueKey(used: Set<string>, base: string): string {
  let key = base || "item";
  if (!used.has(key)) {
    used.add(key);
    return key;
  }
  let n = 2;
  while (used.has(`${key}-${n}`)) {
    n += 1;
  }
  const next = `${key}-${n}`;
  used.add(next);
  return next;
}

async function syncOptions(
  productId: string,
  options: NonNullable<ProductSaveInput["options"]>,
) {
  const cleaned = options.filter((option) => option.labelEn.trim() || option.key.trim());
  const existing = await prisma.productOption.findMany({
    where: { productId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((row) => row.id));
  const keep = cleaned
    .map((option) => option.id)
    .filter((id): id is string => Boolean(id && existingIds.has(id)));
  if (cleaned.length === 0) {
    await prisma.productOption.deleteMany({ where: { productId } });
    return;
  }
  await prisma.productOption.deleteMany({
    where: { productId, id: { notIn: keep } },
  });
  const usedOptionKeys = new Set<string>();
  for (const [index, option] of cleaned.entries()) {
    const key = uniqueKey(
      usedOptionKeys,
      option.key.trim() || slugFromTitle(option.labelEn || "option"),
    );
    const optionId = option.id && existingIds.has(option.id) ? option.id : undefined;
    const row = optionId
      ? await prisma.productOption.update({
          where: { id: optionId },
          data: { key, sortOrder: option.sortOrder ?? index },
        })
      : await prisma.productOption.create({
          data: { productId, key, sortOrder: option.sortOrder ?? index },
        });
    await prisma.productOptionTranslation.upsert({
      where: { optionId_locale: { optionId: row.id, locale: "EN" } },
      create: { optionId: row.id, locale: "EN", label: option.labelEn },
      update: { label: option.labelEn },
    });
    await prisma.productOptionTranslation.upsert({
      where: { optionId_locale: { optionId: row.id, locale: "AR" } },
      create: {
        optionId: row.id,
        locale: "AR",
        label: option.labelAr || option.labelEn,
      },
      update: { label: option.labelAr || option.labelEn },
    });
    const values = option.values.filter((value) => value.labelEn.trim() || value.value.trim());
    const existingValues = await prisma.productOptionValue.findMany({
      where: { optionId: row.id },
      select: { id: true },
    });
    const existingValueIds = new Set(existingValues.map((value) => value.id));
    const keepValues = values
      .map((value) => value.id)
      .filter((id): id is string => Boolean(id && existingValueIds.has(id)));
    if (values.length === 0) {
      await prisma.productOptionValue.deleteMany({ where: { optionId: row.id } });
      continue;
    }
    await prisma.productOptionValue.deleteMany({
      where: { optionId: row.id, id: { notIn: keepValues } },
    });
    const usedValueKeys = new Set<string>();
    for (const [valueIndex, value] of values.entries()) {
      const valueKey = uniqueKey(
        usedValueKeys,
        value.value.trim() || slugFromTitle(value.labelEn || "value"),
      );
      const valueId = value.id && existingValueIds.has(value.id) ? value.id : undefined;
      const saved = valueId
        ? await prisma.productOptionValue.update({
            where: { id: valueId },
            data: {
              value: valueKey,
              priceModifier: value.priceModifier?.trim() || "0",
              sortOrder: value.sortOrder ?? valueIndex,
            },
          })
        : await prisma.productOptionValue.create({
            data: {
              optionId: row.id,
              value: valueKey,
              priceModifier: value.priceModifier?.trim() || "0",
              sortOrder: value.sortOrder ?? valueIndex,
            },
          });
      await prisma.productOptionValueTranslation.upsert({
        where: { valueId_locale: { valueId: saved.id, locale: "EN" } },
        create: { valueId: saved.id, locale: "EN", label: value.labelEn },
        update: { label: value.labelEn },
      });
      await prisma.productOptionValueTranslation.upsert({
        where: { valueId_locale: { valueId: saved.id, locale: "AR" } },
        create: {
          valueId: saved.id,
          locale: "AR",
          label: value.labelAr || value.labelEn,
        },
        update: { label: value.labelAr || value.labelEn },
      });
    }
  }
}
