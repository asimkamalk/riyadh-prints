import type { Prisma, SectionType } from "@/generated/prisma/client";

import { prisma, tiptapDoc } from "./helpers";

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
      legacyPath: seed.slug === "home" ? "/" : `/${seed.slug}/`,
    },
    update: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      sortOrder,
      showInSitemap: true,
      legacyPath: seed.slug === "home" ? "/" : `/${seed.slug}/`,
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

export async function seedPages() {
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

  await replaceSections(home.id, [
    {
      type: "HERO",
      settings: { layout: "split", cta: "quote" },
      dataEn: {
        heading: "Printing in Riyadh, finished on a date you can hold",
        subheading: "Apparel, packaging, banners, and cards — quoted on WhatsApp, printed in Ghubairah.",
        primaryCta: "Request a quote",
        secondaryCta: "WhatsApp",
      },
      dataAr: {
        heading: "طباعة في الرياض تُسلَّم في موعد تمسكونه",
        subheading: "ملابس وتغليف وبنرات وبطاقات — عرض عبر واتساب، طباعة في غبيرة.",
        primaryCta: "اطلب عرض سعر",
        secondaryCta: "واتساب",
      },
    },
    {
      type: "USP_GRID",
      settings: { columns: 4 },
      dataEn: {
        items: [
          { title: "Printed in Riyadh", body: "Not a last-minute import." },
          { title: "Same-day options", body: "Cards, flyers, selected banners." },
          { title: "Proof first", body: "Nothing runs until you sign off." },
          { title: "No cart", body: "Quote and WhatsApp only." },
        ],
      },
      dataAr: {
        items: [
          { title: "طباعة في الرياض", body: "ليست استيرادًا في آخر لحظة." },
          { title: "خيار نفس اليوم", body: "بطاقات وفلايرات وبنرات مختارة." },
          { title: "البروفة أولاً", body: "لا تشغيل قبل اعتمادكم." },
          { title: "لا سلة", body: "عرض سعر وواتساب فقط." },
        ],
      },
    },
    {
      type: "SERVICE_GRID",
      settings: { featuredOnly: true, limit: 6 },
      dataEn: { heading: "Services", subheading: "Dates in writing after the proof." },
      dataAr: { heading: "الخدمات", subheading: "مواعيد مكتوبة بعد البروفة." },
    },
    {
      type: "CATEGORY_GRID",
      settings: { kind: "PRODUCT", limit: 15 },
      dataEn: { heading: "Shop by category", subheading: "Slugs match the current catalogue URLs." },
      dataAr: { heading: "تصفح حسب التصنيف", subheading: "الروابط تطابق الموقع الحالي." },
    },
    {
      type: "FEATURED_PRODUCTS",
      settings: { limit: 8 },
      dataEn: { heading: "Featured print", subheading: "Starting prices; final quote after files." },
      dataAr: { heading: "منتجات مختارة", subheading: "أسعار بداية؛ العرض النهائي بعد الملفات." },
    },
    {
      type: "IMAGE_TEXT",
      settings: { mediaSide: "end" },
      dataEn: {
        heading: "Printed in the city",
        body: "Ghubairah production for Riyadh pickup and KSA freight. You speak to the people who run the press.",
      },
      dataAr: {
        heading: "طباعة داخل المدينة",
        body: "إنتاج في غبيرة للاستلام في الرياض والشحن داخل المملكة. تتحدثون مع من يشغّل المطبعة.",
      },
    },
    {
      type: "IMAGE_TEXT",
      settings: { mediaSide: "start" },
      dataEn: {
        heading: "Same-day when the file is ready",
        body: "Urgent cards and selected banners. Capacity is finite — we will say no if the press is already booked.",
      },
      dataAr: {
        heading: "نفس اليوم إن كان الملف جاهزًا",
        body: "بطاقات عاجلة وبنرات مختارة. الطاقة محدودة — نقول لا إن كانت المطبعة محجوزة.",
      },
    },
    {
      type: "IMAGE_TEXT",
      settings: { mediaSide: "end" },
      dataEn: {
        heading: "Layout help, not a mystery fee",
        body: "If you have no designer, we set type and send a proof. That work is on the quote, not added at the cutter.",
      },
      dataAr: {
        heading: "مساعدة إخراج بلا رسوم غامضة",
        body: "إن لم يكن لديكم مصمم نرتب النص ونرسل بروفة. هذا العمل في العرض لا عند القص.",
      },
    },
    {
      type: "STATS",
      settings: {},
      dataEn: { heading: "Work already in the Kingdom" },
      dataAr: { heading: "عمل قائم في المملكة" },
    },
    {
      type: "PARTNERS",
      settings: {},
      dataEn: { heading: "Trusted on campaigns and fleets" },
      dataAr: { heading: "موثوقون في الحملات والأساطيل" },
    },
    {
      type: "TESTIMONIALS",
      settings: { limit: 6 },
      dataEn: { heading: "What clients send after delivery" },
      dataAr: { heading: "ما يرسله العملاء بعد التسليم" },
    },
    {
      type: "CTA_BANNER",
      settings: { variant: "accent" },
      dataEn: {
        heading: "Send the file. Get a number and a date.",
        cta: "Request a quote",
        secondary: "WhatsApp +966 54 331 8975",
      },
      dataAr: {
        heading: "أرسلوا الملف. خذوا رقمًا وموعدًا.",
        cta: "اطلب عرض سعر",
        secondary: "واتساب +966 54 331 8975",
      },
    },
    {
      type: "FAQ",
      settings: { scope: "GLOBAL" },
      dataEn: { heading: "Questions before you order" },
      dataAr: { heading: "أسئلة قبل الطلب" },
    },
  ]);
}
