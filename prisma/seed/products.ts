import { prisma, tiptapDoc, upsertMedia } from "./helpers";

type ProductSeed = {
  slug: string;
  sku: string;
  categorySlug: string;
  featured: boolean;
  isNew: boolean;
  includesDesign: boolean;
  sameDay: boolean;
  minOrderQty: number;
  turnaroundDays: number;
  basePrice: string;
  priceUnit: string;
  nameEn: string;
  nameAr: string;
  shortEn: string;
  shortAr: string;
  image: {
    pathname: string;
    url: string;
    mimeType: string;
    width: number;
    height: number;
    altEn: string;
    altAr: string;
  };
  optionSets: {
    key: string;
    labelEn: string;
    labelAr: string;
    values: { value: string; labelEn: string; labelAr: string; priceModifier: string }[];
  }[];
  tiers: { minQty: number; maxQty: number | null; unitPrice: string }[];
};

const products: ProductSeed[] = [
  {
    slug: "custom-t-shirts-in-riyadh",
    sku: "RP-TEE-001",
    categorySlug: "apparel",
    featured: true,
    isNew: false,
    includesDesign: true,
    sameDay: true,
    minOrderQty: 1,
    turnaroundDays: 1,
    basePrice: "35.00",
    priceUnit: "SAR / shirt",
    nameEn: "Custom t-shirts in Riyadh",
    nameAr: "تيشيرتات مخصصة في الرياض",
    shortEn: "Same-day cotton tees with a digital proof.",
    shortAr: "تيشيرت قطن في نفس اليوم مع بروفة رقمية.",
    image: {
      pathname: "seed/custom-t-shirts-in-riyadh.webp",
      url: "https://riyadhprints.com/wp-content/uploads/2026/01/custom-tshirt-printing-riyadh7.webp",
      mimeType: "image/webp",
      width: 1181,
      height: 1575,
      altEn: "Custom t-shirt print in Riyadh",
      altAr: "طباعة تيشيرت مخصص في الرياض",
    },
    optionSets: [
      {
        key: "size",
        labelEn: "Size",
        labelAr: "المقاس",
        values: [
          { value: "s", labelEn: "S", labelAr: "S", priceModifier: "0" },
          { value: "m", labelEn: "M", labelAr: "M", priceModifier: "0" },
          { value: "l", labelEn: "L", labelAr: "L", priceModifier: "0" },
          { value: "xl", labelEn: "XL", labelAr: "XL", priceModifier: "5.00" },
        ],
      },
      {
        key: "paper",
        labelEn: "Fabric",
        labelAr: "القماش",
        values: [
          { value: "180gsm", labelEn: "180 gsm cotton", labelAr: "قطن 180 جم", priceModifier: "0" },
          { value: "220gsm", labelEn: "220 gsm cotton", labelAr: "قطن 220 جم", priceModifier: "8.00" },
        ],
      },
      {
        key: "finish",
        labelEn: "Print",
        labelAr: "الطباعة",
        values: [
          { value: "dtg", labelEn: "DTG", labelAr: "DTG", priceModifier: "0" },
          { value: "screen", labelEn: "Screen print", labelAr: "سلك سكرين", priceModifier: "0" },
        ],
      },
      {
        key: "quantity",
        labelEn: "Quantity",
        labelAr: "الكمية",
        values: [
          { value: "10", labelEn: "10", labelAr: "10", priceModifier: "0" },
          { value: "50", labelEn: "50", labelAr: "50", priceModifier: "0" },
          { value: "100", labelEn: "100", labelAr: "100", priceModifier: "0" },
        ],
      },
    ],
    tiers: [
      { minQty: 1, maxQty: 24, unitPrice: "45.00" },
      { minQty: 25, maxQty: 99, unitPrice: "38.00" },
      { minQty: 100, maxQty: null, unitPrice: "32.00" },
    ],
  },
  {
    slug: "tote-bag-printing-riyadh",
    sku: "RP-TOTE-001",
    categorySlug: "bags",
    featured: true,
    isNew: false,
    includesDesign: true,
    sameDay: false,
    minOrderQty: 25,
    turnaroundDays: 4,
    basePrice: "18.00",
    priceUnit: "SAR / bag",
    nameEn: "Tote bag printing",
    nameAr: "طباعة حقائب قماشية",
    shortEn: "Business and personal totes printed locally.",
    shortAr: "حقائب عمل وشخصية تُطبع محليًا.",
    image: {
      pathname: "seed/tote-bag-printing-riyadh.webp",
      url: "https://riyadhprints.com/wp-content/uploads/2026/06/tote-bag-printing-riyadh-white-branded-tote-bag-scaled.webp",
      mimeType: "image/webp",
      width: 2560,
      height: 2560,
      altEn: "Branded tote bag printing in Riyadh",
      altAr: "طباعة حقيبة قماش في الرياض",
    },
    optionSets: [
      {
        key: "size",
        labelEn: "Size",
        labelAr: "المقاس",
        values: [
          { value: "standard", labelEn: "40 × 40 cm", labelAr: "40 × 40 سم", priceModifier: "0" },
          { value: "large", labelEn: "45 × 50 cm", labelAr: "45 × 50 سم", priceModifier: "4.00" },
        ],
      },
      {
        key: "finish",
        labelEn: "Finish",
        labelAr: "التشطيب",
        values: [
          { value: "1c", labelEn: "One colour", labelAr: "لون واحد", priceModifier: "0" },
          { value: "2c", labelEn: "Two colour", labelAr: "لونان", priceModifier: "6.00" },
        ],
      },
      {
        key: "quantity",
        labelEn: "Quantity",
        labelAr: "الكمية",
        values: [
          { value: "25", labelEn: "25", labelAr: "25", priceModifier: "0" },
          { value: "100", labelEn: "100", labelAr: "100", priceModifier: "0" },
          { value: "500", labelEn: "500", labelAr: "500", priceModifier: "0" },
        ],
      },
    ],
    tiers: [
      { minQty: 25, maxQty: 99, unitPrice: "22.00" },
      { minQty: 100, maxQty: 499, unitPrice: "18.00" },
      { minQty: 500, maxQty: null, unitPrice: "14.00" },
    ],
  },
  {
    slug: "roll-up-banner-printing-in-riyadh",
    sku: "RP-ROLL-001",
    categorySlug: "roller-banners",
    featured: true,
    isNew: false,
    includesDesign: true,
    sameDay: true,
    minOrderQty: 1,
    turnaroundDays: 1,
    basePrice: "180.00",
    priceUnit: "SAR / stand",
    nameEn: "Roll-up banner",
    nameAr: "رول أب",
    shortEn: "Portable stands, often same-day in Riyadh.",
    shortAr: "حاملات محمولة، غالبًا في نفس اليوم داخل الرياض.",
    image: {
      pathname: "seed/roll-up-banner.jpg",
      url: "https://riyadhprints.com/wp-content/uploads/2026/04/Roll-up-stand-3-scaled.jpg",
      mimeType: "image/jpeg",
      width: 1920,
      height: 2560,
      altEn: "Roll-up banner stand printing in Riyadh",
      altAr: "طباعة رول أب في الرياض",
    },
    optionSets: [
      {
        key: "size",
        labelEn: "Size",
        labelAr: "المقاس",
        values: [
          { value: "85x200", labelEn: "85 × 200 cm", labelAr: "85 × 200 سم", priceModifier: "0" },
          { value: "100x200", labelEn: "100 × 200 cm", labelAr: "100 × 200 سم", priceModifier: "40.00" },
        ],
      },
      {
        key: "finish",
        labelEn: "Finish",
        labelAr: "التشطيب",
        values: [
          { value: "standard", labelEn: "Standard cassette", labelAr: "كاسيت قياسي", priceModifier: "0" },
          { value: "wide-base", labelEn: "Wide base", labelAr: "قاعدة عريضة", priceModifier: "35.00" },
        ],
      },
    ],
    tiers: [
      { minQty: 1, maxQty: 4, unitPrice: "195.00" },
      { minQty: 5, maxQty: 19, unitPrice: "175.00" },
      { minQty: 20, maxQty: null, unitPrice: "155.00" },
    ],
  },
  {
    slug: "business-card-printing-riyadh",
    sku: "RP-CARD-001",
    categorySlug: "business-cards",
    featured: true,
    isNew: false,
    includesDesign: true,
    sameDay: true,
    minOrderQty: 100,
    turnaroundDays: 1,
    basePrice: "0.60",
    priceUnit: "SAR / card",
    nameEn: "Business card printing",
    nameAr: "طباعة بطاقات الأعمال",
    shortEn: "Same-day cards with optional luxury finishes.",
    shortAr: "بطاقات في نفس اليوم مع تشطيبات فاخرة اختيارية.",
    image: {
      pathname: "seed/business-card-printing-riyadh.jpg",
      url: "https://riyadhprints.com/wp-content/uploads/2025/12/3-min-1-scaled.jpg",
      mimeType: "image/jpeg",
      width: 1920,
      height: 2560,
      altEn: "Premium business card printing in Riyadh",
      altAr: "طباعة بطاقات أعمال فاخرة في الرياض",
    },
    optionSets: [
      {
        key: "paper",
        labelEn: "Paper",
        labelAr: "الورق",
        values: [
          { value: "350gsm", labelEn: "350 gsm silk", labelAr: "350 جم حريري", priceModifier: "0" },
          { value: "400gsm", labelEn: "400 gsm cotton", labelAr: "400 جم قطن", priceModifier: "0.25" },
        ],
      },
      {
        key: "finish",
        labelEn: "Finish",
        labelAr: "التشطيب",
        values: [
          { value: "matte", labelEn: "Matte laminate", labelAr: "تغليف مطفي", priceModifier: "0" },
          { value: "spot-uv", labelEn: "Spot UV", labelAr: "سبوت UV", priceModifier: "0.15" },
          { value: "foil", labelEn: "Foil stamp", labelAr: "فويل", priceModifier: "0.40" },
        ],
      },
      {
        key: "quantity",
        labelEn: "Quantity",
        labelAr: "الكمية",
        values: [
          { value: "100", labelEn: "100", labelAr: "100", priceModifier: "0" },
          { value: "250", labelEn: "250", labelAr: "250", priceModifier: "0" },
          { value: "500", labelEn: "500", labelAr: "500", priceModifier: "0" },
        ],
      },
    ],
    tiers: [
      { minQty: 100, maxQty: 249, unitPrice: "0.85" },
      { minQty: 250, maxQty: 499, unitPrice: "0.65" },
      { minQty: 500, maxQty: null, unitPrice: "0.48" },
    ],
  },
  {
    slug: "billboard-printing-riyadh",
    sku: "RP-BB-001",
    categorySlug: "banners",
    featured: true,
    isNew: false,
    includesDesign: false,
    sameDay: true,
    minOrderQty: 1,
    turnaroundDays: 1,
    basePrice: "85.00",
    priceUnit: "SAR / m²",
    nameEn: "Billboard printing",
    nameAr: "طباعة اللوحات الإعلانية",
    shortEn: "UV-stable vinyl, any size, same-day options.",
    shortAr: "فينيل يتحمل الأشعة، أي مقاس، مع خيار نفس اليوم.",
    image: {
      pathname: "seed/billboard-printing-riyadh.jpg",
      url: "https://riyadhprints.com/wp-content/uploads/2026/01/2.jpg",
      mimeType: "image/jpeg",
      width: 850,
      height: 850,
      altEn: "Billboard printing mockup in Riyadh",
      altAr: "محاكاة لوحة إعلانية في الرياض",
    },
    optionSets: [
      {
        key: "size",
        labelEn: "Size",
        labelAr: "المقاس",
        values: [
          { value: "4x3", labelEn: "4 × 3 m", labelAr: "4 × 3 م", priceModifier: "0" },
          { value: "6x3", labelEn: "6 × 3 m", labelAr: "6 × 3 م", priceModifier: "120.00" },
        ],
      },
      {
        key: "finish",
        labelEn: "Finish",
        labelAr: "التشطيب",
        values: [
          { value: "eyelet", labelEn: "Eyelets", labelAr: "حلقات", priceModifier: "0" },
          { value: "pole-pocket", labelEn: "Pole pockets", labelAr: "جيوب عمود", priceModifier: "25.00" },
        ],
      },
    ],
    tiers: [
      { minQty: 1, maxQty: 2, unitPrice: "95.00" },
      { minQty: 3, maxQty: null, unitPrice: "80.00" },
    ],
  },
  {
    slug: "custom-packaging-box",
    sku: "RP-PACK-001",
    categorySlug: "packaging",
    featured: true,
    isNew: false,
    includesDesign: true,
    sameDay: false,
    minOrderQty: 50,
    turnaroundDays: 7,
    basePrice: "4.50",
    priceUnit: "SAR / box",
    nameEn: "Custom packaging boxes",
    nameAr: "علب تغليف مخصصة",
    shortEn: "Strong branded cartons built to protect.",
    shortAr: "كرتون قوي بشعاركم يحمي الشحنة.",
    image: {
      pathname: "seed/custom-packaging-box.jpg",
      url: "https://riyadhprints.com/wp-content/uploads/2025/12/2-min-scaled.jpg",
      mimeType: "image/jpeg",
      width: 1920,
      height: 2560,
      altEn: "Custom printed carton boxes in Riyadh",
      altAr: "علب كرتون مطبوعة في الرياض",
    },
    optionSets: [
      {
        key: "paper",
        labelEn: "Board",
        labelAr: "الكرتون",
        values: [
          { value: "e-flute", labelEn: "E-flute", labelAr: "فلوت E", priceModifier: "0" },
          { value: "b-flute", labelEn: "B-flute", labelAr: "فلوت B", priceModifier: "0.80" },
        ],
      },
      {
        key: "finish",
        labelEn: "Finish",
        labelAr: "التشطيب",
        values: [
          { value: "kraft", labelEn: "Kraft outside", labelAr: "كرافت خارجي", priceModifier: "0" },
          { value: "white-print", labelEn: "White print", labelAr: "طباعة بيضاء", priceModifier: "0.60" },
        ],
      },
    ],
    tiers: [
      { minQty: 50, maxQty: 249, unitPrice: "6.20" },
      { minQty: 250, maxQty: 999, unitPrice: "4.50" },
      { minQty: 1000, maxQty: null, unitPrice: "3.40" },
    ],
  },
  {
    slug: "vehicle-branding-custom-car-wraps",
    sku: "RP-WRAP-001",
    categorySlug: "car",
    featured: false,
    isNew: true,
    includesDesign: true,
    sameDay: false,
    minOrderQty: 1,
    turnaroundDays: 5,
    basePrice: "1800.00",
    priceUnit: "SAR / vehicle",
    nameEn: "Custom car wraps",
    nameAr: "تغليف سيارات مخصص",
    shortEn: "Fleet graphics and full wraps, quoted per panel.",
    shortAr: "رسومات أسطول وتغليف كامل يُسعَّر حسب اللوح.",
    image: {
      pathname: "seed/vehicle-branding.jpg",
      url: "https://riyadhprints.com/wp-content/uploads/2026/01/7-1.jpg",
      mimeType: "image/jpeg",
      width: 850,
      height: 850,
      altEn: "Vehicle branding and fleet graphics in Riyadh",
      altAr: "تغليف سيارات ورسومات أساطيل في الرياض",
    },
    optionSets: [
      {
        key: "size",
        labelEn: "Coverage",
        labelAr: "التغطية",
        values: [
          { value: "partial", labelEn: "Partial / lettering", labelAr: "جزئي / حروف", priceModifier: "0" },
          { value: "full", labelEn: "Full wrap", labelAr: "تغليف كامل", priceModifier: "4200.00" },
        ],
      },
      {
        key: "finish",
        labelEn: "Vinyl",
        labelAr: "الفينيل",
        values: [
          { value: "calendered", labelEn: "Calendered", labelAr: "كالنـدر", priceModifier: "0" },
          { value: "cast", labelEn: "Cast wrap", labelAr: "كاست", priceModifier: "900.00" },
        ],
      },
    ],
    tiers: [
      { minQty: 1, maxQty: 2, unitPrice: "1800.00" },
      { minQty: 3, maxQty: null, unitPrice: "1600.00" },
    ],
  },
  {
    slug: "gift-box",
    sku: "RP-GIFT-001",
    categorySlug: "gifts",
    featured: true,
    isNew: false,
    includesDesign: true,
    sameDay: false,
    minOrderQty: 25,
    turnaroundDays: 8,
    basePrice: "12.00",
    priceUnit: "SAR / box",
    nameEn: "Custom gift box",
    nameAr: "علبة هدية مخصصة",
    shortEn: "Premium packaging for launches and occasions.",
    shortAr: "تغليف فاخر للإطلاقات والمناسبات.",
    image: {
      pathname: "seed/gift-box.jpg",
      url: "https://riyadhprints.com/wp-content/uploads/2025/12/4-min-scaled.jpg",
      mimeType: "image/jpeg",
      width: 1920,
      height: 2560,
      altEn: "Custom gift packaging in Riyadh",
      altAr: "تغليف هدايا مخصص في الرياض",
    },
    optionSets: [
      {
        key: "size",
        labelEn: "Size",
        labelAr: "المقاس",
        values: [
          { value: "s", labelEn: "Small", labelAr: "صغير", priceModifier: "0" },
          { value: "m", labelEn: "Medium", labelAr: "وسط", priceModifier: "4.00" },
          { value: "l", labelEn: "Large", labelAr: "كبير", priceModifier: "9.00" },
        ],
      },
      {
        key: "paper",
        labelEn: "Wrap",
        labelAr: "الغلاف",
        values: [
          { value: "art", labelEn: "Art paper wrap", labelAr: "ورق آرت", priceModifier: "0" },
          { value: "linen", labelEn: "Linen wrap", labelAr: "كتان", priceModifier: "3.50" },
        ],
      },
      {
        key: "finish",
        labelEn: "Finish",
        labelAr: "التشطيب",
        values: [
          { value: "matte", labelEn: "Matte", labelAr: "مطفي", priceModifier: "0" },
          { value: "foil", labelEn: "Foil logo", labelAr: "شعار فويل", priceModifier: "2.75" },
        ],
      },
      {
        key: "quantity",
        labelEn: "Quantity",
        labelAr: "الكمية",
        values: [
          { value: "25", labelEn: "25", labelAr: "25", priceModifier: "0" },
          { value: "100", labelEn: "100", labelAr: "100", priceModifier: "0" },
          { value: "500", labelEn: "500", labelAr: "500", priceModifier: "0" },
        ],
      },
    ],
    tiers: [
      { minQty: 25, maxQty: 99, unitPrice: "16.00" },
      { minQty: 100, maxQty: 499, unitPrice: "12.00" },
      { minQty: 500, maxQty: null, unitPrice: "9.50" },
    ],
  },
];

export async function seedProducts() {
  for (const item of products) {
    const category = await prisma.category.findUnique({
      where: { kind_slug: { kind: "PRODUCT", slug: item.categorySlug } },
    });
    if (!category) {
      throw new Error(`Category ${item.categorySlug} missing before products.`);
    }

    const media = await upsertMedia(item.image);

    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      create: {
        slug: item.slug,
        sku: item.sku,
        categoryId: category.id,
        status: "PUBLISHED",
        isFeatured: item.featured,
        isNew: item.isNew,
        includesDesign: item.includesDesign,
        sameDayAvailable: item.sameDay,
        minOrderQty: item.minOrderQty,
        turnaroundDays: item.turnaroundDays,
        basePrice: item.basePrice,
        priceUnit: item.priceUnit,
        sortOrder: products.indexOf(item),
        publishedAt: new Date(),
        showInSitemap: true,
        legacyPath: `/product/${item.slug}/`,
      },
      update: {
        sku: item.sku,
        categoryId: category.id,
        status: "PUBLISHED",
        isFeatured: item.featured,
        includesDesign: item.includesDesign,
        sameDayAvailable: item.sameDay,
        minOrderQty: item.minOrderQty,
        turnaroundDays: item.turnaroundDays,
        basePrice: item.basePrice,
        priceUnit: item.priceUnit,
        publishedAt: new Date(),
        legacyPath: `/product/${item.slug}/`,
      },
    });

    await prisma.productToCategory.upsert({
      where: {
        productId_categoryId: { productId: product.id, categoryId: category.id },
      },
      create: { productId: product.id, categoryId: category.id, sortOrder: 0 },
      update: { sortOrder: 0 },
    });

    await prisma.productTranslation.upsert({
      where: { productId_locale: { productId: product.id, locale: "EN" } },
      create: {
        productId: product.id,
        locale: "EN",
        name: item.nameEn,
        slug: item.slug,
        shortDescription: item.shortEn,
        longDescription: tiptapDoc(item.shortEn),
        specifications: { printedIn: "Riyadh", proof: "digital" },
        materials: [],
        useCases: [],
        metaTitle: item.nameEn,
        metaDescription: item.shortEn,
      },
      update: {
        name: item.nameEn,
        slug: item.slug,
        shortDescription: item.shortEn,
        longDescription: tiptapDoc(item.shortEn),
        metaTitle: item.nameEn,
        metaDescription: item.shortEn,
      },
    });

    await prisma.productTranslation.upsert({
      where: { productId_locale: { productId: product.id, locale: "AR" } },
      create: {
        productId: product.id,
        locale: "AR",
        name: item.nameAr,
        slug: item.slug,
        shortDescription: item.shortAr,
        longDescription: tiptapDoc(item.shortAr),
        specifications: { printedIn: "الرياض", proof: "رقمية" },
        materials: [],
        useCases: [],
        metaTitle: item.nameAr,
        metaDescription: item.shortAr,
      },
      update: {
        name: item.nameAr,
        slug: item.slug,
        shortDescription: item.shortAr,
        longDescription: tiptapDoc(item.shortAr),
        metaTitle: item.nameAr,
        metaDescription: item.shortAr,
      },
    });

    await prisma.productImage.upsert({
      where: { productId_mediaId: { productId: product.id, mediaId: media.id } },
      create: {
        productId: product.id,
        mediaId: media.id,
        sortOrder: 0,
        isPrimary: true,
      },
      update: { sortOrder: 0, isPrimary: true },
    });

    for (const [optionIndex, option] of item.optionSets.entries()) {
      const optionRow = await prisma.productOption.upsert({
        where: { productId_key: { productId: product.id, key: option.key } },
        create: { productId: product.id, key: option.key, sortOrder: optionIndex },
        update: { sortOrder: optionIndex },
      });

      await prisma.productOptionTranslation.upsert({
        where: { optionId_locale: { optionId: optionRow.id, locale: "EN" } },
        create: { optionId: optionRow.id, locale: "EN", label: option.labelEn },
        update: { label: option.labelEn },
      });
      await prisma.productOptionTranslation.upsert({
        where: { optionId_locale: { optionId: optionRow.id, locale: "AR" } },
        create: { optionId: optionRow.id, locale: "AR", label: option.labelAr },
        update: { label: option.labelAr },
      });

      for (const [valueIndex, value] of option.values.entries()) {
        const valueRow = await prisma.productOptionValue.upsert({
          where: { optionId_value: { optionId: optionRow.id, value: value.value } },
          create: {
            optionId: optionRow.id,
            value: value.value,
            priceModifier: value.priceModifier,
            sortOrder: valueIndex,
          },
          update: {
            priceModifier: value.priceModifier,
            sortOrder: valueIndex,
          },
        });

        await prisma.productOptionValueTranslation.upsert({
          where: { valueId_locale: { valueId: valueRow.id, locale: "EN" } },
          create: { valueId: valueRow.id, locale: "EN", label: value.labelEn },
          update: { label: value.labelEn },
        });
        await prisma.productOptionValueTranslation.upsert({
          where: { valueId_locale: { valueId: valueRow.id, locale: "AR" } },
          create: { valueId: valueRow.id, locale: "AR", label: value.labelAr },
          update: { label: value.labelAr },
        });
      }
    }

    for (const tier of item.tiers) {
      await prisma.productPriceTier.upsert({
        where: { productId_minQty: { productId: product.id, minQty: tier.minQty } },
        create: {
          productId: product.id,
          minQty: tier.minQty,
          maxQty: tier.maxQty,
          unitPrice: tier.unitPrice,
        },
        update: { maxQty: tier.maxQty, unitPrice: tier.unitPrice },
      });
    }
  }
}
