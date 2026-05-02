"use client";

export function BackToTopButton() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="inline-flex items-center gap-2 border border-white/30 bg-black/85 px-4 py-2 text-[0.65rem] uppercase tracking-[0.25em] text-neutral-200 transition hover:border-white hover:text-white"
    >
      <span aria-hidden="true">↑</span>
      Back to top
    </button>
  );
}
