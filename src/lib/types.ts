export interface Point {
  x: number
  y: number
}

export type MarkerIcon = 'check' | 'warning' | 'cross'

export type Tool =
  | 'select'
  | 'arrow'
  | 'line'
  | 'rect'
  | 'ellipse'
  | 'freehand'
  | 'text'
  | 'number'
  | 'icon'

interface AnnotationBase {
  id: string
  color: string
  /** Deckkraft 0..1 */
  opacity: number
}

export interface ArrowAnnotation extends AnnotationBase {
  type: 'arrow'
  start: Point
  end: Point
  strokeWidth: number
}

export interface LineAnnotation extends AnnotationBase {
  type: 'line'
  start: Point
  end: Point
  strokeWidth: number
}

export interface RectAnnotation extends AnnotationBase {
  type: 'rect'
  x: number
  y: number
  width: number
  height: number
  strokeWidth: number
}

export interface EllipseAnnotation extends AnnotationBase {
  type: 'ellipse'
  x: number
  y: number
  width: number
  height: number
  strokeWidth: number
}

export interface FreehandAnnotation extends AnnotationBase {
  type: 'freehand'
  points: Point[]
  strokeWidth: number
}

export interface TextAnnotation extends AnnotationBase {
  type: 'text'
  x: number
  y: number
  text: string
  fontSize: number
}

export interface NumberMarkerAnnotation extends AnnotationBase {
  type: 'number'
  x: number
  y: number
  value: number
  fontSize: number
}

export interface IconMarkerAnnotation extends AnnotationBase {
  type: 'icon'
  x: number
  y: number
  icon: MarkerIcon
  fontSize: number
}

export type Annotation =
  | ArrowAnnotation
  | LineAnnotation
  | RectAnnotation
  | EllipseAnnotation
  | FreehandAnnotation
  | TextAnnotation
  | NumberMarkerAnnotation
  | IconMarkerAnnotation

export type AnnotationType = Annotation['type']

/** Aktuell gewählte Werkzeug-Eigenschaften */
export interface ToolStyle {
  color: string
  strokeWidth: number
  fontSize: number
  opacity: number
  markerIcon: MarkerIcon
}

export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

/** Datensatz aus der Supabase-Tabelle `projects` */
export interface ProjectRecord {
  id: string
  owner_id: string
  title: string
  image_path: string
  annotations_json: Annotation[]
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface RecentProject {
  id: string
  title: string
  openedAt: string
}
