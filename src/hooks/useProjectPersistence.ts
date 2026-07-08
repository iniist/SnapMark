import { useCallback, useMemo, useState } from 'react'
import type { Annotation, ProjectRecord } from '@/lib/types'
import { imageToBlob } from '@/lib/export'
import { saveProject, setProjectVisibility } from '@/lib/projects'
import { rememberProject } from '@/lib/recentProjects'
import type { SaveState } from '@/components/editor/TopBar'
import { useAuth } from './useAuth'
import { useAutosave } from './useAutosave'

interface PersistenceOptions {
  image: HTMLImageElement
  /** Original-Datei beim frischen Upload; bei geladenen Projekten null */
  imageBlob: Blob | null
  initialProject: ProjectRecord | null
  annotations: Annotation[]
  title: string
}

export interface ProjectPersistence {
  project: ProjectRecord | null
  /** Angemeldet und Besitzer (bzw. neues Projekt) – darf speichern */
  canSave: boolean
  saveState: SaveState
  save: () => Promise<ProjectRecord | null>
  setVisibility: (isPublic: boolean) => Promise<void>
  /** Speichert eine Kopie als neues Projekt und liefert dessen ID */
  duplicate: () => Promise<string>
}

export function useProjectPersistence({
  image,
  imageBlob,
  initialProject,
  annotations,
  title,
}: PersistenceOptions): ProjectPersistence {
  const { user, isConfigured } = useAuth()
  const [project, setProject] = useState<ProjectRecord | null>(initialProject)
  const [saveState, setSaveState] = useState<SaveState>(
    initialProject ? 'saved' : 'unsaved',
  )

  const isOwner = !project || (user !== null && project.owner_id === user.id)
  const canSave = isConfigured && user !== null && isOwner

  const save = useCallback(async (): Promise<ProjectRecord | null> => {
    if (!user) return null
    setSaveState('saving')
    try {
      const saved = await saveProject({
        projectId: project?.id,
        ownerId: user.id,
        title: title.trim() || 'Unbenanntes Projekt',
        annotations,
        existingImagePath: project?.image_path,
        imageBlob: project ? undefined : (imageBlob ?? (await imageToBlob(image))),
      })
      setProject(saved)
      rememberProject(saved.id, saved.title)
      setSaveState('saved')
      return saved
    } catch (error) {
      setSaveState('error')
      throw error
    }
  }, [user, project, title, annotations, imageBlob, image])

  const setVisibility = useCallback(
    async (isPublic: boolean) => {
      if (!project) return
      await setProjectVisibility(project.id, isPublic)
      setProject({ ...project, is_public: isPublic })
    },
    [project],
  )

  const duplicate = useCallback(async (): Promise<string> => {
    if (!user) throw new Error('Zum Duplizieren bitte anmelden.')
    const blob = imageBlob ?? (await imageToBlob(image))
    const copy = await saveProject({
      ownerId: user.id,
      title: `${title.trim() || 'Unbenanntes Projekt'} (Kopie)`,
      annotations,
      imageBlob: blob,
    })
    rememberProject(copy.id, copy.title)
    return copy.id
  }, [user, imageBlob, image, title, annotations])

  // Autosave: erst aktiv, wenn das Projekt einmal gespeichert wurde
  const autosaveData = useMemo(() => ({ annotations, title }), [annotations, title])
  useAutosave(autosaveData, canSave && project !== null, () => {
    void save().catch(() => {
      // Fehlerzustand steckt bereits in saveState; kein Toast-Spam beim Autosave
    })
  })

  return { project, canSave, saveState, save, setVisibility, duplicate }
}
