"use server";

import { subscribeNewsletterSchema } from "@/lib/validations/newsletter";
import { prisma } from "@/server/db";
import { toPrismaLocale } from "@/server/queries/_shared";

import { createAction } from "./_helpers";

export const subscribeNewsletter = createAction({
  input: subscribeNewsletterSchema,
  roles: "public",
  touchSitemap: false,
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 8,
    key: (_input, ipHash) => `newsletter:${ipHash}`,
  },
  revalidate: () => [],
  audit: {
    action: "newsletter.subscribe",
    entityType: "newsletter",
    entityId: (_i, r) => r.id,
  },
  handler: async ({ input }) => {
    if (input.website?.trim()) {
      return { id: "ignored" };
    }
    const email = input.email.trim().toLowerCase();
    const row = await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: {
        email,
        locale: toPrismaLocale(input.locale),
        source: "footer",
      },
      update: {
        unsubscribedAt: null,
        locale: toPrismaLocale(input.locale),
        source: "footer",
      },
      select: { id: true },
    });
    return row;
  },
});
