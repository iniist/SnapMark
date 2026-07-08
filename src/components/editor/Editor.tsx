import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ProjectRecord } from '@/lib/types'
import { ZOOM_BUTTON_FACTOR } from '@/lib/constants'
import {
  copyPngToClipboard,
  downloadBlob,
  isClipboardImageSupported,
  renderToPngBlob,
} from '@/lib/export'
import { useAuth } from '@/hooks/useAuth'
import { useEditorState } from '@/hooks/useEditorState'
import { useViewport } from '@/hooks/useViewport'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useProjectPersistence } from '@/hooks/useProjectPersistence'
import { useToast } from '@/components/ui/toaster'
import { EditorCanvas } from './EditorCanvas'
import { ShareDialog } from './ShareDialog'
import { StylePanel } from './StylePanel'
import { Toolbar } from './Toolbar'
import { TopBar } from './TopBar'

interface EditorProps {
  image: HTMLImageElement
  /** Original-Datei beim frischen Upload (spart erneutes Kodieren) */
  imageBlob: Blob | null
  initialProject: ProjectRecord | null
  onNewImage: () => void
}

export function Editor({ image, imageBlob, initialProject, onNewImage }: EditorProps) {
  const editor = useEditorState()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const [title, setTitle] = useState(initialProject?.title ?? 'Unbenanntes Projekt')
  const [shareOpen, setShareOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const imageSize = useMemo(
    () => ({ width: image.naturalWidth, height: image.naturalHeight }),
    [image],
  )
  const viewport = useViewport(containerRef, imageSize)

  const [spacePan, setSpacePan] = useState(false)
  const spacePanRef = useRef(false)

  const { resetAnnotations } = editor
  useEffect(() => {
    resetAnnotations(initialProject?.annotations_json ?? [])
  }, [initialProject, resetAnnotations])

  const persistence = useProjectPersistence({
    image,
    imageBlob,
    initialProject,
    annotations: editor.annotations,
    title,
  })

  const handleEscape = useCallback(() => {
    editor.clearSelection()
    editor.setTool('select')
  }, [editor])

  const handleSpaceChange = useCallback((down: boolean) => {
    spacePanRef.current = down
    setSpacePan(down)
  }, [])

  useKeyboardShortcuts({
    onUndo: editor.history.undo,
    onRedo: editor.history.redo,
    onDelete: editor.deleteSelected,
    onEscape: handleEscape,
    onSpaceChange: handleSpaceChange,
  })

  const handleDownload = useCallback(async () => {
    try {
      const blob = await renderToPngBlob(image, editor.annotations)
      downloadBlob(blob, `${title.trim() || 'orivo'}.png`)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Export fehlgeschlagen.', 'error')
    }
  }, [image, editor.annotations, title, toast])

  const handleCopyPng = useCallback(async () => {
    try {
      await copyPngToClipboard(image, editor.annotations)
      toast('PNG in die Zwischenablage kopiert.', 'success')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Kopieren fehlgeschlagen.', 'error')
    }
  }, [image, editor.annotations, toast])

  const handleSave = useCallback(async () => {
    try {
      const saved = await persistence.save()
      if (saved) toast('Projekt gespeichert.', 'success')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Speichern fehlgeschlagen.', 'error')
    }
  }, [persistence, toast])

  const handleDuplicate = useCallback(async () => {
    try {
      const id = await persistence.duplicate()
      toast('Kopie erstellt.', 'success')
      navigate(`/project/${id}`)
    } catch (error) {
      toast(
        error instanceof Error ? error.message : 'Duplizieren fehlgeschlagen.',
        'error',
      )
    }
  }, [persistence, toast, navigate])

  const selectedAnnotations = useMemo(
    () =>
      editor.annotations.filter((annotation) =>
        editor.selectedIds.has(annotation.id),
      ),
    [editor.annotations, editor.selectedIds],
  )

  const { project, canSave, saveState } = persistence

  return (
    <div className="flex h-full flex-col">
      <TopBar
        title={title}
        onTitleChange={setTitle}
        canUndo={editor.history.canUndo}
        canRedo={editor.history.canRedo}
        onUndo={editor.history.undo}
        onRedo={editor.history.redo}
        zoomPercent={Math.round(viewport.viewport.scale * 100)}
        onZoomIn={() => viewport.zoomBy(ZOOM_BUTTON_FACTOR)}
        onZoomOut={() => viewport.zoomBy(1 / ZOOM_BUTTON_FACTOR)}
        onFitToScreen={viewport.fitToScreen}
        onDownload={() => void handleDownload()}
        onCopyPng={() => void handleCopyPng()}
        copySupported={isClipboardImageSupported()}
        onNewImage={onNewImage}
        canSave={canSave}
        saveState={saveState}
        onSave={() => void handleSave()}
        canShare={canSave && project !== null}
        onShare={() => setShareOpen(true)}
        canDuplicate={project !== null && user !== null}
        onDuplicate={() => void handleDuplicate()}
      />

      <div className="relative flex-1 overflow-hidden">
        <EditorCanvas
          editor={editor}
          viewport={viewport}
          image={image}
          containerRef={containerRef}
          spacePan={spacePan}
          spacePanRef={spacePanRef}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center p-2 md:inset-x-auto md:left-3 md:top-1/2 md:block md:-translate-y-1/2 md:p-0">
          <div className="pointer-events-auto max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Toolbar tool={editor.tool} onSelectTool={editor.setTool} />
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-2 bottom-16 z-10 md:inset-x-auto md:bottom-auto md:right-3 md:top-3">
          <StylePanel
            tool={editor.tool}
            style={editor.style}
            selectedAnnotations={selectedAnnotations}
            onChange={editor.updateStyle}
            onGestureStart={editor.history.beginGesture}
            onGestureEnd={editor.history.endGesture}
          />
        </div>
      </div>

      {project ? (
        <ShareDialog
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          projectId={project.id}
          isPublic={project.is_public}
          onVisibilityChange={persistence.setVisibility}
        />
      ) : null}
    </div>
  )
}
