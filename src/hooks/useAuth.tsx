import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

interface AuthContextValue {
  user: User | null
  /** true, solange die initiale Session noch geladen wird */
  loading: boolean
  isConfigured: boolean
  signInWithMagicLink: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      },
    )

    return () => subscription.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isConfigured: isSupabaseConfigured,
      signInWithMagicLink: async (email: string) => {
        if (!supabase) throw new Error('Supabase ist nicht konfiguriert.')
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/editor` },
        })
        if (error) {
          // Registrierung ist auf dieser Instanz ggf. auf eingeladene
          // Benutzer beschränkt (Supabase: "Allow new users to sign up" aus)
          if (error.message.toLowerCase().includes('signups not allowed')) {
            throw new Error(
              'Diese E-Mail-Adresse ist noch nicht freigeschaltet. Bitte lass dich vom Admin einladen.',
            )
          }
          throw new Error(error.message)
        }
      },
      signOut: async () => {
        if (!supabase) return
        await supabase.auth.signOut()
      },
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth muss innerhalb von AuthProvider verwendet werden.')
  return context
}
