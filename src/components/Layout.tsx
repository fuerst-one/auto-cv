import { ReactNode, Suspense } from "react";

import { IntroFooter } from "./Intro";

export function Layout({
  sidebarContent,
  children,
}: {
  sidebarContent: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-[-20%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.16),transparent_65%)] blur-3xl" />
        <div className="absolute right-[-12%] top-1/3 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.18),transparent_60%)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,19,0.65),rgba(7,11,19,0.92))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.12),transparent_75%)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-12 sm:px-8 lg:px-12">
        <header className="flex flex-col gap-6 text-sm text-slate-400">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <span className="font-[var(--font-plex)] text-[0.65rem] uppercase tracking-wide text-emerald-300/80">
                fuerst.one
              </span>
              <div className="flex flex-col gap-1 text-slate-200">
                <span className="text-2xl font-semibold text-white">Alexander Fuerst</span>
                <span className="font-[var(--font-plex)] text-xs uppercase tracking-wide text-slate-400">
                  UI engineer · generative aesthetics · product craftsmanship
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[0.7rem] font-[var(--font-plex)] uppercase tracking-wide text-slate-300">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Creative Technologist
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
        </header>

        <div className="grid items-start gap-12 lg:grid-cols-[360px,1fr] lg:gap-16">
          <aside className="lg:sticky lg:top-24">
            <div className="relative space-y-10 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_25px_60px_rgba(8,11,19,0.55)] backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
              {sidebarContent}
              <div className="border-t border-white/10 pt-6 text-xs text-slate-500">
                <IntroFooter />
              </div>
            </div>
          </aside>
          <main className="flex-1 pb-24">
            <div className="mx-auto w-full max-w-3xl space-y-12">
              <Suspense>{children}</Suspense>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
