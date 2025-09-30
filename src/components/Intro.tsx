import Link from "next/link";
import { ReactNode } from "react";
import { SignUpForm } from "./SignUpForm";
import { Contact } from "./Contact";

export function Intro({ claim }: { claim: ReactNode }) {
  return (
    <>
      <div className="space-y-4 text-sm text-slate-300">
        <p className="text-base leading-relaxed text-slate-200">{claim}</p>
        <p className="text-xs font-[var(--font-plex)] uppercase tracking-wide text-slate-400">
          Building immersive interfaces that fuse rigorous systems with
          intuitive design.
        </p>
      </div>
      <SignUpForm />
      <Contact />
    </>
  );
}

export function IntroFooter() {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.75rem] text-slate-500 print:hidden">
      <Link
        className="transition hover:text-emerald-300"
        href="https://fuerst.one/imprint"
      >
        Imprint
      </Link>
      <span className="opacity-40">/</span>
      <Link
        className="transition hover:text-emerald-300"
        href="https://fuerst.one/privacy-policy"
      >
        Privacy Policy
      </Link>
    </p>
  );
}
