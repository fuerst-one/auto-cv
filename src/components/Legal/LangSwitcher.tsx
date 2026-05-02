"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SISTER_PAGE: Record<string, { href: string; label: string }> = {
  "/impressum": { href: "/legal-notice", label: "English" },
  "/legal-notice": { href: "/impressum", label: "Deutsch" },
  "/datenschutz": { href: "/privacy", label: "English" },
  "/privacy": { href: "/datenschutz", label: "Deutsch" },
};

export const LangSwitcher = () => {
  const pathname = usePathname();
  const sister = SISTER_PAGE[pathname];
  if (!sister) {
    return null;
  }
  return (
    <Link
      href={sister.href}
      className="inline-flex items-center gap-2 border border-white/30 px-3 py-1 text-[0.7rem] uppercase tracking-[0.25em] text-neutral-200 transition hover:bg-white/10"
    >
      {sister.label} →
    </Link>
  );
};
