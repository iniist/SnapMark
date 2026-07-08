import type { ToolStyle } from './types'

export const ACCEPTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const

export const ACCEPTED_FILE_EXTENSIONS = '.png,.jpg,.jpeg,.webp'

export const COLOR_PALETTE = [
  '#ef4444', // Rot
  '#f97316', // Orange
  '#eab308', // Gelb
  '#22c55e', // Grün
  '#3b82f6', // Blau
  '#8b5cf6', // Violett
  '#ec4899', // Pink
  '#111827', // Schwarz
  '#ffffff', // Weiß
] as const

export const STROKE_WIDTH_RANGE = { min: 1, max: 24, step: 1 } as const
export const FONT_SIZE_RANGE = { min: 10, max: 96, step: 1 } as const
export const OPACITY_RANGE = { min: 0.1, max: 1, step: 0.05 } as const

export const DEFAULT_TOOL_STYLE: ToolStyle = {
  color: '#ef4444',
  strokeWidth: 4,
  fontSize: 28,
  opacity: 1,
  markerIcon: 'check',
}

export const ZOOM_LIMITS = { min: 0.05, max: 16 } as const
export const ZOOM_WHEEL_FACTOR = 1.1
export const ZOOM_BUTTON_FACTOR = 1.25
export const FIT_PADDING = 48

/** Toleranz in Bildpixeln (bei Zoom 1) für die Trefferprüfung */
export const HIT_TOLERANCE = 6

export const AUTOSAVE_DELAY_MS = 2000

export const RECENT_PROJECTS_KEY = 'snapmark.recent-projects'
export const THEME_STORAGE_KEY = 'snapmark.theme'
export const MAX_RECENT_PROJECTS = 8

// Mit "snapmark"-Präfix, damit sich die App eine Supabase-Instanz
// konfliktfrei mit anderen Projekten teilen kann
export const STORAGE_BUCKET = 'snapmark-images'
export const PROJECTS_TABLE = 'snapmark_projects'
