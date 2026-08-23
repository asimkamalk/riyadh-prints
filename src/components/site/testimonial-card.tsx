import { SiteImage } from "@/components/site/site-image";
import type { TestimonialDto } from "@/types/content";

export function TestimonialCard({ testimonial }: { testimonial: TestimonialDto }) {
  const byline = [testimonial.authorRole, testimonial.company].filter(Boolean).join(" · ");
  const initial = testimonial.authorName.trim().charAt(0).toUpperCase() || "R";
  const stars = Math.round(testimonial.rating ?? 0);

  return (
    <figure className="grid h-full gap-3 rounded-2xl border bg-card p-5 shadow-xs">
      <figcaption className="flex items-center gap-3">
        {testimonial.avatar ? (
          <span className="relative size-10 overflow-hidden rounded-full bg-muted">
            <SiteImage
              media={testimonial.avatar}
              alt={testimonial.avatar.alt || testimonial.authorName}
              sizes="40px"
              className="object-cover"
            />
          </span>
        ) : (
          <span
            aria-hidden
            className="grid size-10 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-primary"
          >
            {initial}
          </span>
        )}
        <span>
          <span className="block text-sm font-semibold">{testimonial.authorName}</span>
          {byline ? <span className="block text-xs text-muted-foreground">{byline}</span> : null}
        </span>
      </figcaption>
      {stars > 0 ? (
        <p className="text-sm text-amber-500" aria-label={`${stars} / 5`}>
          {"★".repeat(stars)}
        </p>
      ) : null}
      <blockquote className="text-sm leading-relaxed text-muted-foreground">{testimonial.quote}</blockquote>
    </figure>
  );
}
