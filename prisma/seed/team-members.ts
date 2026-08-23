import { prisma } from "./helpers";

const hamzaSkills = [
  { label: "Graphic Design & Branding", percent: 95 },
  { label: "Brand Identity & Visual Design", percent: 90 },
  { label: "Print Production & Quality", percent: 85 },
];

const asimSkills = [
  { label: "Operations & Business Strategy", percent: 95 },
  { label: "Full Stack Development (MERN)", percent: 90 },
  { label: "WordPress Development", percent: 85 },
];

export async function seedTeamMembers() {
  const members = [
    {
      slug: "hamza-raza",
      sortOrder: 0,
      email: "info@riyadhprints.com",
      phone: "+966543318975",
      socials: {},
      en: {
        name: "Hamza Raza",
        slug: "hamza-raza",
        role: "Founder & CEO",
        secondaryRole: null,
        bio: "Hamza Raza is the Founder and CEO of Riyadh Prints. With extensive experience in the Saudi Arabian printing industry, he has built the company from the ground up into a trusted printing partner for hundreds of businesses. From designing business cards, banners, and brochures to managing print production and daily operations, Hamza ensures every project is delivered with precision and creativity. His strong brand building skills help businesses across Riyadh create powerful visual identities that leave a lasting impression.",
        experience:
          "As the Founder and CEO of Riyadh Prints, Hamza Raza leads all business operations, design, and print production. With deep knowledge of graphic design, color management, and finishing techniques, he has built a company known for the highest standards of quality. Hamza works closely with businesses to understand their brand identity and translate it into stunning printed materials — from business cards and packaging to large format banners and vehicle wraps.\n\nHis hands-on approach means clients get a seamless experience from concept to final delivery. Hamza’s attention to detail and creative eye have made him a trusted partner for hundreds of satisfied customers in Riyadh and beyond.",
        awards:
          "Since founding Riyadh Prints, Hamza has built the company into a recognized name in the Riyadh printing industry. Key achievements include building and scaling the business from scratch to serve hundreds of clients across Saudi Arabia, mastering advanced printing techniques including foil stamping, embossing, and UV coating, developing brand identity packages for startups and established businesses, and maintaining a track record of zero-defect print production.\n\nOutside of work, Hamza continuously sharpens his design skills by exploring the latest trends in typography, packaging design, and visual branding to bring fresh creative ideas to every project.",
        skills: hamzaSkills,
      },
      ar: {
        name: "حمزة رضا",
        slug: "hamza-raza",
        role: "المؤسس والرئيس التنفيذي",
        secondaryRole: null,
        bio: "حمزة رضا هو المؤسس والرئيس التنفيذي لمطبعة الرياض. بخبرة واسعة في صناعة الطباعة السعودية، بنى الشركة من الصفر لتصبح شريك طباعة موثوقاً لمئات الشركات.",
        experience:
          "يقود حمزة رضا عمليات مطبعة الرياض وتصميمها وإنتاجها للطباعة. يعمل عن قرب مع الشركات لترجمة هوية العلامة إلى مواد مطبوعة متميزة — من بطاقات الأعمال إلى البنرات الكبيرة وعلامات المركبات.",
        awards:
          "منذ تأسيس مطبعة الرياض، بنى حمزة الشركة لتصبح اسماً معروفاً في صناعة الطباعة بالرياض، مع إتقان تقنيات متقدمة مثل ال foil stamping وال UV coating.",
        skills: hamzaSkills,
      },
    },
    {
      slug: "asim-kamal",
      sortOrder: 1,
      email: "asimkamalk@gmail.com",
      phone: null,
      socials: { linkedin: "https://www.linkedin.com/in/asimkamalk/" },
      en: {
        name: "Asim Kamal",
        slug: "asim-kamal",
        role: "Chief Operating Officer",
        secondaryRole: "Software Engineer",
        bio: "Experienced COO and **Full Stack Developer** with expertise in operations management and web development. Skilled in building and scaling businesses while leading technical projects using the **MERN Stack** (MongoDB, Express.js, React, Node.js) and **WordPress**. Combines business strategy with hands-on technical ability to deliver results that drive growth.",
        experience:
          "As the Chief Operating Officer and lead developer at Riyadh Prints, Asim Kamal oversees all business operations, technical infrastructure, and growth strategy. With a strong background in Full Stack Development (MERN Stack) and WordPress, he built the Riyadh Prints website and e-commerce platform from the ground up. Asim combines his technical expertise with business acumen to ensure every customer receives premium quality printing with fast turnaround times. Under his leadership, Riyadh Prints has grown to serve hundreds of businesses across Saudi Arabia, from startups to established corporations.\n\nAsim is passionate about leveraging technology to simplify the printing experience. From automating order workflows to optimizing the website for search engines, he ensures Riyadh Prints stays ahead of the competition in Riyadh’s fast-growing printing industry.",
        awards:
          "Since founding the operations at Riyadh Prints, Asim has built the company into a trusted printing partner for businesses across the region. Key achievements include building and scaling businesses for clients in Saudi Arabia, Dubai, and Pakistan, developing a fully automated ordering system via WhatsApp and web, establishing same-day printing and delivery capabilities in Riyadh, and building a strong reputation for premium quality and fast turnaround.\n\nWhen he’s not running operations, Asim stays up to date with the latest in web development, e-commerce trends, and digital marketing strategies to continuously improve the Riyadh Prints experience for customers.",
        skills: asimSkills,
      },
      ar: {
        name: "أسيم كمال",
        slug: "asim-kamal",
        role: "الرئيس التنفيذي للعمليات",
        secondaryRole: "مهندس برمجيات",
        bio: "COO ومطور Full Stack بخبرة في إدارة العمليات وتطوير الويب، مع تركيز على MERN Stack وWordPress.",
        experience:
          "يشرف أسيم كمال على عمليات مطبعة الرياض والبنية التقنية واستراتيجية النمو، وقاد بناء الموقع ومنصة الطلبات من الصفر.",
        awards:
          "أسهم أسيم في بناء مطبعة الرياض كشريك موثوق للشركات في المملكة، مع أنظمة طلب آلية عبر واتساب والويب وقدرات طباعة في نفس اليوم بالرياض.",
        skills: asimSkills,
      },
    },
  ] as const;

  for (const member of members) {
    const row = await prisma.teamMember.upsert({
      where: { slug: member.slug },
      create: {
        slug: member.slug,
        email: member.email,
        phone: member.phone,
        socials: member.socials,
        sortOrder: member.sortOrder,
        isVisible: true,
      },
      update: {
        email: member.email,
        phone: member.phone,
        socials: member.socials,
        sortOrder: member.sortOrder,
        isVisible: true,
      },
      select: { id: true },
    });

    for (const [locale, data] of [
      ["EN", member.en],
      ["AR", member.ar],
    ] as const) {
      await prisma.teamMemberTranslation.upsert({
        where: { teamMemberId_locale: { teamMemberId: row.id, locale } },
        create: {
          teamMemberId: row.id,
          locale,
          name: data.name,
          slug: data.slug,
          role: data.role,
          secondaryRole: data.secondaryRole,
          bio: data.bio,
          experience: data.experience,
          awards: data.awards,
          skills: data.skills,
        },
        update: {
          name: data.name,
          slug: data.slug,
          role: data.role,
          secondaryRole: data.secondaryRole,
          bio: data.bio,
          experience: data.experience,
          awards: data.awards,
          skills: data.skills,
        },
      });
    }
  }
}
