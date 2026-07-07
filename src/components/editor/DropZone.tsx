import { useRef, useState, type DragEvent } from 'react'
import { ImagePlus, Upload } from 'lucide-react'
import { ACCEPTED_FILE_EXTENSIONS, ACCEPTED_IMAGE_TYPES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface DropZoneProps {
  onFileSelected: (file: File) => void
  onError: (message: string) => void
}

function findAcceptedFile(files: FileList | null): File | null {
  if (!files) return null
  for (const file of Array.from(files)) {
    if ((ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      return file
    }
  }
  return null
}

export function DropZone({ onFileSelected, onError }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFiles = (files: FileList | null) => {
    const file = findAcceptedFile(files)
    if (file) onFileSelected(file)
    else onError('Bitte ein Bild im Format PNG, JPG oder WEBP auswählen.')
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    handleFiles(event.dataTransfer.files)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Bild hochladen"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click()
      }}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        'flex w-full max-w-2xl cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-8 py-16 text-center transition-colors',
        isDragOver
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-accent/50',
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        {isDragOver ? (
          <Upload className="h-8 w-8 text-primary" />
        ) : (
          <ImagePlus className="h-8 w-8 text-primary" />
        )}
      </div>
      <div className="space-y-1">
        <p className="text-lg font-semibold">
          Screenshot hierher ziehen oder klicken
        </p>
        <p className="text-sm text-muted-foreground">PNG, JPG oder WEBP</p>
      </div>
      <Button size="lg" tabIndex={-1} className="pointer-events-none">
        Datei auswählen
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_FILE_EXTENSIONS}
        className="hidden"
        onChange={(event) => {
          handleFiles(event.target.files)
          event.target.value = ''
        }}
      />
    </div>
  )
}
