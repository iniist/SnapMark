import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ANNOTATION_FONT_FAMILY, TEXT_LINE_HEIGHT } from '@/lib/draw'

interface TextEditorOverlayProps {
  /** Position der linken oberen Ecke in Bildschirm-Koordinaten (Container-lokal) */
  left: number
  top: number
  /** Schriftgröße in Bildschirm-Pixeln (bereits mit Zoom multipliziert) */
  fontSize: number
  color: string
  initialText: string
  onCommit: (text: string) => void
  onCancel: () => void
}

/**
 * Frei positioniertes Textfeld über dem Canvas. Enter erzeugt Zeilenumbrüche,
 * Strg/Cmd+Enter oder Klick daneben übernimmt, Escape verwirft.
 */
export function TextEditorOverlay({
  left,
  top,
  fontSize,
  color,
  initialText,
  onCommit,
  onCancel,
}: TextEditorOverlayProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [text, setText] = useState(initialText)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.focus()
      textarea.select()
    }
  }, [])

  const style: CSSProperties = {
    left,
    top,
    fontSize,
    color,
    lineHeight: TEXT_LINE_HEIGHT,
    fontFamily: ANNOTATION_FONT_FAMILY,
    minWidth: fontSize * 4,
    width: `${Math.max(4, ...text.split('\n').map((line) => line.length)) + 2}ch`,
  }

  return (
    <textarea
      ref={textareaRef}
      value={text}
      rows={text.split('\n').length}
      onChange={(event) => setText(event.target.value)}
      onBlur={() => onCommit(text)}
      onKeyDown={(event) => {
        event.stopPropagation()
        if (event.key === 'Escape') {
          event.preventDefault()
          onCancel()
        } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
          event.preventDefault()
          onCommit(text)
        }
      }}
      spellCheck={false}
      placeholder="Text eingeben…"
      className="absolute z-20 resize-none overflow-hidden rounded-md border-2 border-dashed border-primary/70 bg-transparent p-0 outline-none placeholder:text-muted-foreground/60"
      style={style}
    />
  )
}
