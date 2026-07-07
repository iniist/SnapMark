import type { Annotation, Bounds, MarkerIcon, Point } from './types'

export const ANNOTATION_FONT_FAMILY =
  "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"

export const TEXT_LINE_HEIGHT = 1.3

let measureContext: CanvasRenderingContext2D | null = null

function getMeasureContext(): CanvasRenderingContext2D {
  if (!measureContext) {
    measureContext = document.createElement('canvas').getContext('2d')
    if (!measureContext) throw new Error('Canvas 2D wird nicht unterstützt.')
  }
  return measureContext
}

export function measureText(
  text: string,
  fontSize: number,
): { width: number; height: number } {
  const ctx = getMeasureContext()
  ctx.font = `${fontSize}px ${ANNOTATION_FONT_FAMILY}`
  const lines = text.split('\n')
  const width = Math.max(...lines.map((line) => ctx.measureText(line).width), 1)
  return { width, height: lines.length * fontSize * TEXT_LINE_HEIGHT }
}

export function markerRadius(fontSize: number): number {
  return fontSize * 0.8
}

function arrowHeadLength(strokeWidth: number): number {
  return Math.max(14, strokeWidth * 3.5)
}

function drawArrow(ctx: CanvasRenderingContext2D, start: Point, end: Point, strokeWidth: number): void {
  const angle = Math.atan2(end.y - start.y, end.x - start.x)
  const head = arrowHeadLength(strokeWidth)
  const spread = Math.PI / 7

  // Linie etwas kürzen, damit sie nicht aus der Pfeilspitze ragt
  const shaftEnd: Point = {
    x: end.x - Math.cos(angle) * head * 0.6,
    y: end.y - Math.sin(angle) * head * 0.6,
  }

  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(shaftEnd.x, shaftEnd.y)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(end.x, end.y)
  ctx.lineTo(
    end.x - head * Math.cos(angle - spread),
    end.y - head * Math.sin(angle - spread),
  )
  ctx.lineTo(
    end.x - head * Math.cos(angle + spread),
    end.y - head * Math.sin(angle + spread),
  )
  ctx.closePath()
  ctx.fill()
}

function drawFreehand(ctx: CanvasRenderingContext2D, points: readonly Point[]): void {
  if (points.length === 0) return
  const first = points[0] as Point
  ctx.beginPath()
  ctx.moveTo(first.x, first.y)
  if (points.length === 1) {
    ctx.lineTo(first.x + 0.01, first.y)
  } else {
    // Quadratische Kurven durch die Mittelpunkte glätten den Strich
    for (let i = 1; i < points.length - 1; i += 1) {
      const current = points[i] as Point
      const next = points[i + 1] as Point
      ctx.quadraticCurveTo(
        current.x,
        current.y,
        (current.x + next.x) / 2,
        (current.y + next.y) / 2,
      )
    }
    const last = points[points.length - 1] as Point
    ctx.lineTo(last.x, last.y)
  }
  ctx.stroke()
}

function drawText(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  fontSize: number,
): void {
  ctx.font = `${fontSize}px ${ANNOTATION_FONT_FAMILY}`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'
  text.split('\n').forEach((line, index) => {
    ctx.fillText(line, x, y + index * fontSize * TEXT_LINE_HEIGHT)
  })
}

function drawMarkerCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
): void {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

function drawIconSymbol(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  icon: MarkerIcon,
): void {
  const s = radius * 0.45
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = Math.max(2, radius * 0.22)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  if (icon === 'check') {
    ctx.moveTo(x - s, y + s * 0.1)
    ctx.lineTo(x - s * 0.25, y + s * 0.8)
    ctx.lineTo(x + s, y - s * 0.7)
  } else if (icon === 'cross') {
    ctx.moveTo(x - s * 0.8, y - s * 0.8)
    ctx.lineTo(x + s * 0.8, y + s * 0.8)
    ctx.moveTo(x + s * 0.8, y - s * 0.8)
    ctx.lineTo(x - s * 0.8, y + s * 0.8)
  } else {
    // Warnung: Ausrufezeichen
    ctx.moveTo(x, y - s)
    ctx.lineTo(x, y + s * 0.35)
    ctx.moveTo(x, y + s)
    ctx.lineTo(x, y + s * 1.001)
  }
  ctx.stroke()
}

export function drawAnnotation(
  ctx: CanvasRenderingContext2D,
  annotation: Annotation,
): void {
  ctx.save()
  ctx.globalAlpha = annotation.opacity
  ctx.strokeStyle = annotation.color
  ctx.fillStyle = annotation.color
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  switch (annotation.type) {
    case 'arrow':
      ctx.lineWidth = annotation.strokeWidth
      drawArrow(ctx, annotation.start, annotation.end, annotation.strokeWidth)
      break
    case 'line':
      ctx.lineWidth = annotation.strokeWidth
      ctx.beginPath()
      ctx.moveTo(annotation.start.x, annotation.start.y)
      ctx.lineTo(annotation.end.x, annotation.end.y)
      ctx.stroke()
      break
    case 'rect':
      ctx.lineWidth = annotation.strokeWidth
      ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height)
      break
    case 'ellipse': {
      ctx.lineWidth = annotation.strokeWidth
      const rx = Math.abs(annotation.width) / 2
      const ry = Math.abs(annotation.height) / 2
      const cx = annotation.x + annotation.width / 2
      const cy = annotation.y + annotation.height / 2
      ctx.beginPath()
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
      ctx.stroke()
      break
    }
    case 'freehand':
      ctx.lineWidth = annotation.strokeWidth
      drawFreehand(ctx, annotation.points)
      break
    case 'text':
      drawText(ctx, annotation.x, annotation.y, annotation.text, annotation.fontSize)
      break
    case 'number': {
      const radius = markerRadius(annotation.fontSize)
      drawMarkerCircle(ctx, annotation.x, annotation.y, radius)
      ctx.fillStyle = '#ffffff'
      ctx.font = `600 ${annotation.fontSize}px ${ANNOTATION_FONT_FAMILY}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(annotation.value), annotation.x, annotation.y + radius * 0.05)
      break
    }
    case 'icon': {
      const radius = markerRadius(annotation.fontSize)
      drawMarkerCircle(ctx, annotation.x, annotation.y, radius)
      drawIconSymbol(ctx, annotation.x, annotation.y, radius, annotation.icon)
      break
    }
  }

  ctx.restore()
}

export function drawAnnotations(
  ctx: CanvasRenderingContext2D,
  annotations: readonly Annotation[],
): void {
  annotations.forEach((annotation) => drawAnnotation(ctx, annotation))
}

/** Gestrichelte Auswahl-Markierung; `scale` hält die Strichstärke konstant. */
export function drawSelectionOutline(
  ctx: CanvasRenderingContext2D,
  bounds: Bounds,
  scale: number,
): void {
  const padding = 6 / scale
  ctx.save()
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 1.5 / scale
  ctx.setLineDash([5 / scale, 4 / scale])
  ctx.strokeRect(
    bounds.x - padding,
    bounds.y - padding,
    bounds.width + padding * 2,
    bounds.height + padding * 2,
  )
  ctx.restore()
}
