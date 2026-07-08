import { useEffect } from 'react'

export interface KeyboardShortcutHandlers {
  onUndo: () => void
  onRedo: () => void
  onDelete: () => void
  onEscape: () => void
  onSpaceChange: (down: boolean) => void
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable
  )
}

/**
 * Globale Editor-Shortcuts: Strg+Z, Strg+Shift+Z/Strg+Y, Entf, Esc,
 * Leertaste (gedrückt halten) zum Pannen.
 */
export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers): void {
  const { onUndo, onRedo, onDelete, onEscape, onSpaceChange } = handlers

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return

      const modifier = event.ctrlKey || event.metaKey
      if (modifier && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) onRedo()
        else onUndo()
        return
      }
      if (modifier && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        onRedo()
        return
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        onDelete()
        return
      }
      if (event.key === 'Escape') {
        onEscape()
        return
      }
      if (event.key === ' ') {
        event.preventDefault()
        onSpaceChange(true)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === ' ') onSpaceChange(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [onUndo, onRedo, onDelete, onEscape, onSpaceChange])
}
