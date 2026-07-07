import { useCallback, useRef, useState } from 'react'

interface HistoryStack<T> {
  past: T[]
  present: T
  future: T[]
}

export interface HistoryState<T> {
  value: T
  /** Ersetzt den Zustand; `record: false` überspringt die Historie (für Live-Updates). */
  set: (updater: T | ((current: T) => T), options?: { record?: boolean }) => void
  /** Markiert den Beginn einer Geste (Ziehen, Zeichnen). */
  beginGesture: () => void
  /** Schließt die Geste ab und schreibt genau einen Undo-Schritt. */
  endGesture: () => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  /** Setzt Zustand und Historie komplett zurück. */
  reset: (value: T) => void
}

function resolveUpdater<T>(updater: T | ((current: T) => T), current: T): T {
  return typeof updater === 'function'
    ? (updater as (current: T) => T)(current)
    : updater
}

export function useHistoryState<T>(
  initial: T,
  equals: (a: T, b: T) => boolean = Object.is,
): HistoryState<T> {
  const [stack, setStack] = useState<HistoryStack<T>>({
    past: [],
    present: initial,
    future: [],
  })
  const gestureBase = useRef<T | null>(null)
  const equalsRef = useRef(equals)
  equalsRef.current = equals

  const set = useCallback(
    (updater: T | ((current: T) => T), options?: { record?: boolean }) => {
      const record = options?.record ?? true
      setStack((current) => {
        const next = resolveUpdater(updater, current.present)
        if (equalsRef.current(next, current.present)) return current
        // Innerhalb einer Geste wird erst bei endGesture aufgezeichnet
        if (!record || gestureBase.current !== null) {
          return { ...current, present: next }
        }
        return {
          past: [...current.past, current.present],
          present: next,
          future: [],
        }
      })
    },
    [],
  )

  const beginGesture = useCallback(() => {
    setStack((current) => {
      gestureBase.current = current.present
      return current
    })
  }, [])

  const endGesture = useCallback(() => {
    setStack((current) => {
      const base = gestureBase.current
      gestureBase.current = null
      if (base === null || equalsRef.current(base, current.present)) return current
      return { ...current, past: [...current.past, base], future: [] }
    })
  }, [])

  const undo = useCallback(() => {
    setStack((current) => {
      const previous = current.past[current.past.length - 1]
      if (previous === undefined) return current
      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future],
      }
    })
  }, [])

  const redo = useCallback(() => {
    setStack((current) => {
      const next = current.future[0]
      if (next === undefined) return current
      return {
        past: [...current.past, current.present],
        present: next,
        future: current.future.slice(1),
      }
    })
  }, [])

  const reset = useCallback((value: T) => {
    gestureBase.current = null
    setStack({ past: [], present: value, future: [] })
  }, [])

  return {
    value: stack.present,
    set,
    beginGesture,
    endGesture,
    undo,
    redo,
    canUndo: stack.past.length > 0,
    canRedo: stack.future.length > 0,
    reset,
  }
}
