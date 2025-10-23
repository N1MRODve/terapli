import type { User, Session } from '@supabase/supabase-js'
import type { Database, UserRole } from '~/types/database.types'

// Tipo para el perfil del usuario
export type UserProfile = Database['public']['Tables']['profiles']['Row']

// Re-exportar UserRole para facilitar su uso
export type { UserRole }

export const useSupabase = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  // Estado reactivo para la sesión
  const session = useState<Session | null>('supabase-session', () => null)
  
  // Estado reactivo para el perfil del usuario
  const userProfile = useState<UserProfile | null>('user-profile', () => null)

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
      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        session.value = newSession
        
        // Cargar perfil cuando cambia la sesión
        if (newSession?.user) {
          await loadUserProfile()
        } else {
          userProfile.value = null
        }
      })
    }
  }

  // Cargar el perfil del usuario desde la tabla profiles
  const loadUserProfile = async () => {
    if (!user.value) {
      userProfile.value = null
      return null
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (error) {
        console.error('Error al cargar perfil:', error)
        userProfile.value = null
        return null
      }

      userProfile.value = data as UserProfile
      return data as UserProfile
    } catch (err) {
      console.error('Error en loadUserProfile:', err)
      userProfile.value = null
      return null
    }
  }

  // Obtener el rol del usuario actual
  const getUserRole = async (): Promise<UserRole | null> => {
    // Si ya tenemos el perfil cargado, retornarlo
    if (userProfile.value) {
      return userProfile.value.rol
    }

    // Si no, cargar el perfil
    const profile = await loadUserProfile()
    return profile?.rol || null
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
      userProfile.value = null
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
    userProfile: readonly(userProfile),
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
    updatePassword,
    loadUserProfile,
    getUserRole,
    isAuthenticated: computed(() => !!user.value)
  }
}
