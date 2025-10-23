import type { User, Session } from '@supabase/supabase-js'

export const useSupabase = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Estado reactivo para la sesión
  const session = useState<Session | null>('supabase-session', () => null)

  // Inicializar la sesión
  const initSession = async () => {
    if (process.client) {
      const { data } = await supabase.auth.getSession()
      session.value = data.session
    }
  }

  // Escuchar cambios en la autenticación
  const setupAuthListener = () => {
    if (process.client) {
      supabase.auth.onAuthStateChange((_event, newSession) => {
        session.value = newSession
      })
    }
  }

  // Métodos de autenticación
  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (!error && data.session) {
      session.value = data.session
    }
    
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
