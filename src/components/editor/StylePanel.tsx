import { Check, TriangleAlert, X, type LucideIcon } from 'lucide-react'
import type { Annotation, MarkerIcon, Tool, ToolStyle } from '@/lib/types'
import {
  COLOR_PALETTE,
  FONT_SIZE_RANGE,
  OPACITY_RANGE,
  STROKE_WIDTH_RANGE,
} from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

const MARKER_ICONS: readonly { id: MarkerIcon; label: string; icon: LucideIcon }[] = [
  { id: 'check', label: 'Häkchen', icon: Check },
  { id: 'warning', label: 'Warnung', icon: TriangleAlert },
  { id: 'cross', label: 'Kreuz', icon: X },
]

const STROKE_TOOLS: readonly Tool[] = ['arrow', 'line', 'rect', 'ellipse', 'freehand']
const FONT_TOOLS: readonly Tool[] = ['text', 'number', 'icon']

interface StylePanelProps {
  tool: Tool
  style: ToolStyle
  selectedAnnotations: readonly Annotation[]
  onChange: (patch: Partial<ToolStyle>) => void
  /** Bündelt Slider-Ziehen zu einem einzigen Undo-Schritt */
  onGestureStart: () => void
  onGestureEnd: () => void
}

export function StylePanel({
  tool,
  style,
  selectedAnnotations,
  onChange,
  onGestureStart,
  onGestureEnd,
}: StylePanelProps) {
  const selectionHasStroke = selectedAnnotations.some((a) => 'strokeWidth' in a)
  const selectionHasFont = selectedAnnotations.some((a) => 'fontSize' in a)
  const selectionHasIcon = selectedAnnotations.some((a) => a.type === 'icon')

  const showStroke = STROKE_TOOLS.includes(tool) || selectionHasStroke
  const showFont = FONT_TOOLS.includes(tool) || selectionHasFont
  const showIcon = tool === 'icon' || selectionHasIcon

  return (
    <div className="pointer-events-auto w-56 space-y-4 rounded-xl border bg-card/95 p-4 shadow-lg backdrop-blur">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Farbe</Label>
        <div className="grid grid-cols-5 gap-1.5">
          {COLOR_PALETTE.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Farbe ${color}`}
              onClick={() => onChange({ color })}
              className={cn(
                'h-7 w-7 rounded-full border border-black/10 transition-transform hover:scale-110 dark:border-white/20',
                style.color === color &&
                  'ring-2 ring-ring ring-offset-2 ring-offset-card',
              )}
              style={{ backgroundColor: color }}
            />
          ))}
          <label
            className="relative h-7 w-7 cursor-pointer rounded-full border border-black/10 dark:border-white/20"
            style={{
              background:
                'conic-gradient(#ef4444, #eab308, #22c55e, #3b82f6, #8b5cf6, #ef4444)',
            }}
            title="Eigene Farbe"
          >
            <input
              type="color"
              value={style.color}
              onChange={(event) => onChange({ color: event.target.value })}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Eigene Farbe wählen"
            />
          </label>
        </div>
      </div>

      {showStroke ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Linienstärke</Label>
            <span className="text-xs tabular-nums text-muted-foreground">
              {style.strokeWidth}px
            </span>
          </div>
          <Slider
            value={style.strokeWidth}
            onChange={(strokeWidth) => onChange({ strokeWidth })}
            onDragStart={onGestureStart}
            onDragEnd={onGestureEnd}
            aria-label="Linienstärke"
            {...STROKE_WIDTH_RANGE}
          />
        </div>
      ) : null}

      {showFont ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              {tool === 'text' || selectionHasFont ? 'Schriftgröße' : 'Größe'}
            </Label>
            <span className="text-xs tabular-nums text-muted-foreground">
              {style.fontSize}px
            </span>
          </div>
          <Slider
            value={style.fontSize}
            onChange={(fontSize) => onChange({ fontSize })}
            onDragStart={onGestureStart}
            onDragEnd={onGestureEnd}
            aria-label="Schriftgröße"
            {...FONT_SIZE_RANGE}
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Deckkraft</Label>
          <span className="text-xs tabular-nums text-muted-foreground">
            {Math.round(style.opacity * 100)}%
          </span>
        </div>
        <Slider
          value={style.opacity}
          onChange={(opacity) => onChange({ opacity })}
          onDragStart={onGestureStart}
          onDragEnd={onGestureEnd}
          aria-label="Deckkraft"
          {...OPACITY_RANGE}
        />
      </div>

      {showIcon ? (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Symbol</Label>
          <div className="flex gap-1.5">
            {MARKER_ICONS.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={style.markerIcon === id ? 'default' : 'outline'}
                size="icon"
                aria-label={label}
                title={label}
                onClick={() => onChange({ markerIcon: id })}
              >
                <Icon />
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      {selectedAnnotations.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          {selectedAnnotations.length === 1
            ? '1 Element ausgewählt'
            : `${selectedAnnotations.length} Elemente ausgewählt`}{' '}
          – Entf löscht die Auswahl.
        </p>
      ) : null}
    </div>
  )
}
