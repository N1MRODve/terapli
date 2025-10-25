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
      
      // Si hay sesión, cargar el perfil
      if (data.session?.user) {
        await loadUserProfile()
      }
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
    // Validar que hay usuario y tiene ID
    if (!user.value?.id) {
      console.warn('[useSupabase] No hay usuario autenticado o ID inválido')
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
        console.error('[useSupabase] Error al cargar perfil:', error)
        console.error('[useSupabase] Error code:', error.code)
        console.error('[useSupabase] Error message:', error.message)
        console.error('[useSupabase] Error details:', error.details)
        console.error('[useSupabase] User ID:', user.value.id)
        userProfile.value = null
        return null
      }

      if (!data) {
        console.warn('[useSupabase] No se encontró perfil para el usuario:', user.value.id)
        console.warn('[useSupabase] El usuario existe en auth pero no tiene perfil en la tabla profiles')
        userProfile.value = null
        return null
      }

      userProfile.value = data as UserProfile
      console.log('[useSupabase] Perfil cargado:', data.email, 'Rol:', data.rol)
      return data as UserProfile
    } catch (err) {
      console.error('[useSupabase] Error en loadUserProfile:', err)
      userProfile.value = null
      return null
    }
  }

  // Obtener el rol del usuario actual
  const getUserRole = async (): Promise<UserRole | null> => {
    // Validar que hay usuario primero
    if (!user.value?.id) {
      console.warn('[useSupabase] getUserRole: No hay usuario autenticado')
      return null
    }

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
