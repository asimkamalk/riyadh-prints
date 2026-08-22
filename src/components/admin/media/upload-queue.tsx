"use client";

import { cn } from "@/lib/utils";

export type MediaUploadJob = {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "processing" | "done" | "error";
  error?: string;
};

export function MediaUploadQueue({ jobs }: { jobs: readonly MediaUploadJob[] }) {
  if (jobs.length === 0) {
    return null;
  }

  return (
    <ul className="grid gap-2 rounded-lg border p-3">
      {jobs.map((job) => (
        <li key={job.id} className="grid gap-1">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="truncate">{job.name}</span>
            <span className="text-muted-foreground shrink-0">
              {job.status === "error"
                ? job.error
                : job.status === "processing"
                  ? "Processing…"
                  : job.status === "done"
                    ? "Done"
                    : `${job.progress}%`}
            </span>
          </div>
          <div className="bg-muted h-1.5 overflow-hidden rounded-full">
            <div
              className={cn(
                "h-full rounded-full transition-[width]",
                job.status === "error" ? "bg-destructive" : "bg-primary",
              )}
              style={{ width: `${job.status === "done" ? 100 : job.progress}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
