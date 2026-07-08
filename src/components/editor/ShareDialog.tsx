import { useState } from 'react'
import { Check, Copy, Globe, Lock } from 'lucide-react'
import { buildShareUrl } from '@/lib/projects'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/toaster'

interface ShareDialogProps {
  open: boolean
  onClose: () => void
  projectId: string
  isPublic: boolean
  onVisibilityChange: (isPublic: boolean) => Promise<void>
}

export function ShareDialog({
  open,
  onClose,
  projectId,
  isPublic,
  onVisibilityChange,
}: ShareDialogProps) {
  const { toast } = useToast()
  const [updating, setUpdating] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareUrl = buildShareUrl(projectId)

  const handleToggle = async (next: boolean) => {
    setUpdating(true)
    try {
      await onVisibilityChange(next)
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Änderung fehlgeschlagen.', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Projekt teilen"
      description="Bestimme, wer dieses Projekt über den Link öffnen kann."
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            {isPublic ? (
              <Globe className="h-5 w-5 text-primary" />
            ) : (
              <Lock className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">
                {isPublic ? 'Öffentlich per Link' : 'Privat'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isPublic
                  ? 'Alle mit dem Link können das Projekt ansehen.'
                  : 'Nur du kannst das Projekt öffnen.'}
              </p>
            </div>
          </div>
          <Switch
            checked={isPublic}
            onCheckedChange={(next) => void handleToggle(next)}
            disabled={updating}
            aria-label="Öffentlich per Link"
          />
        </div>

        <div className="flex gap-2">
          <Input value={shareUrl} readOnly className="text-xs" aria-label="Share-Link" />
          <Button
            variant="outline"
            size="icon"
            onClick={() => void handleCopyLink()}
            aria-label="Link kopieren"
            title="Link kopieren"
          >
            {copied ? <Check className="text-green-500" /> : <Copy />}
          </Button>
        </div>

        {!isPublic ? (
          <p className="text-xs text-muted-foreground">
            Hinweis: Der Link funktioniert für andere erst, wenn das Projekt
            öffentlich ist.
          </p>
        ) : null}
      </div>
    </Dialog>
  )
}
