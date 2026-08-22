import { del, put } from "@vercel/blob";

import { ActionError } from "@/server/actions/_helpers";

function blobToken(): string | undefined {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  return token ? token : undefined;
}

export async function putMediaBlob(input: {
  pathname: string;
  body: Buffer;
  contentType: string;
}): Promise<{ url: string; pathname: string }> {
  try {
    const blob = await put(input.pathname, input.body, {
      access: "public",
      contentType: input.contentType,
      addRandomSuffix: false,
      token: blobToken(),
    });
    return { url: blob.url, pathname: blob.pathname };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/token|BLOB_READ_WRITE|not configured|unauthorized/i.test(message) || !blobToken()) {
      throw new ActionError(
        "Blob storage is not configured. Set BLOB_READ_WRITE_TOKEN.",
        "INVALID",
      );
    }
    throw new ActionError("Could not upload to Blob storage.", "INVALID");
  }
}

export async function deleteMediaBlob(urlOrPathname: string): Promise<void> {
  try {
    await del(urlOrPathname, { token: blobToken() });
  } catch {
    // Legacy WordPress URLs and already-deleted blobs are ignored.
  }
}
