import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle2, CircleAlert, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TOAST_DURATION_MS = 3500

const toastIcons = {
  success: CheckCircle2,
  error: CircleAlert,
  info: Info,
} as const

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = nextId.current
    nextId.current += 1
    setToasts((current) => [...current, { id, message, variant }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id))
    }, TOAST_DURATION_MS)
  }, [])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
        {toasts.map(({ id, message, variant }) => {
          const Icon = toastIcons[variant]
          return (
            <div
              key={id}
              className={cn(
                'pointer-events-auto flex w-full items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm text-card-foreground shadow-lg',
                variant === 'error' && 'border-destructive/40',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  variant === 'success' && 'text-green-500',
                  variant === 'error' && 'text-destructive',
                  variant === 'info' && 'text-primary',
                )}
              />
              {message}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast muss innerhalb von ToastProvider verwendet werden.')
  return context
}
