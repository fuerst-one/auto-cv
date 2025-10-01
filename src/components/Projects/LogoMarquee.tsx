type LogoMarqueeProps = {
  logos: { src: string; alt: string }[];
};

const getUniqueLogos = (logos: LogoMarqueeProps["logos"]) => {
  const seen = new Set<string>();

  return logos.filter(({ src }) => {
    if (seen.has(src)) {
      return false;
    }

    seen.add(src);
    return true;
  });
};

export const LogoMarquee = ({ logos }: LogoMarqueeProps) => {
  const uniqueLogos = getUniqueLogos(logos);

  if (uniqueLogos.length === 0) {
    return null;
  }

  const marqueeItems = [...uniqueLogos, ...uniqueLogos];
  const animationDurationSeconds = Math.max(uniqueLogos.length * 4, 24);

  return (
    <div className="relative overflow-hidden rounded-full border border-white/10 bg-white/5 px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-900 via-slate-900/80 to-transparent"
      />
      <div
        className="flex w-max items-center gap-12 py-3 motion-safe:animate-marquee"
        style={{
          animationDuration: `${animationDurationSeconds}s`,
        }}
      >
        {marqueeItems.map((logo, index) => (
          <span
            key={`${logo.src}-${index}`}
            className="flex h-10 items-center"
            aria-label={logo.alt}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo.src}
              alt={logo.alt}
              className="h-full w-auto max-w-[9rem] object-contain opacity-80 grayscale"
              loading="lazy"
            />
          </span>
        ))}
      </div>
    </div>
  );
};
