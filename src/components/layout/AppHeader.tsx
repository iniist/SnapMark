import { Link, useNavigate } from 'react-router-dom'
import { LogIn, LogOut, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'

export function AppHeader() {
  const { user, isConfigured, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <header className="flex h-16 items-center justify-between px-6 md:px-10">
      <Link to="/" className="group flex items-center gap-2 text-lg font-semibold tracking-tight">
        <Logo className="h-8 w-8 transition-transform duration-300 group-hover:rotate-[14deg] group-hover:scale-110" />
        Orivo
      </Link>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Dark Mode umschalten"
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </Button>
        {isConfigured && !user ? (
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            title="Anmelden – nur nötig zum Speichern & Teilen von Projekten"
          >
            <LogIn /> Anmelden
          </Button>
        ) : null}
        {user ? (
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.email}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => void signOut()}
              aria-label="Abmelden"
              title="Abmelden"
            >
              <LogOut />
            </Button>
          </div>
        ) : null}
        <Button onClick={() => navigate('/editor')}>Editor öffnen</Button>
      </div>
    </header>
  )
}
