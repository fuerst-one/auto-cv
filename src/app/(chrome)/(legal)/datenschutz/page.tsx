import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutz | Fuerst.one",
  description: "Datenschutzerklärung von Fuerst.one — Alexander Fürst.",
  alternates: { canonical: "https://fuerst.one/datenschutz" },
};

export default function DatenschutzPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-white">
        Datenschutzerklärung
      </h1>

      <p>
        Diese Datenschutzerklärung klärt Sie über die Art, den Umfang und Zweck
        der Verarbeitung von personenbezogenen Daten (nachfolgend kurz „Daten“)
        im Rahmen unseres Onlineangebotes auf. Im Hinblick auf die verwendeten
        Begrifflichkeiten verweisen wir auf die Definitionen in Art. 4 der
        Datenschutzgrundverordnung (DSGVO).
      </p>

      <h2 className="mt-10 text-base font-semibold uppercase tracking-[0.2em] text-white">
        Verantwortlicher
      </h2>
      <p>
        Fuerst.one — Webdesign &amp; E-Commerce, Alexander Fürst
        <br />
        Grombühlstraße 37
        <br />
        97080 Würzburg
        <br />
        E-Mail:{" "}
        <a
          className="text-white underline underline-offset-4 hover:text-neutral-300"
          href="mailto:alexander@fuerst.one"
        >
          alexander@fuerst.one
        </a>
        <br />
        Inhaber: Alexander Fürst
      </p>

      <h2 className="mt-10 text-base font-semibold uppercase tracking-[0.2em] text-white">
        Arten der verarbeiteten Daten
      </h2>
      <ul className="list-disc space-y-1 pl-6">
        <li>Bestandsdaten (z. B. Namen)</li>
        <li>Kontaktdaten (z. B. E-Mail-Adressen)</li>
        <li>
          Nutzungsdaten (z. B. besuchte Seiten, Zugriffszeiten — anonymisiert
          durch unseren Hosting-Provider)
        </li>
      </ul>

      <h2 className="mt-10 text-base font-semibold uppercase tracking-[0.2em] text-white">
        Kategorien betroffener Personen
      </h2>
      <p>Besucher und Nutzer des Onlineangebotes (nachfolgend „Nutzer“).</p>

      <h2 className="mt-10 text-base font-semibold uppercase tracking-[0.2em] text-white">
        Zweck der Verarbeitung
      </h2>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          Bereitstellung des Onlineangebotes, seiner Funktionen und Inhalte
        </li>
        <li>Beantwortung von Kontaktanfragen</li>
        <li>Versand von angeforderten Informationen (z. B. CV-PDF)</li>
        <li>Sicherheitsmaßnahmen</li>
      </ul>

      <h2 className="mt-10 text-base font-semibold uppercase tracking-[0.2em] text-white">
        Maßgebliche Rechtsgrundlagen
      </h2>
      <p>
        Nach Maßgabe des Art. 13 DSGVO teilen wir Ihnen die Rechtsgrundlagen
        unserer Datenverarbeitungen mit. Die Rechtsgrundlage für die Einholung
        von Einwilligungen ist Art. 6 Abs. 1 lit. a DSGVO; für die Verarbeitung
        zur Beantwortung von Anfragen Art. 6 Abs. 1 lit. b DSGVO; für die
        Verarbeitung zur Wahrung berechtigter Interessen Art. 6 Abs. 1 lit. f
        DSGVO.
      </p>

      <h2 className="mt-10 text-base font-semibold uppercase tracking-[0.2em] text-white">
        Hosting und Auftragsverarbeiter
      </h2>
      <p>
        Diese Website wird von Vercel Inc. (440 N Barranca Avenue #4133, Covina,
        CA 91723, USA) gehostet. Im Rahmen des Hostings werden technische
        Zugriffsdaten (z. B. IP-Adresse, Browser-Typ, Zugriffszeit) verarbeitet,
        die für den sicheren Betrieb des Onlineangebotes erforderlich sind (Art.
        6 Abs. 1 lit. f DSGVO). Es besteht ein Auftragsverarbeitungsvertrag.
      </p>
      <p>
        Beim Eintrag Ihrer E-Mail-Adresse über das Newsletter-Formular wird
        diese in unserer Notion-Datenbank gespeichert (Notion Labs, Inc., 500
        Sansome Street, San Francisco, CA 94111, USA). Die Speicherung erfolgt
        zur Bereitstellung des angeforderten Inhalts und zur Kontaktaufnahme
        (Art. 6 Abs. 1 lit. b DSGVO).
      </p>

      <h2 className="mt-10 text-base font-semibold uppercase tracking-[0.2em] text-white">
        Übermittlungen in Drittländer
      </h2>
      <p>
        Soweit Daten an Dienstleister in den USA übermittelt werden (Vercel,
        Notion), erfolgt dies auf Grundlage geeigneter Garantien
        (Standardvertragsklauseln gem. Art. 46 DSGVO).
      </p>

      <h2 className="mt-10 text-base font-semibold uppercase tracking-[0.2em] text-white">
        Schriftarten
      </h2>
      <p>
        Wir verwenden die Schriftart „IBM Plex Mono“. Diese wird über{" "}
        <code className="text-neutral-200">next/font</code> beim Build- Prozess
        heruntergeladen und von unserem Server selbst ausgeliefert — es findet
        keine Verbindung zu Google-Servern beim Seitenaufruf statt.
      </p>

      <h2 className="mt-10 text-base font-semibold uppercase tracking-[0.2em] text-white">
        Rechte der betroffenen Personen
      </h2>
      <p>
        Sie haben das Recht, eine Bestätigung darüber zu verlangen, ob
        betreffende Daten verarbeitet werden, sowie auf Auskunft über diese
        Daten und Kopie der Daten. Sie haben das Recht, die Berichtigung
        unrichtiger Daten oder die Löschung der Sie betreffenden Daten zu
        verlangen, sowie eine Einschränkung der Verarbeitung. Sie haben das
        Recht auf Datenübertragbarkeit und das Recht, eine Beschwerde bei der
        zuständigen Aufsichtsbehörde einzureichen.
      </p>

      <h2 className="mt-10 text-base font-semibold uppercase tracking-[0.2em] text-white">
        Widerrufsrecht
      </h2>
      <p>
        Sie haben das Recht, erteilte Einwilligungen mit Wirkung für die Zukunft
        zu widerrufen.
      </p>

      <h2 className="mt-10 text-base font-semibold uppercase tracking-[0.2em] text-white">
        Widerspruchsrecht
      </h2>
      <p>
        <strong className="text-neutral-200">
          Sie können der künftigen Verarbeitung der Sie betreffenden Daten nach
          Maßgabe der gesetzlichen Vorgaben jederzeit widersprechen.
        </strong>{" "}
        Der Widerspruch kann insbesondere gegen die Verarbeitung für Zwecke der
        Direktwerbung erfolgen.
      </p>

      <h2 className="mt-10 text-base font-semibold uppercase tracking-[0.2em] text-white">
        Löschung von Daten
      </h2>
      <p>
        Die von uns verarbeiteten Daten werden nach Maßgabe der gesetzlichen
        Vorgaben gelöscht, sobald sie für ihre Zweckbestimmung nicht mehr
        erforderlich sind und der Löschung keine gesetzlichen
        Aufbewahrungspflichten entgegenstehen.
      </p>

      <h2 className="mt-10 text-base font-semibold uppercase tracking-[0.2em] text-white">
        Kontaktaufnahme
      </h2>
      <p>
        Bei der Kontaktaufnahme mit uns (z. B. per E-Mail) werden die Angaben
        des Nutzers zur Bearbeitung der Kontaktanfrage und deren Abwicklung gem.
        Art. 6 Abs. 1 lit. b DSGVO verarbeitet. Wir löschen die Anfragen, sofern
        diese nicht mehr erforderlich sind.
      </p>

      <h2 className="mt-10 text-base font-semibold uppercase tracking-[0.2em] text-white">
        Änderungen dieser Datenschutzerklärung
      </h2>
      <p>
        Wir bitten Sie, sich regelmäßig über den Inhalt unserer
        Datenschutzerklärung zu informieren. Wir passen die Datenschutzerklärung
        an, sobald die Änderungen der von uns durchgeführten Datenverarbeitungen
        dies erforderlich machen.
      </p>

      <p className="text-xs text-neutral-500">Stand: Mai 2026.</p>
    </>
  );
}
