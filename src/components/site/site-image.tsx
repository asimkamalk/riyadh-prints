import Image from "next/image";

import { cn } from "@/lib/utils";
import type { MediaDto } from "@/types/content";

export function SiteImage({
  media,
  alt,
  sizes,
  priority = false,
  className,
}: {
  media: MediaDto;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const width = media.width && media.width > 0 ? media.width : 800;
  const height = media.height && media.height > 0 ? media.height : 800;
  return (
    <Image
      src={media.url}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={cn("size-full object-cover", className)}
      placeholder={media.blurDataUrl ? "blur" : "empty"}
      blurDataURL={media.blurDataUrl ?? undefined}
    />
  );
}
