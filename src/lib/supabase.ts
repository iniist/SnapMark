import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Ohne konfigurierte Umgebungsvariablen läuft die App im reinen
 * Offline-Modus: Bearbeiten und Exportieren funktionieren, Speichern nicht.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null

export const isSupabaseConfigured = supabase !== null

/** Wirft einen verständlichen Fehler, wenn Supabase nicht konfiguriert ist. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase ist nicht konfiguriert. Bitte VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY setzen.',
    )
  }
  return supabase
}
