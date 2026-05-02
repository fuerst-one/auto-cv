import Link from "next/link";

export function SiteFooter() {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem] text-neutral-500 print:hidden">
      <Link className="transition hover:text-white" href="/legal-notice">
        Legal Notice
      </Link>
      <span className="opacity-40">/</span>
      <Link className="transition hover:text-white" href="/privacy">
        Privacy
      </Link>
    </p>
  );
}
