import type { User, Session } from '@supabase/supabase-js'
import type { Database, UserRole } from '~/types/database.types'

// Tipo para el perfil del usuario
export type UserProfile = Database['public']['Tables']['profiles']['Row']

// Re-exportar UserRole para facilitar su uso
export type { UserRole }

// Flag global para evitar múltiples cargas simultáneas
let isLoadingProfile = false

export const useSupabase = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  // Estado global compartido (singleton) - ahora dentro de la función
  const session = useState<Session | null>('supabase-session', () => null)
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
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        console.log('🔐 [Auth State Change]', event, {
          hasSession: !!newSession,
          userId: newSession?.user?.id,
          email: newSession?.user?.email
        })
        
        session.value = newSession
        
        // Solo limpiar perfil en eventos de cierre de sesión
        if (event === 'SIGNED_OUT') {
          console.warn('⚠️ [Auth] Sesión cerrada, limpiando perfil')
          userProfile.value = null
          isLoadingProfile = false
          return
        }
        
        // Cargar perfil cuando cambia la sesión (login, token refresh, etc.)
        if (newSession?.user && !userProfile.value) {
          console.log('✅ [Auth] Usuario autenticado sin perfil, cargando...')
          await loadUserProfile()
        } else if (newSession?.user && userProfile.value) {
          console.log('✅ [Auth] Usuario autenticado, perfil ya cargado')
        }
      })
    }
  }

  // Cargar el perfil del usuario desde la tabla profiles
  const loadUserProfile = async () => {
    // Evitar llamadas múltiples simultáneas
    if (isLoadingProfile) {
      console.log('[useSupabase] Ya hay una carga de perfil en progreso, esperando...')
      // Esperar a que termine la carga actual
      while (isLoadingProfile) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      // Si ya se cargó el perfil mientras esperábamos, retornarlo
      if (userProfile.value) {
        console.log('[useSupabase] Perfil ya cargado por otra instancia')
        return userProfile.value
      }
    }

    isLoadingProfile = true

    try {
      // Esperar a que el usuario esté disponible (fix para race condition)
      let attempts = 0
      while (!user.value && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }

      // Obtener el ID del usuario (puede estar en .id o .sub dependiendo del tipo)
      const userId = (user.value as any)?.id || (user.value as any)?.sub

      // Validar que hay usuario y tiene ID
      if (!userId) {
        console.warn('[useSupabase] No hay usuario autenticado o ID inválido después de esperar')
        console.warn('[useSupabase] user.value:', user.value)
        userProfile.value = null
        return null
      }

      console.log('[useSupabase] Cargando perfil para usuario:', userId)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[useSupabase] Error al cargar perfil:', error)
        console.error('[useSupabase] Error code:', error.code)
        console.error('[useSupabase] Error message:', error.message)
        console.error('[useSupabase] Error details:', error.details)
        console.error('[useSupabase] User ID:', userId)
        userProfile.value = null
        return null
      }

      if (!data) {
        console.warn('[useSupabase] No se encontró perfil para el usuario:', userId)
        console.warn('[useSupabase] El usuario existe en auth pero no tiene perfil en la tabla profiles')
        userProfile.value = null
        return null
      }

      userProfile.value = data as UserProfile
      console.log('[useSupabase] ✅ Perfil cargado correctamente:', data.email, 'Rol:', data.rol)
      
      // Sincronizar con tabla terapeutas si el rol es 'psicologa'
      if (data.rol === 'psicologa') {
        await syncTerapeutaProfile(data)
      }
      
      return data as UserProfile
    } catch (err) {
      console.error('[useSupabase] Error en loadUserProfile:', err)
      userProfile.value = null
      return null
    } finally {
      isLoadingProfile = false
    }
  }

  // Sincronizar perfil con tabla terapeutas (solo para psicólogas)
  const syncTerapeutaProfile = async (profile: UserProfile) => {
    try {
      console.log('[Sync] Verificando sincronización con tabla terapeutas...')
      
      if (!profile.email) {
        console.warn('[Sync] No se puede sincronizar: email faltante')
        return
      }
      
      // Usar cliente sin tipos para acceder a la tabla terapeutas
      const supabaseClient = supabase as any
      
      // Buscar si ya existe un registro en terapeutas con este email
      const { data: existingTerapeuta, error: searchError } = await supabaseClient
        .from('terapeutas')
        .select('*')
        .eq('email', profile.email)
        .maybeSingle()

      if (searchError && searchError.code !== 'PGRST116') {
        console.warn('[Sync] Error al buscar terapeuta:', searchError)
        return
      }

      // Preparar datos del terapeuta
      const terapeutaData = {
        id: profile.id,
        nombre_completo: profile.nombre || profile.email.split('@')[0] || 'Psicóloga',
        email: profile.email,
        telefono: null,
        especialidad: null,
        num_colegiada: null,
        disponibilidad: null,
        activo: true,
        metadata: {
          sincronizado_desde_profile: true,
          ultima_sincronizacion: new Date().toISOString()
        }
      }

      if (!existingTerapeuta) {
        // No existe, crear nuevo registro
        console.log('[Sync] Creando nuevo registro en tabla terapeutas...')
        
        const { error: insertError } = await supabaseClient
          .from('terapeutas')
          .insert(terapeutaData)

        if (insertError) {
          // Si el error es por ID duplicado, intentar actualizar en su lugar
          if (insertError.code === '23505') {
            console.log('[Sync] El terapeuta ya existe por ID, actualizando...')
            const { error: updateError } = await supabaseClient
              .from('terapeutas')
              .update({
                nombre_completo: terapeutaData.nombre_completo,
                email: terapeutaData.email,
                activo: true,
                metadata: terapeutaData.metadata
              })
              .eq('id', profile.id)

            if (updateError) {
              console.warn('[Sync] No se pudo actualizar el terapeuta:', updateError)
            } else {
              console.log('[Sync] ✅ Terapeuta actualizado correctamente')
            }
          } else {
            console.warn('[Sync] No se pudo insertar el terapeuta:', insertError)
          }
        } else {
          console.log('[Sync] ✅ Terapeuta creado correctamente en la tabla terapeutas')
        }
      } else {
        // Ya existe, verificar si necesita actualización
        const needsUpdate = 
          existingTerapeuta.nombre_completo !== terapeutaData.nombre_completo ||
          existingTerapeuta.email !== terapeutaData.email ||
          !existingTerapeuta.activo

        if (needsUpdate) {
          console.log('[Sync] Actualizando registro existente en tabla terapeutas...')
          
          const { error: updateError } = await supabaseClient
            .from('terapeutas')
            .update({
              nombre_completo: terapeutaData.nombre_completo,
              email: terapeutaData.email,
              activo: true,
              metadata: terapeutaData.metadata
            })
            .eq('id', profile.id)

          if (updateError) {
            console.warn('[Sync] No se pudo actualizar el terapeuta:', updateError)
          } else {
            console.log('[Sync] ✅ Terapeuta actualizado correctamente')
          }
        } else {
          console.log('[Sync] ✅ Terapeuta ya está sincronizado correctamente')
        }
      }
    } catch (err) {
      console.warn('[Sync] Error al sincronizar terapeuta:', err)
      // No romper el flujo de login, solo registrar el error
    }
  }

  // Obtener el rol del usuario actual
  const getUserRole = async (): Promise<UserRole | null> => {
    // Obtener el ID del usuario (puede estar en .id o .sub)
    const userId = (user.value as any)?.id || (user.value as any)?.sub
    
    // Validar que hay usuario primero
    if (!userId) {
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

  // Esperar a que el usuario esté disponible (útil en onMounted)
  const waitForUser = async (maxAttempts = 20) => {
    let attempts = 0
    while (!user.value && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
    return user.value
  }

  // Helper para obtener el ID del usuario (maneja tanto .id como .sub)
  const getUserId = () => {
    return (user.value as any)?.id || (user.value as any)?.sub || null
  }

  // Inicializar cuando se monta
  if (process.client) {
    initSession()
    setupAuthListener()
    
    // Watch para detectar cuando se pierde el perfil inesperadamente
    watch(userProfile, (newProfile, oldProfile) => {
      if (oldProfile && !newProfile) {
        console.warn('⚠️ [useSupabase] PERFIL SE PERDIÓ - Intentando recargar...')
        // Si había perfil y se perdió, intentar recargarlo
        if (user.value) {
          loadUserProfile()
        }
      } else if (newProfile && !oldProfile) {
        console.log('✅ [useSupabase] Perfil cargado:', newProfile.email, 'Rol:', newProfile.rol)
      }
    })
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
    waitForUser,
    getUserId, // Nueva función helper
    isAuthenticated: computed(() => !!user.value)
  }
}
