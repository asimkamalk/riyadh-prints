import type { ContentStatus } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";

const LABELS: Record<ContentStatus, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  const variant = status === "PUBLISHED" ? "default" : status === "ARCHIVED" ? "outline" : "secondary";
  return <Badge variant={variant}>{LABELS[status]}</Badge>;
}
