import { ReactNode } from "react";
import { PlasmaBackground } from "@/components/Plasma/PlasmaBackground";

export default function ChromeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PlasmaBackground />
      {children}
    </>
  );
}
