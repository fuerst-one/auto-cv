import { ReactNode } from "react";
import { SignUpForm } from "./SignUpForm";
import { Contact } from "./Contact";

export function Intro({ claim }: { claim: ReactNode }) {
  return (
    <>
      <div className="space-y-4 text-sm text-neutral-300">
        <p className="text-base leading-relaxed text-neutral-100">{claim}</p>
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
          Building immersive interfaces that fuse rigorous systems with
          intuitive design.
        </p>
      </div>
      <SignUpForm />
      <Contact />
    </>
  );
}
