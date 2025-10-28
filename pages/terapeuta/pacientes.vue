<template>
  <main class="pacientes-container section-padding">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-serif font-bold text-cafe mb-2">
        Pacientes
      </h1>
      <p class="text-lg text-cafe/70">
        Gestión de pacientes activos
      </p>
    </div>

    <!-- Buscador y filtros -->
    <div class="mb-6 bg-white rounded-xl shadow-sm border border-[#EAD5D3]/40 p-4">
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Buscador -->
        <div class="flex-1">
          <div class="relative">
            <input
              v-model="busqueda"
              type="text"
              placeholder="Buscar paciente por nombre..."
              class="w-full px-4 py-2.5 pl-10 bg-base-bg rounded-lg border border-transparent focus:border-terracota focus:outline-none focus:ring-2 focus:ring-terracota/20 transition-all text-cafe placeholder-cafe/50"
            />
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-cafe/50">
              🔍
            </span>
          </div>
        </div>

        <!-- Filtros de estado -->
        <div class="flex gap-2">
          <button
            v-for="filtro in filtrosEstado"
            :key="filtro.valor"
            @click="estadoSeleccionado = filtro.valor"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            :class="estadoSeleccionado === filtro.valor 
              ? 'bg-terracota text-white' 
              : 'bg-base-bg text-cafe hover:bg-rosa/30'"
          >
            {{ filtro.emoji }} {{ filtro.label }}
          </button>
        </div>

        <!-- Botón añadir paciente -->
        <button
          @click="abrirModalNuevoPaciente"
          class="px-4 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <span>+</span>
          <span>Nuevo Paciente</span>
        </button>
      </div>
    </div>

    <!-- Lista de pacientes -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin w-12 h-12 border-4 border-terracota border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-cafe/60">Cargando pacientes...</p>
    </div>

    <div v-else-if="pacientesFiltrados.length === 0" class="text-center py-12">
      <DashboardCard>
        <span class="text-6xl mb-4 block opacity-40">👥</span>
        <h3 class="text-xl font-serif font-semibold text-cafe mb-2">
          {{ busqueda || estadoSeleccionado !== 'todos' 
            ? 'No se encontraron pacientes' 
            : 'Aún no tienes pacientes registrados' }}
        </h3>
        <p class="text-cafe/60 mb-4">
          {{ busqueda || estadoSeleccionado !== 'todos'
            ? 'Intenta ajustar los filtros de búsqueda'
            : 'Comienza añadiendo tu primer paciente' }}
        </p>
        <button
          v-if="!busqueda && estadoSeleccionado === 'todos'"
          @click="abrirModalNuevoPaciente"
          class="px-6 py-3 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors"
        >
          + Añadir Primer Paciente
        </button>
      </DashboardCard>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="paciente in pacientesFiltrados"
        :key="paciente.id"
        class="relative group cursor-pointer"
        @click="irAFichaPaciente(paciente.id)"
      >
        <PacienteCard
          :paciente="paciente"
          @editar="abrirModalEditar"
          @eliminar="abrirModalEliminar"
          @ver-citas="verCitasPaciente"
          @gestionar-bonos="gestionarBonosPaciente"
        />
        
        <!-- Botón flotante "Asignar Cita" - Visible al hover en desktop -->
        <button
          v-if="paciente.activo && !paciente.en_pausa"
          @click.stop="abrirModalAsignarCita(paciente)"
          class="hidden md:flex absolute bottom-4 right-4 px-4 py-2 bg-gradient-to-r from-terracota to-rosa text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 items-center gap-2 z-10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
          title="Asignar nueva cita"
        >
          <span>📅</span>
          <span>Asignar Cita</span>
        </button>
        
        <!-- Versión visible siempre en móvil -->
        <button
          v-if="paciente.activo && !paciente.en_pausa"
          @click.stop="abrirModalAsignarCita(paciente)"
          class="md:hidden absolute bottom-4 right-4 px-4 py-2 bg-gradient-to-r from-terracota to-rosa text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2 z-10"
          title="Asignar nueva cita"
        >
          <span>📅</span>
          <span>Asignar Cita</span>
        </button>
      </div>
    </div>

    <!-- Modal Asignar Cita -->
    <ModalNuevaCita
      :mostrar="mostrarModalAsignarCita"
      :paciente-preseleccionado="pacienteSeleccionadoCita"
      @cerrar="cerrarModalAsignarCita"
      @cita-creada="manejarCitaCreada"
    />

    <!-- Paginación (si es necesaria) -->
    <div v-if="pacientesFiltrados.length > 0" class="mt-8 flex items-center justify-between">
      <p class="text-sm text-cafe/60">
        Mostrando {{ pacientesFiltrados.length }} de {{ totalPacientes }} pacientes
      </p>
      <div v-if="totalPacientes > pacientesFiltrados.length" class="flex gap-2">
        <button
          class="px-4 py-2 bg-white border border-cafe/20 text-cafe rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          Ver más
        </button>
      </div>
    </div>

    <!-- Modal Nuevo Paciente -->
    <ModalNuevoPaciente
      :mostrar="mostrarModalNuevo"
      @cerrar="cerrarModalNuevo"
      @paciente-creado="manejarPacienteCreado"
    />

    <!-- Modal Editar Paciente -->
    <ModalEditarPaciente
      :mostrar="mostrarModalEditar"
      :paciente="pacienteSeleccionado"
      @cerrar="cerrarModalEditar"
      @paciente-actualizado="manejarPacienteActualizado"
    />

    <!-- Modal Eliminar Paciente -->
    <ModalEliminarPaciente
      :mostrar="mostrarModalEliminar"
      :paciente="pacienteSeleccionado"
      @cerrar="cerrarModalEliminar"
      @paciente-eliminado="manejarPacienteEliminado"
      @paciente-desactivado="manejarPacienteDesactivado"
    />
  </main>
</template>

<script setup>
definePageMeta({
  layout: 'terapeuta'
})

const router = useRouter()
const supabase = useSupabaseClient()
const { getUserId, waitForUser } = useSupabase()
const user = useSupabaseUser()

// Log inicial del estado del usuario
console.log('👤 [Pacientes] Estado inicial del usuario:', {
  existe: !!user.value,
  id: getUserId(),
  email: user.value?.email
})

// Watch para detectar cambios en el usuario
watch(user, (newUser, oldUser) => {
  console.log('🔄 [Pacientes] Usuario cambió:', {
    antes: oldUser?.email || 'null',
    ahora: newUser?.email || 'null',
    id: getUserId()
  })
})

// Estado del modal
const mostrarModalNuevo = ref(false)
const mostrarModalEditar = ref(false)
const mostrarModalEliminar = ref(false)
const mostrarModalAsignarCita = ref(false)
const pacienteSeleccionado = ref(null)
const pacienteSeleccionadoCita = ref(null)

// Estado
const pacientes = ref([])
const loading = ref(true)
const busqueda = ref('')
const estadoSeleccionado = ref('todos')

// Filtros disponibles
const filtrosEstado = [
  { valor: 'todos', label: 'Todos', emoji: '📋' },
  { valor: 'activo', label: 'Activos', emoji: '✅' },
  { valor: 'pausa', label: 'En pausa', emoji: '⏸️' },
  { valor: 'finalizado', label: 'Finalizados', emoji: '🏁' }
]

// Cargar pacientes desde Supabase
const cargarPacientes = async () => {
  loading.value = true
  try {
    const userId = getUserId()
    console.log('📥 [Pacientes] Iniciando carga de pacientes...')
    console.log('📥 [Pacientes] Usuario actual:', {
      existe: !!user.value,
      id: userId,
      email: user.value?.email
    })
    
    // Verificar que el usuario esté autenticado
    if (!userId) {
      console.error('❌ [Pacientes] Usuario no autenticado')
      loading.value = false
      return
    }

    console.log('✅ [Pacientes] Usuario verificado, consultando database...')
    
    // Obtener pacientes del terapeuta autenticado
    const { data: pacientesData, error: pacientesError } = await supabase
      .from('pacientes')
      .select(`
        id,
        created_at,
        activo,
        email,
        nombre_completo,
        telefono,
        area_de_acompanamiento,
        frecuencia,
        metadata
      `)
      .eq('terapeuta_id', userId)
      .order('created_at', { ascending: false })
    
    if (pacientesError) throw pacientesError

    // Enriquecer datos con información de citas y emociones
    const pacientesEnriquecidos = await Promise.all(
      pacientesData.map(async (paciente) => {
        // Obtener última sesión (de tabla 'citas')
        const { data: ultimaCita } = await supabase
          .from('citas')
          .select('fecha_cita')
          .eq('paciente_id', paciente.id)
          .eq('estado', 'realizada')
          .order('fecha_cita', { ascending: false })
          .limit(1)
          .maybeSingle()

        // Obtener próxima sesión (de tabla 'citas')
        const { data: proximaCita } = await supabase
          .from('citas')
          .select('fecha_cita, hora_inicio')
          .eq('paciente_id', paciente.id)
          .in('estado', ['pendiente', 'confirmada'])
          .gte('fecha_cita', new Date().toISOString().split('T')[0])
          .order('fecha_cita', { ascending: true })
          .order('hora_inicio', { ascending: true })
          .limit(1)
          .maybeSingle()

        // Contar total de sesiones (de tabla 'citas')
        const { count: totalSesiones } = await supabase
          .from('citas')
          .select('*', { count: 'exact', head: true })
          .eq('paciente_id', paciente.id)
          .eq('estado', 'realizada')

        // Obtener bono activo o pendiente (con manejo seguro de errores)
        let bonoActivo = null
        try {
          const { data: bonoData, error: bonoError } = await supabase
            .from('bonos')
            .select('id, tipo, estado, sesiones_totales, sesiones_restantes, fecha_fin, created_at')
            .eq('paciente_id', paciente.id)
            .in('estado', ['activo', 'pendiente'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (bonoError) {
            console.warn('[Bonos] Error en consulta:', bonoError.message)
          } else {
            bonoActivo = bonoData
          }
        } catch (error) {
          console.warn('[Bonos] Error inesperado:', error)
        }

        // Contar sesiones completadas desde la última renovación de bono
        let sesionesCompletadasBono = 0
        let totalSesionesBono = 0
        if (bonoActivo) {
          totalSesionesBono = bonoActivo.sesiones_totales
          sesionesCompletadasBono = totalSesionesBono - bonoActivo.sesiones_restantes
        }

        // Obtener promedio emocional de últimos 7 días
        const hace7Dias = new Date()
        hace7Dias.setDate(hace7Dias.getDate() - 7)
        
        const { data: emocionesRecientes } = await supabase
          .from('metricas_bienestar')
          .select('estado_animo, nivel_energia, nivel_estres')
          .eq('paciente_id', paciente.id)
          .gte('fecha', hace7Dias.toISOString())

        let estadoEmocionalPromedio = 3
        let requiereAtencion = false
        let evolucionPorcentaje = 50

        if (emocionesRecientes && emocionesRecientes.length > 0) {
          const promedioAnimo = emocionesRecientes.reduce((sum, e) => sum + e.estado_animo, 0) / emocionesRecientes.length
          estadoEmocionalPromedio = promedioAnimo
          evolucionPorcentaje = Math.round((promedioAnimo / 10) * 100) // Estado de ánimo es 1-10
          
          // Detectar si requiere atención (3 o más registros bajos consecutivos)
          const ultimosTres = emocionesRecientes.slice(-3)
          if (ultimosTres.length >= 3) {
            requiereAtencion = ultimosTres.every(e => e.estado_animo <= 4) // Bajo es 4 o menos en escala 1-10
          }
        }

        // Obtener el nombre completo del paciente
        const nombreCompleto = paciente.nombre_completo || 
                              paciente.metadata?.nombre_completo ||
                              paciente.email

        return {
          id: paciente.id,
          nombre: nombreCompleto,
          apellidos: '', // Deprecado - ya no se usa
          email: paciente.email,
          telefono: paciente.telefono,
          activo: paciente.activo,
          en_pausa: paciente.metadata?.en_pausa || false,
          area_de_acompanamiento: paciente.area_de_acompanamiento,
          frecuencia: paciente.frecuencia,
          ultima_sesion: ultimaCita?.fecha_cita || null,
          proxima_sesion: proximaCita ? `${proximaCita.fecha_cita}T${proximaCita.hora_inicio}:00` : null,
          total_sesiones: totalSesiones || 0,
          estado_emocional_promedio: estadoEmocionalPromedio,
          evolucion_porcentaje: evolucionPorcentaje,
          requiere_atencion: requiereAtencion,
          created_at: paciente.created_at,
          bono_activo: bonoActivo ? {
            tipo: bonoActivo.tipo,
            estado: bonoActivo.estado,
            fecha_fin: bonoActivo.fecha_fin,
            sesiones_completadas: sesionesCompletadasBono,
            sesiones_totales: totalSesionesBono,
            sesiones_restantes: bonoActivo.sesiones_restantes
          } : null
        }
      })
    )

    pacientes.value = pacientesEnriquecidos
  } catch (error) {
    console.error('Error al cargar pacientes:', error)
    alert('Hubo un error al cargar los pacientes. Por favor, recarga la página.')
  } finally {
    loading.value = false
  }
}

// Filtrar pacientes
const pacientesFiltrados = computed(() => {
  let resultado = pacientes.value

  // Filtrar por búsqueda
  if (busqueda.value) {
    const busquedaLower = busqueda.value.toLowerCase()
    resultado = resultado.filter(p => {
      // Buscar en el nombre completo del paciente
      const nombreCompleto = (p.nombre || '').toLowerCase()
      return nombreCompleto.includes(busquedaLower) || 
             (p.email || '').toLowerCase().includes(busquedaLower)
    })
  }

  // Filtrar por estado
  if (estadoSeleccionado.value !== 'todos') {
    resultado = resultado.filter(p => {
      if (estadoSeleccionado.value === 'activo') {
        return p.activo && !p.en_pausa
      } else if (estadoSeleccionado.value === 'pausa') {
        return p.activo && p.en_pausa
      } else if (estadoSeleccionado.value === 'finalizado') {
        return !p.activo
      }
      return true
    })
  }

  return resultado
})

const totalPacientes = computed(() => pacientes.value.length)

// Navegación
const irAFichaPaciente = (id) => {
  router.push(`/terapeuta/pacientes/${id}`)
}

// Gestión del modal
const abrirModalNuevoPaciente = () => {
  mostrarModalNuevo.value = true
}

const cerrarModalNuevo = () => {
  mostrarModalNuevo.value = false
}

const abrirModalEditar = (paciente) => {
  console.log('Abriendo modal de edición para:', paciente)
  pacienteSeleccionado.value = paciente
  mostrarModalEditar.value = true
}

const cerrarModalEditar = () => {
  mostrarModalEditar.value = false
  pacienteSeleccionado.value = null
}

const abrirModalEliminar = (paciente) => {
  console.log('Abriendo modal de eliminación para:', paciente)
  pacienteSeleccionado.value = paciente
  mostrarModalEliminar.value = true
}

const cerrarModalEliminar = () => {
  mostrarModalEliminar.value = false
  pacienteSeleccionado.value = null
}

const manejarPacienteCreado = async (nuevoPaciente) => {
  console.log('Nuevo paciente creado:', nuevoPaciente)
  
  // Recargar la lista de pacientes
  await cargarPacientes()
  
  // Opcional: Mostrar notificación de éxito
  // toast.success('Paciente creado exitosamente')
}

const manejarPacienteActualizado = async (pacienteActualizado) => {
  console.log('Paciente actualizado:', pacienteActualizado)
  
  // Recargar la lista de pacientes
  await cargarPacientes()
  
  // Opcional: Mostrar notificación de éxito
  // toast.success('Paciente actualizado exitosamente')
}

const manejarPacienteEliminado = async (pacienteId) => {
  console.log('Paciente eliminado:', pacienteId)
  
  // Eliminar de la lista local
  pacientes.value = pacientes.value.filter(p => p.id !== pacienteId)
  
  // Opcional: Mostrar notificación de éxito
  // toast.success('Paciente eliminado exitosamente')
}

const manejarPacienteDesactivado = async (pacienteId) => {
  console.log('Paciente desactivado:', pacienteId)
  
  // Recargar la lista de pacientes
  await cargarPacientes()
  
  // Opcional: Mostrar notificación de éxito
  // toast.success('Paciente desactivado exitosamente')
}

// Gestión del modal de asignar cita
const abrirModalAsignarCita = (paciente) => {
  console.log('Abriendo modal de asignación de cita para:', paciente)
  pacienteSeleccionadoCita.value = paciente
  mostrarModalAsignarCita.value = true
}

const cerrarModalAsignarCita = () => {
  mostrarModalAsignarCita.value = false
  pacienteSeleccionadoCita.value = null
}

const manejarCitaCreada = async (nuevaCita) => {
  console.log('Nueva cita creada:', nuevaCita)
  
  // Recargar la lista de pacientes para actualizar próxima sesión y bonos
  await cargarPacientes()
  
  // Cerrar el modal
  cerrarModalAsignarCita()
  
  // Opcional: Mostrar notificación de éxito
  // toast.success('Cita asignada exitosamente')
}

// Función para ver las citas de un paciente
const verCitasPaciente = (paciente) => {
  router.push(`/terapeuta/agenda?paciente=${paciente.id}`)
}

// Función para gestionar bonos de un paciente
const gestionarBonosPaciente = (paciente) => {
  router.push(`/terapeuta/pacientes/${paciente.id}/bonos`)
}

// Lifecycle
onMounted(async () => {
  console.log('🚀 [Pacientes] Componente montado')
  
  try {
    // Esperar a que el usuario y el perfil estén completamente cargados
    console.log('⏳ [Pacientes] Esperando a que el usuario esté disponible...')
    await waitForUser()
    
    const userId = getUserId()
    console.log('👤 [Pacientes] Usuario después de waitForUser:', {
      existe: !!user.value,
      id: userId,
      email: user.value?.email
    })
    
    if (userId) {
      console.log('✅ [Pacientes] Usuario disponible, cargando pacientes...')
      await cargarPacientes()
    } else {
      console.error('❌ [Pacientes] No se pudo obtener el usuario autenticado')
      loading.value = false
    }
  } catch (error) {
    console.error('❌ [Pacientes] Error en onMounted:', error)
    loading.value = false
  }
})

// Watch para recargar si el usuario cambia
watch(() => getUserId(), (newUserId, oldUserId) => {
  console.log('🔄 [Pacientes] ID de usuario cambió:', {
    antes: oldUserId,
    ahora: newUserId
  })
  if (newUserId && pacientes.value.length === 0) {
    console.log('📥 [Pacientes] Recargando pacientes por cambio de usuario...')
    cargarPacientes()
  }
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
