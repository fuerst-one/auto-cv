import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal Notice | Fuerst.one",
  description:
    "Legal notice for Fuerst.one — Webdesign & E-Commerce, Alexander Fürst.",
  alternates: { canonical: "https://fuerst.one/legal-notice" },
};

export default function LegalNoticePage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-white">
        Legal Notice
      </h1>

      <h2 className="mt-10 text-base font-semibold uppercase tracking-[0.2em] text-white">
        Provider information{" "}
        <span className="text-xs normal-case tracking-normal text-neutral-400">
          (per § 5 TMG)
        </span>
      </h2>
      <p>
        Alexander Fürst
        <br />
        Fuerst.one — Webdesign &amp; E-Commerce, Alexander Fürst
        <br />
        Grombühlstraße 37
        <br />
        97080 Würzburg
        <br />
        Germany
      </p>

      <h2 className="mt-10 text-base font-semibold uppercase tracking-[0.2em] text-white">
        Contact
      </h2>
      <p>
        Phone: +49 152 55244840
        <br />
        Email:{" "}
        <a
          className="text-white underline underline-offset-4 hover:text-neutral-300"
          href="mailto:alexander@fuerst.one"
        >
          alexander@fuerst.one
        </a>
      </p>

      <h2 className="mt-10 text-base font-semibold uppercase tracking-[0.2em] text-white">
        Online dispute resolution
      </h2>
      <p>
        The European Commission provides a platform for online dispute
        resolution (ODR):{" "}
        <a
          className="text-white underline underline-offset-4 hover:text-neutral-300"
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noopener"
        >
          https://ec.europa.eu/consumers/odr
        </a>
        . Our email address is listed above. We are neither willing nor
        obligated to participate in dispute resolution proceedings before a
        consumer arbitration board.
      </p>

      <p className="mt-10 border-t border-white/20 pt-6 text-xs text-neutral-500">
        For the full legal disclosures under German law (liability for content,
        liability for links, copyright), please refer to the German{" "}
        <Link
          className="underline underline-offset-4 hover:text-neutral-300"
          href="/impressum"
        >
          Impressum
        </Link>
        .
      </p>
    </>
  );
}
