import { ReactNode } from "react";
import { PlasmaBackground } from "@/components/PlasmaBackground/PlasmaBackground";

export default function ChromeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PlasmaBackground />
      {children}
    </>
  );
}
