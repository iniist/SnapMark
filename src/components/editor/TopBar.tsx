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
  if (state === 'saving') {
    return (
      <>
        <Loader2 className="animate-spin" /> Speichert…
      </>
    )
  }
  if (state === 'saved') {
    return (
      <>
        <Check /> Gespeichert
      </>
    )
  }
  return (
    <>
      <Save /> Speichern
    </>
  )
}

export function TopBar(props: TopBarProps) {
  const { user, isConfigured, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-card px-3">
      <Link
        to="/"
        className="group flex items-center gap-1.5 rounded-md px-2 py-1 font-semibold tracking-tight hover:bg-accent"
      >
        <Logo className="h-5 w-5 transition-transform duration-300 group-hover:rotate-[14deg]" />
        Orivo
      </Link>
      <Separator orientation="vertical" className="h-6" />
      <input
        value={props.title}
        onChange={(event) => props.onTitleChange(event.target.value)}
        aria-label="Projekttitel"
        placeholder="Unbenanntes Projekt"
        className="h-8 w-40 rounded-md bg-transparent px-2 text-sm font-medium outline-none transition-colors hover:bg-accent focus:bg-accent md:w-56"
      />

      <div className="flex items-center">
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

      <div className="ml-auto flex items-center gap-1.5">
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
          <Button
            size="sm"
            onClick={props.onSave}
            disabled={props.saveState === 'saving'}
          >
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
    </header>
  )
}
