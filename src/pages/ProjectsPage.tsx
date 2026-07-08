import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { FolderOpen, ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { deleteProject, listOwnProjects } from '@/lib/projects'
import { forgetProject } from '@/lib/recentProjects'
import type { ProjectRecord } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/layout/AppHeader'
import { Footer } from '@/components/layout/Footer'

/** Übersicht der in der Cloud gespeicherten Projekte (nur für angemeldete Nutzer). */
export function ProjectsPage() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [projects, setProjects] = useState<ProjectRecord[] | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setProjects(null)
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

  // Nicht angemeldet -> zum Login (sobald die Session geladen ist)
  if (!authLoading && !user) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-gradient">Meine Projekte</span>
          </h1>
          <Link to="/editor">
            <Button>
              <ImagePlus /> Neuer Screenshot
            </Button>
          </Link>
        </div>

        {projects === null ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Projekte werden geladen…
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed py-20 text-center">
            <span className="bg-gradient-cool flex h-14 w-14 items-center justify-center rounded-2xl">
              <FolderOpen className="h-7 w-7 text-[#0F397A]" />
            </span>
            <div className="space-y-1">
              <p className="font-medium">Noch keine gespeicherten Projekte</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Lade einen Screenshot hoch, bearbeite ihn und speichere ihn – dann
                findest du ihn hier wieder.
              </p>
            </div>
            <Link to="/editor">
              <Button size="lg">
                <ImagePlus /> Ersten Screenshot hochladen
              </Button>
            </Link>
          </div>
        ) : (
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
                  {deletingId === project.id ? <Loader2 className="animate-spin" /> : <Trash2 />}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  )
}
