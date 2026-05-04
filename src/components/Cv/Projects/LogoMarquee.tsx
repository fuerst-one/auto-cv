import { CvProject } from "@/server/notion/getCvProjects";
import { getProjectLogoSources } from "./getProjectLogoSources";
import uniqBy from "lodash/uniqBy";

export const LogoMarquee = ({ projects }: { projects: CvProject[] }) => {
  const logos = projects.flatMap((project) =>
    getProjectLogoSources(project).map((src) => ({
      src,
      alt: `${project.clients[0]?.name ?? project.name} logo`,
    })),
  );

  if (logos.length === 0) {
    return null;
  }

  const uniqueLogos = uniqBy(logos, "alt");
  const animationDurationSeconds = Math.max(uniqueLogos.length * 4, 24);

  return (
    <div className="relative overflow-hidden border border-white/20 bg-white/20 px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-32"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-32"
      />
      <div
        className="flex w-max items-center gap-12 py-3 motion-safe:animate-marquee"
        style={{
          animationDuration: `${animationDurationSeconds}s`,
        }}
      >
        {uniqueLogos.map((logo, index) => (
          <span
            key={`${logo.src}-${index}`}
            className="flex h-8 items-center"
            aria-label={logo.alt}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo.src}
              alt={logo.alt}
              className="h-full w-auto max-w-[9rem] object-contain opacity-90 grayscale [mix-blend-mode:screen]"
              loading="lazy"
            />
          </span>
        ))}
      </div>
    </div>
  );
};
