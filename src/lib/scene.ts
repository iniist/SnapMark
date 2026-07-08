import type { Annotation } from './types'
import type { Viewport } from '@/hooks/useViewport'
import { drawAnnotations, drawSelectionOutline } from './draw'
import { getAnnotationBounds } from './geometry'

export interface SceneInput {
  canvas: HTMLCanvasElement
  image: HTMLImageElement
  annotations: readonly Annotation[]
  selectedIds: ReadonlySet<string>
  viewport: Viewport
}

/** Zeichnet Bild, Annotationen und Auswahlrahmen in den Editor-Canvas. */
export function renderEditorScene({
  canvas,
  image,
  annotations,
  selectedIds,
  viewport,
}: SceneInput): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const { scale, offsetX, offsetY } = viewport

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offsetX, dpr * offsetY)

  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)'
  ctx.shadowBlur = 24 / scale
  ctx.shadowOffsetY = 8 / scale
  ctx.drawImage(image, 0, 0)
  ctx.restore()

  // Annotationen außerhalb des Bildes nicht abschneiden – bewusst ohne Clip
  drawAnnotations(ctx, annotations)

  if (selectedIds.size > 0) {
    annotations
      .filter((annotation) => selectedIds.has(annotation.id))
      .forEach((annotation) => {
        drawSelectionOutline(ctx, getAnnotationBounds(annotation), scale)
      })
  }
}
