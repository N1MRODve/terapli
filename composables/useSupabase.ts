import type { Database } from '~/types/database.types'
import type { SupabaseClient, User, Session } from '@supabase/supabase-js'

export const useSupabase = () => {
  const { $supabase } = useNuxtApp()
  const supabase = $supabase as SupabaseClient<Database>

  // Estado reactivo para el usuario y la sesión
  const user = useState<User | null>('supabase-user', () => null)
  const session = useState<Session | null>('supabase-session', () => null)

  // Inicializar la sesión
  const initSession = async () => {
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    user.value = data.session?.user ?? null
  }

  // Escuchar cambios en la autenticación
  const setupAuthListener = () => {
    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession
      user.value = newSession?.user ?? null
    })
  }

  // Métodos de autenticación
  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signUpWithEmail = async (email: string, password: string, metadata?: Record<string, any>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      user.value = null
      session.value = null
    }
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { data, error }
  }

  const updatePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })
    return { data, error }
  }

  // Inicializar cuando se monta
  if (process.client) {
    initSession()
    setupAuthListener()
  }

  return {
    supabase,
    user: readonly(user),
    session: readonly(session),
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
    updatePassword,
    isAuthenticated: computed(() => !!user.value)
  }
}
