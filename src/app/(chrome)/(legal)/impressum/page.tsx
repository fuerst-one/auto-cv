import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum | Fuerst.one",
  description:
    "Impressum von Fuerst.one — Webdesign & E-Commerce, Alexander Fürst.",
  alternates: { canonical: "https://fuerst.one/impressum" },
};

export default function ImpressumPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-white">
        Impressum
      </h1>

      <h2 className="mt-10 text-base font-semibold uppercase tracking-[0.2em] text-white">
        Angaben{" "}
        <span className="text-xs normal-case tracking-normal text-neutral-400">
          (gemäß § 5 TMG)
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
      </p>

      <h2 className="mt-10 text-base font-semibold uppercase tracking-[0.2em] text-white">
        Kontakt
      </h2>
      <p>
        Telefon: 015255244840
        <br />
        E-Mail:{" "}
        <a
          className="text-white underline underline-offset-4 hover:text-neutral-300"
          href="mailto:alexander@fuerst.one"
        >
          alexander@fuerst.one
        </a>
      </p>

      <h2 className="mt-10 text-base font-semibold uppercase tracking-[0.2em] text-white">
        Streitschlichtung
      </h2>
      <p>
        Die Europäische Kommission stellt eine Plattform zur
        Online-Streitbeilegung (OS) bereit:{" "}
        <a
          className="text-white underline underline-offset-4 hover:text-neutral-300"
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noopener"
        >
          https://ec.europa.eu/consumers/odr
        </a>
        . Unsere E-Mail-Adresse finden Sie oben im Impressum.
      </p>
      <p>
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren
        vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.15em] text-neutral-100">
        Haftung für Inhalte
      </h3>
      <p>
        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf
        diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8
        bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet,
        übermittelte oder gespeicherte fremde Informationen zu überwachen oder
        nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
        hinweisen.
      </p>
      <p>
        Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
        Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
        Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der
        Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von
        entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend
        entfernen.
      </p>

      <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.15em] text-neutral-100">
        Haftung für Links
      </h3>
      <p>
        Unser Angebot enthält Links zu externen Websites Dritter, auf deren
        Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden
        Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten
        Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten
        verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der
        Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte
        waren zum Zeitpunkt der Verlinkung nicht erkennbar.
      </p>
      <p>
        Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch
        ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei
        Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend
        entfernen.
      </p>

      <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.15em] text-neutral-100">
        Urheberrecht
      </h3>
      <p>
        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen
        Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung,
        Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
        Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des
        jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite
        sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
      </p>
      <p>
        Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden,
        werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte
        Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine
        Urheberrechtsverletzung aufmerksam werden, bitten wir um einen
        entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden
        wir derartige Inhalte umgehend entfernen.
      </p>

      <p className="text-xs text-neutral-500">
        Quelle:{" "}
        <a
          className="underline underline-offset-4 hover:text-neutral-300"
          href="https://www.e-recht24.de"
        >
          e-recht24.de
        </a>
      </p>
    </>
  );
}
