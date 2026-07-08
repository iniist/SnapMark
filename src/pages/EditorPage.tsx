import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, FolderOpen, Loader2, Trash2 } from 'lucide-react'
import { loadImageFromFile } from '@/lib/export'
import { deleteProject, listOwnProjects } from '@/lib/projects'
import { forgetProject, getRecentProjects } from '@/lib/recentProjects'
import type { ProjectRecord } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/layout/AppHeader'
import { Footer } from '@/components/layout/Footer'
import { DropZone } from '@/components/editor/DropZone'
import { Editor } from '@/components/editor/Editor'

interface LoadedImage {
  image: HTMLImageElement
  blob: Blob
  /** Erzwingt einen frischen Editor pro Bild */
  key: number
}

/** Cloud-Projekte des angemeldeten Benutzers, mit Löschen-Funktion */
function OwnProjectsSection() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [projects, setProjects] = useState<ProjectRecord[] | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    listOwnProjects(user.id)
      .then((list) => {
        if (!cancelled) setProjects(list)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          toast(
            error instanceof Error ? error.message : 'Projekte konnten nicht geladen werden.',
            'error',
          )
          setProjects([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [user, toast])

  const handleDelete = useCallback(
    async (project: ProjectRecord) => {
      const confirmed = window.confirm(
        `Projekt „${project.title}“ samt Bild endgültig löschen?`,
      )
      if (!confirmed) return
      setDeletingId(project.id)
      try {
        await deleteProject(project)
        forgetProject(project.id)
        setProjects((current) => current?.filter((p) => p.id !== project.id) ?? null)
        toast('Projekt gelöscht.', 'success')
      } catch (error) {
        toast(
          error instanceof Error ? error.message : 'Projekt konnte nicht gelöscht werden.',
          'error',
        )
      } finally {
        setDeletingId(null)
      }
    },
    [toast],
  )

  if (projects === null) {
    return (
      <section className="flex w-full max-w-2xl items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Projekte werden geladen…
      </section>
    )
  }

  if (projects.length === 0) return null

  return (
    <section className="w-full max-w-2xl">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <FolderOpen className="h-4 w-4" /> Meine Projekte
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {projects.map((project) => (
          <li
            key={project.id}
            className="flex items-center rounded-lg border bg-card text-sm transition-colors hover:border-primary/50"
          >
            <Link
              to={`/project/${project.id}`}
              className="flex min-w-0 flex-1 items-center justify-between rounded-l-lg px-4 py-3 hover:bg-accent"
            >
              <span className="truncate font-medium">{project.title}</span>
              <span className="ml-3 shrink-0 text-xs text-muted-foreground">
                {formatRelativeTime(project.updated_at)}
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="mx-1 shrink-0 text-muted-foreground hover:text-destructive"
              disabled={deletingId === project.id}
              onClick={() => void handleDelete(project)}
              aria-label={`Projekt „${project.title}“ löschen`}
              title="Projekt löschen"
            >
              {deletingId === project.id ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Trash2 />
              )}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
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

export function EditorPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [loaded, setLoaded] = useState<LoadedImage | null>(null)

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
        {isSupabaseConfigured ? (
          user ? (
            <OwnProjectsSection />
          ) : (
            <RecentProjectsSection />
          )
        ) : null}
      </main>
      <Footer />
    </div>
  )
}
