import Image from "next/image";

import { cn } from "@/lib/utils";
import type { AdminMediaRecord } from "@/server/queries/media";

export function MediaThumb({
  item,
  className,
  sizes = "160px",
}: {
  item: AdminMediaRecord;
  className?: string;
  sizes?: string;
}) {
  return (
    <div className={cn("bg-muted relative overflow-hidden", className)}>
      <Image
        src={item.url}
        alt={item.altEn || item.pathname}
        fill
        sizes={sizes}
        className="object-cover"
        unoptimized
        placeholder={item.blurDataUrl ? "blur" : "empty"}
        blurDataURL={item.blurDataUrl ?? undefined}
      />
    </div>
  );
}
