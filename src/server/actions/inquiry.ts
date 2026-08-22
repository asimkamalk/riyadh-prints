"use server";

import { Resend } from "resend";
import { z } from "zod";

import type { Prisma } from "@/generated/prisma/client";
import {
  bulkIdsSchema,
  idSchema,
  inquiryStatusSchema,
  reorderSchema,
} from "@/lib/validations/common";
import { submitInquirySchema, updateInquirySchema } from "@/lib/validations/inquiry";
import { prisma } from "@/server/db";
import { toPrismaLocale } from "@/server/queries/_shared";

import { ActionError, CONTENT_ROLES, createAction } from "./_helpers";
import { notFound } from "./_resource";

const MIN_FORM_MS = 2_000;
const MAX_FORM_MS = 24 * 60 * 60 * 1000;

const staffInquirySchema = submitInquirySchema
  .omit({ website: true, honeypot: true, formStartedAt: true })
  .extend({
    status: inquiryStatusSchema.optional(),
    source: z.string().trim().max(80).optional(),
    adminNotes: z.string().max(5000).optional(),
  });

const inquiryStatusBulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
  status: inquiryStatusSchema,
});

function isHoneypot(website?: string, honeypot?: string): boolean {
  return Boolean(website?.trim() || honeypot?.trim());
}

function silentInquiryResult() {
  return { id: "ignored", status: "NEW" as const };
}

async function resolveRelatedIds(productId?: string, serviceId?: string) {
  const [product, service] = await Promise.all([
    productId
      ? prisma.product.findUnique({ where: { id: productId }, select: { id: true } })
      : null,
    serviceId
      ? prisma.service.findUnique({ where: { id: serviceId }, select: { id: true } })
      : null,
  ]);
  return { productId: product?.id, serviceId: service?.id };
}

async function adminNotifyEmail(): Promise<string | null> {
  if (process.env.INQUIRY_NOTIFY_EMAIL) {
    return process.env.INQUIRY_NOTIFY_EMAIL;
  }
  const row = await prisma.siteSetting.findUnique({
    where: { key: "contact.email" },
    select: { value: true },
  });
  return typeof row?.value === "string" ? row.value : null;
}

async function sendInquiryEmails(args: {
  name: string;
  email: string;
  phone: string;
  company?: string;
  message: string;
  locale: "en" | "ar";
  productId?: string;
  serviceId?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return;
  }
  const from =
    process.env.RESEND_FROM ?? "Riyadh Prints <noreply@riyadhprints.com>";
  const adminTo = await adminNotifyEmail();
  const resend = new Resend(apiKey);
  const details = [
    `Name: ${args.name}`,
    `Email: ${args.email}`,
    `Phone: ${args.phone}`,
    args.company ? `Company: ${args.company}` : null,
    args.productId ? `Product: ${args.productId}` : null,
    args.serviceId ? `Service: ${args.serviceId}` : null,
    "",
    args.message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const sends: Promise<unknown>[] = [];
  if (adminTo) {
    sends.push(
      resend.emails.send({
        from,
        to: adminTo,
        replyTo: args.email,
        subject: `New quote request from ${args.name}`,
        text: details,
      }),
    );
  }
  sends.push(
    resend.emails.send({
      from,
      to: args.email,
      subject:
        args.locale === "ar"
          ? "استلمنا طلب عرض السعر الخاص بك"
          : "We received your quote request",
      text:
        args.locale === "ar"
          ? `مرحباً ${args.name}،\n\nشكراً لتواصلك مع مطبعة الرياض. استلمنا طلبك وسنعاود الاتصال بك قريباً.\n\nمطبعة الرياض`
          : `Hi ${args.name},\n\nThank you for contacting Riyadh Prints. We received your quote request and will get back to you shortly.\n\nRiyadh Prints`,
    }),
  );
  await Promise.allSettled(sends);
}

export const submitInquiry = createAction({
  input: submitInquirySchema,
  roles: "public",
  rateLimit: { windowMs: 15 * 60 * 1000, max: 5 },
  revalidate: () => [],
  audit: {
    action: "inquiry.submit",
    entityType: "inquiry",
    entityId: (_i, r) => r.id,
  },
  handler: async ({ input, ipHash, userAgent }) => {
    if (isHoneypot(input.website, input.honeypot)) {
      return silentInquiryResult();
    }
    const elapsed = Date.now() - input.formStartedAt;
    if (elapsed < MIN_FORM_MS) {
      return silentInquiryResult();
    }
    if (elapsed > MAX_FORM_MS) {
      throw new ActionError("This form expired. Please refresh the page and try again.");
    }

    const related = await resolveRelatedIds(input.productId, input.serviceId);
    const row = await prisma.inquiry.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        company: input.company,
        serviceInterest: input.serviceInterest,
        productId: related.productId,
        serviceId: related.serviceId,
        quantity: input.quantity,
        message: input.message,
        locale: toPrismaLocale(input.locale),
        ipHash,
        userAgent,
        source: "quote-form",
        status: "NEW",
      },
      select: { id: true, status: true },
    });

    await sendInquiryEmails({
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company,
      message: input.message,
      locale: input.locale,
      productId: related.productId,
      serviceId: related.serviceId,
    });

    return row;
  },
});

export const createInquiry = createAction({
  input: staffInquirySchema,
  roles: CONTENT_ROLES,
  revalidate: () => [],
  audit: { action: "inquiry.create", entityType: "inquiry", entityId: (_i, r) => r.id },
  handler: async ({ input, ipHash, userAgent }) => {
    const related = await resolveRelatedIds(input.productId, input.serviceId);
    return prisma.inquiry.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        company: input.company,
        serviceInterest: input.serviceInterest,
        productId: related.productId,
        serviceId: related.serviceId,
        quantity: input.quantity,
        message: input.message,
        locale: toPrismaLocale(input.locale),
        adminNotes: input.adminNotes,
        source: input.source ?? "dashboard",
        status: input.status ?? "NEW",
        ipHash,
        userAgent,
      },
      select: { id: true, status: true },
    });
  },
});

export const updateInquiry = createAction({
  input: updateInquirySchema,
  roles: CONTENT_ROLES,
  revalidate: () => [],
  audit: { action: "inquiry.update", entityType: "inquiry", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.inquiry.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!existing) {
      notFound("Inquiry");
    }
    return prisma.inquiry.update({
      where: { id: existing.id },
      data: {
        status: input.status,
        adminNotes: input.adminNotes,
        assignedToId: input.assignedToId === null ? null : input.assignedToId,
      },
      select: { id: true, status: true },
    });
  },
});

export const deleteInquiry = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [],
  audit: { action: "inquiry.delete", entityType: "inquiry", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.inquiry.findUnique({
      where: { id: input.id },
      select: { id: true },
    });
    if (!existing) {
      notFound("Inquiry");
    }
    return prisma.inquiry.update({
      where: { id: existing.id },
      data: { status: "SPAM" },
      select: { id: true, status: true },
    });
  },
});

export const duplicateInquiry = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [],
  audit: { action: "inquiry.duplicate", entityType: "inquiry", entityId: (_i, r) => r.id },
  handler: async ({ input }) => {
    const existing = await prisma.inquiry.findUnique({
      where: { id: input.id },
    });
    if (!existing) {
      notFound("Inquiry");
    }
    return prisma.inquiry.create({
      data: {
        name: existing.name,
        email: existing.email,
        phone: existing.phone,
        company: existing.company,
        serviceInterest: existing.serviceInterest,
        productId: existing.productId,
        serviceId: existing.serviceId,
        quantity: existing.quantity,
        selections: (existing.selections ?? undefined) as Prisma.InputJsonValue | undefined,
        message: existing.message,
        fileUrls: existing.fileUrls,
        locale: existing.locale,
        source: existing.source,
        status: "NEW",
      },
      select: { id: true, status: true },
    });
  },
});

export const toggleInquiryStatus = createAction({
  input: idSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [],
  audit: { action: "inquiry.toggleStatus", entityType: "inquiry", entityId: (i) => i.id },
  handler: async ({ input }) => {
    const existing = await prisma.inquiry.findUnique({
      where: { id: input.id },
      select: { id: true, status: true },
    });
    if (!existing) {
      notFound("Inquiry");
    }
    const status = existing.status === "NEW" ? "CONTACTED" : "NEW";
    return prisma.inquiry.update({
      where: { id: existing.id },
      data: { status },
      select: { id: true, status: true },
    });
  },
});

export const reorderInquiries = createAction({
  input: reorderSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [],
  audit: { action: "inquiry.reorder", entityType: "inquiry", entityId: () => "batch" },
  handler: async () => {
    throw new ActionError("Inquiries have no sort order.");
  },
});

export const bulkUpdateInquiryStatus = createAction({
  input: inquiryStatusBulkSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [],
  audit: { action: "inquiry.bulkUpdateStatus", entityType: "inquiry", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.inquiry.updateMany({
      where: { id: { in: input.ids } },
      data: { status: input.status },
    });
    return { count: result.count };
  },
});

export const bulkDeleteInquiries = createAction({
  input: bulkIdsSchema,
  roles: CONTENT_ROLES,
  revalidate: () => [],
  audit: { action: "inquiry.bulkDelete", entityType: "inquiry", entityId: () => "batch" },
  handler: async ({ input }) => {
    const result = await prisma.inquiry.updateMany({
      where: { id: { in: input.ids } },
      data: { status: "SPAM" },
    });
    return { count: result.count };
  },
});
