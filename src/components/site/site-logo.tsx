import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

const MARK_SRC = "/brand/logo.svg";
const MARK_SIZE = 40;

export function SiteLogo({
  companyName,
  href,
  priority = false,
  className,
}: {
  companyName: string;
  href: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href as never}
      className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}
    >
      <Image
        src={MARK_SRC}
        alt={companyName}
        width={MARK_SIZE}
        height={MARK_SIZE}
        priority={priority}
        unoptimized
      />
      <span aria-hidden="true">{companyName}</span>
    </Link>
  );
}
