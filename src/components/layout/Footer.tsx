import { Link } from 'react-router-dom'

/** Globaler Footer mit den rechtlich erforderlichen Links (auf jeder Seite erreichbar). */
export function Footer() {
  return (
    <footer className="border-t px-6 py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
        <span>Orivo – Screenshots annotieren, direkt im Browser.</span>
        <nav className="flex items-center gap-5">
          <Link to="/zugang" className="transition-colors hover:text-foreground">
            Zugang anfragen
          </Link>
          <Link to="/impressum" className="transition-colors hover:text-foreground">
            Impressum
          </Link>
          <Link to="/datenschutz" className="transition-colors hover:text-foreground">
            Datenschutz
          </Link>
        </nav>
      </div>
    </footer>
  )
}
