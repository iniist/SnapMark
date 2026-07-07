import { useEffect, useRef } from 'react'
import { AUTOSAVE_DELAY_MS } from '@/lib/constants'

/**
 * Ruft `save` verzögert auf, sobald sich `data` ändert (Referenzvergleich).
 * Der initiale Zustand nach dem Laden löst kein Speichern aus.
 */
export function useAutosave(
  data: unknown,
  enabled: boolean,
  save: () => void,
): void {
  const saveRef = useRef(save)
  saveRef.current = save
  const lastDataRef = useRef(data)

  useEffect(() => {
    if (lastDataRef.current === data) return
    lastDataRef.current = data
    if (!enabled) return
    const timeout = window.setTimeout(() => saveRef.current(), AUTOSAVE_DELAY_MS)
    return () => window.clearTimeout(timeout)
  }, [data, enabled])
}
