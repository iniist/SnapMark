import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from 'react'
import type { Point } from '@/lib/types'
import { FIT_PADDING, ZOOM_LIMITS } from '@/lib/constants'
import { clamp } from '@/lib/utils'

export interface Viewport {
  scale: number
  offsetX: number
  offsetY: number
}

export interface ViewportApi {
  viewport: Viewport
  /** Ref-Spiegel für Pointer-Handler, die immer den aktuellen Stand brauchen */
  viewportRef: MutableRefObject<Viewport>
  screenToImage: (point: Point) => Point
  zoomAt: (screenPoint: Point, factor: number) => void
  zoomBy: (factor: number) => void
  panBy: (dx: number, dy: number) => void
  fitToScreen: () => void
}

const INITIAL_VIEWPORT: Viewport = { scale: 1, offsetX: 0, offsetY: 0 }

export function useViewport(
  containerRef: RefObject<HTMLElement | null>,
  imageSize: { width: number; height: number } | null,
): ViewportApi {
  const [viewport, setViewport] = useState<Viewport>(INITIAL_VIEWPORT)
  const viewportRef = useRef<Viewport>(viewport)
  viewportRef.current = viewport

  const screenToImage = useCallback((point: Point): Point => {
    const { scale, offsetX, offsetY } = viewportRef.current
    return { x: (point.x - offsetX) / scale, y: (point.y - offsetY) / scale }
  }, [])

  const zoomAt = useCallback((screenPoint: Point, factor: number) => {
    setViewport((current) => {
      const scale = clamp(current.scale * factor, ZOOM_LIMITS.min, ZOOM_LIMITS.max)
      const ratio = scale / current.scale
      return {
        scale,
        offsetX: screenPoint.x - (screenPoint.x - current.offsetX) * ratio,
        offsetY: screenPoint.y - (screenPoint.y - current.offsetY) * ratio,
      }
    })
  }, [])

  const zoomBy = useCallback(
    (factor: number) => {
      const container = containerRef.current
      if (!container) return
      zoomAt(
        { x: container.clientWidth / 2, y: container.clientHeight / 2 },
        factor,
      )
    },
    [containerRef, zoomAt],
  )

  const panBy = useCallback((dx: number, dy: number) => {
    setViewport((current) => ({
      ...current,
      offsetX: current.offsetX + dx,
      offsetY: current.offsetY + dy,
    }))
  }, [])

  const fitToScreen = useCallback(() => {
    const container = containerRef.current
    if (!container || !imageSize) return
    const availableWidth = container.clientWidth - FIT_PADDING * 2
    const availableHeight = container.clientHeight - FIT_PADDING * 2
    // Kleine Bilder nicht hochskalieren – das wirkt sonst pixelig
    const scale = clamp(
      Math.min(
        availableWidth / imageSize.width,
        availableHeight / imageSize.height,
        1,
      ),
      ZOOM_LIMITS.min,
      ZOOM_LIMITS.max,
    )
    setViewport({
      scale,
      offsetX: (container.clientWidth - imageSize.width * scale) / 2,
      offsetY: (container.clientHeight - imageSize.height * scale) / 2,
    })
  }, [containerRef, imageSize])

  // Beim Laden eines (neuen) Bildes automatisch einpassen
  useEffect(() => {
    if (imageSize) fitToScreen()
  }, [imageSize, fitToScreen])

  return { viewport, viewportRef, screenToImage, zoomAt, zoomBy, panBy, fitToScreen }
}
