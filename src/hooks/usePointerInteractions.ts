import {
  useCallback,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
} from 'react'
import type { Point, TextAnnotation } from '@/lib/types'
import { HIT_TOLERANCE } from '@/lib/constants'
import { findAnnotationAt } from '@/lib/geometry'
import {
  createDraftShape,
  createIconMarker,
  createNumberMarker,
  finalizeShape,
  isDegenerateShape,
  updateDraftShape,
  type DraftShapeTool,
} from '@/lib/annotationFactory'
import type { EditorState } from './useEditorState'
import type { ViewportApi } from './useViewport'

type Interaction =
  | { kind: 'idle' }
  | { kind: 'pan'; last: Point }
  | { kind: 'draw'; id: string; origin: Point }
  | { kind: 'move'; last: Point }

const DRAFT_TOOLS: readonly DraftShapeTool[] = [
  'arrow',
  'line',
  'rect',
  'ellipse',
  'freehand',
]

function isDraftTool(tool: string): tool is DraftShapeTool {
  return (DRAFT_TOOLS as readonly string[]).includes(tool)
}

interface PointerInteractionOptions {
  editor: EditorState
  viewport: ViewportApi
  /** true, solange die Leertaste gehalten wird (temporärer Pan-Modus) */
  spacePanRef: RefObject<boolean>
  onRequestTextEdit: (point: Point, annotation?: TextAnnotation) => void
}

export interface PointerHandlers {
  onPointerDown: (event: PointerEvent<HTMLCanvasElement>) => void
  onPointerMove: (event: PointerEvent<HTMLCanvasElement>) => void
  onPointerUp: (event: PointerEvent<HTMLCanvasElement>) => void
  onDoubleClick: (event: MouseEvent<HTMLCanvasElement>) => void
}

export function usePointerInteractions({
  editor,
  viewport,
  spacePanRef,
  onRequestTextEdit,
}: PointerInteractionOptions): {
  handlers: PointerHandlers
  isPanning: boolean
} {
  const interactionRef = useRef<Interaction>({ kind: 'idle' })
  const [isPanning, setIsPanning] = useState(false)
  // Aktuelle Editor-Daten für Handler, ohne sie bei jedem Render neu zu binden
  const editorRef = useRef(editor)
  editorRef.current = editor

  const localPoint = (event: MouseEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const setInteraction = useCallback((next: Interaction) => {
    interactionRef.current = next
    setIsPanning(next.kind === 'pan')
  }, [])

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      const state = editorRef.current
      const screen = localPoint(event)
      const point = viewport.screenToImage(screen)
      event.currentTarget.setPointerCapture(event.pointerId)

      // Mittlere Maustaste oder gehaltene Leertaste: Pannen
      if (event.button === 1 || spacePanRef.current) {
        setInteraction({ kind: 'pan', last: screen })
        return
      }
      if (event.button !== 0) return

      if (isDraftTool(state.tool)) {
        state.history.beginGesture()
        const draft = createDraftShape(state.tool, point, state.style)
        state.addAnnotation(draft)
        setInteraction({ kind: 'draw', id: draft.id, origin: point })
        return
      }

      switch (state.tool) {
        case 'number':
          state.addAnnotation(
            createNumberMarker(point, state.style, state.nextNumberValue),
          )
          return
        case 'icon':
          state.addAnnotation(createIconMarker(point, state.style))
          return
        case 'text':
          // Overlay erst bei pointerup öffnen – das mousedown-Default würde
          // dem frisch fokussierten Textfeld sonst sofort den Fokus entziehen
          return
        case 'select': {
          const tolerance = HIT_TOLERANCE / viewport.viewportRef.current.scale
          const hit = findAnnotationAt(state.annotations, point, tolerance)
          if (!hit) {
            if (!event.shiftKey) state.clearSelection()
            return
          }
          if (event.shiftKey) {
            state.toggleSelection(hit.id)
            return
          }
          if (!state.selectedIds.has(hit.id)) state.setSelection([hit.id])
          state.history.beginGesture()
          setInteraction({ kind: 'move', last: point })
          return
        }
      }
    },
    [viewport, spacePanRef, onRequestTextEdit, setInteraction],
  )

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      const interaction = interactionRef.current
      if (interaction.kind === 'idle') return
      const state = editorRef.current
      const screen = localPoint(event)

      if (interaction.kind === 'pan') {
        viewport.panBy(screen.x - interaction.last.x, screen.y - interaction.last.y)
        interactionRef.current = { kind: 'pan', last: screen }
        return
      }

      const point = viewport.screenToImage(screen)
      if (interaction.kind === 'draw') {
        state.updateAnnotation(interaction.id, (annotation) =>
          updateDraftShape(annotation, interaction.origin, point),
        )
        return
      }
      if (interaction.kind === 'move') {
        state.moveSelected(point.x - interaction.last.x, point.y - interaction.last.y)
        interactionRef.current = { kind: 'move', last: point }
      }
    },
    [viewport],
  )

  const onPointerUp = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      const interaction = interactionRef.current
      const state = editorRef.current
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }

      if (
        interaction.kind === 'idle' &&
        state.tool === 'text' &&
        event.button === 0 &&
        !spacePanRef.current
      ) {
        onRequestTextEdit(viewport.screenToImage(localPoint(event)))
        return
      }

      if (interaction.kind === 'draw') {
        const draft = state.annotations.find((a) => a.id === interaction.id)
        if (draft && isDegenerateShape(draft)) {
          state.removeAnnotation(interaction.id)
        } else if (draft) {
          state.updateAnnotation(interaction.id, finalizeShape)
        }
        state.history.endGesture()
      } else if (interaction.kind === 'move') {
        state.history.endGesture()
      }
      setInteraction({ kind: 'idle' })
    },
    [setInteraction, viewport, spacePanRef, onRequestTextEdit],
  )

  const onDoubleClick = useCallback(
    (event: MouseEvent<HTMLCanvasElement>) => {
      const state = editorRef.current
      if (state.tool !== 'select') return
      const point = viewport.screenToImage(localPoint(event))
      const tolerance = HIT_TOLERANCE / viewport.viewportRef.current.scale
      const hit = findAnnotationAt(state.annotations, point, tolerance)
      if (hit?.type === 'text') onRequestTextEdit({ x: hit.x, y: hit.y }, hit)
    },
    [viewport, onRequestTextEdit],
  )

  return {
    handlers: { onPointerDown, onPointerMove, onPointerUp, onDoubleClick },
    isPanning,
  }
}
