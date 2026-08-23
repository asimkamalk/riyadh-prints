import type { Prisma } from "@/generated/prisma/client";

import type { SeedMediaAssets } from "./media";
import { prisma, upsertMedia } from "./helpers";

const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Prince+Muhammad+Ibn+Abd+Al+Rahman%2C+Ghubairah%2C+Riyadh+12665";

const HOURS = {
  timezone: "Asia/Riyadh",
  en: "Saturday – Thursday: 8:00 AM – 10:00 PM. Friday: Closed.",
  ar: "السبت – الخميس: 8:00 صباحًا – 10:00 مساءً. الجمعة: مغلق.",
  days: [
    { day: "saturday", open: "08:00", close: "22:00" },
    { day: "sunday", open: "08:00", close: "22:00" },
    { day: "monday", open: "08:00", close: "22:00" },
    { day: "tuesday", open: "08:00", close: "22:00" },
    { day: "wednesday", open: "08:00", close: "22:00" },
    { day: "thursday", open: "08:00", close: "22:00" },
    { day: "friday", closed: true },
  ],
};

async function setting(key: string, group: string, value: Prisma.InputJsonValue) {
  await prisma.siteSetting.upsert({
    where: { key },
    create: { key, group, value },
    update: { group, value },
  });
}

export async function seedSettings(media?: SeedMediaAssets) {
  const og = await upsertMedia({
    pathname: "seed/og-default.jpg",
    url: "https://riyadhprints.com/wp-content/uploads/2025/12/3-min-1-scaled-1170x630.jpg",
    mimeType: "image/jpeg",
    width: 1170,
    height: 630,
    altEn: "Custom printing in Riyadh by Riyadh Prints",
    altAr: "طباعة مخصصة في الرياض من مطبعة الرياض",
  });

  await setting("company.name", "general", {
    en: "Riyadh Prints",
    ar: "مطبعة الرياض",
  });
  await setting("company.tagline", "general", {
    en: "Same-day printing in Riyadh — apparel, packaging, banners, and stationery.",
    ar: "طباعة في نفس اليوم في الرياض — ملابس، تغليف، بنرات، وقرطاسية.",
  });
  await setting("contact.whatsapp", "contact", "+966543318975");
  await setting("contact.phone", "contact", "+966543318975");
  await setting("contact.email", "contact", "info@riyadhprints.com");
  await setting("contact.address", "contact", {
    en: "Prince Muhammad Ibn Abd Al Rahman, Ghubairah, Riyadh 12665, Saudi Arabia",
    ar: "الأمير محمد بن عبد الرحمن، غبيرة، الرياض 12665، المملكة العربية السعودية",
  });
  await setting("contact.mapsUrl", "contact", MAPS_URL);
  await setting("contact.hours", "contact", HOURS);
  await setting("social.facebook", "social", "https://www.facebook.com/riyadhprintss");
  await setting("social.instagram", "social", "https://www.instagram.com/riyadhprintss/");
  await setting("social.linkedin", "social", "https://www.linkedin.com/company/riyadh-prints");
  await setting("social.pinterest", "social", "https://www.pinterest.com/riyadhprintss/");
  await setting("social.x", "social", "https://x.com/riyadhprintss");
  await setting("seo.metaTitleTemplate", "seo", "%s | Riyadh Prints");
  await setting("seo.defaultOgImageId", "seo", og.id);
  await setting("seo.defaultOgImageUrl", "seo", og.url);
  await setting("scripts.ga4Id", "scripts", "G-XXXXXXXX");
  await setting("integrations.whatsapp", "integrations", {
    number: "+966543318975",
    defaultMessage: {
      en: "Hello Riyadh Prints, I would like a quote.",
      ar: "مرحباً مطبعة الرياض، أريد عرض سعر.",
    },
  });

  await seedLocation();
  await seedStats();
  await seedPartners(media);
  await seedTestimonials();

  return { ogImageId: og.id };
}

async function seedLocation() {
  const existing = await prisma.location.findFirst({ where: { isPrimary: true } });
  const location = existing
    ? await prisma.location.update({
        where: { id: existing.id },
        data: {
          phone: "+966543318975",
          whatsapp: "+966543318975",
          email: "info@riyadhprints.com",
          googleMapsUrl: MAPS_URL,
          hours: HOURS,
          isVisible: true,
          isPrimary: true,
        },
      })
    : await prisma.location.create({
        data: {
          isPrimary: true,
          phone: "+966543318975",
          whatsapp: "+966543318975",
          email: "info@riyadhprints.com",
          googleMapsUrl: MAPS_URL,
          hours: HOURS,
          isVisible: true,
        },
      });

  await prisma.locationTranslation.upsert({
    where: { locationId_locale: { locationId: location.id, locale: "EN" } },
    create: {
      locationId: location.id,
      locale: "EN",
      name: "Riyadh Prints",
      slug: "riyadh-prints",
      addressLine1: "Prince Muhammad Ibn Abd Al Rahman",
      city: "Riyadh",
      region: "Riyadh",
      postalCode: "12665",
      country: "Saudi Arabia",
      metaTitle: "Contact Riyadh Prints",
    },
    update: {
      name: "Riyadh Prints",
      addressLine1: "Prince Muhammad Ibn Abd Al Rahman",
      city: "Riyadh",
      postalCode: "12665",
    },
  });

  await prisma.locationTranslation.upsert({
    where: { locationId_locale: { locationId: location.id, locale: "AR" } },
    create: {
      locationId: location.id,
      locale: "AR",
      name: "مطبعة الرياض",
      slug: "matbaat-alriyadh",
      addressLine1: "الأمير محمد بن عبد الرحمن",
      city: "الرياض",
      region: "الرياض",
      postalCode: "12665",
      country: "المملكة العربية السعودية",
      metaTitle: "تواصل مع مطبعة الرياض",
    },
    update: {
      name: "مطبعة الرياض",
      addressLine1: "الأمير محمد بن عبد الرحمن",
      city: "الرياض",
    },
  });
}

async function seedStats() {
  const stats = [
    { value: "240", suffix: "+", sortOrder: 0, iconName: "building-2", en: "Trusted clients", ar: "عميل يثق بنا" },
    { value: "4", suffix: "+", sortOrder: 1, iconName: "calendar", en: "Years in Riyadh", ar: "سنوات في الرياض" },
    { value: "50", suffix: "+", sortOrder: 2, iconName: "package", en: "Products available", ar: "منتج متاح" },
    { value: "Same day", suffix: "", sortOrder: 3, iconName: "zap", en: "Delivery available", ar: "توصيل متاح" },
  ];

  for (const stat of stats) {
    const existing = await prisma.stat.findFirst({ where: { sortOrder: stat.sortOrder } });
    const row = existing
      ? await prisma.stat.update({
          where: { id: existing.id },
          data: { value: stat.value, suffix: stat.suffix, iconName: stat.iconName },
        })
      : await prisma.stat.create({
          data: {
            value: stat.value,
            suffix: stat.suffix,
            sortOrder: stat.sortOrder,
            iconName: stat.iconName,
          },
        });

    await prisma.statTranslation.upsert({
      where: { statId_locale: { statId: row.id, locale: "EN" } },
      create: { statId: row.id, locale: "EN", label: stat.en },
      update: { label: stat.en },
    });
    await prisma.statTranslation.upsert({
      where: { statId_locale: { statId: row.id, locale: "AR" } },
      create: { statId: row.id, locale: "AR", label: stat.ar },
      update: { label: stat.ar },
    });
  }
}

async function seedPartners(media?: SeedMediaAssets) {
  const partners = [
    { name: "Hayat Charity", nameAr: "جمعية حياة الخيرية", url: "https://riyadhprints.com", logoId: media?.partnerHayat.id },
    { name: "DR Nutrition", nameAr: "دكتور نيوتريشن", url: "https://riyadhprints.com", logoId: undefined },
    { name: "Chat Globe", nameAr: "شات غلوب", url: "https://riyadhprints.com", logoId: undefined },
    { name: "Creative", nameAr: "كرييتف", url: "https://riyadhprints.com", logoId: undefined },
  ];

  for (const [index, partner] of partners.entries()) {
    const existing = await prisma.partner.findFirst({ where: { name: partner.name } });
    const row = existing
      ? await prisma.partner.update({
          where: { id: existing.id },
          data: { websiteUrl: partner.url, sortOrder: index, isVisible: true, logoId: partner.logoId },
        })
      : await prisma.partner.create({
          data: {
            name: partner.name,
            websiteUrl: partner.url,
            sortOrder: index,
            isVisible: true,
            logoId: partner.logoId,
          },
        });

    await prisma.partnerTranslation.upsert({
      where: { partnerId_locale: { partnerId: row.id, locale: "EN" } },
      create: { partnerId: row.id, locale: "EN", name: partner.name },
      update: { name: partner.name },
    });
    await prisma.partnerTranslation.upsert({
      where: { partnerId_locale: { partnerId: row.id, locale: "AR" } },
      create: { partnerId: row.id, locale: "AR", name: partner.nameAr },
      update: { name: partner.nameAr },
    });
  }

  await prisma.partner.updateMany({
    where: { name: { notIn: partners.map((partner) => partner.name) } },
    data: { isVisible: false },
  });
}

async function seedTestimonials() {
  const items = [
    {
      authorName: "Noura Al-Saud",
      authorRole: "Brand manager",
      company: "Riyadh F&B group",
      rating: 5,
      en: "Same-day business cards for a client pitch. Colour matched our violet exactly.",
      ar: "بطاقات أعمال في نفس اليوم لعرض عميل. اللون طابق بنفسجيتنا تمامًا.",
      roleAr: "مديرة العلامة",
    },
    {
      authorName: "Faisal Al-Harbi",
      authorRole: "Events lead",
      company: "Corporate offsites",
      rating: 5,
      en: "Roll-up banners arrived in Ghubairah before lunch. Hardware felt solid.",
      ar: "رول أب وصل غبيرة قبل الظهر. الحامل متين.",
      roleAr: "مسؤول الفعاليات",
    },
    {
      authorName: "Lina Haddad",
      authorRole: "Founder",
      company: "Studio in Olaya",
      rating: 5,
      en: "Tote bags and tees for a pop-up. They sent a proof and we signed off on WhatsApp.",
      ar: "حقائب وتيشيرتات لبوب أب. أرسلوا بروفة واعتمدنا عبر واتساب.",
      roleAr: "مؤسِّسة",
    },
    {
      authorName: "Omar Balkhi",
      authorRole: "Procurement",
      company: "Logistics fleet",
      rating: 5,
      en: "Vehicle wrap quote was clear: vinyl grade, install window, and city permit notes.",
      ar: "عرض تغليف السيارة واضح: نوع الفينيل وموعد التركيب وملاحظات التصريح.",
      roleAr: "مشتريات",
    },
    {
      authorName: "Sara Al-Qahtani",
      authorRole: "Marketing",
      company: "National Day campaign",
      rating: 5,
      en: "Heritage cubes and shirts for 96. Printed in the city, not imported last minute.",
      ar: "مكعبات وقمصان لليوم الوطني 96. طُبعت في المدينة وليست مستوردة في آخر لحظة.",
      roleAr: "تسويق",
    },
    {
      authorName: "Yousef Nasser",
      authorRole: "Operations",
      company: "E-commerce packing",
      rating: 5,
      en: "Mailer boxes held up on last-mile routes. We now keep a standing purchase order.",
      ar: "علب الشحن صمدت في التوصيل. أصبح لدينا أمر شراء ثابت.",
      roleAr: "عمليات",
    },
  ];

  for (const [index, item] of items.entries()) {
    const existing = await prisma.testimonial.findFirst({
      where: { authorName: item.authorName, company: item.company },
    });
    const row = existing
      ? await prisma.testimonial.update({
          where: { id: existing.id },
          data: {
            authorRole: item.authorRole,
            rating: item.rating,
            sortOrder: index,
            isFeatured: true,
            status: "PUBLISHED",
          },
        })
      : await prisma.testimonial.create({
          data: {
            authorName: item.authorName,
            authorRole: item.authorRole,
            company: item.company,
            rating: item.rating,
            sortOrder: index,
            isFeatured: true,
            status: "PUBLISHED",
          },
        });

    await prisma.testimonialTranslation.upsert({
      where: { testimonialId_locale: { testimonialId: row.id, locale: "EN" } },
      create: {
        testimonialId: row.id,
        locale: "EN",
        quote: item.en,
        authorName: item.authorName,
        authorRole: item.authorRole,
      },
      update: { quote: item.en, authorRole: item.authorRole },
    });
    await prisma.testimonialTranslation.upsert({
      where: { testimonialId_locale: { testimonialId: row.id, locale: "AR" } },
      create: {
        testimonialId: row.id,
        locale: "AR",
        quote: item.ar,
        authorName: item.authorName,
        authorRole: item.roleAr,
      },
      update: { quote: item.ar, authorRole: item.roleAr },
    });
  }
}
