import type { RecentProject } from './types'
import { MAX_RECENT_PROJECTS, RECENT_PROJECTS_KEY } from './constants'

export function getRecentProjects(): RecentProject[] {
  try {
    const raw = localStorage.getItem(RECENT_PROJECTS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (entry): entry is RecentProject =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as RecentProject).id === 'string' &&
        typeof (entry as RecentProject).title === 'string',
    )
  } catch {
    return []
  }
}

export function rememberProject(id: string, title: string): void {
  const entry: RecentProject = { id, title, openedAt: new Date().toISOString() }
  const others = getRecentProjects().filter((project) => project.id !== id)
  const next = [entry, ...others].slice(0, MAX_RECENT_PROJECTS)
  localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(next))
}

export function forgetProject(id: string): void {
  const next = getRecentProjects().filter((project) => project.id !== id)
  localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(next))
}
