import Link from "next/link";

const LEGAL_LINKS = [
  { label: "IMPRESSUM", href: "/impressum" },
  { label: "DATENSCHUTZ", href: "/datenschutz" },
  { label: "LEGAL NOTICE", href: "/legal-notice" },
  { label: "PRIVACY", href: "/privacy" },
];

export const PlaygroundFooter = () => {
  return (
    <footer className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs tracking-wider text-muted-foreground">
      {LEGAL_LINKS.map((link, idx) => (
        <span key={link.href} className="flex items-center gap-3">
          <Link href={link.href} className="hover:text-foreground">
            {link.label}
          </Link>
          {idx < LEGAL_LINKS.length - 1 && <span aria-hidden>·</span>}
        </span>
      ))}
    </footer>
  );
};
