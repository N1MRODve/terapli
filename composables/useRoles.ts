/**
 * Composable para gestión de roles y permisos
 * Proporciona helpers útiles para verificar roles en componentes
 */

import type { UserRole } from '~/types/database.types'

export const useRoles = () => {
  const { userProfile, getUserRole } = useSupabase()

  /**
   * Verifica si el usuario actual tiene un rol específico
   */
  const hasRole = (role: UserRole): boolean => {
    return userProfile.value?.rol === role
  }

  /**
   * Verifica si el usuario actual tiene alguno de los roles especificados
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => userProfile.value?.rol === role)
  }

  /**
   * Verifica si el usuario es una psicóloga
   */
  const isPsicologa = computed(() => userProfile.value?.rol === 'psicologa')

  /**
   * Verifica si el usuario es un paciente
   */
  const isPaciente = computed(() => userProfile.value?.rol === 'paciente')

  /**
   * Verifica si el usuario es coordinadora
   */
  const isCoordinadora = computed(() => userProfile.value?.rol === 'coordinadora')

  /**
   * Obtiene el nombre del rol en español
   */
  const getRoleName = (role?: UserRole): string => {
    const nombres: Record<UserRole, string> = {
      psicologa: 'Psicóloga',
      paciente: 'Paciente',
      coordinadora: 'Coordinadora'
    }
    return role ? nombres[role] : 'Desconocido'
  }

  /**
   * Obtiene el dashboard correspondiente al rol
   */
  const getDashboardPath = (role?: UserRole): string => {
    const rol = role || userProfile.value?.rol
    
    const paths: Record<UserRole, string> = {
      psicologa: '/terapeuta/dashboard',
      coordinadora: '/coordinacion/dashboard',
      paciente: '/paciente/dashboard'
    }
    
    return rol ? paths[rol] : '/login'
  }

  /**
   * Navega al dashboard correspondiente al rol actual
   */
  const goToDashboard = async () => {
    const path = getDashboardPath()
    await navigateTo(path)
  }

  return {
    // Estado
    userProfile: readonly(userProfile),
    isPsicologa,
    isPaciente,
    isCoordinadora,
    
    // Métodos
    hasRole,
    hasAnyRole,
    getUserRole,
    getRoleName,
    getDashboardPath,
    goToDashboard
  }
}
