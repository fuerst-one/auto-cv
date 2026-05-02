import { ReactNode, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "./SiteFooter";
import { BackToTopButton } from "./BackToTopButton";

export function Layout({
  sidebarContent,
  topContent,
  children,
}: {
  sidebarContent?: ReactNode;
  topContent?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative z-10 min-h-screen max-w-full">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col px-2 py-12 sm:px-4 lg:px-6">
        <header className="flex flex-col gap-6 text-sm text-neutral-300">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-4">
              <div className="relative h-20 w-20 border border-white/30 bg-black p-1">
                <Image
                  src="/avatar.png"
                  alt="Alexander Fuerst"
                  width={80}
                  height={80}
                  className="h-full w-full object-cover grayscale"
                />
              </div>
              <div className="flex flex-col gap-0">
                <span className="text-[0.65rem] uppercase tracking-[0.3em] text-neutral-400">
                  fuerst.one
                </span>
                <div className="flex flex-col gap-1 text-white">
                  <span className="text-2xl font-semibold">
                    Alexander Fuerst
                  </span>
                  <span className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                    creative technology · accessible aesthetics · converting
                    interfaces
                  </span>
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-3 border border-white/30 bg-black px-4 py-2 text-[0.7rem] uppercase tracking-[0.25em] text-neutral-200">
              <span className="inline-flex h-1.5 w-1.5 bg-white" />
              UI Engineer
            </div>
          </div>
          <div className="h-px w-full bg-white/20" />
        </header>

        {topContent && <div className="relative mb-12 mt-6">{topContent}</div>}

        {sidebarContent ? (
          <div className="grid grid-cols-1 lg:grid-cols-[360px,1fr] lg:gap-8 xl:gap-16">
            <aside className="flex flex-col">
              <div className="relative space-y-6 border border-white/30 bg-black/85 p-8">
                {sidebarContent}
                <div className="border-t border-white/20 pt-6 text-xs text-neutral-500">
                  <SiteFooter />
                </div>
              </div>
              <div className="hidden flex-1 lg:flex">
                <div className="sticky bottom-4 mt-auto flex w-full justify-end pt-6">
                  <BackToTopButton />
                </div>
              </div>
            </aside>
            <main className="min-w-0 flex-1 pb-24">
              <div className="mx-auto w-full max-w-3xl space-y-12">
                <Suspense>{children}</Suspense>
              </div>
            </main>
          </div>
        ) : (
          <>
            <main className="min-w-0 flex-1 pb-24 pt-6">
              <div className="mx-auto w-full max-w-3xl space-y-12">
                <Suspense>{children}</Suspense>
              </div>
            </main>
            <footer className="mt-12 border-t border-white/20 pt-6 text-xs text-neutral-500">
              <SiteFooter />
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
