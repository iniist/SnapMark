import type {
  Annotation,
  IconMarkerAnnotation,
  NumberMarkerAnnotation,
  Point,
  TextAnnotation,
  ToolStyle,
} from './types'
import { normalizeBounds } from './geometry'
import { createId } from './utils'

export type DraftShapeTool = 'arrow' | 'line' | 'rect' | 'ellipse' | 'freehand'

export function createDraftShape(
  tool: DraftShapeTool,
  point: Point,
  style: ToolStyle,
): Annotation {
  const base = {
    id: createId(),
    color: style.color,
    opacity: style.opacity,
    strokeWidth: style.strokeWidth,
  }
  switch (tool) {
    case 'arrow':
      return { ...base, type: 'arrow', start: point, end: point }
    case 'line':
      return { ...base, type: 'line', start: point, end: point }
    case 'rect':
      return { ...base, type: 'rect', x: point.x, y: point.y, width: 0, height: 0 }
    case 'ellipse':
      return {
        ...base,
        type: 'ellipse',
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
      }
    case 'freehand':
      return { ...base, type: 'freehand', points: [point] }
  }
}

/** Aktualisiert eine Form während des Aufziehens. */
export function updateDraftShape(
  annotation: Annotation,
  origin: Point,
  point: Point,
): Annotation {
  switch (annotation.type) {
    case 'arrow':
    case 'line':
      return { ...annotation, end: point }
    case 'rect':
    case 'ellipse':
      return {
        ...annotation,
        x: origin.x,
        y: origin.y,
        width: point.x - origin.x,
        height: point.y - origin.y,
      }
    case 'freehand':
      return { ...annotation, points: [...annotation.points, point] }
    default:
      return annotation
  }
}

/** Bringt negative Breiten/Höhen nach dem Aufziehen in Normalform. */
export function finalizeShape(annotation: Annotation): Annotation {
  if (annotation.type === 'rect' || annotation.type === 'ellipse') {
    return { ...annotation, ...normalizeBounds(annotation) }
  }
  return annotation
}

/** Formen unterhalb dieser Größe (in Bildpixeln) gelten als versehentlicher Klick. */
const MIN_SHAPE_SIZE = 3

export function isDegenerateShape(annotation: Annotation): boolean {
  switch (annotation.type) {
    case 'arrow':
    case 'line':
      return (
        Math.hypot(
          annotation.end.x - annotation.start.x,
          annotation.end.y - annotation.start.y,
        ) < MIN_SHAPE_SIZE
      )
    case 'rect':
    case 'ellipse':
      return (
        Math.abs(annotation.width) < MIN_SHAPE_SIZE &&
        Math.abs(annotation.height) < MIN_SHAPE_SIZE
      )
    default:
      return false
  }
}

export function createNumberMarker(
  point: Point,
  style: ToolStyle,
  value: number,
): NumberMarkerAnnotation {
  return {
    id: createId(),
    type: 'number',
    x: point.x,
    y: point.y,
    value,
    fontSize: style.fontSize,
    color: style.color,
    opacity: style.opacity,
  }
}

export function createIconMarker(
  point: Point,
  style: ToolStyle,
): IconMarkerAnnotation {
  return {
    id: createId(),
    type: 'icon',
    x: point.x,
    y: point.y,
    icon: style.markerIcon,
    fontSize: style.fontSize,
    color: style.color,
    opacity: style.opacity,
  }
}

export function createText(
  point: Point,
  style: ToolStyle,
  text: string,
): TextAnnotation {
  return {
    id: createId(),
    type: 'text',
    x: point.x,
    y: point.y,
    text,
    fontSize: style.fontSize,
    color: style.color,
    opacity: style.opacity,
  }
}
