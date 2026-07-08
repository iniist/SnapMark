import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2, MailCheck, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AppHeader } from '@/components/layout/AppHeader'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/toaster'

export function LoginPage() {
  const { user, isConfigured, signInWithMagicLink } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  if (user) return <Navigate to="/editor" replace />

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSending(true)
    try {
      await signInWithMagicLink(email)
      setSentTo(email)
    } catch (error) {
      toast(
        error instanceof Error ? error.message : 'Anmeldung fehlgeschlagen.',
        'error',
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
          {sentTo ? (
            <div className="space-y-4 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <MailCheck className="h-6 w-6 text-green-500" />
              </span>
              <h1 className="text-xl font-semibold">Prüfe dein Postfach</h1>
              <p className="text-sm text-muted-foreground">
                Wir haben einen Magic Link an <strong>{sentTo}</strong> gesendet.
                Klicke auf den Link, um dich anzumelden.
              </p>
              <Button variant="ghost" onClick={() => setSentTo(null)}>
                Andere E-Mail-Adresse verwenden
              </Button>
            </div>
          ) : (
            <>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Wand2 className="h-6 w-6 text-primary" />
              </span>
              <h1 className="mt-5 text-xl font-semibold">Anmelden</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Ohne Passwort – wir senden dir einen Magic Link per E-Mail.
              </p>
              <p className="mt-3 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                Die Anmeldung brauchst du nur, um Projekte online zu speichern
                und per Link zu teilen. Screenshots bearbeiten und als PNG
                exportieren funktioniert auch ohne Konto.
              </p>
              {isConfigured ? (
                <form onSubmit={(event) => void handleSubmit(event)} className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail-Adresse</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      autoFocus
                      placeholder="du@beispiel.de"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={sending}>
                    {sending ? <Loader2 className="animate-spin" /> : null}
                    Magic Link senden
                  </Button>
                </form>
              ) : (
                <p className="mt-6 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Supabase ist nicht konfiguriert. Zum Aktivieren der Anmeldung
                  bitte <code>VITE_SUPABASE_URL</code> und{' '}
                  <code>VITE_SUPABASE_ANON_KEY</code> setzen.
                </p>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
