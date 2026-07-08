import {
  Circle,
  ListOrdered,
  MousePointer2,
  MoveUpRight,
  Pencil,
  Slash,
  Square,
  Stamp,
  Type,
  type LucideIcon,
} from 'lucide-react'
import type { Tool } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ToolDefinition {
  id: Tool
  label: string
  icon: LucideIcon
}

const TOOLS: readonly ToolDefinition[] = [
  { id: 'select', label: 'Auswählen & Verschieben', icon: MousePointer2 },
  { id: 'arrow', label: 'Pfeil', icon: MoveUpRight },
  { id: 'line', label: 'Linie', icon: Slash },
  { id: 'rect', label: 'Rechteck', icon: Square },
  { id: 'ellipse', label: 'Kreis / Ellipse', icon: Circle },
  { id: 'freehand', label: 'Freihand', icon: Pencil },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'number', label: 'Nummerierter Marker', icon: ListOrdered },
  { id: 'icon', label: 'Icon-Marker', icon: Stamp },
]

interface ToolbarProps {
  tool: Tool
  onSelectTool: (tool: Tool) => void
}

export function Toolbar({ tool, onSelectTool }: ToolbarProps) {
  return (
    <div className="pointer-events-auto flex flex-row items-center gap-1 rounded-xl border bg-card/95 p-1.5 shadow-lg backdrop-blur md:flex-col">
      {TOOLS.map((definition, index) => {
        const Icon = definition.icon
        const active = tool === definition.id
        return (
          <div key={definition.id} className="contents">
            {index === 1 ? (
              <div
                role="separator"
                className="mx-1 h-6 w-px shrink-0 bg-border md:mx-0 md:my-1 md:h-px md:w-6"
              />
            ) : null}
            <Button
              variant={active ? 'default' : 'ghost'}
              size="icon-lg"
              aria-label={definition.label}
              aria-pressed={active}
              title={definition.label}
              className={cn('shrink-0 rounded-lg', !active && 'text-muted-foreground')}
              onClick={() => onSelectTool(definition.id)}
            >
              <Icon />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
