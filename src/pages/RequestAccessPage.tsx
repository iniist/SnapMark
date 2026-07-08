import { Mail, ShieldCheck } from 'lucide-react'
import { CONTACT_EMAIL } from '@/lib/constants'
import { TextPage } from '@/components/layout/TextPage'
import { Button } from '@/components/ui/button'

const MAIL_SUBJECT = 'Zugang zu Orivo anfragen'
const MAIL_BODY = [
  'Hallo,',
  '',
  'ich möchte gerne einen Orivo-Zugang beantragen.',
  '',
  'Name:',
  'E-Mail-Adresse für den Zugang:',
  'Firma / Kontext (optional):',
  '',
  'Vielen Dank!',
].join('\n')

export function RequestAccessPage() {
  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    MAIL_SUBJECT,
  )}&body=${encodeURIComponent(MAIL_BODY)}`

  return (
    <TextPage title="Zugang anfragen">
      <p>
        Orivo ist ein internes Werkzeug – eine öffentliche Registrierung gibt es bewusst
        nicht. Konten werden manuell angelegt. Zum{' '}
        <strong className="text-foreground">Bearbeiten und Exportieren</strong> von
        Screenshots brauchst du übrigens gar kein Konto; ein Zugang ist nur nötig, um
        Projekte online zu <strong className="text-foreground">speichern und zu teilen</strong>.
      </p>
      <p>
        Schreib mir einfach eine kurze E-Mail mit der Adresse, die freigeschaltet werden
        soll – ich richte den Zugang ein und du bekommst dann per Magic Link Zugriff.
      </p>

      <div className="rounded-xl border bg-card p-6">
        <a href={mailtoHref}>
          <Button size="lg" className="w-full sm:w-auto">
            <Mail /> Anfrage per E-Mail senden
          </Button>
        </a>
        <p className="mt-3 text-xs text-muted-foreground">
          Öffnet dein E-Mail-Programm mit vorbereitetem Text an{' '}
          <a href={mailtoHref} className="text-primary hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>

      <p className="flex items-start gap-2">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>
          Es wird kein Formular verwendet und auf dieser Seite werden keine Daten erhoben –
          die Anfrage läuft ausschließlich über dein eigenes E-Mail-Programm.
        </span>
      </p>
    </TextPage>
  )
}
