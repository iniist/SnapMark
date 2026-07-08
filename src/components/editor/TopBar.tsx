import { Link, useNavigate } from 'react-router-dom'
import {
  Check,
  Copy,
  CopyPlus,
  Download,
  FolderOpen,
  ImagePlus,
  Loader2,
  LogIn,
  LogOut,
  Maximize,
  MoreVertical,
  Moon,
  Redo2,
  Save,
  Share2,
  Sun,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { Menu, MenuItem, MenuSeparator } from '@/components/ui/menu'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'

export type SaveState = 'unsaved' | 'saving' | 'saved' | 'error'

interface TopBarProps {
  title: string
  onTitleChange: (title: string) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  zoomPercent: number
  onZoomIn: () => void
  onZoomOut: () => void
  onFitToScreen: () => void
  onDownload: () => void
  onCopyPng: () => void
  copySupported: boolean
  onNewImage: () => void
  canSave: boolean
  saveState: SaveState
  onSave: () => void
  canShare: boolean
  onShare: () => void
  canDuplicate: boolean
  onDuplicate: () => void
}

function SaveLabel({ state }: { state: SaveState }) {
  const Icon = state === 'saving' ? Loader2 : state === 'saved' ? Check : Save
  const text = state === 'saving' ? 'Speichert…' : state === 'saved' ? 'Gespeichert' : 'Speichern'
  return (
    <>
      <Icon className={state === 'saving' ? 'animate-spin' : undefined} />
      <span className="hidden sm:inline">{text}</span>
    </>
  )
}

export function TopBar(props: TopBarProps) {
  const { user, isConfigured, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <header className="flex h-14 shrink-0 items-center gap-1 border-b bg-card px-2 sm:gap-2 sm:px-3">
      <Link
        to="/"
        className="group flex shrink-0 items-center gap-1.5 rounded-md px-1.5 py-1 font-semibold tracking-tight hover:bg-accent sm:px-2"
      >
        <Logo className="h-5 w-5 transition-transform duration-300 group-hover:rotate-[14deg]" />
        <span className="hidden sm:inline">Orivo</span>
      </Link>
      <Separator orientation="vertical" className="hidden h-6 sm:block" />
      <input
        value={props.title}
        onChange={(event) => props.onTitleChange(event.target.value)}
        aria-label="Projekttitel"
        placeholder="Unbenanntes Projekt"
        className="h-8 min-w-0 flex-1 rounded-md bg-transparent px-2 text-sm font-medium outline-none transition-colors hover:bg-accent focus:bg-accent md:max-w-56"
      />

      <div className="flex shrink-0 items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={props.onUndo}
          disabled={!props.canUndo}
          aria-label="Rückgängig (Strg+Z)"
          title="Rückgängig (Strg+Z)"
        >
          <Undo2 />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={props.onRedo}
          disabled={!props.canRedo}
          aria-label="Wiederherstellen (Strg+Shift+Z)"
          title="Wiederherstellen (Strg+Shift+Z)"
        >
          <Redo2 />
        </Button>
      </div>

      <div className="hidden items-center md:flex">
        <Button
          variant="ghost"
          size="icon"
          onClick={props.onZoomOut}
          aria-label="Herauszoomen"
          title="Herauszoomen"
        >
          <ZoomOut />
        </Button>
        <span className="w-12 text-center text-xs tabular-nums text-muted-foreground">
          {props.zoomPercent}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={props.onZoomIn}
          aria-label="Hineinzoomen"
          title="Hineinzoomen"
        >
          <ZoomIn />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={props.onFitToScreen}
          aria-label="An Bildschirm anpassen"
          title="An Bildschirm anpassen"
        >
          <Maximize />
        </Button>
      </div>

      {/* Vollständige Aktionsleiste ab md */}
      <div className="ml-auto hidden shrink-0 items-center gap-1.5 md:flex">
        <Button
          variant="ghost"
          size="icon"
          onClick={props.onNewImage}
          aria-label="Neues Bild öffnen"
          title="Neues Bild öffnen"
        >
          <ImagePlus />
        </Button>
        {user ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/projekte')}
            aria-label="Meine Projekte"
            title="Meine Projekte"
          >
            <FolderOpen />
          </Button>
        ) : null}
        {props.canDuplicate ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={props.onDuplicate}
            aria-label="Projekt duplizieren"
            title="Projekt duplizieren"
          >
            <CopyPlus />
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Dark Mode umschalten"
          title="Dark Mode umschalten"
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </Button>
        <Separator orientation="vertical" className="h-6" />
        {props.copySupported ? (
          <Button
            variant="outline"
            size="sm"
            onClick={props.onCopyPng}
            title="PNG in die Zwischenablage kopieren"
          >
            <Copy /> Kopieren
          </Button>
        ) : null}
        <Button variant="outline" size="sm" onClick={props.onDownload}>
          <Download /> PNG
        </Button>
        {props.canShare ? (
          <Button variant="outline" size="sm" onClick={props.onShare}>
            <Share2 /> Teilen
          </Button>
        ) : null}
        {props.canSave ? (
          <Button size="sm" onClick={props.onSave} disabled={props.saveState === 'saving'}>
            <SaveLabel state={props.saveState} />
          </Button>
        ) : null}
        {isConfigured && !user ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('/login')}
            title="Anmelden – nur nötig zum Speichern & Teilen von Projekten"
          >
            <LogIn /> Anmelden
          </Button>
        ) : null}
        {user ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void signOut()}
            aria-label={`Abmelden (${user.email ?? ''})`}
            title={`Abmelden (${user.email ?? ''})`}
          >
            <LogOut />
          </Button>
        ) : null}
      </div>

      {/* Kompakte Leiste + Überlaufmenü unter md */}
      <div className="ml-auto flex shrink-0 items-center gap-1 md:hidden">
        {props.canSave ? (
          <Button
            size="sm"
            onClick={props.onSave}
            disabled={props.saveState === 'saving'}
            aria-label="Speichern"
          >
            <SaveLabel state={props.saveState} />
          </Button>
        ) : null}
        <Menu
          trigger={({ toggle }) => (
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Weitere Aktionen">
              <MoreVertical />
            </Button>
          )}
        >
          {(close) => (
            <>
              <MenuItem onClick={() => { props.onDownload(); close() }}>
                <Download /> Als PNG herunterladen
              </MenuItem>
              {props.copySupported ? (
                <MenuItem onClick={() => { props.onCopyPng(); close() }}>
                  <Copy /> In Zwischenablage kopieren
                </MenuItem>
              ) : null}
              {props.canShare ? (
                <MenuItem onClick={() => { props.onShare(); close() }}>
                  <Share2 /> Teilen
                </MenuItem>
              ) : null}
              <MenuSeparator />
              <MenuItem onClick={() => { props.onNewImage(); close() }}>
                <ImagePlus /> Neues Bild öffnen
              </MenuItem>
              {user ? (
                <MenuItem onClick={() => { navigate('/projekte'); close() }}>
                  <FolderOpen /> Meine Projekte
                </MenuItem>
              ) : null}
              {props.canDuplicate ? (
                <MenuItem onClick={() => { props.onDuplicate(); close() }}>
                  <CopyPlus /> Projekt duplizieren
                </MenuItem>
              ) : null}
              <MenuItem onClick={() => { props.onFitToScreen(); close() }}>
                <Maximize /> An Bildschirm anpassen
              </MenuItem>
              <MenuSeparator />
              <MenuItem onClick={() => { toggleTheme(); close() }}>
                {theme === 'dark' ? <Sun /> : <Moon />}
                {theme === 'dark' ? 'Heller Modus' : 'Dunkler Modus'}
              </MenuItem>
              {isConfigured && !user ? (
                <MenuItem onClick={() => { navigate('/login'); close() }}>
                  <LogIn /> Anmelden
                </MenuItem>
              ) : null}
              {user ? (
                <MenuItem onClick={() => { void signOut(); close() }}>
                  <LogOut /> Abmelden
                </MenuItem>
              ) : null}
            </>
          )}
        </Menu>
      </div>
    </header>
  )
}
