import { chromeText } from "@/components/site/copy";
import {
  FacebookIcon,
  LinkedinIcon,
  WhatsAppIcon,
  XSocialIcon,
} from "@/components/site/icons";
import type { Locale } from "@/i18n/locales";

export function ShareButtons({
  locale,
  url,
  title,
}: {
  locale: Locale;
  url: string;
  title: string;
}) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const links = [
    {
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      label: chromeText(locale, "shareWhatsapp"),
      Icon: WhatsAppIcon,
    },
    {
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      label: chromeText(locale, "shareX"),
      Icon: XSocialIcon,
    },
    {
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      label: chromeText(locale, "shareFacebook"),
      Icon: FacebookIcon,
    },
    {
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
      label: chromeText(locale, "shareLinkedin"),
      Icon: LinkedinIcon,
    },
    {
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      label: chromeText(locale, "shareEmail"),
      Icon: MailIcon,
    },
  ];

  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label={chromeText(locale, "share")}>
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            target={link.href.startsWith("mailto:") ? undefined : "_blank"}
            rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
            className="inline-flex size-9 items-center justify-center rounded-full border hover:bg-muted"
            aria-label={link.label}
          >
            <link.Icon className="size-4" />
          </a>
        </li>
      ))}
    </ul>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}
