"use client";

import { useState } from "react";

import { uploadMediaFile } from "@/components/admin/media/upload-client";
import type { MediaUploadJob } from "@/components/admin/media/upload-queue";

export function useMediaUploads(onComplete: () => void) {
  const [jobs, setJobs] = useState<MediaUploadJob[]>([]);

  async function uploadFiles(files: File[], folder: string) {
    const queue = files.map((file) => ({ id: crypto.randomUUID(), file }));
    setJobs((current) => [
      ...current,
      ...queue.map(({ id, file }) => ({
        id,
        name: file.name,
        progress: 0,
        status: "uploading" as const,
      })),
    ]);
    let cursor = 0;
    async function worker() {
      while (cursor < queue.length) {
        const job = queue[cursor];
        cursor += 1;
        if (!job) continue;
        await runOne(job.id, job.file, folder, setJobs);
      }
    }
    await Promise.all([worker(), worker(), worker()]);
    onComplete();
  }

  const visible = jobs.filter((job) => job.status !== "done");
  return { jobs: visible, uploadFiles };
}

async function runOne(
  id: string,
  file: File,
  folder: string,
  setJobs: React.Dispatch<React.SetStateAction<MediaUploadJob[]>>,
) {
  try {
    await uploadMediaFile(file, folder, (percent) => {
      setJobs((current) =>
        current.map((job) =>
          job.id === id
            ? {
                ...job,
                progress: percent,
                status: percent >= 99 ? "processing" : "uploading",
              }
            : job,
        ),
      );
    });
    setJobs((current) =>
      current.map((job) => (job.id === id ? { ...job, progress: 100, status: "done" } : job)),
    );
  } catch (error) {
    setJobs((current) =>
      current.map((job) =>
        job.id === id
          ? {
              ...job,
              status: "error",
              error: error instanceof Error ? error.message : "Upload failed.",
            }
          : job,
      ),
    );
  }
}
