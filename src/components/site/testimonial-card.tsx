import { SiteImage } from "@/components/site/site-image";
import type { TestimonialDto } from "@/types/content";

export function TestimonialCard({ testimonial }: { testimonial: TestimonialDto }) {
  const byline = [testimonial.authorRole, testimonial.company].filter(Boolean).join(" · ");
  return (
    <figure className="grid h-full gap-4 rounded-xl border bg-card p-5 shadow-xs">
      {testimonial.rating ? (
        <p className="text-sm text-accent" aria-label={`${testimonial.rating} / 5`}>
          {"★".repeat(Math.round(testimonial.rating))}
        </p>
      ) : null}
      <blockquote className="text-sm leading-relaxed">{testimonial.quote}</blockquote>
      <figcaption className="mt-auto flex items-center gap-3">
        {testimonial.avatar ? (
          <span className="relative size-10 overflow-hidden rounded-full bg-muted">
            <SiteImage
              media={testimonial.avatar}
              alt={testimonial.avatar.alt || testimonial.authorName}
              sizes="40px"
              className="object-cover"
            />
          </span>
        ) : null}
        <span>
          <span className="block text-sm font-medium">{testimonial.authorName}</span>
          {byline ? <span className="block text-xs text-muted-foreground">{byline}</span> : null}
        </span>
      </figcaption>
    </figure>
  );
}
