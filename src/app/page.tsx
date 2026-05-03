import type { Metadata } from "next";
import { PlasmaLanding } from "@/components/PlasmaLanding/PlasmaLanding";

export const metadata: Metadata = {
  title: "Fuerst.one — Alexander Fuerst",
  description:
    "Alexander Fuerst — creative technology, accessible aesthetics, converting interfaces.",
};

export default function Home() {
  return <PlasmaLanding />;
}
