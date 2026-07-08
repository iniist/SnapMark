import type { Annotation } from './types'
import { drawAnnotations } from './draw'

/**
 * Rendert das Originalbild samt Annotationen in Originalauflösung
 * und liefert das Ergebnis als PNG-Blob.
 */
export async function renderToPngBlob(
  image: HTMLImageElement,
  annotations: readonly Annotation[],
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D wird nicht unterstützt.')

  ctx.drawImage(image, 0, 0)
  drawAnnotations(ctx, annotations)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('PNG-Export fehlgeschlagen.'))
    }, 'image/png')
  })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function isClipboardImageSupported(): boolean {
  return (
    typeof ClipboardItem !== 'undefined' &&
    typeof navigator.clipboard?.write === 'function'
  )
}

/** Kopiert das gerenderte PNG in die Zwischenablage. */
export async function copyPngToClipboard(
  image: HTMLImageElement,
  annotations: readonly Annotation[],
): Promise<void> {
  if (!isClipboardImageSupported()) {
    throw new Error('Die Zwischenablage wird von diesem Browser nicht unterstützt.')
  }
  // Safari verlangt, dass ClipboardItem synchron mit einem Promise erstellt wird
  const blobPromise = renderToPngBlob(image, annotations)
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blobPromise }),
  ])
}

/** Serialisiert das (unannotierte) Bild als PNG-Blob, z. B. zum Duplizieren. */
export async function imageToBlob(image: HTMLImageElement): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D wird nicht unterstützt.')
  ctx.drawImage(image, 0, 0)
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Bild konnte nicht serialisiert werden.'))
    }, 'image/png')
  })
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Das Bild konnte nicht geladen werden.'))
    }
    image.src = url
  })
}

export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    // Nötig, damit der Canvas nach dem Zeichnen exportierbar bleibt
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Das Bild konnte nicht geladen werden.'))
    image.src = url
  })
}
