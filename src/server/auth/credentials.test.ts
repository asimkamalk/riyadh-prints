import { beforeEach, describe, expect, it, vi } from "vitest";

const compare = vi.hoisted(() => vi.fn());
const findUnique = vi.hoisted(() => vi.fn());
const update = vi.hoisted(() => vi.fn());

vi.mock("bcryptjs", () => ({
  compare: (...args: unknown[]) => compare(...args),
}));

vi.mock("@/server/db", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => findUnique(...args),
      update: (...args: unknown[]) => update(...args),
    },
  },
}));

import { authorizeCredentials, INVALID_CREDENTIALS_MESSAGE } from "./credentials";

const activeUser = {
  id: "u1",
  email: "admin@riyadhprints.com",
  name: "Admin",
  role: "ADMIN" as const,
  passwordHash: "$2b$12$realhash",
  isActive: true,
};

describe("authorizeCredentials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    compare.mockResolvedValue(false);
    findUnique.mockResolvedValue(null);
    update.mockResolvedValue(activeUser);
  });

  it("returns null with a generic failure for unknown emails after a hash compare", async () => {
    const result = await authorizeCredentials({
      email: "nobody@example.com",
      password: "whatever-long",
    });
    expect(result).toBeNull();
    expect(compare).toHaveBeenCalledOnce();
    expect(update).not.toHaveBeenCalled();
  });

  it("returns null for a known email with the wrong password", async () => {
    findUnique.mockResolvedValue(activeUser);
    compare.mockResolvedValue(false);
    const result = await authorizeCredentials({
      email: "admin@riyadhprints.com",
      password: "wrong-password",
    });
    expect(result).toBeNull();
    expect(update).not.toHaveBeenCalled();
  });

  it("returns the user when the password matches", async () => {
    findUnique.mockResolvedValue(activeUser);
    compare.mockResolvedValue(true);
    const result = await authorizeCredentials({
      email: "admin@riyadhprints.com",
      password: "correct-horse",
    });
    expect(result).toEqual({
      id: "u1",
      email: "admin@riyadhprints.com",
      name: "Admin",
      role: "ADMIN",
    });
    expect(update).toHaveBeenCalledOnce();
  });

  it("does not distinguish invalid input from a failed login", async () => {
    const result = await authorizeCredentials({ email: "not-an-email", password: "" });
    expect(result).toBeNull();
    expect(compare).toHaveBeenCalledOnce();
    expect(INVALID_CREDENTIALS_MESSAGE.length).toBeGreaterThan(0);
  });
});
