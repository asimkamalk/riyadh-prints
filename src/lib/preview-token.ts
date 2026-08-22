import { createHmac, timingSafeEqual } from "node:crypto";

export const PREVIEW_TYPES = ["product", "category", "service", "page"] as const;
export type PreviewEntityType = (typeof PREVIEW_TYPES)[number];

export type PreviewPayload = {
  type: PreviewEntityType;
  id: string;
  exp: number;
};

function secret(): string {
  const value = process.env.AUTH_SECRET?.trim();
  if (!value) {
    throw new Error("AUTH_SECRET is not set.");
  }
  return value;
}

function sign(body: string): string {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

export function signPreviewToken(
  input: { type: PreviewEntityType; id: string },
  ttlSeconds = 60 * 60,
): string {
  const payload: PreviewPayload = {
    type: input.type,
    id: input.id,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyPreviewToken(token: string | null | undefined): PreviewPayload | null {
  if (!token || !token.includes(".")) {
    return null;
  }
  const [body, sig] = token.split(".");
  if (!body || !sig) {
    return null;
  }
  let expected: string;
  try {
    expected = sign(body);
  } catch {
    return null;
  }
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as PreviewPayload;
    if (!PREVIEW_TYPES.includes(payload.type) || typeof payload.id !== "string") {
      return null;
    }
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
