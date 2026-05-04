import { Button } from "../Button";
import { Contact } from "./Contact";

export function Intro() {
  return (
    <div className="space-y-2">
      <p className="text-neutral-40 mb-4 text-xs uppercase tracking-[0.2em]">
        Building immersive interfaces that fuse rigorous systems with intuitive
        design.
      </p>
      <Button href="/contact" arrow className="mt-8 w-full justify-center">
        Contact &amp; download CV
      </Button>
      <Contact />
    </div>
  );
}
