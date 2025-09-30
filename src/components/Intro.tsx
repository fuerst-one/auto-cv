import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { SignUpForm } from "./SignUpForm";
import { Contact } from "./Contact";
import { CvProject } from "@/server/notion/getCvProjects";
import { ProjectAnalysisPanel } from "./Projects/Filter/ProjectAnalysisPanel";

export function Intro({
  claim,
  projects,
}: {
  claim: ReactNode;
  projects: CvProject[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="group relative h-20 w-20 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-1">
          <Image
            src="/avatar.png"
            alt="Alexander Fuerst"
            width={80}
            height={80}
            className="h-full w-full rounded-[1.1rem] object-cover"
          />
          <div className="absolute inset-0 rounded-[1.1rem] border border-white/10 opacity-0 transition group-hover:opacity-100" />
        </div>
        <div className="flex-1 space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[0.65rem] font-[var(--font-plex)] uppercase tracking-wide text-emerald-200">
            <span className="h-1 w-1 animate-[pulse-glow_4s_ease-in-out_infinite] rounded-full bg-emerald-400" />
            Creative Technologist
          </span>
          <h1 className="text-4xl font-semibold leading-tight text-white">
            Alexander Fuerst
          </h1>
          <p className="text-xs font-[var(--font-plex)] uppercase tracking-wide text-slate-400">
            UI engineer · generative aesthetics · product craftsmanship
          </p>
        </div>
      </div>
      <div className="space-y-4 text-sm text-slate-300">
        <p className="text-base leading-relaxed text-slate-200">{claim}</p>
        <p className="text-xs font-[var(--font-plex)] uppercase tracking-wide text-slate-400">
          Building immersive interfaces that fuse rigorous systems with playful
          art.
        </p>
      </div>
      <SignUpForm />
      <ProjectAnalysisPanel projects={projects} />
      <Contact />
    </div>
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
