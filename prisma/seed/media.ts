import { upsertMedia } from "./helpers";

async function photo(input: {
  pathname: string;
  url: string;
  mimeType: string;
  width: number;
  height: number;
  altEn: string;
  altAr: string;
}) {
  return upsertMedia(input);
}

export async function seedMediaAssets() {
  const heroCampaign = await photo({
    pathname: "seed/hero-national-day.jpg",
    url: "https://riyadhprints.com/wp-content/uploads/2025/12/3-1.jpg",
    mimeType: "image/jpeg",
    width: 1920,
    height: 1080,
    altEn: "Saudi National Day printing and décor by Riyadh Prints",
    altAr: "طباعة وديكور اليوم الوطني من مطبعة الرياض",
  });
  const heroStudio = await photo({
    pathname: "seed/hero-print-studio.jpg",
    url: "https://riyadhprints.com/wp-content/uploads/2023/02/h1_img-5.jpg",
    mimeType: "image/jpeg",
    width: 1600,
    height: 900,
    altEn: "Printed products and lifestyle display from Riyadh Prints",
    altAr: "منتجات مطبوعة وعرض معيشي من مطبعة الرياض",
  });
  const processPick = await photo({
    pathname: "seed/process-pick-product.webp",
    url: "https://riyadhprints.com/wp-content/uploads/2026/05/custom-tshirt-tote-bag-mug-printing-riyadh.webp",
    mimeType: "image/webp",
    width: 1200,
    height: 900,
    altEn: "Custom t-shirts, tote bags, and mugs printed in Riyadh",
    altAr: "تيشيرتات وحقائب وأكواب مطبوعة في الرياض",
  });
  const processCustom = await photo({
    pathname: "seed/process-custom-print.webp",
    url: "https://riyadhprints.com/wp-content/uploads/2026/05/premium-business-branding-printing-services-riyadh.webp",
    mimeType: "image/webp",
    width: 1200,
    height: 900,
    altEn: "Business cards, boxes, and branded stationery",
    altAr: "بطاقات أعمال وعلب وقرطاسية بشعاركم",
  });
  const processRest = await photo({
    pathname: "seed/process-print-floor.webp",
    url: "https://riyadhprints.com/wp-content/uploads/2026/05/large-format-printing-services-riyadh-prints.webp",
    mimeType: "image/webp",
    width: 1200,
    height: 900,
    altEn: "Large-format printing on the Riyadh Prints floor",
    altAr: "طباعة قياس كبير في مطبعة الرياض",
  });
  const kickstart = await photo({
    pathname: "seed/kickstart-print-shop.webp",
    url: "https://riyadhprints.com/wp-content/uploads/2026/05/custom-printing-branded-packaging-riyadh-prints.webp",
    mimeType: "image/webp",
    width: 1400,
    height: 1050,
    altEn: "Branded packaging and print samples from Riyadh Prints",
    altAr: "تغليف بشعار وعينات طباعة من مطبعة الرياض",
  });
  const partnerHayat = await photo({
    pathname: "seed/partner-hayat.webp",
    url: "https://riyadhprints.com/wp-content/uploads/2026/04/Hayat-Charity-Association-in-Medina.png.webp",
    mimeType: "image/webp",
    width: 400,
    height: 200,
    altEn: "Hayat Charity Association",
    altAr: "جمعية حياة الخيرية",
  });

  const categoryEntries = await Promise.all(
    (
      [
        [
          "apparel",
          "https://riyadhprints.com/wp-content/uploads/2026/01/custom-tshirt-printing-riyadh7.webp",
          "image/webp",
          "Custom apparel printing in Riyadh",
          "طباعة ملابس مخصصة في الرياض",
        ],
        [
          "bags",
          "https://riyadhprints.com/wp-content/uploads/2026/06/tote-bag-printing-riyadh-white-branded-tote-bag-scaled.webp",
          "image/webp",
          "Branded tote bags printed in Riyadh",
          "حقائب قماشية بشعاركم في الرياض",
        ],
        [
          "banners",
          "https://riyadhprints.com/wp-content/uploads/2026/01/2.jpg",
          "image/jpeg",
          "Banner printing in Riyadh",
          "طباعة بنرات في الرياض",
        ],
        [
          "box",
          "https://riyadhprints.com/wp-content/uploads/2026/05/custom-packaging-boxes-riyadh-prints.webp",
          "image/webp",
          "Custom boxes printed in Riyadh",
          "علب مخصصة مطبوعة في الرياض",
        ],
        [
          "brochures-catalogues",
          "https://riyadhprints.com/wp-content/uploads/2026/05/business-stationery-printing-riyadh-prints.webp",
          "image/webp",
          "Brochure and catalogue printing",
          "طباعة بروشورات وكتالوجات",
        ],
        [
          "business-cards",
          "https://riyadhprints.com/wp-content/uploads/2025/12/3-min-1-scaled.jpg",
          "image/jpeg",
          "Business card printing in Riyadh",
          "طباعة بطاقات أعمال في الرياض",
        ],
        [
          "car",
          "https://riyadhprints.com/wp-content/uploads/2026/01/7-1.jpg",
          "image/jpeg",
          "Vehicle wrapping in Riyadh",
          "تغليف سيارات في الرياض",
        ],
        [
          "flyers",
          "https://riyadhprints.com/wp-content/uploads/2026/05/corporate-branding-stationery-printing-riyadh-prints.webp",
          "image/webp",
          "Flyer printing in Riyadh",
          "طباعة فلايرات في الرياض",
        ],
        [
          "gifts",
          "https://riyadhprints.com/wp-content/uploads/2025/12/4-min-scaled.jpg",
          "image/jpeg",
          "Printed gifts and kits in Riyadh",
          "هدايا مطبوعة في الرياض",
        ],
        [
          "national-day",
          "https://riyadhprints.com/wp-content/uploads/2026/08/saudi-national-day-decor-cubes-office-lobby-stack-460x460.webp",
          "image/webp",
          "Saudi National Day print and décor",
          "طباعة وديكور اليوم الوطني",
        ],
        [
          "packaging",
          "https://riyadhprints.com/wp-content/uploads/2025/12/2-min-scaled.jpg",
          "image/jpeg",
          "Custom packaging printed in Riyadh",
          "تغليف مخصص مطبوع في الرياض",
        ],
        [
          "paper-bracelet",
          "https://riyadhprints.com/wp-content/uploads/2026/08/authenticity-01.webp",
          "image/webp",
          "Paper wristbands printed in Riyadh",
          "أساور ورقية مطبوعة في الرياض",
        ],
        [
          "posters",
          "https://riyadhprints.com/wp-content/uploads/2026/05/large-format-printing-services-riyadh-prints.webp",
          "image/webp",
          "Poster printing in Riyadh",
          "طباعة بوسترات في الرياض",
        ],
        [
          "roller-banners",
          "https://riyadhprints.com/wp-content/uploads/2026/04/Roll-up-stand-3-scaled.jpg",
          "image/jpeg",
          "Roll-up banner printing in Riyadh",
          "طباعة رول أب في الرياض",
        ],
        [
          "stickers",
          "https://riyadhprints.com/wp-content/uploads/2026/08/authenticity-03-scaled.webp",
          "image/webp",
          "Sticker printing in Riyadh",
          "طباعة استيكرات في الرياض",
        ],
      ] as const
    ).map(async ([slug, url, mimeType, altEn, altAr]) => {
      const media = await photo({
        pathname: `seed/category-${slug}${url.endsWith(".jpg") ? ".jpg" : ".webp"}`,
        url,
        mimeType,
        width: 800,
        height: 800,
        altEn,
        altAr,
      });
      return [slug, media.id] as const;
    }),
  );

  return {
    heroCampaign,
    heroStudio,
    processPick,
    processCustom,
    processRest,
    kickstart,
    partnerHayat,
    categories: Object.fromEntries(categoryEntries) as Record<string, string>,
  };
}

export type SeedMediaAssets = Awaited<ReturnType<typeof seedMediaAssets>>;
