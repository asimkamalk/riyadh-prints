import type { LinkType, MenuLocation } from "@/generated/prisma/client";

import { prisma } from "./helpers";

async function addItem(input: {
  location: MenuLocation;
  sortOrder: number;
  linkType: LinkType;
  labelEn: string;
  labelAr: string;
  parentId?: string;
  targetId?: string;
  externalUrl?: string;
  internalPath?: string;
  isMegaMenu?: boolean;
  highlight?: boolean;
  openInNewTab?: boolean;
}) {
  const item = await prisma.menuItem.create({
    data: {
      location: input.location,
      sortOrder: input.sortOrder,
      linkType: input.linkType,
      parentId: input.parentId,
      targetId: input.targetId,
      externalUrl: input.externalUrl,
      internalPath: input.internalPath,
      isMegaMenu: input.isMegaMenu ?? false,
      highlight: input.highlight ?? false,
      openInNewTab: input.openInNewTab ?? false,
      isVisible: true,
    },
  });

  await prisma.menuItemTranslation.createMany({
    data: [
      { menuItemId: item.id, locale: "EN", label: input.labelEn },
      { menuItemId: item.id, locale: "AR", label: input.labelAr },
    ],
  });

  return item;
}

export async function seedMenus() {
  await prisma.menuItem.deleteMany({ where: { parentId: { not: null } } });
  await prisma.menuItem.deleteMany();

  const page = Object.fromEntries(
    (await prisma.page.findMany({ select: { id: true, slug: true } })).map((row) => [
      row.slug,
      row.id,
    ]),
  );
  const services = await prisma.service.findMany({
    orderBy: { sortOrder: "asc" },
    include: { translations: { where: { locale: "EN" } } },
  });
  const categories = await prisma.category.findMany({
    where: { kind: "PRODUCT" },
    orderBy: { sortOrder: "asc" },
    include: { translations: { where: { locale: "EN" } } },
  });

  const required = [
    "home",
    "services",
    "about",
    "faqs",
    "contact",
    "request-a-quote",
    "portfolio",
    "privacy-policy",
    "refund-returns",
    "national-day-printing-riyadh",
  ] as const;
  for (const slug of required) {
    if (!page[slug]) {
      throw new Error(`Cannot build menus; page "${slug}" is missing.`);
    }
  }

  const servicesParent = await addItem({
    location: "HEADER",
    sortOrder: 1,
    linkType: "PAGE",
    targetId: page.services,
    labelEn: "Services",
    labelAr: "الخدمات",
    isMegaMenu: true,
  });
  const productsParent = await addItem({
    location: "HEADER",
    sortOrder: 2,
    linkType: "CATEGORY",
    targetId: categories[0]?.id,
    labelEn: "Products",
    labelAr: "المنتجات",
    isMegaMenu: true,
  });

  await addItem({
    location: "HEADER",
    sortOrder: 0,
    linkType: "PAGE",
    targetId: page.home,
    labelEn: "Home",
    labelAr: "الرئيسية",
  });
  await addItem({
    location: "HEADER",
    sortOrder: 3,
    linkType: "PAGE",
    targetId: page.portfolio,
    labelEn: "Portfolio",
    labelAr: "أعمالنا",
  });
  await addItem({
    location: "HEADER",
    sortOrder: 4,
    linkType: "PAGE",
    targetId: page.about,
    labelEn: "About",
    labelAr: "من نحن",
  });
  await addItem({
    location: "HEADER",
    sortOrder: 5,
    linkType: "PAGE",
    targetId: page.faqs,
    labelEn: "FAQs",
    labelAr: "أسئلة",
  });
  await addItem({
    location: "HEADER",
    sortOrder: 6,
    linkType: "PAGE",
    targetId: page.contact,
    labelEn: "Contact",
    labelAr: "تواصل",
  });
  await addItem({
    location: "HEADER",
    sortOrder: 7,
    linkType: "PAGE",
    targetId: page["request-a-quote"],
    labelEn: "Request a quote",
    labelAr: "عرض سعر",
    highlight: true,
  });

  for (const [index, service] of services.entries()) {
    const labelEn = service.translations[0]?.name ?? service.slug;
    const ar = await prisma.serviceTranslation.findUnique({
      where: { serviceId_locale: { serviceId: service.id, locale: "AR" } },
    });
    await addItem({
      location: "HEADER",
      sortOrder: index,
      linkType: "SERVICE",
      targetId: service.id,
      parentId: servicesParent.id,
      labelEn,
      labelAr: ar?.name ?? labelEn,
    });
  }

  for (const [index, category] of categories.entries()) {
    const labelEn = category.translations[0]?.name ?? category.slug;
    const ar = await prisma.categoryTranslation.findUnique({
      where: { categoryId_locale: { categoryId: category.id, locale: "AR" } },
    });
    await addItem({
      location: "HEADER",
      sortOrder: index,
      linkType: "CATEGORY",
      targetId: category.id,
      parentId: productsParent.id,
      labelEn,
      labelAr: ar?.name ?? labelEn,
    });
  }

  const mobile = [
    ["home", "Home", "الرئيسية"],
    ["services", "Services", "الخدمات"],
    ["portfolio", "Portfolio", "أعمالنا"],
    ["about", "About", "من نحن"],
    ["faqs", "FAQs", "أسئلة"],
    ["contact", "Contact", "تواصل"],
    ["request-a-quote", "Request a quote", "عرض سعر"],
  ] as const;

  for (const [index, [slug, en, ar]] of mobile.entries()) {
    await addItem({
      location: "MOBILE",
      sortOrder: index,
      linkType: "PAGE",
      targetId: page[slug],
      labelEn: en,
      labelAr: ar,
      highlight: slug === "request-a-quote",
    });
  }

  await addItem({
    location: "FOOTER_INFO",
    sortOrder: 0,
    linkType: "PAGE",
    targetId: page.contact,
    labelEn: "Contact",
    labelAr: "تواصل",
  });
  await addItem({
    location: "FOOTER_INFO",
    sortOrder: 1,
    linkType: "EXTERNAL",
    externalUrl: "https://wa.me/966543318975",
    openInNewTab: true,
    labelEn: "WhatsApp +966 54 331 8975",
    labelAr: "واتساب +966 54 331 8975",
  });
  await addItem({
    location: "FOOTER_INFO",
    sortOrder: 2,
    linkType: "EXTERNAL",
    externalUrl: "mailto:info@riyadhprints.com",
    labelEn: "info@riyadhprints.com",
    labelAr: "info@riyadhprints.com",
  });
  await addItem({
    location: "FOOTER_INFO",
    sortOrder: 3,
    linkType: "EXTERNAL",
    externalUrl:
      "https://www.google.com/maps/search/?api=1&query=Prince+Muhammad+Ibn+Abd+Al+Rahman%2C+Ghubairah%2C+Riyadh+12665",
    openInNewTab: true,
    labelEn: "Ghubairah, Riyadh 12665",
    labelAr: "غبيرة، الرياض 12665",
  });

  await addItem({
    location: "FOOTER_LINKS",
    sortOrder: 0,
    linkType: "PAGE",
    targetId: page.services,
    labelEn: "Services",
    labelAr: "الخدمات",
  });
  await addItem({
    location: "FOOTER_LINKS",
    sortOrder: 1,
    linkType: "PAGE",
    targetId: page.portfolio,
    labelEn: "Portfolio",
    labelAr: "أعمالنا",
  });
  await addItem({
    location: "FOOTER_LINKS",
    sortOrder: 2,
    linkType: "PAGE",
    targetId: page["national-day-printing-riyadh"],
    labelEn: "National Day",
    labelAr: "اليوم الوطني",
  });
  await addItem({
    location: "FOOTER_LINKS",
    sortOrder: 3,
    linkType: "PAGE",
    targetId: page["request-a-quote"],
    labelEn: "Request a quote",
    labelAr: "عرض سعر",
  });

  await addItem({
    location: "FOOTER_ABOUT",
    sortOrder: 0,
    linkType: "PAGE",
    targetId: page.about,
    labelEn: "About",
    labelAr: "من نحن",
  });
  await addItem({
    location: "FOOTER_ABOUT",
    sortOrder: 1,
    linkType: "PAGE",
    targetId: page.faqs,
    labelEn: "FAQs",
    labelAr: "أسئلة شائعة",
  });
  await addItem({
    location: "FOOTER_ABOUT",
    sortOrder: 2,
    linkType: "PAGE",
    targetId: page["privacy-policy"],
    labelEn: "Privacy policy",
    labelAr: "الخصوصية",
  });
  await addItem({
    location: "FOOTER_ABOUT",
    sortOrder: 3,
    linkType: "PAGE",
    targetId: page["refund-returns"],
    labelEn: "Refunds",
    labelAr: "الاسترجاع",
  });
}
