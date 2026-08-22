import { chromeText } from "@/components/site/copy";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  PinterestIcon,
  XSocialIcon,
} from "@/components/site/icons";
import type { Locale } from "@/i18n/locales";
import type { SiteSettingsDto } from "@/types/content";

const networks = [
  { key: "facebook" as const, Icon: FacebookIcon, label: "Facebook" },
  { key: "instagram" as const, Icon: InstagramIcon, label: "Instagram" },
  { key: "linkedin" as const, Icon: LinkedinIcon, label: "LinkedIn" },
  { key: "pinterest" as const, Icon: PinterestIcon, label: "Pinterest" },
  { key: "x" as const, Icon: XSocialIcon, label: "X" },
];

export function SocialLinks({
  locale,
  social,
}: {
  locale: Locale;
  social: SiteSettingsDto["social"];
}) {
  const links = networks
    .map((network) => ({ ...network, href: social[network.key] }))
    .filter((network): network is typeof network & { href: string } => Boolean(network.href));
  if (links.length === 0) {
    return null;
  }
  return (
    <ul className="flex items-center gap-3" aria-label={chromeText(locale, "social")}>
      {links.map((network) => (
        <li key={network.key}>
          <a
            href={network.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex size-9 items-center justify-center rounded-full border hover:bg-muted"
            aria-label={network.label}
          >
            <network.Icon className="size-4" />
          </a>
        </li>
      ))}
    </ul>
  );
}
