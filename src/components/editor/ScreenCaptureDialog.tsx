import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { Camera, Crop, Maximize2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ScreenCaptureDialogProps {
  stream: MediaStream
  onCapture: (file: File) => void
  onClose: () => void
}

interface Shot {
  url: string
  width: number
  height: number
}

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Nimmt einen Einzelframe aus einem Bildschirm-Stream auf und lässt den
 * gewünschten Ausschnitt aufziehen, bevor er in den Editor übergeben wird.
 */
export function ScreenCaptureDialog({ stream, onCapture, onClose }: ScreenCaptureDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const dragStart = useRef<{ x: number; y: number } | null>(null)

  const [phase, setPhase] = useState<'preview' | 'crop'>('preview')
  const [shot, setShot] = useState<Shot | null>(null)
  const [sel, setSel] = useState<Rect | null>(null)

  const stopStream = useCallback(() => {
    stream.getTracks().forEach((track) => track.stop())
  }, [stream])

  const close = useCallback(() => {
    stopStream()
    onClose()
  }, [stopStream, onClose])

  // Live-Stream an das Vorschau-Video hängen
  useEffect(() => {
    if (phase !== 'preview') return
    const video = videoRef.current
    if (!video) return
    video.srcObject = stream
    void video.play().catch(() => {})
    const [track] = stream.getVideoTracks()
    // Beendet der Nutzer die Freigabe über den Browser, Dialog schließen
    const onEnded = () => onClose()
    track?.addEventListener('ended', onEnded)
    return () => track?.removeEventListener('ended', onEnded)
  }, [phase, stream, onClose])

  // Escape schließt den Dialog
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [close])

  const handleShoot = useCallback(() => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    setShot({ url: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height })
    stopStream() // Aufnahme steht – Freigabe-Indikator ausblenden
    setPhase('crop')
  }, [stopStream])

  const emitFile = useCallback(
    (area: Rect | null) => {
      if (!shot) return
      const source = new Image()
      source.onload = () => {
        const region = area ?? { x: 0, y: 0, w: shot.width, h: shot.height }
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(region.w))
        canvas.height = Math.max(1, Math.round(region.h))
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(
          source,
          region.x,
          region.y,
          region.w,
          region.h,
          0,
          0,
          canvas.width,
          canvas.height,
        )
        canvas.toBlob((blob) => {
          if (blob) onCapture(new File([blob], 'screenshot.png', { type: 'image/png' }))
        }, 'image/png')
      }
      source.src = shot.url
    },
    [shot, onCapture],
  )

  const hasSelection = !!sel && sel.w >= 4 && sel.h >= 4

  const confirmCrop = useCallback(() => {
    const img = imgRef.current
    if (!img || !shot || !hasSelection || !sel) {
      emitFile(null)
      return
    }
    const scale = shot.width / img.clientWidth
    emitFile({ x: sel.x * scale, y: sel.y * scale, w: sel.w * scale, h: sel.h * scale })
  }, [sel, shot, hasSelection, emitFile])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    dragStart.current = { x, y }
    setSel({ x, y, w: 0, h: 0 })
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width))
    const y = Math.max(0, Math.min(event.clientY - rect.top, rect.height))
    const start = dragStart.current
    setSel({
      x: Math.min(start.x, x),
      y: Math.min(start.y, y),
      w: Math.abs(x - start.x),
      h: Math.abs(y - start.y),
    })
  }

  const onPointerUp = () => {
    dragStart.current = null
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80 p-4 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-hidden rounded-2xl border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">
            {phase === 'preview' ? 'Bildschirm aufnehmen' : 'Bereich zuschneiden'}
          </h2>
          <Button variant="ghost" size="icon" onClick={close} aria-label="Schließen">
            <X />
          </Button>
        </div>

        {phase === 'preview' ? (
          <>
            <div className="flex flex-1 items-center justify-center overflow-hidden bg-black p-2">
              <video
                ref={videoRef}
                muted
                playsInline
                className="max-h-[70vh] max-w-full rounded-lg"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Bring das gewünschte Fenster in den Vordergrund und nimm dann auf.
              </p>
              <Button onClick={handleShoot}>
                <Camera /> Jetzt aufnehmen
              </Button>
            </div>
          </>
        ) : shot ? (
          <>
            <div className="flex flex-1 items-center justify-center overflow-auto bg-[#0b1220] p-2">
              <div
                className="relative touch-none select-none"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              >
                <img
                  ref={imgRef}
                  src={shot.url}
                  alt="Aufnahme"
                  draggable={false}
                  className="max-h-[70vh] max-w-full rounded-lg"
                />
                {sel && sel.w > 0 && sel.h > 0 ? (
                  <div
                    className="pointer-events-none absolute border-2 border-primary"
                    style={{
                      left: sel.x,
                      top: sel.y,
                      width: sel.w,
                      height: sel.h,
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
                    }}
                  />
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Ziehe einen Bereich auf – oder nimm das ganze Bild.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => emitFile(null)}>
                  <Maximize2 /> Ganzes Bild
                </Button>
                <Button onClick={confirmCrop} disabled={!hasSelection}>
                  <Crop /> Zuschneiden &amp; öffnen
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
