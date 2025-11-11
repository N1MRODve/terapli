/**
 * Composable para manejar el contexto de consulta multi-tenant
 * Gestiona la consulta actual del usuario y sus permisos
 */

export const useConsulta = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Estado reactivo
  const consultaActual = ref(null)
  const consultasUsuario = ref([])
  const rolesEnConsulta = ref([])
  const cargando = ref(false)
  const error = ref(null)

  /**
   * Obtener todas las consultas donde el usuario tiene acceso
   */
  const obtenerConsultasUsuario = async () => {
    try {
      cargando.value = true
      error.value = null

      if (!user.value) {
        throw new Error('Usuario no autenticado')
      }

      const { data: consultasData, error: consultasError } = await supabase
        .from('consulta_usuarios')
        .select(`
          consulta_id,
          role,
          activo,
          fecha_ingreso,
          consultas:consulta_id (
            id,
            nombre,
            slug,
            email_contacto,
            ciudad,
            logo_url,
            color_primario,
            color_secundario,
            plan,
            activa
          )
        `)
        .eq('user_id', user.value.id)
        .eq('activo', true)
        .order('fecha_ingreso', { ascending: true })

      if (consultasError) throw consultasError

      consultasUsuario.value = consultasData || []
      
      // Si no hay consulta actual, establecer la primera
      if (consultasData?.length > 0 && !consultaActual.value) {
        await establecerConsultaActual(consultasData[0].consultas.id)
      }

      return consultasData
    } catch (err) {
      console.error('Error al obtener consultas del usuario:', err)
      error.value = err.message
      return null
    } finally {
      cargando.value = false
    }
  }

  /**
   * Establecer la consulta actual
   */
  const establecerConsultaActual = async (consultaId) => {
    try {
      // Buscar la consulta en las disponibles para el usuario
      const consultaEncontrada = consultasUsuario.value.find(
        cu => cu.consultas.id === consultaId
      )

      if (!consultaEncontrada) {
        throw new Error('No tienes acceso a esta consulta')
      }

      consultaActual.value = consultaEncontrada.consultas
      
      // Obtener roles del usuario en esta consulta
      rolesEnConsulta.value = consultasUsuario.value
        .filter(cu => cu.consultas.id === consultaId)
        .map(cu => cu.role)

      // Guardar en localStorage para persistencia
      if (process.client) {
        localStorage.setItem('consulta_actual_id', consultaId)
      }

      return consultaEncontrada.consultas
    } catch (err) {
      console.error('Error al establecer consulta actual:', err)
      error.value = err.message
      return null
    }
  }

  /**
   * Obtener consulta actual desde localStorage
   */
  const cargarConsultaActual = async () => {
    if (process.client && !consultaActual.value) {
      const consultaGuardadaId = localStorage.getItem('consulta_actual_id')
      if (consultaGuardadaId && consultasUsuario.value.length > 0) {
        await establecerConsultaActual(consultaGuardadaId)
      }
    }
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  const tieneRol = (rol) => {
    return rolesEnConsulta.value.includes(rol)
  }

  /**
   * Verificar si el usuario tiene alguno de los roles especificados
   */
  const tieneAlgunRol = (roles) => {
    return roles.some(rol => rolesEnConsulta.value.includes(rol))
  }

  /**
   * Verificar si el usuario es propietario
   */
  const esPropietario = computed(() => tieneRol('propietario'))

  /**
   * Verificar si el usuario es admin
   */
  const esAdmin = computed(() => tieneRol('admin'))

  /**
   * Verificar si el usuario es staff (puede gestionar)
   */
  const esStaff = computed(() => 
    tieneAlgunRol(['propietario', 'admin', 'coordinadora', 'terapeuta'])
  )

  /**
   * Cambiar entre consultas disponibles
   */
  const cambiarConsulta = async (consultaId) => {
    return await establecerConsultaActual(consultaId)
  }

  /**
   * Obtener ID de la consulta actual
   */
  const consultaId = computed(() => consultaActual.value?.id)

  /**
   * Obtener información completa de la consulta actual
   */
  const infoConsulta = computed(() => {
    if (!consultaActual.value) return null
    
    return {
      ...consultaActual.value,
      roles: rolesEnConsulta.value,
      permisos: {
        esPropietario: esPropietario.value,
        esAdmin: esAdmin.value,
        esStaff: esStaff.value
      }
    }
  })

  // Watchers para reactividad
  watch(user, async (newUser) => {
    if (newUser) {
      await obtenerConsultasUsuario()
    } else {
      // Limpiar estado cuando no hay usuario
      consultaActual.value = null
      consultasUsuario.value = []
      rolesEnConsulta.value = []
      if (process.client) {
        localStorage.removeItem('consulta_actual_id')
      }
    }
  }, { immediate: true })

  // Inicialización
  onMounted(async () => {
    if (user.value) {
      await obtenerConsultasUsuario()
      await cargarConsultaActual()
    }
  })

  return {
    // Estado
    consultaActual: readonly(consultaActual),
    consultasUsuario: readonly(consultasUsuario),
    rolesEnConsulta: readonly(rolesEnConsulta),
    cargando: readonly(cargando),
    error: readonly(error),
    
    // Computeds
    consultaId,
    infoConsulta,
    esPropietario,
    esAdmin,
    esStaff,
    
    // Métodos
    obtenerConsultasUsuario,
    establecerConsultaActual,
    cambiarConsulta,
    tieneRol,
    tieneAlgunRol,
    cargarConsultaActual
  }
}