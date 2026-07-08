import { useNavigate } from 'react-router-dom'
import { ArrowRight, Lock, Share2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/layout/AppHeader'

const FEATURES = [
  {
    icon: Zap,
    title: 'Schnell',
    description:
      'Bild hochladen, markieren, fertig. Ohne Installation, ohne Wartezeit – alles läuft direkt im Browser.',
  },
  {
    icon: Lock,
    title: 'Privat',
    description:
      'Deine Bilder bleiben lokal, solange du nicht speicherst. Gespeicherte Projekte sind standardmäßig privat.',
  },
  {
    icon: Share2,
    title: 'Export als PNG',
    description:
      'Exportiere das Ergebnis in Originalauflösung als PNG – oder teile es als Link mit einem Klick.',
  },
] as const

/** Dekorative Editor-Vorschau für den Hero-Bereich */
function HeroMockup() {
  return (
    <div className="relative mx-auto mt-16 w-full max-w-3xl rounded-2xl border bg-card p-3 shadow-2xl">
      <div className="mb-3 flex items-center gap-1.5 px-1">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-green-400" />
        <span className="ml-3 h-5 flex-1 rounded-md bg-muted" />
      </div>
      <svg
        viewBox="0 0 720 380"
        role="img"
        aria-label="Beispiel eines annotierten Screenshots"
        className="w-full rounded-lg bg-muted"
      >
        <rect x="24" y="24" width="200" height="332" rx="8" className="fill-background" />
        <rect x="40" y="44" width="120" height="12" rx="6" className="fill-border" />
        <rect x="40" y="72" width="160" height="8" rx="4" className="fill-border" />
        <rect x="40" y="92" width="140" height="8" rx="4" className="fill-border" />
        <rect x="248" y="24" width="448" height="160" rx="8" className="fill-background" />
        <rect x="268" y="48" width="240" height="14" rx="7" className="fill-border" />
        <rect x="268" y="80" width="400" height="8" rx="4" className="fill-border" />
        <rect x="268" y="100" width="380" height="8" rx="4" className="fill-border" />
        <rect x="248" y="208" width="448" height="148" rx="8" className="fill-background" />
        <rect x="268" y="232" width="180" height="12" rx="6" className="fill-border" />
        <rect x="268" y="260" width="400" height="8" rx="4" className="fill-border" />

        {/* Annotationen */}
        <rect
          x="256"
          y="36"
          width="270"
          height="38"
          rx="6"
          fill="none"
          stroke="#ef4444"
          strokeWidth="4"
        />
        <path
          d="M 560 320 Q 620 300 610 120"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path d="M 610 120 l -14 22 l 24 4 z" fill="#3b82f6" />
        <circle cx="120" cy="220" r="22" fill="#22c55e" />
        <text
          x="120"
          y="228"
          textAnchor="middle"
          fill="#fff"
          fontSize="24"
          fontWeight="600"
          fontFamily="Inter, sans-serif"
        >
          1
        </text>
        <text
          x="540"
          y="345"
          fill="#3b82f6"
          fontSize="22"
          fontWeight="600"
          fontFamily="Inter, sans-serif"
        >
          Hier klicken!
        </text>
      </svg>
    </div>
  )
}

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-full">
      <AppHeader />
      <main>
        <section className="px-6 pb-8 pt-20 text-center md:pt-28">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Markiere Screenshots in Sekunden.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Pfeile, Texte und Markierungen direkt im Browser. Kein Photoshop.
            Keine Installation.
          </p>
          <div className="mt-10">
            <Button size="lg" className="h-14 px-10 text-lg" onClick={() => navigate('/editor')}>
              Screenshot hochladen
              <ArrowRight className="!size-5" />
            </Button>
          </div>
          <HeroMockup />
        </section>

        <section className="mx-auto grid max-w-5xl gap-6 px-6 py-24 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border bg-card p-8 text-left">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </span>
              <h2 className="mt-5 text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </section>
      </main>
      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        Orivo – Screenshots annotieren, direkt im Browser.
      </footer>
    </div>
  )
}
