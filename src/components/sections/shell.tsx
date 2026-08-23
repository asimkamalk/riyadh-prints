import { layoutClassName, parseLayout } from "@/lib/sections/layout";
import { asString } from "@/lib/sections/parse";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

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
      <Reveal className={classes.inner}>{children}</Reveal>
    </section>
  );
}

export function AccentText({ children }: { children: string }) {
  const parts = children.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) {
    return children;
  }
  return (
    <>
      {parts.map((part, index) => {
        const marked = part.match(/^\*\*([^*]+)\*\*$/);
        if (marked?.[1]) {
          return (
            <span key={index} className="text-primary">
              {marked[1]}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

export function SectionHeading({
  level,
  children,
}: {
  level: 1 | 2;
  children: React.ReactNode;
}) {
  const content = typeof children === "string" ? <AccentText>{children}</AccentText> : children;
  if (level === 1) {
    return <h1 className="text-h1 font-bold tracking-tight">{content}</h1>;
  }
  return <h2 className="text-h2 font-bold tracking-tight">{content}</h2>;
}

export function SectionIntro({
  heading,
  subheading,
  headingLevel,
  settings,
}: {
  heading: string;
  subheading?: string;
  headingLevel: 1 | 2;
  settings?: unknown;
}) {
  if (!heading && !subheading) {
    return null;
  }
  const centered = settings ? parseLayout(settings).alignment === "center" : false;
  return (
    <div className={cn("mb-8 w-full", centered && "text-center")}>
      {heading ? <SectionHeading level={headingLevel}>{heading}</SectionHeading> : null}
      {subheading ? (
        <p
          className={cn(
            "mt-3 text-lg leading-relaxed text-muted-foreground",
            centered && "mx-auto w-full max-w-(--container-2xl)",
          )}
        >
          {subheading}
        </p>
      ) : null}
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
