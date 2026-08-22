import type { FaqScope } from "@/generated/prisma/client";

import { prisma, tiptapDoc } from "./helpers";

type FaqSeed = {
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
};

const globalFaqs: FaqSeed[] = [
  {
    questionEn: "What are your turnaround times?",
    questionAr: "ما مدة التنفيذ؟",
    answerEn:
      "Standard print orders are completed within 2–4 business days. Same-day printing is available for urgent orders within Riyadh. Large format, custom packaging, and bulk orders may need more time. WhatsApp us for a date on your file.",
    answerAr:
      "الطلبات المعتادة تُنجز خلال 2–4 أيام عمل. الطباعة في نفس اليوم متاحة للطلبات العاجلة داخل الرياض. القياس الكبير والتغليف المخصص والكميات قد تحتاج وقتًا أطول. راسلونا على واتساب لموعد على ملفكم.",
  },
  {
    questionEn: "What products and services do you offer?",
    questionAr: "ما المنتجات والخدمات التي تقدمونها؟",
    answerEn:
      "Business cards, banners, brochures, flyers, custom t-shirts, posters, roller banners, packaging boxes, vehicle branding, billboards, wristbands, display cubes, and book covers — printed in Riyadh.",
    answerAr:
      "بطاقات أعمال، بنرات، بروشورات، فلايرات، تيشيرتات، بوسترات، رول أب، علب تغليف، تغليف سيارات، لوحات، أساور، مكعبات عرض، وأغلفة كتب — تُطبع في الرياض.",
  },
  {
    questionEn: "Where is Riyadh Prints located?",
    questionAr: "أين تقع مطبعة الرياض؟",
    answerEn:
      "Prince Muhammad Ibn Abd Al Rahman, Ghubairah, Riyadh 12665, Saudi Arabia. We deliver across Riyadh (same-day options) and ship to Jeddah, Dammam, Mecca, Medina, and other KSA cities.",
    answerAr:
      "الأمير محمد بن عبد الرحمن، غبيرة، الرياض 12665. نوصل داخل الرياض (مع خيار نفس اليوم) ونشحن إلى جدة والدمام ومكة والمدينة ومدن أخرى.",
  },
  {
    questionEn: "Why should I choose Riyadh Prints?",
    questionAr: "لماذا مطبعة الرياض؟",
    answerEn:
      "Premium materials, fast turnaround, competitive quotes, free design consultations, same-day options, and no cart — one WhatsApp thread or quote form.",
    answerAr:
      "خامات جيدة، تنفيذ سريع، أسعار واضحة، استشارة تصميم، خيار نفس اليوم، ولا سلة — واتساب أو نموذج عرض سعر.",
  },
  {
    questionEn: "What file formats do you accept for printing?",
    questionAr: "ما صيغ الملفات المقبولة؟",
    answerEn:
      "PNG, JPG, PDF, AI, PSD, and SVG. Vector or 300 DPI PDF with bleed is best. If you have no file, share the idea on WhatsApp and we will layout a proof.",
    answerAr:
      "PNG و JPG و PDF و AI و PSD و SVG. الأفضل فيكتور أو PDF بـ 300 نقطة مع هدر. إن لم يكن لديكم ملف، أرسلوا الفكرة على واتساب ونعمل بروفة.",
  },
  {
    questionEn: "Do you offer bulk order discounts?",
    questionAr: "هل يوجد خصم للكميات؟",
    answerEn:
      "Yes. Unit prices drop on price tiers for cards, flyers, tees, and boxes. Send quantity and size for a written quote — we do not hide the break in a cart.",
    answerAr:
      "نعم. ينخفض سعر الوحدة في شرائح الكمية للبطاقات والفلايرات والتيشيرت والعلب. أرسلوا الكمية والمقاس لعرض مكتوب — لا نخبئ الشريحة في سلة.",
  },
  {
    questionEn: "Can I see a proof before printing?",
    questionAr: "هل أرى بروفة قبل الطباعة؟",
    answerEn:
      "Yes. We send a digital proof for approval before production. Revisions continue until you sign off.",
    answerAr:
      "نعم. نرسل بروفة رقمية للاعتماد قبل التشغيل. التعديلات مستمرة حتى تعتمدوا.",
  },
  {
    questionEn: "Do you deliver outside Riyadh?",
    questionAr: "هل التوصيل خارج الرياض؟",
    answerEn:
      "Yes — Jeddah, Dammam, Mecca, Medina, Khobar, Tabuk, and more. Express is typically 1–2 business days. Pickup and same-day delivery stay in Riyadh.",
    answerAr:
      "نعم — جدة والدمام ومكة والمدينة والخبر وتبوك وغيرها. السريع عادة 1–2 يوم عمل. الاستلام ونفس اليوم داخل الرياض.",
  },
  {
    questionEn: "Is there a minimum order?",
    questionAr: "هل يوجد حد أدنى؟",
    answerEn:
      "Many items start at one piece (tees, roll-ups). Cards and cartons have practical minimums printed on the product page. Ask if your quantity is below the listed tier.",
    answerAr:
      "كثير من الأصناف تبدأ بقطعة (تيشيرت، رول أب). البطاقات والكرتون لها حد عملي ظاهر في صفحة المنتج. اسألوا إن كانت كميتكم أقل من الشريحة.",
  },
  {
    questionEn: "Do you print in Arabic and English?",
    questionAr: "هل تطبعون بالعربي والإنجليزي؟",
    answerEn:
      "Yes. We check shaping, kashida, and bilingual hierarchy on the proof so Arabic does not collapse into a Latin layout.",
    answerAr:
      "نعم. نراجع التشكيل والكشيدة وترتيب اللغتين على البروفة حتى لا يُضغط العربي داخل تصميم لاتيني.",
  },
  {
    questionEn: "How do I pay?",
    questionAr: "كيف أدفع؟",
    answerEn:
      "There is no website checkout. After the quote you pay by the method in the invoice (bank transfer or the details we send). Production starts when payment is confirmed unless we agreed terms.",
    answerAr:
      "لا يوجد دفع على الموقع. بعد عرض السعر تدفعون حسب الفاتورة (تحويل أو التفاصيل التي نرسلها). يبدأ التشغيل بعد تأكيد الدفع ما لم نتفق على أجل.",
  },
  {
    questionEn: "Can I visit the shop?",
    questionAr: "هل يمكن زيارة المطبعة؟",
    answerEn:
      "Yes. Ghubairah, Riyadh. Saturday–Thursday 8:00 AM–10:00 PM. Friday closed. Message WhatsApp before you come with a large file so we can load it.",
    answerAr:
      "نعم. غبيرة، الرياض. السبت–الخميس 8 ص–10 م. الجمعة مغلق. راسلوا واتساب قبل الحضور بملف كبير حتى نجهزه.",
  },
];

async function upsertFaq(args: {
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
  scope: FaqScope;
  sortOrder: number;
  groupId?: string;
  pageId?: string;
  productId?: string;
  serviceId?: string;
}) {
  const existing = await prisma.faqItemTranslation.findFirst({
    where: { locale: "EN", question: args.questionEn },
    select: { faqItemId: true },
  });

  const item = existing
    ? await prisma.faqItem.update({
        where: { id: existing.faqItemId },
        data: {
          scope: args.scope,
          sortOrder: args.sortOrder,
          isVisible: true,
          groupId: args.groupId,
          pageId: args.pageId,
          productId: args.productId,
          serviceId: args.serviceId,
        },
      })
    : await prisma.faqItem.create({
        data: {
          scope: args.scope,
          sortOrder: args.sortOrder,
          isVisible: true,
          groupId: args.groupId,
          pageId: args.pageId,
          productId: args.productId,
          serviceId: args.serviceId,
        },
      });

  await prisma.faqItemTranslation.upsert({
    where: { faqItemId_locale: { faqItemId: item.id, locale: "EN" } },
    create: {
      faqItemId: item.id,
      locale: "EN",
      question: args.questionEn,
      answer: tiptapDoc(args.answerEn),
    },
    update: { question: args.questionEn, answer: tiptapDoc(args.answerEn) },
  });
  await prisma.faqItemTranslation.upsert({
    where: { faqItemId_locale: { faqItemId: item.id, locale: "AR" } },
    create: {
      faqItemId: item.id,
      locale: "AR",
      question: args.questionAr,
      answer: tiptapDoc(args.answerAr),
    },
    update: { question: args.questionAr, answer: tiptapDoc(args.answerAr) },
  });
}

export async function seedFaqs() {
  const groupHeading = "General";
  const existingGroup = await prisma.faqGroupTranslation.findFirst({
    where: { locale: "EN", heading: groupHeading },
    select: { groupId: true },
  });

  const group = existingGroup
    ? await prisma.faqGroup.update({
        where: { id: existingGroup.groupId },
        data: { scope: "GLOBAL", sortOrder: 0 },
      })
    : await prisma.faqGroup.create({
        data: { scope: "GLOBAL", sortOrder: 0 },
      });

  await prisma.faqGroupTranslation.upsert({
    where: { groupId_locale: { groupId: group.id, locale: "EN" } },
    create: {
      groupId: group.id,
      locale: "EN",
      heading: groupHeading,
      subheading: "Before you send a file",
    },
    update: { heading: groupHeading, subheading: "Before you send a file" },
  });
  await prisma.faqGroupTranslation.upsert({
    where: { groupId_locale: { groupId: group.id, locale: "AR" } },
    create: {
      groupId: group.id,
      locale: "AR",
      heading: "أسئلة عامة",
      subheading: "قبل إرسال الملف",
    },
    update: { heading: "أسئلة عامة", subheading: "قبل إرسال الملف" },
  });

  for (const [index, faq] of globalFaqs.entries()) {
    await upsertFaq({
      ...faq,
      scope: "GLOBAL",
      sortOrder: index,
      groupId: group.id,
    });
  }

  const services = await prisma.service.findMany({ select: { id: true, slug: true } });
  for (const [index, service] of services.entries()) {
    await upsertFaq({
      questionEn: `How long does ${service.slug.split("-").join(" ")} take?`,
      questionAr: `كم يستغرق تنفيذ هذه الخدمة؟`,
      answerEn: `Turnaround is on the service page and starts after you approve the proof — not when the WhatsApp message arrives.`,
      answerAr: `المدة مكتوبة في صفحة الخدمة وتبدأ بعد اعتماد البروفة — لا عند وصول رسالة واتساب.`,
      scope: "SERVICE",
      sortOrder: index,
      serviceId: service.id,
    });
  }

  const products = await prisma.product.findMany({ select: { id: true, slug: true } });
  for (const [index, product] of products.entries()) {
    await upsertFaq({
      questionEn: `Can I order one ${product.slug.split("-").join(" ")}?`,
      questionAr: `هل أطلب قطعة واحدة من هذا المنتج؟`,
      answerEn: `Minimum quantity and same-day eligibility are listed on the product. If you are under the minimum, WhatsApp us — we will say yes or no in writing.`,
      answerAr: `الحد الأدنى وإمكانية نفس اليوم مذكوران في المنتج. إن كانت كميتكم أقل، راسلوا واتساب — نجيب نعم أو لا كتابة.`,
      scope: "PRODUCT",
      sortOrder: index,
      productId: product.id,
    });
  }
}
