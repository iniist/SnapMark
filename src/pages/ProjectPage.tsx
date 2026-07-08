import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FileQuestion, Loader2 } from 'lucide-react'
import type { ProjectRecord } from '@/lib/types'
import { getImagePublicUrl, loadProject } from '@/lib/projects'
import { loadImageFromUrl } from '@/lib/export'
import { forgetProject, rememberProject } from '@/lib/recentProjects'
import { isSupabaseConfigured } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/layout/AppHeader'
import { Editor } from '@/components/editor/Editor'
import { useAuth } from '@/hooks/useAuth'

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; project: ProjectRecord; image: HTMLImageElement }

export function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const { loading: authLoading, user } = useAuth()
  const navigate = useNavigate()
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    if (!id || authLoading) return
    if (!isSupabaseConfigured) {
      setState({ status: 'error', message: 'Supabase ist nicht konfiguriert.' })
      return
    }
    let cancelled = false
    setState({ status: 'loading' })

    const run = async () => {
      try {
        const project = await loadProject(id)
        const image = await loadImageFromUrl(getImagePublicUrl(project.image_path))
        if (cancelled) return
        rememberProject(project.id, project.title)
        setState({ status: 'ready', project, image })
      } catch (error) {
        if (cancelled) return
        forgetProject(id)
        setState({
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Projekt konnte nicht geladen werden.',
        })
      }
    }
    void run()

    return () => {
      cancelled = true
    }
  }, [id, authLoading, user?.id])

  if (state.status === 'ready') {
    return (
      <Editor
        key={state.project.id}
        image={state.image}
        imageBlob={null}
        initialProject={state.project}
        onNewImage={() => navigate('/editor')}
      />
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        {state.status === 'loading' ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Projekt wird geladen…</p>
          </>
        ) : (
          <>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <FileQuestion className="h-7 w-7 text-muted-foreground" />
            </span>
            <h1 className="text-xl font-semibold">Projekt nicht verfügbar</h1>
            <p className="max-w-sm text-sm text-muted-foreground">{state.message}</p>
            <Button onClick={() => navigate('/editor')}>
              Zum Editor
            </Button>
            <Link to="/" className="text-sm text-primary hover:underline">
              Zur Startseite
            </Link>
          </>
        )}
      </main>
    </div>
  )
}
