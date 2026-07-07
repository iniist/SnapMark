import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import type { Point, TextAnnotation } from '@/lib/types'
import { ZOOM_WHEEL_FACTOR } from '@/lib/constants'
import { createText } from '@/lib/annotationFactory'
import { renderEditorScene } from '@/lib/scene'
import type { EditorState } from '@/hooks/useEditorState'
import type { ViewportApi } from '@/hooks/useViewport'
import { usePointerInteractions } from '@/hooks/usePointerInteractions'
import { TextEditorOverlay } from './TextEditorOverlay'

interface TextEditSession {
  point: Point
  annotation?: TextAnnotation
}

interface EditorCanvasProps {
  editor: EditorState
  viewport: ViewportApi
  image: HTMLImageElement
  containerRef: RefObject<HTMLDivElement>
  spacePan: boolean
  spacePanRef: RefObject<boolean>
}

export function EditorCanvas({
  editor,
  viewport,
  image,
  containerRef,
  spacePan,
  spacePanRef,
}: EditorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [textEdit, setTextEdit] = useState<TextEditSession | null>(null)

  const onRequestTextEdit = useCallback(
    (point: Point, annotation?: TextAnnotation) => {
      setTextEdit({ point, annotation })
    },
    [],
  )

  const { handlers, isPanning } = usePointerInteractions({
    editor,
    viewport,
    spacePanRef,
    onRequestTextEdit,
  })

  // Canvas an die Containergröße koppeln (inkl. Retina-Auflösung)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(() => {
      setCanvasSize({
        width: container.clientWidth,
        height: container.clientHeight,
      })
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [containerRef])

  // Während der Textbearbeitung das Original ausblenden
  const visibleAnnotations = useMemo(() => {
    const editingId = textEdit?.annotation?.id
    if (!editingId) return editor.annotations
    return editor.annotations.filter((annotation) => annotation.id !== editingId)
  }, [editor.annotations, textEdit])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || canvasSize.width === 0) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(canvasSize.width * dpr)
    canvas.height = Math.round(canvasSize.height * dpr)
    renderEditorScene({
      canvas,
      image,
      annotations: visibleAnnotations,
      selectedIds: editor.selectedIds,
      viewport: viewport.viewport,
    })
  }, [image, visibleAnnotations, editor.selectedIds, viewport.viewport, canvasSize])

  // Mausrad-Zoom braucht einen non-passive Listener
  const { zoomAt } = viewport
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const factor = event.deltaY < 0 ? ZOOM_WHEEL_FACTOR : 1 / ZOOM_WHEEL_FACTOR
      zoomAt(
        { x: event.clientX - rect.left, y: event.clientY - rect.top },
        factor,
      )
    }
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [zoomAt])

  const commitTextEdit = useCallback(
    (text: string) => {
      if (!textEdit) return
      const trimmed = text.trim()
      if (textEdit.annotation) {
        if (trimmed) {
          editor.updateAnnotation(textEdit.annotation.id, (annotation) =>
            annotation.type === 'text' ? { ...annotation, text } : annotation,
          )
        } else {
          editor.removeAnnotation(textEdit.annotation.id)
        }
      } else if (trimmed) {
        editor.addAnnotation(createText(textEdit.point, editor.style, text))
      }
      setTextEdit(null)
    },
    [editor, textEdit],
  )

  const cursor = spacePan || isPanning
    ? isPanning
      ? 'grabbing'
      : 'grab'
    : editor.tool === 'select'
      ? 'default'
      : editor.tool === 'text'
        ? 'text'
        : 'crosshair'

  const { scale, offsetX, offsetY } = viewport.viewport
  const textEditFontSize =
    (textEdit?.annotation?.fontSize ?? editor.style.fontSize) * scale

  return (
    <div
      ref={containerRef}
      className="canvas-backdrop relative h-full w-full overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        style={{ cursor }}
        {...handlers}
      />
      {textEdit ? (
        <TextEditorOverlay
          left={textEdit.point.x * scale + offsetX}
          top={textEdit.point.y * scale + offsetY}
          fontSize={textEditFontSize}
          color={textEdit.annotation?.color ?? editor.style.color}
          initialText={textEdit.annotation?.text ?? ''}
          onCommit={commitTextEdit}
          onCancel={() => setTextEdit(null)}
        />
      ) : null}
    </div>
  )
}
