import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { tags } from "@/lib/cache-tags";
import { CONTENT_ROLES, enforceRateLimit } from "@/server/actions/_helpers";
import { getCurrentUser } from "@/server/auth/guards";
import { prisma } from "@/server/db";
import { storeUploadedMedia } from "@/server/media/store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Please sign in." }, { status: 401 });
  }
  if (!CONTENT_ROLES.includes(user.role)) {
    return NextResponse.json(
      { ok: false, error: "You do not have permission to do that." },
      { status: 403 },
    );
  }

  try {
    enforceRateLimit(`media.upload:${user.id}`, 60_000, 30);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Too many uploads. Please try again later." },
      { status: 429 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  const folder = typeof form.get("folder") === "string" ? String(form.get("folder")) : "uploads";

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Choose a file to upload." }, { status: 400 });
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const record = await storeUploadedMedia({
      bytes,
      filename: file.name,
      reportedType: file.type,
      folder,
      userId: user.id,
    });
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "media.upload",
        entityType: "media",
        entityId: record.id,
        after: { id: record.id, pathname: record.pathname },
      },
    });
    revalidateTag(tags.media());
    revalidateTag(tags.global());
    return NextResponse.json({ ok: true, data: record });
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Could not upload this file.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
