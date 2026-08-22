import { createHash } from "node:crypto";

import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import type { z } from "zod";

import type { Prisma } from "@/generated/prisma/client";
import type { UserRole } from "@/generated/prisma/enums";
import { tags } from "@/lib/cache-tags";
import { getSessionUser, type ActionUser } from "@/server/auth";
import { prisma } from "@/server/db";

export type { ActionUser };

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export const CONTENT_ROLES: readonly UserRole[] = ["ADMIN", "EDITOR"];
export const ADMIN_ROLES: readonly UserRole[] = ["ADMIN"];

export class ActionError extends Error {
  readonly code:
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "RATE_LIMIT"
    | "CONFLICT"
    | "INVALID";

  constructor(
    message: string,
    code: ActionError["code"] = "INVALID",
  ) {
    super(message);
    this.name = "ActionError";
    this.code = code;
  }
}

export async function requireRole(
  roles: readonly UserRole[],
): Promise<ActionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new ActionError("Please sign in.", "UNAUTHORIZED");
  }
  if (!roles.includes(user.role)) {
    throw new ActionError("You do not have permission to do that.", "FORBIDDEN");
  }
  return user;
}

function fieldErrorsFromZod(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "_root";
    const list = out[key] ?? [];
    list.push(issue.message);
    out[key] = list;
  }
  return out;
}

function jsonSafe(value: unknown): Prisma.InputJsonValue {
  try {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  } catch {
    return {};
  }
}

function toMetaResult(value: unknown): ActionMetaResult {
  const record =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};
  return {
    id: typeof record.id === "string" ? record.id : "unknown",
    slug: typeof record.slug === "string" ? record.slug : "",
    location: typeof record.location === "string" ? record.location : "",
    key: typeof record.key === "string" ? record.key : "",
  };
}

const rateBuckets = new Map<string, number[]>();

export function resetRateLimitForTests(): void {
  rateBuckets.clear();
}

export function enforceRateLimit(
  key: string,
  windowMs: number,
  max: number,
): void {
  const now = Date.now();
  const recent = (rateBuckets.get(key) ?? []).filter((stamp) => now - stamp < windowMs);
  if (recent.length >= max) {
    throw new ActionError(
      "Too many requests. Please try again later.",
      "RATE_LIMIT",
    );
  }
  recent.push(now);
  rateBuckets.set(key, recent);
}

export async function getRequestMeta(): Promise<{
  ipHash: string;
  userAgent: string | null;
}> {
  try {
    const headerList = await headers();
    const forwarded = headerList.get("x-forwarded-for");
    const ip =
      forwarded?.split(",")[0]?.trim() ||
      headerList.get("x-real-ip") ||
      "unknown";
    const ipHash = createHash("sha256").update(ip).digest("hex");
    return { ipHash, userAgent: headerList.get("user-agent") };
  } catch {
    return { ipHash: "unknown", userAgent: null };
  }
}

type ActionContext<TInput> = {
  input: TInput;
  user: ActionUser | null;
  ipHash: string;
  userAgent: string | null;
};

/**
 * Fields that revalidate/audit callbacks may read. Handlers often return a subset;
 * `createAction` only uses `id` for the audit row.
 */
export type ActionMetaResult = {
  id: string;
  slug: string;
  location: string;
  key: string;
};

export type CreateActionOptions<TSchema extends z.ZodType, TReturn> = {
  input: TSchema;
  roles: readonly UserRole[] | "public";
  handler: (ctx: ActionContext<z.infer<TSchema>>) => TReturn;
  revalidate: (input: z.infer<TSchema>, result: ActionMetaResult) => string[];
  audit: {
    action: string;
    entityType: string;
    entityId: (input: z.infer<TSchema>, result: ActionMetaResult) => string;
  };
  rateLimit?: {
    windowMs: number;
    max: number;
    key?: (input: z.infer<TSchema>, ipHash: string) => string;
  };
};

/**
 * Every server action in the app is created with this helper.
 * Pipeline: Zod → requireRole (unless public) → handler → AuditLog → revalidateTag → ActionResult.
 */
export function createAction<TSchema extends z.ZodType, TReturn>(
  options: CreateActionOptions<TSchema, TReturn>,
) {
  return async (raw: unknown): Promise<ActionResult<Awaited<TReturn>>> => {
    const parsed = options.input.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Invalid input.",
        fieldErrors: fieldErrorsFromZod(parsed.error),
      };
    }

    try {
      const { ipHash, userAgent } = await getRequestMeta();
      const user =
        options.roles === "public"
          ? await getSessionUser()
          : await requireRole(options.roles);

      if (options.rateLimit) {
        const key =
          options.rateLimit.key?.(parsed.data, ipHash) ??
          `${options.audit.action}:${ipHash}`;
        enforceRateLimit(key, options.rateLimit.windowMs, options.rateLimit.max);
      }

      const result = await options.handler({
        input: parsed.data,
        user,
        ipHash,
        userAgent,
      });
      const meta = toMetaResult(result);

      await prisma.auditLog.create({
        data: {
          userId: user?.id ?? null,
          action: options.audit.action,
          entityType: options.audit.entityType,
          entityId: options.audit.entityId(parsed.data, meta),
          after: jsonSafe(result),
          ip: ipHash,
        },
      });

      const tagList = [
        ...options.revalidate(parsed.data, meta),
        tags.sitemap(),
      ];
      for (const tag of [...new Set(tagList)]) {
        revalidateTag(tag);
      }

      return { ok: true, data: result };
    } catch (error) {
      if (error instanceof ActionError) {
        return { ok: false, error: error.message };
      }
      return { ok: false, error: "Something went wrong." };
    }
  };
}
