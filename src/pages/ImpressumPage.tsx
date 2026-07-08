import { CONTACT_EMAIL } from '@/lib/constants'
import { TextPage } from '@/components/layout/TextPage'

function Heading({ children }: { children: string }) {
  return <h2 className="pt-2 text-base font-semibold text-foreground">{children}</h2>
}

export function ImpressumPage() {
  return (
    <TextPage title="Impressum">
      <p>Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG).</p>
      <p className="not-italic">
        Daniel Scholz
        <br />
        Nelly-Sachs-Straße 1
        <br />
        79111 Freiburg im Breisgau
        <br />
        Deutschland
      </p>

      <Heading>Kontakt</Heading>
      <p>
        E-Mail:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
          {CONTACT_EMAIL}
        </a>
      </p>

      <Heading>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</Heading>
      <p>Daniel Scholz (Anschrift wie oben)</p>

      <Heading>Verbraucherstreitbeilegung</Heading>
      <p>
        Ich bin nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor
        einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <Heading>Haftung für Inhalte</Heading>
      <p>
        Die Inhalte dieser Seiten wurden mit größter Sorgfalt erstellt. Für die
        Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr
        übernommen werden. Als Diensteanbieter bin ich für eigene Inhalte auf diesen
        Seiten nach den allgemeinen Gesetzen verantwortlich, jedoch nicht verpflichtet,
        übermittelte oder gespeicherte fremde Informationen zu überwachen.
      </p>

      <Heading>Haftung für Links</Heading>
      <p>
        Diese Seite kann Links zu externen Websites Dritter enthalten, auf deren Inhalte
        ich keinen Einfluss habe. Für diese fremden Inhalte ist stets der jeweilige
        Anbieter oder Betreiber der Seiten verantwortlich.
      </p>

      <Heading>Urheberrecht</Heading>
      <p>
        Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
        unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche
        gekennzeichnet. Von Nutzerinnen und Nutzern hochgeladene Bilder verbleiben in
        deren Verantwortung.
      </p>
    </TextPage>
  )
}
