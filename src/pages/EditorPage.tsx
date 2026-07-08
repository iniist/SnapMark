import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { loadImageFromFile } from '@/lib/export'
import { getRecentProjects } from '@/lib/recentProjects'
import { formatRelativeTime } from '@/lib/utils'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useToast } from '@/components/ui/toaster'
import { AppHeader } from '@/components/layout/AppHeader'
import { DropZone } from '@/components/editor/DropZone'
import { Editor } from '@/components/editor/Editor'

interface LoadedImage {
  image: HTMLImageElement
  blob: Blob
  /** Erzwingt einen frischen Editor pro Bild */
  key: number
}

export function EditorPage() {
  const { toast } = useToast()
  const [loaded, setLoaded] = useState<LoadedImage | null>(null)
  const recentProjects = isSupabaseConfigured ? getRecentProjects() : []

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
      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-12">
        <DropZone
          onFileSelected={(file) => void handleFileSelected(file)}
          onError={(message) => toast(message, 'error')}
        />
        {recentProjects.length > 0 ? (
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
        ) : null}
      </main>
    </div>
  )
}
