import { CONTACT_EMAIL } from '@/lib/constants'
import { TextPage } from '@/components/layout/TextPage'

function Heading({ children }: { children: string }) {
  return <h2 className="pt-2 text-base font-semibold text-foreground">{children}</h2>
}

export function DatenschutzPage() {
  return (
    <TextPage title="Datenschutzerklärung">
      <Heading>1. Verantwortlicher</Heading>
      <p className="not-italic">
        Daniel Scholz
        <br />
        Nelly-Sachs-Straße 1
        <br />
        79111 Freiburg im Breisgau
        <br />
        Deutschland
        <br />
        E-Mail:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
          {CONTACT_EMAIL}
        </a>
      </p>

      <Heading>2. Grundsätzliches</Heading>
      <p>
        Der Schutz Ihrer personenbezogenen Daten ist mir wichtig. Orivo ist so gestaltet,
        dass so wenige Daten wie möglich verarbeitet werden. Das Bearbeiten von
        Screenshots (Hochladen, Markieren, Export als PNG) erfolgt vollständig lokal in
        Ihrem Browser – dabei werden keine Bilddaten an einen Server übertragen. Eine
        Anmeldung ist nur erforderlich, wenn Sie Projekte online speichern oder per Link
        teilen möchten.
      </p>

      <Heading>3. Hosting (Netlify)</Heading>
      <p>
        Diese Website wird bei Netlify gehostet. Anbieter ist die Netlify, Inc., 512 2nd
        Street, Suite 200, San Francisco, CA 94107, USA. Beim Aufruf der Website werden
        durch den Anbieter technisch notwendige Zugriffsdaten (u. a. IP-Adresse,
        Datum/Uhrzeit, angeforderte Ressource, Browsertyp) verarbeitet, um die Website
        auszuliefern und ihre Sicherheit und Stabilität zu gewährleisten. Rechtsgrundlage
        ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer sicheren,
        effizienten Bereitstellung). Da es sich um einen US-Anbieter handelt, kann eine
        Übermittlung in die USA erfolgen; diese ist durch die Standardvertragsklauseln der
        EU-Kommission abgesichert. Mit dem Anbieter besteht ein Vertrag zur
        Auftragsverarbeitung.
      </p>

      <Heading>4. Nutzung ohne Konto</Heading>
      <p>
        Für das Bearbeiten von Screenshots benötigen Sie kein Konto. Ihre Einstellungen
        (heller/dunkler Modus) sowie eine Liste zuletzt geöffneter Projekte werden
        ausschließlich lokal im Speicher Ihres Browsers (localStorage) abgelegt. Diese
        Daten werden nicht an mich oder Dritte übertragen und können jederzeit durch
        Löschen der Browserdaten entfernt werden.
      </p>

      <Heading>5. Konto, Anmeldung und gespeicherte Projekte (Supabase)</Heading>
      <p>
        Für Anmeldung, Datenbank und Dateispeicher nutze ich Supabase. Anbieter ist die
        Supabase, Inc. (USA). Die Daten dieses Projekts werden in der Region eu-central-1
        (Rechenzentrum Frankfurt am Main, Deutschland) innerhalb der EU gespeichert. Ein
        Zugriff aus einem Drittland kann nicht vollständig ausgeschlossen werden und ist
        durch Standardvertragsklauseln abgesichert; ein Vertrag zur Auftragsverarbeitung
        besteht.
      </p>
      <p>
        Die Anmeldung erfolgt passwortlos per „Magic Link“: Sie geben Ihre E-Mail-Adresse
        ein und erhalten einen Anmeldelink per E-Mail. Verarbeitet werden hierfür Ihre
        E-Mail-Adresse und Anmeldezeitpunkte. Speichern Sie ein Projekt, werden der
        Projekttitel, Ihre Annotationen sowie das hochgeladene Bild in Ihrem Konto
        abgelegt. Eine Selbstregistrierung ist nicht möglich; Konten werden ausschließlich
        manuell auf Anfrage angelegt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO
        (Bereitstellung der von Ihnen angeforderten Funktionen) bzw. lit. f DSGVO.
      </p>

      <Heading>6. Hochgeladene Bilder</Heading>
      <p>
        Speichern Sie ein Projekt, wird das zugehörige Bild im Dateispeicher von Supabase
        (EU, s. o.) abgelegt. Die Ablagepfade enthalten nicht erratbare Kennungen.
        Projekte sind standardmäßig privat; nur wenn Sie ein Projekt aktiv per Link teilen,
        ist es über diesen Link abrufbar. Bitte beachten Sie, dass hochgeladene Screenshots
        personenbezogene Daten enthalten können – für deren Inhalt sind Sie verantwortlich.
        Sie können gespeicherte Projekte samt Bild jederzeit selbst löschen.
      </p>

      <Heading>7. Kontaktaufnahme</Heading>
      <p>
        Wenn Sie mich per E-Mail kontaktieren (etwa um einen Zugang anzufragen), werden
        Ihre Angaben zur Bearbeitung der Anfrage verarbeitet. Rechtsgrundlage ist Art. 6
        Abs. 1 lit. b bzw. lit. f DSGVO. Die Daten werden gelöscht, sobald sie für die
        Bearbeitung nicht mehr erforderlich sind und keine gesetzlichen
        Aufbewahrungspflichten entgegenstehen.
      </p>

      <Heading>8. Cookies und lokale Speicherung</Heading>
      <p>
        Orivo setzt keine Tracking- oder Marketing-Cookies ein und bindet keine Analyse-
        oder Werbedienste ein. Verwendet wird ausschließlich technisch notwendige lokale
        Speicherung (localStorage), etwa zur Aufrechterhaltung Ihrer Anmeldesitzung und zum
        Speichern Ihrer Oberflächeneinstellungen. Hierfür ist nach § 25 Abs. 2 TDDDG keine
        Einwilligung erforderlich, weshalb kein Cookie-Banner angezeigt wird.
      </p>

      <Heading>9. Ihre Rechte</Heading>
      <p>
        Sie haben im Rahmen der gesetzlichen Vorgaben das Recht auf Auskunft (Art. 15
        DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung
        (Art. 18), Datenübertragbarkeit (Art. 20) sowie ein Widerspruchsrecht (Art. 21).
        Wenden Sie sich hierzu an die oben genannte Kontaktadresse.
      </p>

      <Heading>10. Beschwerderecht</Heading>
      <p>
        Ihnen steht ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde zu,
        insbesondere in dem Mitgliedstaat Ihres Aufenthaltsorts oder des mutmaßlichen
        Verstoßes. Für den Verantwortlichen zuständig ist der Landesbeauftragte für den
        Datenschutz und die Informationsfreiheit Baden-Württemberg.
      </p>

      <Heading>11. Speicherdauer</Heading>
      <p>
        Personenbezogene Daten werden nur so lange gespeichert, wie es für die genannten
        Zwecke erforderlich ist. Kontodaten und gespeicherte Projekte werden gelöscht, wenn
        Sie das Projekt löschen bzw. Ihr Konto aufgelöst wird.
      </p>

      <Heading>12. Stand</Heading>
      <p>Diese Datenschutzerklärung wird bei Bedarf angepasst. Stand: Juli 2026.</p>
    </TextPage>
  )
}
