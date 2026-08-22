import Link from "next/link";

import { isExternalHref } from "@/components/site/nav-utils";
import { cn } from "@/lib/utils";

export function MenuLink({
  href,
  openInNewTab,
  className,
  children,
  onClick,
}: {
  href: string;
  openInNewTab?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const classNames = cn("hover:text-primary", className);
  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        className={classNames}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href as never} className={classNames} onClick={onClick}>
      {children}
    </Link>
  );
}
