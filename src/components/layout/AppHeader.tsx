import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FolderOpen, LogIn, LogOut, Menu as MenuIcon, Moon, Pencil, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Menu, MenuItem, MenuSeparator } from '@/components/ui/menu'
import { Logo } from '@/components/Logo'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

function navItemClass({ isActive }: { isActive: boolean }) {
  return cn(
    'rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-accent',
    isActive ? 'text-foreground' : 'text-muted-foreground',
  )
}

export function AppHeader() {
  const { user, isConfigured, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <header className="flex h-16 items-center justify-between gap-2 px-5 md:px-10">
      <div className="flex items-center gap-1 md:gap-3">
        <Link to="/" className="group flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Logo className="h-8 w-8 transition-transform duration-300 group-hover:rotate-[14deg] group-hover:scale-110" />
          Orivo
        </Link>
        {/* Inline-Navigation ab sm */}
        <nav className="hidden items-center sm:flex">
          <NavLink to="/editor" className={navItemClass}>
            Editor
          </NavLink>
          {isConfigured ? (
            <NavLink to="/projekte" className={navItemClass}>
              Meine Projekte
            </NavLink>
          ) : null}
        </nav>
      </div>

      {/* Desktop-Aktionen ab sm */}
      <div className="hidden items-center gap-2 sm:flex">
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
            <span className="hidden text-sm text-muted-foreground md:inline">
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
      </div>

      {/* Mobiles Menü unter sm */}
      <div className="flex items-center gap-1 sm:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Dark Mode umschalten"
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </Button>
        <Menu
          trigger={({ toggle }) => (
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Menü">
              <MenuIcon />
            </Button>
          )}
        >
          {(close) => (
            <>
              <MenuItem
                onClick={() => {
                  navigate('/editor')
                  close()
                }}
              >
                <Pencil /> Editor
              </MenuItem>
              {isConfigured ? (
                <MenuItem
                  onClick={() => {
                    navigate('/projekte')
                    close()
                  }}
                >
                  <FolderOpen /> Meine Projekte
                </MenuItem>
              ) : null}
              {isConfigured ? <MenuSeparator /> : null}
              {isConfigured && !user ? (
                <MenuItem
                  onClick={() => {
                    navigate('/login')
                    close()
                  }}
                >
                  <LogIn /> Anmelden
                </MenuItem>
              ) : null}
              {user ? (
                <>
                  <div className="truncate px-3 py-1 text-xs text-muted-foreground">
                    {user.email}
                  </div>
                  <MenuItem
                    onClick={() => {
                      void signOut()
                      close()
                    }}
                  >
                    <LogOut /> Abmelden
                  </MenuItem>
                </>
              ) : null}
            </>
          )}
        </Menu>
      </div>
    </header>
  )
}
