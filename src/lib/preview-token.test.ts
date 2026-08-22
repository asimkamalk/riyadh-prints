import { afterEach, describe, expect, it } from "vitest";

import { signPreviewToken, verifyPreviewToken } from "./preview-token";

const SECRET = "test-auth-secret-for-preview-tokens-32";

describe("preview tokens", () => {
  afterEach(() => {
    delete process.env.AUTH_SECRET;
  });

  it("round-trips a valid product token", () => {
    process.env.AUTH_SECRET = SECRET;
    const token = signPreviewToken({ type: "product", id: "prod_1" }, 60);
    const payload = verifyPreviewToken(token);
    expect(payload).toMatchObject({ type: "product", id: "prod_1" });
    expect(payload?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it("round-trips a valid page token", () => {
    process.env.AUTH_SECRET = SECRET;
    const token = signPreviewToken({ type: "page", id: "page_1" }, 60);
    const payload = verifyPreviewToken(token);
    expect(payload).toMatchObject({ type: "page", id: "page_1" });
  });

  it("rejects a tampered signature", () => {
    process.env.AUTH_SECRET = SECRET;
    const token = signPreviewToken({ type: "category", id: "cat_1" }, 60);
    expect(verifyPreviewToken(`${token}x`)).toBeNull();
  });

  it("rejects an expired token", () => {
    process.env.AUTH_SECRET = SECRET;
    const token = signPreviewToken({ type: "service", id: "svc_1" }, -10);
    expect(verifyPreviewToken(token)).toBeNull();
  });

  it("rejects missing secret at verify time without throwing", () => {
    process.env.AUTH_SECRET = SECRET;
    const token = signPreviewToken({ type: "product", id: "prod_1" }, 60);
    delete process.env.AUTH_SECRET;
    expect(verifyPreviewToken(token)).toBeNull();
  });
});
