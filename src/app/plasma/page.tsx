import type { Metadata } from "next";
import { PlasmaPlayground } from "@/components/PlasmaPlayground/PlasmaPlayground";

export const metadata: Metadata = {
  title: "Plasma — Fuerst.one",
  description:
    "Interactive plasma playground — switch between the plasma animation and ASCII webcam modes.",
};

export default function PlasmaPage() {
  return <PlasmaPlayground />;
}
