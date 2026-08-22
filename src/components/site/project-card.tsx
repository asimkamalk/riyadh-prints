import Link from "next/link";

import { SiteImage } from "@/components/site/site-image";
import type { ProjectCard as ProjectCardDto } from "@/types/content";

export function ProjectCard({ project }: { project: ProjectCardDto }) {
  return (
    <article className="group h-full overflow-hidden rounded-xl border bg-card shadow-xs transition-shadow hover:shadow-elevate-1">
      <Link href={project.href as never} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {project.coverImage ? (
            <SiteImage
              media={project.coverImage}
              alt={project.coverImage.alt || project.title}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]"
            />
          ) : null}
        </div>
        <div className="grid gap-1 p-5">
          {project.category ? (
            <p className="text-xs text-muted-foreground">{project.category.name}</p>
          ) : null}
          <h3 className="font-medium">{project.title}</h3>
          {project.summary ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">{project.summary}</p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
