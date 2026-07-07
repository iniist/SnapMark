import type { Annotation, Bounds, Point } from './types'
import { markerRadius, measureText } from './draw'

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function distanceToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lengthSquared = dx * dx + dy * dy
  if (lengthSquared === 0) return distance(p, a)
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lengthSquared
  t = Math.max(0, Math.min(1, t))
  return distance(p, { x: a.x + t * dx, y: a.y + t * dy })
}

/** Normalisiert ein Rechteck, sodass width/height positiv sind. */
export function normalizeBounds(bounds: Bounds): Bounds {
  return {
    x: bounds.width < 0 ? bounds.x + bounds.width : bounds.x,
    y: bounds.height < 0 ? bounds.y + bounds.height : bounds.y,
    width: Math.abs(bounds.width),
    height: Math.abs(bounds.height),
  }
}

export function getAnnotationBounds(annotation: Annotation): Bounds {
  switch (annotation.type) {
    case 'arrow':
    case 'line': {
      const { start, end } = annotation
      return normalizeBounds({
        x: start.x,
        y: start.y,
        width: end.x - start.x,
        height: end.y - start.y,
      })
    }
    case 'rect':
    case 'ellipse':
      return normalizeBounds(annotation)
    case 'freehand': {
      const xs = annotation.points.map((p) => p.x)
      const ys = annotation.points.map((p) => p.y)
      const minX = Math.min(...xs)
      const minY = Math.min(...ys)
      return {
        x: minX,
        y: minY,
        width: Math.max(...xs) - minX,
        height: Math.max(...ys) - minY,
      }
    }
    case 'text': {
      const size = measureText(annotation.text, annotation.fontSize)
      return { x: annotation.x, y: annotation.y, ...size }
    }
    case 'number':
    case 'icon': {
      const radius = markerRadius(annotation.fontSize)
      return {
        x: annotation.x - radius,
        y: annotation.y - radius,
        width: radius * 2,
        height: radius * 2,
      }
    }
  }
}

function pointInBounds(point: Point, bounds: Bounds, tolerance: number): boolean {
  return (
    point.x >= bounds.x - tolerance &&
    point.x <= bounds.x + bounds.width + tolerance &&
    point.y >= bounds.y - tolerance &&
    point.y <= bounds.y + bounds.height + tolerance
  )
}

export function hitTest(
  annotation: Annotation,
  point: Point,
  tolerance: number,
): boolean {
  switch (annotation.type) {
    case 'arrow':
    case 'line':
      return (
        distanceToSegment(point, annotation.start, annotation.end) <=
        annotation.strokeWidth / 2 + tolerance
      )
    case 'rect': {
      const b = normalizeBounds(annotation)
      const reach = annotation.strokeWidth / 2 + tolerance
      const corners: Point[] = [
        { x: b.x, y: b.y },
        { x: b.x + b.width, y: b.y },
        { x: b.x + b.width, y: b.y + b.height },
        { x: b.x, y: b.y + b.height },
      ]
      return corners.some((corner, i) => {
        const next = corners[(i + 1) % corners.length] as Point
        return distanceToSegment(point, corner, next) <= reach
      })
    }
    case 'ellipse': {
      const b = normalizeBounds(annotation)
      const rx = b.width / 2
      const ry = b.height / 2
      if (rx === 0 || ry === 0) return false
      const cx = b.x + rx
      const cy = b.y + ry
      const radial = Math.hypot((point.x - cx) / rx, (point.y - cy) / ry)
      const reach = (annotation.strokeWidth / 2 + tolerance) / Math.min(rx, ry)
      return Math.abs(radial - 1) <= reach
    }
    case 'freehand': {
      const reach = annotation.strokeWidth / 2 + tolerance
      const points = annotation.points
      if (points.length === 1) return distance(point, points[0] as Point) <= reach
      for (let i = 0; i < points.length - 1; i += 1) {
        if (
          distanceToSegment(point, points[i] as Point, points[i + 1] as Point) <=
          reach
        ) {
          return true
        }
      }
      return false
    }
    case 'text':
      return pointInBounds(point, getAnnotationBounds(annotation), tolerance)
    case 'number':
    case 'icon':
      return (
        distance(point, annotation) <=
        markerRadius(annotation.fontSize) + tolerance
      )
  }
}

/** Oberstes getroffenes Element (zuletzt gezeichnet gewinnt). */
export function findAnnotationAt(
  annotations: readonly Annotation[],
  point: Point,
  tolerance: number,
): Annotation | undefined {
  for (let i = annotations.length - 1; i >= 0; i -= 1) {
    const annotation = annotations[i] as Annotation
    if (hitTest(annotation, point, tolerance)) return annotation
  }
  return undefined
}

export function translateAnnotation(
  annotation: Annotation,
  dx: number,
  dy: number,
): Annotation {
  switch (annotation.type) {
    case 'arrow':
    case 'line':
      return {
        ...annotation,
        start: { x: annotation.start.x + dx, y: annotation.start.y + dy },
        end: { x: annotation.end.x + dx, y: annotation.end.y + dy },
      }
    case 'rect':
    case 'ellipse':
      return { ...annotation, x: annotation.x + dx, y: annotation.y + dy }
    case 'freehand':
      return {
        ...annotation,
        points: annotation.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
      }
    case 'text':
    case 'number':
    case 'icon':
      return { ...annotation, x: annotation.x + dx, y: annotation.y + dy }
  }
}
