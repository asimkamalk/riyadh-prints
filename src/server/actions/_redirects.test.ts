import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  deleteMany,
  updateMany,
  findUnique,
  update,
  create,
  transaction,
} = vi.hoisted(() => ({
  deleteMany: vi.fn(),
  updateMany: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/server/db", () => ({
  prisma: {
    $transaction: (...args: unknown[]) => transaction(...args),
    redirect: {
      deleteMany,
      updateMany,
      findUnique,
      update,
      create,
    },
  },
}));

import {
  ensurePermanentRedirect,
  redirectOnPublishedSlugChange,
} from "./_redirects";

describe("ensurePermanentRedirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation(async (fn: (tx: unknown) => Promise<void>) => {
      await fn({
        redirect: { deleteMany, updateMany, findUnique, update, create },
      });
    });
    findUnique.mockResolvedValue(null);
    deleteMany.mockResolvedValue({ count: 0 });
    updateMany.mockResolvedValue({ count: 0 });
    create.mockResolvedValue({ id: "r1" });
    update.mockResolvedValue({ id: "r1" });
  });

  it("creates a PERMANENT redirect from the old path to the new path", async () => {
    const result = await ensurePermanentRedirect("/product/old-slug", "/product/new-slug");
    expect(result).toEqual({
      created: true,
      source: "/product/old-slug",
      destination: "/product/new-slug",
    });
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        source: "/product/old-slug",
        destination: "/product/new-slug",
        type: "PERMANENT",
        isActive: true,
      }),
    });
  });

  it("skips when source and destination are the same path", async () => {
    const result = await ensurePermanentRedirect("/product/same", "product/same");
    expect(result.created).toBe(false);
    expect(transaction).not.toHaveBeenCalled();
  });

  it("deletes a redirect whose source is the new path to avoid loops", async () => {
    await ensurePermanentRedirect("/product/a", "/product/b");
    expect(deleteMany).toHaveBeenCalledWith({ where: { source: "/product/b" } });
  });

  it("retargets existing redirects that already pointed at the old path", async () => {
    await ensurePermanentRedirect("/product/a", "/product/b");
    expect(updateMany).toHaveBeenCalledWith({
      where: { destination: "/product/a" },
      data: { destination: "/product/b" },
    });
  });

  it("updates an existing row when the old path is already a redirect source", async () => {
    findUnique.mockResolvedValue({ source: "/product/a", note: "keep" });
    await ensurePermanentRedirect("/product/a", "/product/c", "rename");
    expect(update).toHaveBeenCalledWith({
      where: { source: "/product/a" },
      data: expect.objectContaining({
        destination: "/product/c",
        type: "PERMANENT",
        isActive: true,
      }),
    });
    expect(create).not.toHaveBeenCalled();
  });
});

describe("redirectOnPublishedSlugChange", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation(async (fn: (tx: unknown) => Promise<void>) => {
      await fn({
        redirect: { deleteMany, updateMany, findUnique, update, create },
      });
    });
    findUnique.mockResolvedValue(null);
    deleteMany.mockResolvedValue({ count: 0 });
    updateMany.mockResolvedValue({ count: 0 });
    create.mockResolvedValue({ id: "r1" });
  });

  it("creates EN and AR public-path redirects for a published product rename", async () => {
    await redirectOnPublishedSlugChange({
      published: true,
      entityType: "product",
      oldSlug: "old-slug",
      newSlug: "new-slug",
      locale: "en",
    });
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        source: "/product/old-slug",
        destination: "/product/new-slug",
        type: "PERMANENT",
      }),
    });

    create.mockClear();
    await redirectOnPublishedSlugChange({
      published: true,
      entityType: "product",
      oldSlug: "old-slug",
      newSlug: "new-slug",
      locale: "ar",
    });
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        source: "/ar/product/old-slug",
        destination: "/ar/product/new-slug",
        type: "PERMANENT",
      }),
    });
  });

  it("does not create a redirect when the entity is unpublished", async () => {
    const result = await redirectOnPublishedSlugChange({
      published: false,
      entityType: "product",
      oldSlug: "old-slug",
      newSlug: "new-slug",
      locale: "en",
    });
    expect(result).toBeNull();
    expect(transaction).not.toHaveBeenCalled();
  });

  it("does not create a redirect when the slug is unchanged", async () => {
    const result = await redirectOnPublishedSlugChange({
      published: true,
      entityType: "product",
      oldSlug: "same",
      newSlug: "same",
      locale: "en",
    });
    expect(result).toBeNull();
    expect(transaction).not.toHaveBeenCalled();
  });
});
