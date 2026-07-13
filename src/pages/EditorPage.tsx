import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, FolderOpen, MonitorUp } from 'lucide-react'
import { loadImageFromFile } from '@/lib/export'
import { getRecentProjects } from '@/lib/recentProjects'
import { isScreenCaptureSupported, requestDisplayStream } from '@/lib/screenCapture'
import { formatRelativeTime } from '@/lib/utils'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/layout/AppHeader'
import { Footer } from '@/components/layout/Footer'
import { DropZone } from '@/components/editor/DropZone'
import { Editor } from '@/components/editor/Editor'
import { ScreenCaptureDialog } from '@/components/editor/ScreenCaptureDialog'

interface LoadedImage {
  image: HTMLImageElement
  blob: Blob
  /** Erzwingt einen frischen Editor pro Bild */
  key: number
}

/** Zuletzt geöffnete Projekte (localStorage) für nicht angemeldete Besucher */
function RecentProjectsSection() {
  const recentProjects = getRecentProjects()
  if (recentProjects.length === 0) return null

  return (
    <section className="w-full max-w-2xl">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Clock className="h-4 w-4" /> Zuletzt geöffnet
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {recentProjects.map((project) => (
          <li key={project.id}>
            <Link
              to={`/project/${project.id}`}
              className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm transition-colors hover:border-primary/50 hover:bg-accent"
            >
              <span className="truncate font-medium">{project.title}</span>
              <span className="ml-3 shrink-0 text-xs text-muted-foreground">
                {formatRelativeTime(project.openedAt)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

const captureSupported = isScreenCaptureSupported()

export function EditorPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [loaded, setLoaded] = useState<LoadedImage | null>(null)
  const [captureStream, setCaptureStream] = useState<MediaStream | null>(null)

  const handleFileSelected = useCallback(
    async (file: File) => {
      try {
        const image = await loadImageFromFile(file)
        setLoaded((current) => ({
          image,
          blob: file,
          key: (current?.key ?? 0) + 1,
        }))
      } catch (error) {
        toast(
          error instanceof Error ? error.message : 'Bild konnte nicht geladen werden.',
          'error',
        )
      }
    },
    [toast],
  )

  const handleStartCapture = useCallback(async () => {
    try {
      setCaptureStream(await requestDisplayStream())
    } catch (error) {
      // Abbruch im Browser-Dialog ist kein Fehler
      if (error instanceof DOMException && error.name === 'NotAllowedError') return
      toast(
        error instanceof Error ? error.message : 'Bildschirmaufnahme nicht möglich.',
        'error',
      )
    }
  }, [toast])

  const handleCaptured = useCallback(
    (file: File) => {
      setCaptureStream(null)
      void handleFileSelected(file)
    },
    [handleFileSelected],
  )

  if (loaded) {
    return (
      <Editor
        key={loaded.key}
        image={loaded.image}
        imageBlob={loaded.blob}
        initialProject={null}
        onNewImage={() => setLoaded(null)}
      />
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
        <div className="flex w-full max-w-2xl flex-col items-center gap-4">
          <DropZone
            onFileSelected={(file) => void handleFileSelected(file)}
            onError={(message) => toast(message, 'error')}
          />
          {captureSupported ? (
            <>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">oder</span>
              <Button variant="outline" size="lg" onClick={() => void handleStartCapture()}>
                <MonitorUp /> Bildschirm aufnehmen
              </Button>
            </>
          ) : null}
        </div>
        {isSupabaseConfigured ? (
          user ? (
            <Link
              to="/projekte"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <FolderOpen className="h-4 w-4" /> Deine gespeicherten Projekte ansehen
            </Link>
          ) : (
            <RecentProjectsSection />
          )
        ) : null}
      </main>
      <Footer />
      {captureStream ? (
        <ScreenCaptureDialog
          stream={captureStream}
          onCapture={handleCaptured}
          onClose={() => {
            captureStream.getTracks().forEach((track) => track.stop())
            setCaptureStream(null)
          }}
        />
      ) : null}
    </div>
  )
}
