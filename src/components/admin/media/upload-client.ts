"use client";

import type { AdminMediaRecord } from "@/server/queries/media";

export function uploadMediaFile(
  file: File,
  folder: string,
  onProgress: (percent: number) => void,
): Promise<AdminMediaRecord> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
      }
    };
    xhr.onload = () => {
      const body = parseBody(xhr.responseText);
      if (xhr.status >= 200 && xhr.status < 300 && body?.ok && body.data) {
        onProgress(100);
        resolve(body.data);
        return;
      }
      reject(new Error(body?.error ?? "Upload failed."));
    };
    xhr.onerror = () => reject(new Error("Network error while uploading."));
    const data = new FormData();
    data.append("file", file);
    data.append("folder", folder);
    xhr.send(data);
  });
}

function parseBody(text: string): {
  ok?: boolean;
  data?: AdminMediaRecord;
  error?: string;
} | null {
  try {
    return JSON.parse(text) as {
      ok?: boolean;
      data?: AdminMediaRecord;
      error?: string;
    };
  } catch {
    return null;
  }
}
