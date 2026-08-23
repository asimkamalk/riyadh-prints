import Image from "next/image";

import { InlineCopy } from "@/components/sections/about-layouts";
import { Breadcrumbs, type Crumb } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { ShareButtons } from "@/components/site/share-buttons";
import { TeamContactForm } from "@/components/site/team-contact-form";
import { getSiteUrl } from "@/lib/utils/site-url";
import { personFromTeamMember } from "@/lib/seo/json-ld";
import type { Locale } from "@/i18n/locales";
import type { TeamMemberDetail } from "@/types/content";

const copy = {
  en: {
    experience: "Personal experience",
    awards: "Honors & awards",
    contact: "Contact me",
    email: "E-mail",
    share: "Share",
    linkedin: "LinkedIn",
  },
  ar: {
    experience: "الخبرة الشخصية",
    awards: "الجوائز والتكريم",
    contact: "تواصل معي",
    email: "البريد الإلكتروني",
    share: "مشاركة",
    linkedin: "لينكدإن",
  },
} as const;

function splitParagraphs(text: string | null): string[] {
  if (!text?.trim()) {
    return [];
  }
  return text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function TeamProfileView({
  locale,
  member,
  crumbs,
}: {
  locale: Locale;
  member: TeamMemberDetail;
  crumbs: Crumb[];
}) {
  const text = copy[locale];
  const pageUrl = `${getSiteUrl()}${member.href}`;
  const experience = splitParagraphs(member.experience);
  const awards = splitParagraphs(member.awards);

  return (
    <article className="container-page py-xl">
      <Breadcrumbs items={crumbs} />
      <JsonLd data={personFromTeamMember(member)} />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:items-start">
        <div className="mx-auto w-full max-w-xs lg:mx-0">
          <div className="relative aspect-square overflow-hidden rounded-full bg-muted">
            {member.avatar ? (
              <Image
                src={member.avatar.url}
                alt={member.avatar.alt || member.name}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 20rem, 60vw"
                placeholder={member.avatar.blurDataUrl ? "blur" : "empty"}
                blurDataURL={member.avatar.blurDataUrl ?? undefined}
              />
            ) : (
              <span className="grid size-full place-items-center text-5xl font-semibold text-primary">
                {member.name.slice(0, 1)}
              </span>
            )}
          </div>
        </div>
        <div className="grid gap-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">{member.name}</h1>
            <div className="mt-2 space-y-1 text-muted-foreground">
              {member.role ? <p>{member.role}</p> : null}
              {member.secondaryRole ? <p>{member.secondaryRole}</p> : null}
            </div>
          </div>
          {member.bio ? (
            <p className="max-w-3xl text-muted-foreground">
              <InlineCopy text={member.bio} />
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            {member.socials.linkedin ? (
              <a href={member.socials.linkedin} className="font-medium underline-offset-2 hover:underline">
                {text.linkedin}
              </a>
            ) : null}
            {member.email ? (
              <a href={`mailto:${member.email}`} className="text-muted-foreground hover:text-foreground">
                {text.email}: {member.email}
              </a>
            ) : null}
          </div>
          <div className="grid gap-2">
            <span className="text-sm text-muted-foreground">{text.share}</span>
            <ShareButtons locale={locale} url={pageUrl} title={member.name} />
          </div>
          {member.skills.length ? (
            <ul className="grid max-w-2xl gap-4">
              {member.skills.map((skill) => (
                <li key={skill.label}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span>{skill.label}</span>
                    <span className="text-muted-foreground">{skill.percent}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${skill.percent}%` }}
                      role="progressbar"
                      aria-valuenow={skill.percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={skill.label}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {experience.length ? (
        <section className="mt-16 max-w-4xl">
          <h2 className="text-2xl font-semibold tracking-tight">{text.experience}</h2>
          <div className="mt-6 grid gap-4 text-muted-foreground">
            {experience.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-start">
        {awards.length ? (
          <section>
            <h2 className="text-2xl font-semibold tracking-tight">{text.awards}</h2>
            <div className="mt-6 grid gap-4 text-muted-foreground">
              {awards.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
          </section>
        ) : (
          <div />
        )}
        <section>
          <h2 className="text-2xl font-semibold tracking-tight">{text.contact}</h2>
          <div className="mt-6">
            <TeamContactForm locale={locale} memberName={member.name} memberPhone={member.phone} />
          </div>
        </section>
      </div>
    </article>
  );
}
