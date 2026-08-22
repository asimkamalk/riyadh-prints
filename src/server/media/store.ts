import { randomUUID } from "node:crypto";

import { altFromFilename, mimeFromFilename, sanitizeFolder, type AllowedMimeType } from "@/lib/media-types";
import { ActionError } from "@/server/actions/_helpers";
import { deleteMediaBlob, putMediaBlob } from "@/server/media/blob";
import {
  assertUploadConstraints,
  MediaProcessError,
  processImageUpload,
} from "@/server/media/process";
import { prisma } from "@/server/db";
import { mapAdminMedia, type AdminMediaRecord } from "@/server/queries/media";

export async function storeUploadedMedia(input: {
  bytes: Buffer;
  filename: string;
  reportedType: string;
  folder?: string;
  userId: string;
}): Promise<AdminMediaRecord> {
  let mime: AllowedMimeType;
  try {
    mime = assertUploadConstraints(
      input.bytes,
      mimeFromFilename(input.filename, input.reportedType),
    );
  } catch (error) {
    throw toActionError(error);
  }

  let processed;
  try {
    processed = await processImageUpload(input.bytes, mime);
  } catch (error) {
    throw toActionError(error);
  }

  const folder = sanitizeFolder(input.folder);
  const id = randomUUID().replaceAll("-", "");
  const pathname = `media/${folder}/${id}.${processed.extension}`;
  const alt = altFromFilename(input.filename);

  const blob = await putMediaBlob({
    pathname,
    body: processed.buffer,
    contentType: processed.mimeType,
  });

  try {
    const row = await prisma.media.create({
      data: {
        url: blob.url,
        pathname: blob.pathname,
        provider: "vercel-blob",
        mimeType: processed.mimeType,
        width: processed.width,
        height: processed.height,
        blurDataUrl: processed.blurDataUrl,
        sizeBytes: processed.buffer.byteLength,
        folder,
        uploadedById: input.userId,
        translations: {
          create: [
            { locale: "EN", alt, title: alt },
            { locale: "AR", alt, title: alt },
          ],
        },
      },
      include: { translations: true },
    });
    return mapAdminMedia(row);
  } catch (error) {
    await deleteMediaBlob(blob.url);
    throw error;
  }
}

export async function deleteStoredBlob(row: {
  url: string;
  provider: string;
}): Promise<void> {
  if (row.provider === "vercel-blob") {
    await deleteMediaBlob(row.url);
  }
}

function toActionError(error: unknown): ActionError {
  if (error instanceof ActionError) {
    return error;
  }
  if (error instanceof MediaProcessError) {
    return new ActionError(error.message, "INVALID");
  }
  return new ActionError("Could not process this image.", "INVALID");
}
