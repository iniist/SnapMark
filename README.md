# SnapMark

**Markiere Screenshots in Sekunden.** Pfeile, Texte und Markierungen direkt im
Browser – kein Photoshop, keine Installation.

SnapMark ist eine vollständig statische Webanwendung (Vite + React +
TypeScript + TailwindCSS) mit Supabase als einzigem Backend (Auth, Datenbank,
Storage). Sie läuft ohne eigenen Server, z. B. auf Netlify.

## Features

- **Upload:** Drag & Drop oder Dateiauswahl (PNG, JPG, JPEG, WEBP)
- **Canvas:** Zoom (Mausrad), Pan (Leertaste halten oder mittlere Maustaste),
  Fit-to-Screen
- **Werkzeuge:** Pfeil, Linie, Rechteck, Kreis/Ellipse, Freihand, Text,
  nummerierte Marker (1, 2, 3, …), Icon-Marker (✓ ⚠ ✖)
- **Eigenschaften:** Farbe, Linienstärke, Schriftgröße, Deckkraft –
  wirken auch auf die aktuelle Auswahl
- **Bearbeiten:** Undo/Redo, Auswählen, Verschieben, Löschen,
  Mehrfachauswahl per Shift+Klick
- **Export:** PNG in Originalauflösung, PNG direkt in die Zwischenablage
- **Teilen:** Projekt speichern (Bild + Annotationen als JSON), privat oder
  öffentlich per Link, Projekt duplizieren
- **Komfort:** Autosave (angemeldet), Dark Mode, zuletzt geöffnete Projekte

### Tastenkürzel

| Kürzel                | Aktion                  |
| --------------------- | ----------------------- |
| `Strg+Z`              | Rückgängig              |
| `Strg+Shift+Z` / `Strg+Y` | Wiederherstellen    |
| `Entf` / `Backspace`  | Auswahl löschen         |
| `Esc`                 | Auswahl aufheben, zurück zum Auswahl-Werkzeug |
| `Leertaste` (halten)  | Pannen                  |
| Mausrad               | Zoomen                  |

## Lokale Entwicklung

```bash
npm install
cp .env.example .env   # Supabase-Zugangsdaten eintragen (optional)
npm run dev
```

Ohne Supabase-Konfiguration läuft die App im Offline-Modus: Bearbeiten und
Exportieren funktionieren, Speichern/Teilen sind deaktiviert.

## Supabase einrichten

1. Ein Supabase-Projekt anlegen oder ein bestehendes verwenden – alle
   SnapMark-Objekte tragen ein `snapmark`-Präfix und kollidieren nicht mit
   anderen Apps in derselben Instanz.
2. Inhalt von [`supabase/schema.sql`](supabase/schema.sql) im SQL-Editor
   ausführen (legt `snapmark_profiles`, `snapmark_projects`, RLS-Policies
   und den Storage-Bucket `snapmark-images` an).
3. Unter **Authentication → URL Configuration** die Site-URL (z. B.
   `https://deine-app.netlify.app`) und Redirect-URLs eintragen.
4. `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` (Settings → API) als
   Umgebungsvariablen setzen.

## Deployment auf Netlify

Das Repository enthält eine fertige [`netlify.toml`](netlify.toml)
(Build: `npm run build`, Publish: `dist`, SPA-Redirect). Einfach das Repo bei
Netlify verbinden und die beiden `VITE_SUPABASE_*`-Umgebungsvariablen in den
Site-Settings hinterlegen.

## Architektur

```
src/
├── components/
│   ├── editor/     # Editor-UI: Canvas, Toolbar, StylePanel, TopBar, …
│   ├── layout/     # Seitenübergreifende Layout-Bausteine
│   └── ui/         # shadcn-style Basiskomponenten (Button, Dialog, …)
├── hooks/          # Editor-State, History, Viewport, Auth, Autosave, …
├── lib/            # Typen, Konstanten, Geometrie, Rendering, Supabase
└── pages/          # Routen: /, /editor, /login, /project/:id
```

- Alle Annotationen sind reine Daten (`src/lib/types.ts`) und werden auf
  einem HTML-Canvas gerendert (`src/lib/draw.ts`).
- Undo/Redo basiert auf unveränderlichen Snapshots mit Gesten-Batching
  (`src/hooks/useHistoryState.ts`).
- Koordinaten werden immer im Bildraum gespeichert – der Export in
  Originalauflösung ist damit verlustfrei.

## Datenmodell

| Tabelle             | Spalten                                                                 |
| ------------------- | ----------------------------------------------------------------------- |
| `snapmark_profiles` | `id`, `created_at`                                                       |
| `snapmark_projects` | `id`, `owner_id`, `title`, `image_path`, `annotations_json`, `is_public`, `created_at`, `updated_at` |

Bilder liegen im öffentlichen Storage-Bucket `snapmark-images/` unter
`{owner_id}/{project_id}.{ext}`. Die Pfade enthalten unerratbare UUIDs;
Projekt-Metadaten und Annotationen schützt Row Level Security.
