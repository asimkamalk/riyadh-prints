import "dotenv/config";

import type { Prisma } from "@/generated/prisma/client";

import { prisma } from "../../src/lib/db";

export { prisma };

export type LocaleCopy = {
  en: string;
  ar: string;
};

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} is not set. Add it to .env before running the seed.`,
    );
  }
  return value;
}

export function tiptapDoc(...paragraphs: string[]): Prisma.InputJsonValue {
  return {
    type: "doc",
    content: paragraphs.map((text) => ({
      type: "paragraph",
      content: text ? [{ type: "text", text }] : [],
    })),
  };
}

type TiptapBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] };

export function tiptapFromBlocks(blocks: TiptapBlock[]): Prisma.InputJsonValue {
  return {
    type: "doc",
    content: blocks.map((block) => {
      if (block.type === "h2") {
        return {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: block.text }],
        };
      }
      if (block.type === "ul") {
        return {
          type: "bulletList",
          content: block.items.map((text) => ({
            type: "listItem",
            content: [{ type: "paragraph", content: [{ type: "text", text }] }],
          })),
        };
      }
      return {
        type: "paragraph",
        content: block.text ? [{ type: "text", text: block.text }] : [],
      };
    }),
  };
}

export async function upsertMedia(input: {
  pathname: string;
  url: string;
  mimeType: string;
  width: number;
  height: number;
  altEn: string;
  altAr: string;
  titleEn?: string;
  titleAr?: string;
}) {
  const existing = await prisma.media.findFirst({
    where: { pathname: input.pathname },
  });

  const media = existing
    ? await prisma.media.update({
        where: { id: existing.id },
        data: {
          url: input.url,
          mimeType: input.mimeType,
          width: input.width,
          height: input.height,
          folder: "seed",
          provider: "wordpress-legacy",
        },
      })
    : await prisma.media.create({
        data: {
          url: input.url,
          pathname: input.pathname,
          mimeType: input.mimeType,
          width: input.width,
          height: input.height,
          folder: "seed",
          provider: "wordpress-legacy",
        },
      });

  await prisma.mediaTranslation.upsert({
    where: { mediaId_locale: { mediaId: media.id, locale: "EN" } },
    create: {
      mediaId: media.id,
      locale: "EN",
      alt: input.altEn,
      title: input.titleEn ?? input.altEn,
    },
    update: { alt: input.altEn, title: input.titleEn ?? input.altEn },
  });

  await prisma.mediaTranslation.upsert({
    where: { mediaId_locale: { mediaId: media.id, locale: "AR" } },
    create: {
      mediaId: media.id,
      locale: "AR",
      alt: input.altAr,
      title: input.titleAr ?? input.altAr,
    },
    update: { alt: input.altAr, title: input.titleAr ?? input.altAr },
  });

  return media;
}
