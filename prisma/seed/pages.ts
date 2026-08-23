import type { Prisma, SectionType } from "@/generated/prisma/client";

import { prisma, tiptapDoc, tiptapFromBlocks } from "./helpers";
import type { SeedMediaAssets } from "./media";

type PageSeed = {
  slug: string;
  titleEn: string;
  titleAr: string;
  excerptEn: string;
  excerptAr: string;
  bodyEn: string[];
  bodyAr: string[];
};

const staticPages: PageSeed[] = [
  {
    slug: "about",
    titleEn: "About us",
    titleAr: "من نحن",
    excerptEn: "A printing company in Ghubairah, Riyadh — not a marketplace.",
    excerptAr: "مطبعة في غبيرة بالرياض — ليست سوقًا إلكترونيًا.",
    bodyEn: [
      "Riyadh Prints prints in the city: apparel, packaging, banners, cards, and large format. Quotes are written. Production starts after proof approval.",
      "Asim Kamal and Hamza Raza run the floor with a small team. There is no cart and no checkout on this site.",
    ],
    bodyAr: [
      "مطبعة الرياض تطبع داخل المدينة: ملابس، تغليف، بنرات، بطاقات، وقياس كبير. العروض مكتوبة. يبدأ التشغيل بعد اعتماد البروفة.",
      "يدير العمل أسيم كمال وحمزة رضا مع فريق صغير. لا سلة ولا دفع على هذا الموقع.",
    ],
  },
  {
    slug: "contact",
    titleEn: "Contact",
    titleAr: "تواصل",
    excerptEn: "WhatsApp, email, or the form — we answer with a date, not a chatbot.",
    excerptAr: "واتساب أو بريد أو النموذج — نرد بموعد لا بدردشة آلية.",
    bodyEn: [
      "Prince Muhammad Ibn Abd Al Rahman, Ghubairah, Riyadh 12665.",
      "WhatsApp +966 54 331 8975 · info@riyadhprints.com · Saturday–Thursday 8:00 AM–10:00 PM. Friday closed.",
    ],
    bodyAr: [
      "الأمير محمد بن عبد الرحمن، غبيرة، الرياض 12665.",
      "واتساب +966 54 331 8975 · info@riyadhprints.com · السبت–الخميس 8 ص–10 م. الجمعة مغلق.",
    ],
  },
  {
    slug: "faqs",
    titleEn: "FAQs",
    titleAr: "الأسئلة الشائعة",
    excerptEn: "Turnaround, files, delivery, and how quoting works.",
    excerptAr: "مدة التنفيذ، الملفات، التوصيل، وكيف يعمل عرض السعر.",
    bodyEn: ["If your question is not here, WhatsApp the file and the date you need it."],
    bodyAr: ["إن لم تجدوا السؤال، أرسلوا الملف والموعد على واتساب."],
  },
  {
    slug: "portfolio",
    titleEn: "Portfolio",
    titleAr: "أعمالنا",
    excerptEn: "Selected jobs printed in Riyadh.",
    excerptAr: "أعمال مختارة طُبعت في الرياض.",
    bodyEn: ["Apparel, packaging, and exhibition work. Ask for a relevant sample on WhatsApp."],
    bodyAr: ["ملابس وتغليف ومعارض. اطلبوا عينة مشابهة على واتساب."],
  },
  {
    slug: "request-a-quote",
    titleEn: "Request a quote",
    titleAr: "اطلب عرض سعر",
    excerptEn: "Size, quantity, date, and file — we reply with a number and a turnaround.",
    excerptAr: "المقاس والكمية والموعد والملف — نرد برقم ومدة تنفيذ.",
    bodyEn: ["No checkout. Attach artwork if you have it. We confirm bleed and colour on the proof."],
    bodyAr: ["لا يوجد دفع هنا. أرفقوا العمل إن وُجد. نؤكد الهدر واللون على البروفة."],
  },
  {
    slug: "shop",
    titleEn: "Shop",
    titleAr: "المتجر",
    excerptEn: "Printed in Ghubairah. Request a quote — there is no cart.",
    excerptAr: "طباعة في غبيرة. اطلب عرض سعر — لا توجد سلة.",
    bodyEn: ["Browse products, then request a quote or WhatsApp. There is no checkout."],
    bodyAr: ["تصفحوا المنتجات ثم اطلبوا عرض سعر أو واتساب. لا يوجد دفع."],
  },
  {
    slug: "privacy-policy",
    titleEn: "Privacy policy",
    titleAr: "سياسة الخصوصية",
    excerptEn: "How we use enquiry data.",
    excerptAr: "كيف نستخدم بيانات الطلبات.",
    bodyEn: [
      "Quote forms store name, contact, and files so we can reply. We do not sell lists. Analytics may run after you accept cookies.",
    ],
    bodyAr: [
      "نماذج عرض السعر تحفظ الاسم والتواصل والملفات للرد. لا نبيع القوائم. قد يعمل التحليل بعد موافقتكم على ملفات الارتباط.",
    ],
  },
  {
    slug: "refund-returns",
    titleEn: "Refund and returns",
    titleAr: "الاسترجاع والاسترداد",
    excerptEn: "Custom print is made after your proof. Faults are reprinted.",
    excerptAr: "الطباعة المخصصة تتم بعد بروفتكم. العيب يُعاد طبعه.",
    bodyEn: [
      "Approved proofs are the production reference. If we miss the spec, we reprint. Change of mind after cutting is not a refund.",
    ],
    bodyAr: [
      "البروفة المعتمدة مرجع التشغيل. إن أخفقنا في المواصفة نعيد الطبع. تغيير الرأي بعد القص ليس استردادًا.",
    ],
  },
  {
    slug: "services",
    titleEn: "Services",
    titleAr: "الخدمات",
    excerptEn: "Twelve print services with dates given in writing.",
    excerptAr: "اثنتا عشرة خدمة طباعة بمواعيد مكتوبة.",
    bodyEn: ["Choose a service, send the file, approve the proof."],
    bodyAr: ["اختاروا خدمة، أرسلوا الملف، واعتمدوا البروفة."],
  },
];

const landingPages: PageSeed[] = [
  {
    slug: "national-day-printing-riyadh",
    titleEn: "National Day printing",
    titleAr: "طباعة اليوم الوطني",
    excerptEn: "Heritage tees, cubes, and event print for 23 September.",
    excerptAr: "قمصان تراثية ومكعبات وطباعة فعاليات لـ 23 سبتمبر.",
    bodyEn: ["Order early. Same-day capacity fills in the last week of September."],
    bodyAr: ["اطلبوا مبكرًا. طاقة نفس اليوم تمتلئ في الأسبوع الأخير من سبتمبر."],
  },
  {
    slug: "printing-company-in-riyadh",
    titleEn: "Printing company in Riyadh",
    titleAr: "مطبعة في الرياض",
    excerptEn: "Local production for businesses across KSA.",
    excerptAr: "إنتاج محلي للشركات في أنحاء المملكة.",
    bodyEn: ["We print in Ghubairah and ship. We do not import a finished job the night before."],
    bodyAr: ["نطبع في غبيرة ونشحن. لا نستورد عملاً جاهزًا في الليلة السابقة."],
  },
  {
    slug: "exhibition-display-printing-in-riyadh",
    titleEn: "Exhibition display printing",
    titleAr: "طباعة العروض والمعارض",
    excerptEn: "Roll-ups, counters, and fabric graphics for stands.",
    excerptAr: "رول أب وكاونترات وقماش للبوتثات.",
    bodyEn: ["Bring stand dimensions. We quote hardware and print separately so freight is honest."],
    bodyAr: ["أحضروا مقاس البوث. نسعّر الحامل والطباعة منفصلين حتى يكون الشحن صادقًا."],
  },
  {
    slug: "custom-printing-services-riyadh",
    titleEn: "Custom printing services",
    titleAr: "خدمات طباعة مخصصة",
    excerptEn: "One purchase conversation across apparel, packaging, and signage.",
    excerptAr: "محادثة شراء واحدة للملابس والتغليف واللوحات.",
    bodyEn: ["Tell us the event date first. The product mix follows the date, not the other way around."],
    bodyAr: ["أخبرونا بموعد الفعالية أولاً. تشكيلة المنتجات تتبع الموعد لا العكس."],
  },
  {
    slug: "digital-printing-riyadh",
    titleEn: "Digital printing",
    titleAr: "طباعة رقمية",
    excerptEn: "Short runs without plate fees.",
    excerptAr: "كميات قصيرة دون تكلفة بلاكات.",
    bodyEn: ["Digital is right for versions, names, and quantities that would waste offset plates."],
    bodyAr: ["الرقمي مناسب للنسخ والأسماء والكميات التي تُهدر بلاكات الأوفست."],
  },
  {
    slug: "printing-services-riyadh",
    titleEn: "Printing services Riyadh",
    titleAr: "خدمات الطباعة في الرياض",
    excerptEn: "Cards, banners, garments, boxes — quoted, not checked out.",
    excerptAr: "بطاقات وبنرات وملابس وعلب — بعرض سعر لا بدفع سلة.",
    bodyEn: ["Start with Request a Quote or WhatsApp. We will not invent a cart."],
    bodyAr: ["ابدأوا بطلب عرض سعر أو واتساب. لن نخترع سلة."],
  },
];

async function upsertPage(seed: PageSeed, sortOrder: number) {
  const page = await prisma.page.upsert({
    where: { slug: seed.slug },
    create: {
      slug: seed.slug,
      status: "PUBLISHED",
      publishedAt: new Date(),
      sortOrder,
      showInSitemap: true,
      template: "default",
      legacyPath: seed.slug === "home" ? "/" : seed.slug === "shop" ? "/shop/" : `/${seed.slug}/`,
    },
    update: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      sortOrder,
      showInSitemap: true,
      legacyPath: seed.slug === "home" ? "/" : seed.slug === "shop" ? "/shop/" : `/${seed.slug}/`,
    },
  });

  await prisma.pageTranslation.upsert({
    where: { pageId_locale: { pageId: page.id, locale: "EN" } },
    create: {
      pageId: page.id,
      locale: "EN",
      title: seed.titleEn,
      slug: seed.slug,
      excerpt: seed.excerptEn,
      content: tiptapDoc(...seed.bodyEn),
      metaTitle: seed.titleEn,
      metaDescription: seed.excerptEn,
    },
    update: {
      title: seed.titleEn,
      slug: seed.slug,
      excerpt: seed.excerptEn,
      content: tiptapDoc(...seed.bodyEn),
      metaTitle: seed.titleEn,
      metaDescription: seed.excerptEn,
    },
  });

  await prisma.pageTranslation.upsert({
    where: { pageId_locale: { pageId: page.id, locale: "AR" } },
    create: {
      pageId: page.id,
      locale: "AR",
      title: seed.titleAr,
      slug: seed.slug,
      excerpt: seed.excerptAr,
      content: tiptapDoc(...seed.bodyAr),
      metaTitle: seed.titleAr,
      metaDescription: seed.excerptAr,
    },
    update: {
      title: seed.titleAr,
      slug: seed.slug,
      excerpt: seed.excerptAr,
      content: tiptapDoc(...seed.bodyAr),
      metaTitle: seed.titleAr,
      metaDescription: seed.excerptAr,
    },
  });

  return page;
}

async function replaceSections(
  pageId: string,
  sections: {
    type: SectionType;
    settings: Prisma.InputJsonValue;
    dataEn: Prisma.InputJsonValue;
    dataAr: Prisma.InputJsonValue;
  }[],
) {
  await prisma.section.deleteMany({ where: { pageId } });

  for (const [index, section] of sections.entries()) {
    const row = await prisma.section.create({
      data: {
        pageId,
        type: section.type,
        sortOrder: index,
        isVisible: true,
        settings: section.settings,
      },
    });
    await prisma.sectionTranslation.create({
      data: { sectionId: row.id, locale: "EN", data: section.dataEn },
    });
    await prisma.sectionTranslation.create({
      data: { sectionId: row.id, locale: "AR", data: section.dataAr },
    });
  }
}

async function seedShopSections(pageId: string) {
  await replaceSections(pageId, [
    {
      type: "RICH_TEXT",
      settings: { padding: "md" },
      dataEn: {
        heading: "",
        body: tiptapFromBlocks([
          {
            type: "h2",
            text: "Riyadh's most trusted print shop for businesses and individuals",
          },
          {
            type: "p",
            text: "From KAFD to Olaya and Tahlia Street, we print in Ghubairah and quote in writing. Apparel, packaging, banners, cards, and large format — no cart, no checkout.",
          },
          { type: "h2", text: "Why Riyadh Prints is the print shop in Riyadh" },
          {
            type: "ul",
            items: [
              "Commercial printing from a floor in the city, not a last-minute import.",
              "CMYK colour-managed proofs before anything runs.",
              "Same-day production on selected cards, flyers, and banners when the file is ready.",
              "A number and a date you can hold — WhatsApp or the quote form.",
            ],
          },
          { type: "h2", text: "Everything you need from one print shop" },
          {
            type: "p",
            text: "Business print, marketing and promotional print, packaging, and apparel sit on the same quote. Pick a product above, send the spec, and we proof then print.",
          },
        ]),
      },
      dataAr: {
        heading: "",
        body: tiptapFromBlocks([
          { type: "h2", text: "مطبعة الرياض الموثوقة للشركات والأفراد" },
          {
            type: "p",
            text: "من كافد إلى العليا وشارع التحلية نطبع في غبيرة ونكتب العرض. ملابس وتغليف وبنرات وبطاقات وعرض كبير — بلا سلة وبلا دفع.",
          },
          { type: "h2", text: "لماذا مطبعة الرياض في الرياض" },
          {
            type: "ul",
            items: [
              "طباعة تجارية من مطبعة داخل المدينة لا استيرادًا في آخر لحظة.",
              "بروفات ألوان CMYK قبل أي تشغيل.",
              "إنتاج في نفس اليوم لبطاقات وفلايرات وبنرات مختارة إن كان الملف جاهزًا.",
              "رقم وموعد يمكنكم الاعتماد عليه — واتساب أو نموذج العرض.",
            ],
          },
          { type: "h2", text: "كل ما تحتاجونه من مطبعة واحدة" },
          {
            type: "p",
            text: "طباعة الأعمال والتسويق والتغليف والملابس في عرض واحد. اختاروا منتجًا أعلاه وأرسلوا المواصفة، نثبت البروفة ثم نطبع.",
          },
        ]),
      },
    },
  ]);
}

export async function seedShopPage() {
  const seed = staticPages.find((page) => page.slug === "shop");
  if (!seed) {
    return;
  }
  const shop = await upsertPage(seed, staticPages.findIndex((page) => page.slug === "shop") + 1);
  await seedShopSections(shop.id);
}

async function mediaIdByPathname(pathname: string): Promise<string> {
  const row = await prisma.media.findFirst({ where: { pathname }, select: { id: true } });
  return row?.id ?? "";
}

export async function seedAboutPage(media?: SeedMediaAssets) {
  const seed = staticPages.find((page) => page.slug === "about");
  if (!seed) {
    return;
  }
  const page = await upsertPage(seed, staticPages.findIndex((page) => page.slug === "about") + 1);
  await prisma.page.update({
    where: { id: page.id },
    data: { template: "sections" },
  });

  const pick = media?.processPick.id ?? (await mediaIdByPathname("seed/process-pick-product.webp"));
  const custom = media?.processCustom.id ?? (await mediaIdByPathname("seed/process-custom-print.webp"));
  const rest = media?.processRest.id ?? (await mediaIdByPathname("seed/process-print-floor.webp"));
  const kickstart = media?.kickstart.id ?? (await mediaIdByPathname("seed/kickstart-print-shop.webp"));

  await replaceSections(page.id, [
    {
      type: "IMAGE_TEXT",
      settings: { appearance: "story", mediaSide: "start", padding: "lg" },
      dataEn: {
        eyebrow: "About Riyadh Prints",
        heading: "Your Trusted **Printing Partner** in Riyadh",
        body: "Riyadh Prints is a professional printing company based in Riyadh, Saudi Arabia. We specialize in delivering high-quality custom printing solutions for businesses, event organizers, and individuals across the Kingdom.",
        cta: "See our products",
        href: "/shop",
        statValue: "500+",
        statLabel: "Customers Across KSA",
        items: [
          { title: "Custom printing for businesses and individuals" },
          { title: "Same-day and express printing available in Riyadh" },
          { title: "Premium quality materials and advanced printing technology" },
          { title: "Delivery across Riyadh, Jeddah, Dammam, and all KSA" },
          { title: "No minimum order – print 1 or 10,000" },
        ],
      },
      dataAr: {
        eyebrow: "عن مطبعة الرياض",
        heading: "شريككم **الموثوق للطباعة** في الرياض",
        body: "مطبعة الرياض شركة طباعة محترفة في الرياض بالمملكة العربية السعودية. نتخصص في حلول طباعة مخصصة عالية الجودة للشركات ومنظمي الفعاليات والأفراد في أنحاء المملكة.",
        cta: "شاهدوا منتجاتنا",
        href: "/ar/shop",
        statValue: "+500",
        statLabel: "عملاء في أنحاء المملكة",
        items: [
          { title: "طباعة مخصصة للشركات والأفراد" },
          { title: "طباعة في نفس اليوم وطباعة عاجلة في الرياض" },
          { title: "خامات ممتازة وتقنيات طباعة متقدمة" },
          { title: "توصيل في الرياض وجدة والدمام وجميع مناطق المملكة" },
          { title: "بدون حد أدنى — اطبعوا نسخة أو 10,000" },
        ],
      },
    },
    {
      type: "STEPS",
      settings: { alignment: "center", padding: "lg" },
      dataEn: {
        heading: "How to Order with **Riyadh Prints**",
        subheading:
          "Whether you need business cards, banners, or custom t-shirts, ordering with Riyadh Prints is quick and easy.",
        steps: [
          {
            title: "Pick your product",
            body: "Browse our [shop](/shop) or tell us what you need via WhatsApp. We offer business cards, banners, t-shirts, packaging, wristbands, vehicle branding, brochures, posters, and more.",
            mediaId: pick,
          },
          {
            title: "Share your design",
            body: "Upload your artwork or let our design team create something custom for you. We accept PNG, JPG, PDF, AI, and SVG files. We'll send a digital proof for your approval before printing.",
            mediaId: custom,
          },
          {
            title: "We Print & Deliver",
            body: "Once approved, we produce your order using advanced printing technology and deliver it to your doorstep. Same-day delivery available in Riyadh, express shipping across KSA.",
            mediaId: rest,
          },
        ],
      },
      dataAr: {
        heading: "كيف تطلبون من **مطبعة الرياض**",
        subheading: "سواء احتجتم بطاقات أعمال أو بنرات أو تيشيرتات مخصصة، الطلب من مطبعة الرياض سريع وواضح.",
        steps: [
          {
            title: "اختاروا المنتج",
            body: "تصفحوا [المتجر](/ar/shop) أو أخبرونا بما تحتاجون عبر واتساب. نقدّم بطاقات أعمال وبنرات وتيشيرتات وتغليف وأساور وعلامات سيارات وبروشورات وبوسترات والمزيد.",
            mediaId: pick,
          },
          {
            title: "شاركوا التصميم",
            body: "ارفعوا العمل الفني أو دعوا فريق التصميم يعدّ شيئًا مخصصًا. نقبل ملفات PNG وJPG وPDF وAI وSVG. نرسل بروفة رقمية لاعتمادكم قبل الطباعة.",
            mediaId: custom,
          },
          {
            title: "نطبع ونوصل",
            body: "بعد الاعتماد ننتج الطلب بتقنيات طباعة متقدمة ونوصله إلى بابكم. توصيل في نفس اليوم في الرياض، وشحن سريع في أنحاء المملكة.",
            mediaId: rest,
          },
        ],
      },
    },
    {
      type: "USP_GRID",
      settings: { appearance: "split", padding: "lg" },
      dataEn: {
        eyebrow: "Why choose us",
        heading: "Professional Printing Services **You Can Trust** in Riyadh",
        body: "We combine advanced printing technology with premium materials to deliver results that help your brand stand out. From small orders to large-scale projects, every print is handled with precision and care.",
        cta: "Learn more",
        href: "/request-a-quote",
        items: [
          { title: "Professional & experienced printing team" },
          { title: "Competitive pricing with no hidden costs", highlight: true },
          { title: "Sharp, vibrant, and accurate printing quality" },
          { title: "Free delivery in Riyadh with KSA-wide shipping" },
          { title: "Dedicated support via WhatsApp and in-store" },
        ],
      },
      dataAr: {
        eyebrow: "لماذا تختاروننا",
        heading: "خدمات طباعة احترافية **يمكنكم الوثوق بها** في الرياض",
        body: "نجمع تقنيات طباعة متقدمة مع خامات ممتازة لنتائج تُبرز علامتكم. من الطلبات الصغيرة إلى المشاريع الكبيرة، كل طبعة تُنفَّذ بدقة وعناية.",
        cta: "اعرفوا المزيد",
        href: "/ar/request-a-quote",
        items: [
          { title: "فريق طباعة محترف وخبير" },
          { title: "أسعار تنافسية بلا تكاليف مخفية", highlight: true },
          { title: "جودة طباعة حادة ونابضة ودقيقة" },
          { title: "توصيل مجاني في الرياض وشحن لجميع مناطق المملكة" },
          { title: "دعم مخصص عبر واتساب وفي المطبعة" },
        ],
      },
    },
    {
      type: "CTA_BANNER",
      settings: {
        variant: "inverse",
        layout: "showcase",
        leftImageId: custom || null,
        rightImageId: kickstart || null,
        padding: "lg",
      },
      dataEn: {
        secondary: "Printed and shipped on demand!",
        heading: "Ready to buy in bulk & save up to 30%?",
        cta: "Explore More",
        href: "/shop",
      },
      dataAr: {
        secondary: "طباعة وشحن حسب الطلب!",
        heading: "جاهزون للشراء بالجملة وتوفير حتى 30٪؟",
        cta: "استكشفوا المزيد",
        href: "/ar/shop",
      },
    },
    {
      type: "GALLERY",
      settings: { appearance: "people", alignment: "center", padding: "lg" },
      dataEn: {
        eyebrow: "Our team",
        heading: "We are the best **team!**",
        items: [
          { title: "Hamza Raza", caption: "Founder & CEO", alt: "Hamza Raza", mediaId: "" },
          {
            title: "Asim Kamal",
            caption: "Chief Operating Officer / Software Engineer",
            alt: "Asim Kamal",
            mediaId: "",
          },
        ],
      },
      dataAr: {
        eyebrow: "فريقنا",
        heading: "نحن **الفريق** الأفضل!",
        items: [
          { title: "حمزة رضا", caption: "المؤسس والرئيس التنفيذي", alt: "حمزة رضا", mediaId: "" },
          {
            title: "أسيم كمال",
            caption: "الرئيس التنفيذي للعمليات / مهندس برمجيات",
            alt: "أسيم كمال",
            mediaId: "",
          },
        ],
      },
    },
  ]);
}

export async function seedPages(media?: SeedMediaAssets) {
  const home = await upsertPage(
    {
      slug: "home",
      titleEn: "Riyadh Prints",
      titleAr: "مطبعة الرياض",
      excerptEn: "Same-day printing in Riyadh for businesses across KSA.",
      excerptAr: "طباعة في نفس اليوم في الرياض للشركات في أنحاء المملكة.",
      bodyEn: ["Request a quote or WhatsApp. There is no cart."],
      bodyAr: ["اطلبوا عرض سعر أو واتساب. لا توجد سلة."],
    },
    0,
  );

  for (const [index, page] of staticPages.entries()) {
    await upsertPage(page, index + 1);
  }
  for (const [index, page] of landingPages.entries()) {
    await upsertPage(page, 20 + index);
  }

  const contactPage = await prisma.page.findUnique({ where: { slug: "contact" } });
  if (contactPage) {
    await prisma.section.deleteMany({ where: { pageId: contactPage.id } });
    const form = await prisma.section.create({
      data: {
        pageId: contactPage.id,
        type: "CONTACT_FORM",
        sortOrder: 0,
        isVisible: true,
        settings: { variant: "contact" },
      },
    });
    await prisma.sectionTranslation.createMany({
      data: [
        {
          sectionId: form.id,
          locale: "EN",
          data: { heading: "Send a message", submit: "Submit" },
        },
        {
          sectionId: form.id,
          locale: "AR",
          data: { heading: "أرسلوا رسالة", submit: "إرسال" },
        },
      ],
    });
  }

  const quotePage = await prisma.page.findUnique({ where: { slug: "request-a-quote" } });
  if (quotePage) {
    await prisma.section.deleteMany({ where: { pageId: quotePage.id } });
    const form = await prisma.section.create({
      data: {
        pageId: quotePage.id,
        type: "CONTACT_FORM",
        sortOrder: 0,
        isVisible: true,
        settings: { variant: "quote" },
      },
    });
    await prisma.sectionTranslation.createMany({
      data: [
        {
          sectionId: form.id,
          locale: "EN",
          data: { heading: "Request a quote", submit: "Send quote request" },
        },
        {
          sectionId: form.id,
          locale: "AR",
          data: { heading: "طلب عرض سعر", submit: "إرسال الطلب" },
        },
      ],
    });
  }

  await seedShopPage();
  await seedAboutPage(media);

  const hero1 = media?.heroCampaign.id ?? "";
  const hero2 = media?.heroStudio.id ?? "";
  const pick = media?.processPick.id ?? "";
  const custom = media?.processCustom.id ?? "";
  const rest = media?.processRest.id ?? "";
  const kickstart = media?.kickstart.id ?? "";

  await replaceSections(home.id, [
    {
      type: "HERO",
      settings: {
        layout: "overlay",
        cta: "quote",
        imageId: hero1 || null,
        padding: "none",
        container: "full",
      },
      dataEn: {
        eyebrow: "Trusted by 240+ businesses in KSA",
        heading: "Printing Services **Riyadh**",
        subheading:
          "Same-day printing across Riyadh — business cards, banners, posters, packaging, and apparel. Quoted first, printed in Ghubairah.",
        primaryCta: "Request a quote",
        secondaryCta: "WhatsApp",
        primaryHref: "/request-a-quote",
        slides: [
          {
            heading: "Printing Services **Riyadh**",
            subheading: "Heritage campaigns, event print, and same-day cards when the file is ready.",
            cta: "Browse products",
            href: "/shop",
            mediaId: hero1,
          },
          {
            heading: "Printing Services **Riyadh**",
            subheading: "Send the spec on WhatsApp. We reply with a number and a date you can hold.",
            cta: "Request a quote",
            href: "/request-a-quote",
            mediaId: hero2,
          },
        ],
      },
      dataAr: {
        eyebrow: "موثوقون لدى أكثر من 240 شركة في المملكة",
        heading: "خدمات الطباعة في **الرياض**",
        subheading:
          "طباعة في نفس اليوم عبر الرياض — بطاقات وبنرات وبوسترات وتغليف وملابس. عرض سعر أولاً، والطباعة في غبيرة.",
        primaryCta: "اطلب عرض سعر",
        secondaryCta: "واتساب",
        primaryHref: "/ar/request-a-quote",
        slides: [
          {
            heading: "خدمات الطباعة في **الرياض**",
            subheading: "حملات تراثية وطباعة فعاليات وبطاقات في نفس اليوم إن كان الملف جاهزًا.",
            cta: "تصفح المنتجات",
            href: "/ar/shop",
            mediaId: hero1,
          },
          {
            heading: "خدمات الطباعة في **الرياض**",
            subheading: "أرسلوا المواصفة على واتساب. نرد برقم وموعد تمسكونه.",
            cta: "اطلب عرض سعر",
            href: "/ar/request-a-quote",
            mediaId: hero2,
          },
        ],
      },
    },
    {
      type: "STATS",
      settings: { alignment: "center", padding: "sm" },
      dataEn: { heading: "" },
      dataAr: { heading: "" },
    },
    {
      type: "USP_GRID",
      settings: { columns: 4, appearance: "bar", alignment: "center", padding: "sm" },
      dataEn: {
        items: [
          { title: "Fast delivery", body: "Quick turnaround across Riyadh." },
          { title: "Free design support", body: "Layout help on the quote." },
          { title: "Clear pricing", body: "A written number before we print." },
          { title: "Same-day option", body: "Available on selected orders." },
        ],
      },
      dataAr: {
        items: [
          { title: "توصيل سريع", body: "تنفيذ سريع داخل الرياض." },
          { title: "دعم تصميم", body: "مساعدة إخراج ضمن العرض." },
          { title: "تسعير واضح", body: "رقم مكتوب قبل الطباعة." },
          { title: "خيار نفس اليوم", body: "متاح لطلبات مختارة." },
        ],
      },
    },
    {
      type: "SERVICE_GRID",
      settings: { featuredOnly: true, limit: 4, alignment: "center" },
      dataEn: {
        heading: "Printing services in **Riyadh**",
        subheading: "Business cards, banners, packaging, and apparel — we proof first, then print to a date you can hold.",
      },
      dataAr: {
        heading: "خدمات الطباعة في **الرياض**",
        subheading: "بطاقات وبنرات وتغليف وملابس — البروفة أولاً، ثم نطبع في موعد يمكنكم الاعتماد عليه.",
      },
    },
    {
      type: "USP_GRID",
      settings: { columns: 4, appearance: "numbered", alignment: "center" },
      dataEn: {
        heading: "Why choose us in **Riyadh**",
        items: [
          { title: "Same-day printing", body: "Cards, flyers, and selected banners when the file is ready." },
          { title: "Printed in the city", body: "Ghubairah production — not a last-minute import." },
          { title: "Proof first", body: "Nothing runs until you sign off." },
          { title: "Quote, not a cart", body: "WhatsApp or the form. We reply with a number and a date." },
        ],
      },
      dataAr: {
        heading: "لماذا تختاروننا في **الرياض**",
        items: [
          { title: "طباعة في نفس اليوم", body: "بطاقات وفلايرات وبنرات مختارة إن كان الملف جاهزًا." },
          { title: "طباعة داخل المدينة", body: "إنتاج في غبيرة — ليست استيرادًا في آخر لحظة." },
          { title: "البروفة أولاً", body: "لا تشغيل قبل اعتمادكم." },
          { title: "عرض سعر لا سلة", body: "واتساب أو النموذج. نرد برقم وموعد." },
        ],
      },
    },
    {
      type: "CTA_BANNER",
      settings: { variant: "inverse", alignment: "center" },
      dataEn: {
        heading: "Start your print order",
        cta: "Get a free quote",
        secondary: "Send the file. We reply with a number and a date.",
        href: "/request-a-quote",
      },
      dataAr: {
        heading: "ابدأوا طلبكم",
        cta: "اطلب عرض سعر",
        secondary: "أرسلوا الملف. نرد برقم وموعد.",
        href: "/ar/request-a-quote",
      },
    },
    {
      type: "CATEGORY_GRID",
      settings: { kind: "PRODUCT", limit: 8, alignment: "center" },
      dataEn: {
        heading: "Explore print categories",
        subheading: "Apparel, packaging, banners, cards, and more — all quoted from the same floor.",
      },
      dataAr: {
        heading: "تصفحوا التصنيفات",
        subheading: "ملابس وتغليف وبنرات وبطاقات — كلها بعرض سعر من المطبعة نفسها.",
      },
    },
    {
      type: "STEPS",
      settings: { alignment: "center" },
      dataEn: {
        heading: "How a print job works",
        subheading: "Pick a product, send the file, and we print and deliver from Ghubairah.",
        steps: [
          {
            title: "Pick your product",
            body: "Tees, mugs, totes, cards, banners — start with the item and the date you need it.",
            mediaId: pick,
          },
          {
            title: "Custom print: boxes, cards & more",
            body: "We proof brand colours and finishing so the run matches what you signed off.",
            mediaId: custom,
          },
          {
            title: "Leave the rest to us",
            body: "Once the proof is approved, the floor prints and we arrange pickup or KSA delivery.",
            mediaId: rest,
          },
        ],
      },
      dataAr: {
        heading: "كيف تتم الطباعة",
        subheading: "اختاروا المنتج، أرسلوا الملف، ونطبع ونسلّم من غبيرة.",
        steps: [
          {
            title: "اختاروا المنتج",
            body: "تيشيرتات وأكواب وحقائب وبطاقات وبنرات — ابدأوا بالمنتج والموعد.",
            mediaId: pick,
          },
          {
            title: "طباعة مخصصة: علب وبطاقات والمزيد",
            body: "نثبت ألوان العلامة والتشطيب حتى يطابق التشغيل ما اعتمدتموه.",
            mediaId: custom,
          },
          {
            title: "الباقي علينا",
            body: "بعد اعتماد البروفة نطبع ونرتب الاستلام أو التوصيل داخل المملكة.",
            mediaId: rest,
          },
        ],
      },
    },
    {
      type: "FEATURED_PRODUCTS",
      settings: { limit: 4, alignment: "center" },
      dataEn: {
        heading: "Featured **printing** in Riyadh",
        subheading: "Starting prices on the card. The quote is final after files and quantity.",
      },
      dataAr: {
        heading: "منتجات **طباعة** مختارة في الرياض",
        subheading: "أسعار البداية على البطاقة. العرض النهائي بعد الملفات والكمية.",
      },
    },
    {
      type: "IMAGE_TEXT",
      settings: { mediaSide: "end", imageId: kickstart || null },
      dataEn: {
        heading: "Kickstart your printing with **Riyadh Prints**",
        body: "Premium stocks, colour-managed proofs, and a floor that answers on WhatsApp. Use the quote form or chat — there is no cart.",
        cta: "Request a quote",
        href: "/request-a-quote",
      },
      dataAr: {
        heading: "ابدأوا الطباعة مع **مطبعة الرياض**",
        body: "خامات جيدة، بروفات ألوان مضبوطة، ومطبعة ترد على واتساب. النموذج أو المحادثة — لا سلة.",
        cta: "اطلب عرض سعر",
        href: "/ar/request-a-quote",
      },
    },
    {
      type: "PARTNERS",
      settings: { alignment: "center", background: "muted" },
      dataEn: { heading: "Partners" },
      dataAr: { heading: "شركاؤنا" },
    },
    {
      type: "TESTIMONIALS",
      settings: { limit: 4, alignment: "center" },
      dataEn: { heading: "**Here's what** our clients say" },
      dataAr: { heading: "**ماذا يقول** عملاؤنا" },
    },
    {
      type: "CTA_BANNER",
      settings: { variant: "inverse", alignment: "center" },
      dataEn: {
        heading: "Ready to print in bulk? Request a quote or WhatsApp us.",
        cta: "Request a quote",
        secondary: "Printed and shipped from Riyadh — quickly, without a checkout.",
        href: "/request-a-quote",
      },
      dataAr: {
        heading: "جاهزون للطباعة بكميات؟ اطلبوا عرض سعر أو واتساب.",
        cta: "اطلب عرض سعر",
        secondary: "طباعة وشحن من الرياض — بسرعة ومن دون سلة.",
        href: "/ar/request-a-quote",
      },
    },
    {
      type: "FAQ",
      settings: { scope: "GLOBAL", alignment: "center" },
      dataEn: { heading: "Questions before you order" },
      dataAr: { heading: "أسئلة قبل الطلب" },
    },
  ]);
}
