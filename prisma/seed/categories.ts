import { prisma } from "./helpers";
import type { SeedMediaAssets } from "./media";

type CategorySeed = {
  slug: string;
  sortOrder: number;
  iconName: string;
  nameEn: string;
  nameAr: string;
  shortEn: string;
  shortAr: string;
  longEn: string;
  longAr: string;
};

const categories: CategorySeed[] = [
  {
    slug: "apparel",
    sortOrder: 0,
    iconName: "shirt",
    nameEn: "Apparel",
    nameAr: "ملابس",
    shortEn: "Custom t-shirts and garments printed in Riyadh.",
    shortAr: "تيشيرتات وملابس مخصصة تُطبع في الرياض.",
    longEn:
      "Screen and digital garment printing for events, teams, and brands. Cotton tees, long sleeves, and National Day runs with proofs before ink hits fabric.",
    longAr:
      "طباعة ملابس رقمية وسلك سكرين للفعاليات والفرق والعلامات. تيشيرت قطن وأكمام طويلة وطبعات اليوم الوطني مع بروفة قبل التنفيذ.",
  },
  {
    slug: "bags",
    sortOrder: 1,
    iconName: "shopping-bag",
    nameEn: "Bags",
    nameAr: "حقائب",
    shortEn: "Branded tote and shopper bags.",
    shortAr: "حقائب قماشية وترويجية بشعاركم.",
    longEn:
      "Canvas and spunbond totes with one or two colour prints. Useful for conferences, retail, and giveaways without a minimum that blocks a first order.",
    longAr:
      "حقائب قماش وسبن بوند بلون أو لونين. مناسبة للمؤتمرات والتجزئة والهدايا دون حد أدنى يعيق أول طلب.",
  },
  {
    slug: "banners",
    sortOrder: 2,
    iconName: "flag",
    nameEn: "Banners",
    nameAr: "بنرات",
    shortEn: "Outdoor and indoor banners, including same-day sizes.",
    shortAr: "بنرات داخلية وخارجية مع أحجام في نفس اليوم.",
    longEn:
      "Vinyl, mesh, and fabric banners with welded edges and eyelets. Weather-minded inks for Riyadh sun on street and site signage.",
    longAr:
      "بنرات فينيل وشبك وقماش مع لحام وحلقات. أحبار تتحمل شمس الرياض للوحات الشوارع والمواقع.",
  },
  {
    slug: "box",
    sortOrder: 3,
    iconName: "box",
    nameEn: "Box",
    nameAr: "علب",
    shortEn: "Rigid and folding boxes for gifting and retail.",
    shortAr: "علب صلبة وقابلة للطي للهدايا والتجزئة.",
    longEn:
      "Rigid set-up boxes and folding cartons. Specify board, wrap, and insert so the unboxing matches the product, not a generic mailer.",
    longAr:
      "علب صلبة وكرتون قابل للطي. حدّدوا الكرتون والغلاف والداخل ليطابق فتح العلبة المنتج لا مغلّفًا عامًا.",
  },
  {
    slug: "brochures-catalogues",
    sortOrder: 4,
    iconName: "book-open",
    nameEn: "Brochures & Catalogues",
    nameAr: "بروشورات وكاتالوجات",
    shortEn: "Stitched and folded product literature.",
    shortAr: "مطبوعات منتجات مطوية ومُدبَّسة.",
    longEn:
      "Saddle-stitch and perfect-bound catalogues on coated stocks. Page counts and lamination are quoted from the PDF, not guessed on the phone.",
    longAr:
      "كتالوجات تدبيس وتجليد على ورق مطلي. عدد الصفحات والتغطية يُسعَّران من ملف PDF لا بالتخمين هاتفيًا.",
  },
  {
    slug: "business-cards",
    sortOrder: 5,
    iconName: "id-card",
    nameEn: "Business Cards",
    nameAr: "بطاقات أعمال",
    shortEn: "Same-day cards with optional foil and spot UV.",
    shortAr: "بطاقات في نفس اليوم مع خيار فويل وسبوت UV.",
    longEn:
      "Standard and luxury cards: matte, soft-touch, foil, and bilingual Arabic/English layouts. Digital proof before the cutter runs.",
    longAr:
      "بطاقات عادية وفاخرة: مطفي، لمس ناعم، فويل، وتصميم عربي/إنجليزي. بروفة رقمية قبل القص.",
  },
  {
    slug: "car",
    sortOrder: 6,
    iconName: "car",
    nameEn: "Car",
    nameAr: "سيارات",
    shortEn: "Vehicle wraps and fleet graphics.",
    shortAr: "تغليف سيارات ورسومات أساطيل.",
    longEn:
      "Cast vinyl wraps and cut-letter graphics. Quotes include install window and which panels we print — not a single mystery square-metre price.",
    longAr:
      "تغليف فينيل كاست وقص حروف. العرض يشمل موعد التركيب والألواح المطبوعة — لا سعر متر غامض.",
  },
  {
    slug: "flyers",
    sortOrder: 7,
    iconName: "file-text",
    nameEn: "Flyers",
    nameAr: "فلايرات",
    shortEn: "A5 and A4 flyers for drops and counters.",
    shortAr: "فلايرات A5 و A4 للتوزيع والمكاتب.",
    longEn:
      "Fast flyer runs on 150–300 gsm. Single or double sided, with optional fold. Artwork at 300 DPI with 3 mm bleed.",
    longAr:
      "فلايرات سريعة على 150–300 جم. وجه أو وجهين مع طي اختياري. العمل على 300 نقطة مع هدر 3 مم.",
  },
  {
    slug: "gifts",
    sortOrder: 8,
    iconName: "gift",
    nameEn: "Gifts",
    nameAr: "هدايا",
    shortEn: "Promotional gifts and branded kits.",
    shortAr: "هدايا ترويجية وأطقم بشعاركم.",
    longEn:
      "Gift boxes, cubes, and print-led kits for launches and National Day. We print the wrap and the insert, then pack to a list you send.",
    longAr:
      "علب هدايا ومكعبات وأطقم مطبوعة للإطلاقات واليوم الوطني. نطبع الغلاف والداخل ونعبئ حسب قائمتكم.",
  },
  {
    slug: "national-day",
    sortOrder: 9,
    iconName: "sparkles",
    nameEn: "National Day",
    nameAr: "اليوم الوطني",
    shortEn: "Heritage tees, cubes, and event print for 23 September.",
    shortAr: "قمصان تراثية ومكعبات وطباعة فعاليات لـ 23 سبتمبر.",
    longEn:
      "Shop Saudi National Day t-shirts, décor cubes, and printed gifts in cotton. Bulk branding and fast KSA delivery from Riyadh Prints.",
    longAr:
      "قمصان اليوم الوطني ومكعبات ديكور وهدايا مطبوعة على قطن. طباعة كميات وتوصيل سريع داخل المملكة من مطبعة الرياض.",
  },
  {
    slug: "packaging",
    sortOrder: 10,
    iconName: "package",
    nameEn: "Packaging",
    nameAr: "تغليف",
    shortEn: "Mailers, cartons, and branded outer packs.",
    shortAr: "مغلفات وكرتون وتغليف خارجي بشعاركم.",
    longEn:
      "Delivery boxes and retail cartons sized to the SKU. Board grade is chosen for last-mile abuse in Riyadh heat, not for a studio photo only.",
    longAr:
      "علب توصيل وكرتون تجزئة بحجم المنتج. سماكة الكرتون تُختار لتحمّل التوصيل وحرارة الرياض لا لصورة الاستوديو فقط.",
  },
  {
    slug: "paper-bracelet",
    sortOrder: 11,
    iconName: "ticket",
    nameEn: "Paper Bracelet",
    nameAr: "أساور ورقية",
    shortEn: "Tamper-evident event wristbands.",
    shortAr: "أساور فعاليات ضد التلاعب.",
    longEn:
      "Full-colour paper wristbands with sequential numbering on request. Fast for concerts, campuses, and gated events in the city.",
    longAr:
      "أساور ورقية ملونة مع ترقيم تسلسلي عند الطلب. سريعة للحفلات والجامعات والفعاليات المغلقة في المدينة.",
  },
  {
    slug: "posters",
    sortOrder: 12,
    iconName: "image",
    nameEn: "Posters",
    nameAr: "بوسترات",
    shortEn: "Indoor posters and campaign sheets.",
    shortAr: "بوسترات داخلية وأوراق حملات.",
    longEn:
      "Poster stocks from 170 gsm up to board. Colour-managed for brand campaigns hanging in malls, clinics, and offices.",
    longAr:
      "بوسترات من 170 جم حتى الكرتون المقوى. ألوان مضبوطة لحملات المولات والعيادات والمكاتب.",
  },
  {
    slug: "roller-banners",
    sortOrder: 13,
    iconName: "panel-top",
    nameEn: "Roller Banners",
    nameAr: "رول أب",
    shortEn: "Retractable stands, often same-day ready.",
    shortAr: "حاملات رول أب، غالبًا جاهزة في نفس اليوم.",
    longEn:
      "Portable pull-up banners with replaceable prints. We keep hardware in Riyadh so you are not waiting on a shipment from abroad.",
    longAr:
      "رول أب محمول مع طباعة قابلة للاستبدال. الحوامل متوفرة في الرياض فلا تنتظر شحنة من الخارج.",
  },
  {
    slug: "stickers",
    sortOrder: 14,
    iconName: "sticker",
    nameEn: "Stickers",
    nameAr: "استيكرات",
    shortEn: "Cut vinyl, sheets, and product labels.",
    shortAr: "فينيل قص وأوراق وملصقات منتجات.",
    longEn:
      "Kiss-cut sheets and plotter-cut logos. Outdoor grades for vehicles; paper labels for boxes. Shape follows the artwork, not a default rectangle.",
    longAr:
      "شيت قصّ لطيف وشعارات بلوتر. خامات خارجية للسيارات وملصقات ورق للعلب. الشكل يتبع التصميم لا مستطيلاً افتراضيًا.",
  },
];

export async function seedCategories(media?: SeedMediaAssets) {
  for (const item of categories) {
    const category = await prisma.category.upsert({
      where: { kind_slug: { kind: "PRODUCT", slug: item.slug } },
      create: {
        slug: item.slug,
        kind: "PRODUCT",
        sortOrder: item.sortOrder,
        iconName: item.iconName,
        isFeatured: true,
        status: "PUBLISHED",
        showInSitemap: true,
        legacyPath: `/product-category/${item.slug}/`,
        imageId: media?.categories[item.slug],
      },
      update: {
        sortOrder: item.sortOrder,
        iconName: item.iconName,
        isFeatured: true,
        status: "PUBLISHED",
        legacyPath: `/product-category/${item.slug}/`,
        imageId: media?.categories[item.slug],
      },
    });

    await prisma.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: category.id, locale: "EN" } },
      create: {
        categoryId: category.id,
        locale: "EN",
        name: item.nameEn,
        slug: item.slug,
        shortDescription: item.shortEn,
        longDescription: item.longEn,
        heroHeading: item.nameEn,
        heroSubheading: item.shortEn,
        metaTitle: `${item.nameEn} printing in Riyadh`,
        metaDescription: item.shortEn,
        focusKeyword: item.nameEn.toLowerCase(),
      },
      update: {
        name: item.nameEn,
        slug: item.slug,
        shortDescription: item.shortEn,
        longDescription: item.longEn,
        heroHeading: item.nameEn,
        metaTitle: `${item.nameEn} printing in Riyadh`,
        metaDescription: item.shortEn,
      },
    });

    await prisma.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: category.id, locale: "AR" } },
      create: {
        categoryId: category.id,
        locale: "AR",
        name: item.nameAr,
        slug: item.slug,
        shortDescription: item.shortAr,
        longDescription: item.longAr,
        heroHeading: item.nameAr,
        heroSubheading: item.shortAr,
        metaTitle: `طباعة ${item.nameAr} في الرياض`,
        metaDescription: item.shortAr,
        focusKeyword: item.nameAr,
      },
      update: {
        name: item.nameAr,
        slug: item.slug,
        shortDescription: item.shortAr,
        longDescription: item.longAr,
        heroHeading: item.nameAr,
        metaTitle: `طباعة ${item.nameAr} في الرياض`,
        metaDescription: item.shortAr,
      },
    });
  }
}
