import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MenuProps {
  /** Auslöser-Element; bekommt Zustand + Umschaltfunktion */
  trigger: (state: { open: boolean; toggle: () => void }) => ReactNode
  /** Menüinhalt; als Funktion aufgerufen mit einer close()-Hilfe */
  children: ReactNode | ((close: () => void) => ReactNode)
  align?: 'start' | 'end'
  className?: string
}

/** Schlankes Dropdown-Menü mit Klick-außerhalb- und Escape-Schließen. */
export function Menu({ trigger, children, align = 'end', className }: MenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((value) => !value) })}
      {open ? (
        <div
          role="menu"
          className={cn(
            'absolute z-50 mt-2 min-w-52 rounded-xl border bg-card p-1.5 shadow-lg',
            align === 'end' ? 'right-0' : 'left-0',
            className,
          )}
        >
          {typeof children === 'function' ? children(close) : children}
        </div>
      ) : null}
    </div>
  )
}

interface MenuItemProps {
  onClick?: () => void
  children: ReactNode
  className?: string
  disabled?: boolean
}

export function MenuItem({ onClick, children, className, disabled }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function MenuSeparator() {
  return <div role="separator" className="my-1 h-px bg-border" />
}
