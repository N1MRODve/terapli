<template>
  <div class="section-padding">
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
      <PacienteCard
        v-for="paciente in pacientesFiltrados"
        :key="paciente.id"
        :paciente="paciente"
        @click="irAFichaPaciente(paciente.id)"
      />
    </div>

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
  </div>
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
      .eq('psicologa_id', userId)
      .order('created_at', { ascending: false })
    
    if (pacientesError) throw pacientesError

    // Enriquecer datos con información de sesiones y emociones
    const pacientesEnriquecidos = await Promise.all(
      pacientesData.map(async (paciente) => {
        // Obtener última sesión
        const { data: ultimaSesion } = await supabase
          .from('sesiones')
          .select('fecha')
          .eq('paciente_id', paciente.id)
          .eq('estado', 'realizada')
          .order('fecha', { ascending: false })
          .limit(1)
          .single()

        // Obtener próxima sesión
        const { data: proximaSesion } = await supabase
          .from('sesiones')
          .select('fecha')
          .eq('paciente_id', paciente.id)
          .in('estado', ['pendiente', 'confirmada'])
          .gte('fecha', new Date().toISOString())
          .order('fecha', { ascending: true })
          .limit(1)
          .single()

        // Contar total de sesiones
        const { count: totalSesiones } = await supabase
          .from('sesiones')
          .select('*', { count: 'exact', head: true })
          .eq('paciente_id', paciente.id)
          .eq('estado', 'realizada')

        // Obtener bono activo
        const { data: bonoActivo } = await supabase
          .from('bonos')
          .select('id, total_sesiones, sesiones_restantes, created_at')
          .eq('paciente_id', paciente.id)
          .eq('estado', 'activo')
          .single()

        // Contar sesiones completadas desde la última renovación de bono
        let sesionesCompletadasBono = 0
        let totalSesionesBono = 0
        if (bonoActivo) {
          totalSesionesBono = bonoActivo.total_sesiones
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

        // Obtener datos del nombre
        const nombre = paciente.nombre_completo || 
                      paciente.metadata?.nombre_completo ||
                      `${paciente.metadata?.nombre || ''} ${paciente.metadata?.apellido_paterno || ''}`.trim() ||
                      paciente.email

        return {
          id: paciente.id,
          nombre: nombre,
          apellidos: '', // No tenemos apellidos separados en la BD
          email: paciente.email,
          telefono: paciente.telefono,
          activo: paciente.activo,
          en_pausa: paciente.metadata?.en_pausa || false,
          area_de_acompanamiento: paciente.area_de_acompanamiento,
          frecuencia: paciente.frecuencia,
          ultima_sesion: ultimaSesion?.fecha || null,
          proxima_sesion: proximaSesion?.fecha || null,
          total_sesiones: totalSesiones || 0,
          estado_emocional_promedio: estadoEmocionalPromedio,
          evolucion_porcentaje: evolucionPorcentaje,
          requiere_atencion: requiereAtencion,
          created_at: paciente.created_at,
          bono_activo: bonoActivo ? {
            sesiones_completadas: sesionesCompletadasBono,
            total_sesiones: totalSesionesBono,
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
      const nombreCompleto = `${p.nombre} ${p.apellidos}`.toLowerCase()
      return nombreCompleto.includes(busquedaLower)
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

const manejarPacienteCreado = async (nuevoPaciente) => {
  console.log('Nuevo paciente creado:', nuevoPaciente)
  
  // Recargar la lista de pacientes
  await cargarPacientes()
  
  // Opcional: Mostrar notificación de éxito
  // toast.success('Paciente creado exitosamente')
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
