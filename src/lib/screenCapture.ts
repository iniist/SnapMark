/** Prüft, ob der Browser Bildschirmaufnahme unterstützt (Desktop-Browser). */
export function isScreenCaptureSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getDisplayMedia === 'function'
  )
}

/**
 * Fordert per Browser-Dialog die Auswahl einer Quelle an (Bildschirm,
 * Fenster oder Tab) und liefert den zugehörigen MediaStream.
 */
export function requestDisplayStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
}
