import { useCallback, useMemo, useRef, useState } from 'react'
import type { Annotation, Tool, ToolStyle } from '@/lib/types'
import { DEFAULT_TOOL_STYLE } from '@/lib/constants'
import { translateAnnotation } from '@/lib/geometry'
import { useHistoryState, type HistoryState } from './useHistoryState'

/** Überträgt geänderte Stil-Eigenschaften auf ein bestehendes Element. */
function applyStyleToAnnotation(
  annotation: Annotation,
  patch: Partial<ToolStyle>,
): Annotation {
  const next: Annotation = { ...annotation }
  if (patch.color !== undefined) next.color = patch.color
  if (patch.opacity !== undefined) next.opacity = patch.opacity
  if (patch.strokeWidth !== undefined && 'strokeWidth' in next) {
    next.strokeWidth = patch.strokeWidth
  }
  if (patch.fontSize !== undefined && 'fontSize' in next) {
    next.fontSize = patch.fontSize
  }
  if (patch.markerIcon !== undefined && next.type === 'icon') {
    next.icon = patch.markerIcon
  }
  return next
}

export interface EditorState {
  annotations: Annotation[]
  history: Pick<
    HistoryState<Annotation[]>,
    'undo' | 'redo' | 'canUndo' | 'canRedo' | 'beginGesture' | 'endGesture'
  >
  tool: Tool
  setTool: (tool: Tool) => void
  style: ToolStyle
  updateStyle: (patch: Partial<ToolStyle>) => void
  selectedIds: ReadonlySet<string>
  setSelection: (ids: Iterable<string>) => void
  toggleSelection: (id: string) => void
  clearSelection: () => void
  addAnnotation: (annotation: Annotation, options?: { record?: boolean }) => void
  updateAnnotation: (
    id: string,
    update: (annotation: Annotation) => Annotation,
    options?: { record?: boolean },
  ) => void
  removeAnnotation: (id: string) => void
  /** Verschiebt die Auswahl ohne History-Eintrag (Geste zeichnet auf). */
  moveSelected: (dx: number, dy: number) => void
  deleteSelected: () => void
  resetAnnotations: (annotations: Annotation[]) => void
  nextNumberValue: number
}

/** Flacher Vergleich, damit inhaltsgleiche Zustände keine Undo-Schritte erzeugen. */
function annotationsEqual(a: Annotation[], b: Annotation[]): boolean {
  return a.length === b.length && a.every((item, index) => item === b[index])
}

export function useEditorState(): EditorState {
  const history = useHistoryState<Annotation[]>([], annotationsEqual)
  const [tool, setToolState] = useState<Tool>('select')
  const [style, setStyle] = useState<ToolStyle>(DEFAULT_TOOL_STYLE)
  const [selectedIds, setSelectedIdsState] = useState<ReadonlySet<string>>(
    new Set(),
  )
  // Ref-Spiegel, damit Callbacks stabil bleiben und nicht auf veraltete Auswahl zugreifen
  const selectedIdsRef = useRef(selectedIds)

  const setSelectedIds = useCallback((next: ReadonlySet<string>) => {
    selectedIdsRef.current = next
    setSelectedIdsState(next)
  }, [])

  const annotations = history.value
  const { set, reset } = history

  const setTool = useCallback(
    (next: Tool) => {
      setToolState(next)
      if (next !== 'select') setSelectedIds(new Set())
    },
    [setSelectedIds],
  )

  const updateStyle = useCallback(
    (patch: Partial<ToolStyle>) => {
      setStyle((current) => ({ ...current, ...patch }))
      // Stiländerungen wirken direkt auf die aktuelle Auswahl
      const selection = selectedIdsRef.current
      if (selection.size > 0) {
        set((current) =>
          current.map((annotation) =>
            selection.has(annotation.id)
              ? applyStyleToAnnotation(annotation, patch)
              : annotation,
          ),
        )
      }
    },
    [set],
  )

  const setSelection = useCallback(
    (ids: Iterable<string>) => setSelectedIds(new Set(ids)),
    [setSelectedIds],
  )

  const toggleSelection = useCallback(
    (id: string) => {
      const next = new Set(selectedIdsRef.current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      setSelectedIds(next)
    },
    [setSelectedIds],
  )

  const clearSelection = useCallback(
    () => setSelectedIds(new Set()),
    [setSelectedIds],
  )

  const addAnnotation = useCallback(
    (annotation: Annotation, options?: { record?: boolean }) => {
      set((current) => [...current, annotation], options)
    },
    [set],
  )

  const updateAnnotation = useCallback(
    (
      id: string,
      update: (annotation: Annotation) => Annotation,
      options?: { record?: boolean },
    ) => {
      set(
        (current) =>
          current.map((annotation) =>
            annotation.id === id ? update(annotation) : annotation,
          ),
        options,
      )
    },
    [set],
  )

  const removeAnnotation = useCallback(
    (id: string) => {
      set((current) => current.filter((annotation) => annotation.id !== id))
      if (selectedIdsRef.current.has(id)) {
        const next = new Set(selectedIdsRef.current)
        next.delete(id)
        setSelectedIds(next)
      }
    },
    [set, setSelectedIds],
  )

  const moveSelected = useCallback(
    (dx: number, dy: number) => {
      const selection = selectedIdsRef.current
      if (selection.size === 0) return
      set(
        (current) =>
          current.map((annotation) =>
            selection.has(annotation.id)
              ? translateAnnotation(annotation, dx, dy)
              : annotation,
          ),
        { record: false },
      )
    },
    [set],
  )

  const deleteSelected = useCallback(() => {
    const selection = selectedIdsRef.current
    if (selection.size === 0) return
    set((current) =>
      current.filter((annotation) => !selection.has(annotation.id)),
    )
    setSelectedIds(new Set())
  }, [set, setSelectedIds])

  const resetAnnotations = useCallback(
    (next: Annotation[]) => {
      reset(next)
      setSelectedIds(new Set())
    },
    [reset, setSelectedIds],
  )

  const nextNumberValue = useMemo(() => {
    const values = annotations
      .filter((annotation) => annotation.type === 'number')
      .map((annotation) => annotation.value)
    return values.length > 0 ? Math.max(...values) + 1 : 1
  }, [annotations])

  return {
    annotations,
    history,
    tool,
    setTool,
    style,
    updateStyle,
    selectedIds,
    setSelection,
    toggleSelection,
    clearSelection,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
    moveSelected,
    deleteSelected,
    resetAnnotations,
    nextNumberValue,
  }
}
