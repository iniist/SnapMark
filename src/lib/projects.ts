import type { Annotation, ProjectRecord } from './types'
import { PROJECTS_TABLE, STORAGE_BUCKET } from './constants'
import { requireSupabase } from './supabase'
import { createId } from './utils'

function extensionForMimeType(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/webp':
      return 'webp'
    default:
      return 'png'
  }
}

export interface SaveProjectInput {
  projectId?: string
  ownerId: string
  title: string
  annotations: readonly Annotation[]
  /** Nur beim ersten Speichern bzw. Duplizieren nötig */
  imageBlob?: Blob
  existingImagePath?: string
}

/** Legt ein Projekt an oder aktualisiert es; lädt das Bild bei Bedarf hoch. */
export async function saveProject(input: SaveProjectInput): Promise<ProjectRecord> {
  const client = requireSupabase()
  const projectId = input.projectId ?? createId()

  let imagePath = input.existingImagePath
  if (!imagePath) {
    if (!input.imageBlob) throw new Error('Zum Speichern wird ein Bild benötigt.')
    const extension = extensionForMimeType(input.imageBlob.type)
    imagePath = `${input.ownerId}/${projectId}.${extension}`
    const { error: uploadError } = await client.storage
      .from(STORAGE_BUCKET)
      .upload(imagePath, input.imageBlob, { upsert: true })
    if (uploadError) throw new Error(`Bild-Upload fehlgeschlagen: ${uploadError.message}`)
  }

  const { data, error } = await client
    .from(PROJECTS_TABLE)
    .upsert({
      id: projectId,
      owner_id: input.ownerId,
      title: input.title,
      image_path: imagePath,
      annotations_json: input.annotations,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw new Error(`Projekt konnte nicht gespeichert werden: ${error.message}`)
  return data as ProjectRecord
}

export async function loadProject(projectId: string): Promise<ProjectRecord> {
  const client = requireSupabase()
  const { data, error } = await client
    .from(PROJECTS_TABLE)
    .select()
    .eq('id', projectId)
    .maybeSingle()

  if (error) throw new Error(`Projekt konnte nicht geladen werden: ${error.message}`)
  if (!data) {
    throw new Error('Projekt nicht gefunden oder keine Berechtigung.')
  }
  return data as ProjectRecord
}

export async function listOwnProjects(ownerId: string): Promise<ProjectRecord[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from(PROJECTS_TABLE)
    .select()
    .eq('owner_id', ownerId)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(`Projekte konnten nicht geladen werden: ${error.message}`)
  return (data ?? []) as ProjectRecord[]
}

export async function setProjectVisibility(
  projectId: string,
  isPublic: boolean,
): Promise<void> {
  const client = requireSupabase()
  const { error } = await client
    .from(PROJECTS_TABLE)
    .update({ is_public: isPublic, updated_at: new Date().toISOString() })
    .eq('id', projectId)
  if (error) throw new Error(`Sichtbarkeit konnte nicht geändert werden: ${error.message}`)
}

export async function deleteProject(project: ProjectRecord): Promise<void> {
  const client = requireSupabase()
  await client.storage.from(STORAGE_BUCKET).remove([project.image_path])
  const { error } = await client.from(PROJECTS_TABLE).delete().eq('id', project.id)
  if (error) throw new Error(`Projekt konnte nicht gelöscht werden: ${error.message}`)
}

export function getImagePublicUrl(imagePath: string): string {
  const client = requireSupabase()
  return client.storage.from(STORAGE_BUCKET).getPublicUrl(imagePath).data.publicUrl
}

/** Kopiert Bild und Annotationen in ein neues Projekt des angegebenen Besitzers. */
export async function duplicateProject(
  source: ProjectRecord,
  ownerId: string,
  imageBlob: Blob,
): Promise<ProjectRecord> {
  return saveProject({
    ownerId,
    title: `${source.title} (Kopie)`,
    annotations: source.annotations_json,
    imageBlob,
  })
}

export function buildShareUrl(projectId: string): string {
  return `${window.location.origin}/project/${projectId}`
}
