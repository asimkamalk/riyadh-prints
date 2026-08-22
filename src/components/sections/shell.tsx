import { asString } from "@/lib/sections/parse";
import { layoutClassName } from "@/lib/sections/layout";
import { cn } from "@/lib/utils";
import type { SectionRenderProps } from "@/lib/sections/types";

export function SectionShell({
  settings,
  className,
  children,
}: {
  settings: unknown;
  className?: string;
  children: React.ReactNode;
}) {
  const classes = layoutClassName(settings);
  return (
    <section className={cn(classes.section, className)}>
      <div className={classes.inner}>{children}</div>
    </section>
  );
}

export function SectionHeading({
  level,
  children,
}: {
  level: 1 | 2;
  children: React.ReactNode;
}) {
  if (level === 1) {
    return <h1 className="text-4xl font-semibold tracking-tight text-balance">{children}</h1>;
  }
  return <h2 className="text-2xl font-semibold tracking-tight text-balance">{children}</h2>;
}

export function SectionIntro({
  heading,
  subheading,
  headingLevel,
}: {
  heading: string;
  subheading?: string;
  headingLevel: 1 | 2;
}) {
  if (!heading && !subheading) {
    return null;
  }
  return (
    <div className="mb-8 grid max-w-3xl gap-2">
      {heading ? <SectionHeading level={headingLevel}>{heading}</SectionHeading> : null}
      {subheading ? <p className="text-muted-foreground text-lg">{subheading}</p> : null}
    </div>
  );
}

export function headingText(data: unknown): string {
  return asString(asRecordSafe(data).heading);
}

function asRecordSafe(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export function dataString(data: unknown, key: string): string {
  return asString(asRecordSafe(data)[key]);
}
