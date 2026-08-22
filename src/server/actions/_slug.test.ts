import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/db", () => ({
  prisma: {
    product: { findFirst: vi.fn() },
    productTranslation: { findFirst: vi.fn() },
    category: { findFirst: vi.fn() },
    categoryTranslation: { findFirst: vi.fn() },
    service: { findFirst: vi.fn() },
    serviceTranslation: { findFirst: vi.fn() },
    page: { findFirst: vi.fn() },
    pageTranslation: { findFirst: vi.fn() },
    post: { findFirst: vi.fn() },
    postTranslation: { findFirst: vi.fn() },
    project: { findFirst: vi.fn() },
    projectTranslation: { findFirst: vi.fn() },
    author: { findFirst: vi.fn() },
    authorTranslation: { findFirst: vi.fn() },
    teamMember: { findFirst: vi.fn() },
    teamMemberTranslation: { findFirst: vi.fn() },
    locationTranslation: { findFirst: vi.fn() },
    tag: { findFirst: vi.fn() },
    tagTranslation: { findFirst: vi.fn() },
  },
}));

import { prisma } from "@/server/db";

import {
  generateUniqueSlug,
  isReservedSlug,
  slugFromTitle,
  transliterateArabic,
} from "./_slug";

type SlugWhere = {
  where?: {
    slug?: string;
    id?: { not?: string };
    productId?: { not?: string };
  };
};

const productFind = vi.mocked(prisma.product.findFirst);
const productTranslationFind = vi.mocked(prisma.productTranslation.findFirst);

function takenSlugs(identity: string[], translation: string[] = []) {
  const impl = async (args: SlugWhere | undefined, field: "id" | "productId") => {
    const slug = args?.where?.slug ?? "";
    const exclude =
      field === "id" ? args?.where?.id?.not : args?.where?.productId?.not;
    const pool = field === "id" ? identity : translation;
    if (!pool.includes(slug)) {
      return null;
    }
    if (exclude === "self") {
      return null;
    }
    return { id: "other" };
  };
  productFind.mockImplementation(((args?: SlugWhere) =>
    impl(args, "id")) as typeof prisma.product.findFirst);
  productTranslationFind.mockImplementation(((args?: SlugWhere) =>
    impl(args, "productId")) as typeof prisma.productTranslation.findFirst);
}

describe("transliterateArabic", () => {
  it("maps Arabic letters to Latin approximations", () => {
    expect(transliterateArabic("رياض")).toBe("ryad");
    expect(transliterateArabic("طباعة")).toBe("tbaaa");
  });
});

describe("reserved slugs", () => {
  it("flags admin, api, _next, shop, sitemap.xml, and robots.txt", () => {
    expect(isReservedSlug("admin")).toBe(true);
    expect(isReservedSlug("api")).toBe(true);
    expect(isReservedSlug("_next")).toBe(true);
    expect(isReservedSlug("shop")).toBe(true);
    expect(isReservedSlug("sitemap.xml")).toBe(true);
    expect(isReservedSlug("robots.txt")).toBe(true);
    expect(isReservedSlug("business-cards")).toBe(false);
  });

  it("slugifies dotted reserved names into the reserved set", () => {
    expect(isReservedSlug(slugFromTitle("sitemap.xml"))).toBe(true);
    expect(isReservedSlug(slugFromTitle("robots.txt"))).toBe(true);
  });
});

describe("generateUniqueSlug", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    takenSlugs([]);
  });

  it("appends -page when the base slug is reserved", async () => {
    await expect(generateUniqueSlug("product", "en", "Admin")).resolves.toBe("admin-page");
    await expect(generateUniqueSlug("product", "en", "shop")).resolves.toBe("shop-page");
    await expect(generateUniqueSlug("product", "en", "robots.txt")).resolves.toBe(
      "robotstxt-page",
    );
  });

  it("transliterates Arabic titles before slugifying", async () => {
    await expect(generateUniqueSlug("product", "ar", "رياض")).resolves.toBe("ryad");
  });

  it("appends -2, -3 on identity-slug collision", async () => {
    takenSlugs(["flyers", "flyers-2"]);
    await expect(generateUniqueSlug("product", "en", "Flyers")).resolves.toBe("flyers-3");
  });

  it("appends -2 when the translation slug is taken", async () => {
    takenSlugs([], ["business-cards"]);
    await expect(generateUniqueSlug("product", "en", "Business Cards")).resolves.toBe(
      "business-cards-2",
    );
  });

  it("ignores the current entity when excludeId is set", async () => {
    takenSlugs(["letterheads"]);
    await expect(
      generateUniqueSlug("product", "en", "Letterheads", "self"),
    ).resolves.toBe("letterheads");
    await expect(generateUniqueSlug("product", "en", "Letterheads")).resolves.toBe(
      "letterheads-2",
    );
  });
});
