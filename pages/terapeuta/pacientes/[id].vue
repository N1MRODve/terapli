<template>
  <div>
    <!-- Banner de Modo Demo -->
    <div v-if="MODO_DEMO && !loading" class="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
      <div class="flex items-start gap-3">
        <span class="text-3xl">🎭</span>
        <div class="flex-1">
          <h3 class="font-serif text-lg font-semibold text-purple-900 mb-1">
            Modo Demostración Activo
          </h3>
          <p class="text-sm text-purple-700 leading-relaxed">
            Estás viendo datos de prueba simulados. Las notas que edites se guardarán solo en memoria.
            Para usar datos reales, cambia <code class="px-2 py-0.5 bg-purple-100 rounded">MODO_DEMO = false</code>.
          </p>
        </div>
      </div>
    </div>

    <!-- Navegación de regreso -->
    <button
      @click="$router.push('/terapeuta/pacientes')"
      class="mb-6 flex items-center gap-2 text-cafe hover:text-terracota transition-colors"
    >
      <span>←</span>
      <span>Volver a lista de pacientes</span>
    </button>

    <!-- Estado de carga -->
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin w-12 h-12 border-4 border-terracota border-t-transparent rounded-full mx-auto mb-4"></div>
      <p class="text-cafe/60">Cargando información del paciente...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-12">
      <DashboardCard>
        <span class="text-6xl mb-4 block">❌</span>
        <h3 class="text-xl font-serif font-semibold text-cafe mb-2">
          No se pudo cargar la información
        </h3>
        <p class="text-cafe/60 mb-4">
          {{ error }}
        </p>
        <button
          @click="$router.push('/terapeuta/pacientes')"
          class="px-6 py-3 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors"
        >
          Volver a la lista
        </button>
      </DashboardCard>
    </div>

    <!-- Contenido principal -->
    <div v-else-if="paciente">
      <!-- Encabezado del paciente -->
      <DashboardCard class="mb-6">
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <!-- Info principal -->
          <div class="flex items-start gap-4">
            <!-- Avatar -->
            <div 
              class="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
              :style="{ backgroundColor: avatarColor }"
            >
              {{ iniciales }}
            </div>

            <!-- Datos -->
            <div>
              <h1 class="text-3xl font-serif font-bold text-cafe mb-2">
                {{ nombreCompleto }}
              </h1>
              <div class="flex flex-wrap items-center gap-3 mb-3">
                <span 
                  class="px-3 py-1 text-sm font-medium rounded-full"
                  :class="estadoVinculoClasses"
                >
                  {{ estadoVinculoTexto }}
                </span>
                <span class="text-cafe/60 text-sm">
                  📧 {{ paciente.email }}
                </span>
                <span v-if="paciente.edad" class="text-cafe/60 text-sm">
                  🎂 {{ paciente.edad }} años
                </span>
              </div>
              <div v-if="paciente.area_de_acompanamiento" class="text-sm text-cafe/70">
                <strong>Área de acompañamiento:</strong> {{ paciente.area_de_acompanamiento }}
              </div>
              <div v-if="paciente.frecuencia" class="text-sm text-cafe/70 mt-1">
                <strong>Frecuencia:</strong> {{ paciente.frecuencia }}
              </div>
            </div>
          </div>

          <!-- Acciones rápidas -->
          <div class="flex flex-wrap gap-2">
            <button
              @click="agendarSesion"
              class="px-4 py-2 bg-terracota text-white rounded-lg hover:bg-terracota/90 transition-colors text-sm flex items-center gap-2"
            >
              <span>📅</span>
              <span>Agendar sesión</span>
            </button>
            <button
              @click="editarPaciente"
              class="px-4 py-2 bg-white border border-terracota/30 text-terracota rounded-lg hover:bg-terracota/5 transition-colors text-sm flex items-center gap-2"
            >
              <span>✏️</span>
              <span>Editar</span>
            </button>
          </div>
        </div>
      </DashboardCard>

      <!-- Grid de información -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Resumen terapéutico -->
        <DashboardCard>
          <h2 class="font-serif text-xl font-semibold text-cafe flex items-center gap-2 mb-4">
            <span class="text-2xl">📋</span>
            Resumen Terapéutico
          </h2>

          <div class="space-y-4">
            <div class="flex items-start gap-3 p-3 bg-base-bg rounded-lg">
              <span class="text-2xl">📅</span>
              <div class="flex-1">
                <div class="text-sm font-medium text-cafe mb-1">Primera sesión</div>
                <div class="text-sm text-cafe/70">
                  {{ formatearFecha(paciente.primera_sesion) }}
                </div>
              </div>
            </div>

            <div class="flex items-start gap-3 p-3 bg-base-bg rounded-lg">
              <span class="text-2xl">🕐</span>
              <div class="flex-1">
                <div class="text-sm font-medium text-cafe mb-1">Última sesión</div>
                <div class="text-sm text-cafe/70">
                  {{ formatearFecha(paciente.ultima_sesion) }}
                </div>
              </div>
            </div>

            <div class="flex items-start gap-3 p-3 bg-base-bg rounded-lg">
              <span class="text-2xl">💬</span>
              <div class="flex-1">
                <div class="text-sm font-medium text-cafe mb-1">Sesiones completadas</div>
                <div class="text-sm text-cafe/70">
                  {{ paciente.total_sesiones }} sesiones
                </div>
              </div>
            </div>

            <div class="flex items-start gap-3 p-3 bg-base-bg rounded-lg">
              <span class="text-2xl">📦</span>
              <div class="flex-1">
                <div class="text-sm font-medium text-cafe mb-1">Bono actual</div>
                <div class="text-sm text-cafe/70">
                  {{ paciente.sesiones_bono_restantes || 0 }} sesiones restantes
                </div>
              </div>
            </div>

            <div v-if="paciente.proxima_sesion" class="flex items-start gap-3 p-3 bg-terracota/10 border border-terracota/30 rounded-lg">
              <span class="text-2xl">🔔</span>
              <div class="flex-1">
                <div class="text-sm font-medium text-cafe mb-1">Próxima sesión programada</div>
                <div class="text-sm text-cafe/70">
                  {{ formatearFechaCompleta(paciente.proxima_sesion) }}
                </div>
              </div>
            </div>
          </div>
        </DashboardCard>

        <!-- Historial de sesiones recientes -->
        <DashboardCard>
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-serif text-xl font-semibold text-cafe flex items-center gap-2">
              <span class="text-2xl">📝</span>
              Últimas Sesiones
            </h2>
            <button
              @click="$router.push(`/terapeuta/sesiones?paciente=${paciente.id}`)"
              class="text-sm text-terracota hover:text-cafe transition-colors"
            >
              Ver todas →
            </button>
          </div>

          <div v-if="sesionesRecientes.length > 0" class="space-y-3">
            <div
              v-for="sesion in sesionesRecientes"
              :key="sesion.id"
              class="p-3 bg-base-bg rounded-lg hover:bg-rosa/20 transition-colors cursor-pointer"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm font-medium text-cafe">
                      {{ formatearFechaCorta(sesion.fecha) }}
                    </span>
                    <span
                      class="px-2 py-0.5 text-xs rounded-full"
                      :class="sesion.modalidad === 'online' 
                        ? 'bg-terracota/20 text-terracota' 
                        : 'bg-green-100 text-green-700'"
                    >
                      {{ sesion.modalidad }}
                    </span>
                  </div>
                  <p v-if="sesion.nota_terapeuta" class="text-xs text-cafe/60 line-clamp-2">
                    {{ sesion.nota_terapeuta }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-6">
            <span class="text-4xl mb-2 block opacity-40">📝</span>
            <p class="text-sm text-cafe/50 italic">
              Aún no hay sesiones registradas
            </p>
          </div>
        </DashboardCard>
      </div>

      <!-- Evolución emocional -->
      <div class="mb-6">
        <PacienteEvolucion :paciente-id="paciente.id" />
      </div>

      <!-- Alerta si requiere atención -->
      <div v-if="paciente.requiere_atencion" class="mb-6">
        <div class="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6">
          <div class="flex items-start gap-4">
            <span class="text-4xl">⚠️</span>
            <div class="flex-1">
              <h3 class="font-serif text-lg font-semibold text-cafe mb-2">
                Alerta de seguimiento
              </h3>
              <p class="text-cafe/70 leading-relaxed">
                El sistema ha detectado cambios en el estado emocional del paciente. 
                Los últimos registros muestran valores que podrían requerir atención especial. 
                Revisa su evolución y considera ajustar el plan terapéutico si es necesario.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Notas privadas del terapeuta -->
      <NotasPrivadas
        :paciente-id="paciente.id"
        :contenido="notasClinicas"
        :ultima-actualizacion="notasActualizacion"
        @guardar="guardarNotasClinicas"
      />
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'terapeuta'
})

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// ============================================================================
// 🎭 MODO DEMO - Cambiar a false para usar datos reales de Supabase
// ============================================================================
const MODO_DEMO = ref(true) // ← Cambiar a false cuando tengas datos reales

// Estado
const paciente = ref(null)
const loading = ref(true)
const error = ref(null)
const sesionesRecientes = ref([])
const notasClinicas = ref('')
const notasActualizacion = ref(null)

// ID del paciente desde la ruta
const pacienteId = computed(() => route.params.id)

// Cargar información del paciente
const cargarPaciente = async () => {
  loading.value = true
  error.value = null

  try {
    // ========================================================================
    // 🎭 MODO DEMO: Datos mock para demostración
    // ========================================================================
    if (MODO_DEMO.value) {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const pacientesDemo = {
        'demo-1': {
          id: 'demo-1',
          nombre: 'María',
          apellidos: 'González Pérez',
          nombreCompleto: 'María González Pérez',
          email: 'maria.gonzalez@demo.com',
          activo: true,
          en_pausa: false,
          edad: 32,
          area_de_acompanamiento: 'Ansiedad y autoestima',
          frecuencia: 'semanal',
          primera_sesion: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          ultima_sesion: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          proxima_sesion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          total_sesiones: 12,
          sesiones_bono_restantes: 8,
          requiere_atencion: false,
          created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        },
        'demo-2': {
          id: 'demo-2',
          nombre: 'Carlos',
          apellidos: 'Mendoza Silva',
          nombreCompleto: 'Carlos Mendoza Silva',
          email: 'carlos.mendoza@demo.com',
          activo: true,
          en_pausa: false,
          edad: 28,
          area_de_acompanamiento: 'Gestión emocional',
          frecuencia: 'quincenal',
          primera_sesion: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          ultima_sesion: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          proxima_sesion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          total_sesiones: 8,
          sesiones_bono_restantes: 3,
          requiere_atencion: true,
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        'demo-3': {
          id: 'demo-3',
          nombre: 'Ana',
          apellidos: 'Rodríguez López',
          nombreCompleto: 'Ana Rodríguez López',
          email: 'ana.rodriguez@demo.com',
          activo: true,
          en_pausa: false,
          edad: 35,
          area_de_acompanamiento: 'Desarrollo personal',
          frecuencia: 'semanal',
          primera_sesion: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          ultima_sesion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          proxima_sesion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          total_sesiones: 4,
          sesiones_bono_restantes: 7,
          requiere_atencion: false,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        'demo-4': {
          id: 'demo-4',
          nombre: 'Laura',
          apellidos: 'Martínez García',
          nombreCompleto: 'Laura Martínez García',
          email: 'laura.martinez@demo.com',
          activo: true,
          en_pausa: true,
          edad: 40,
          area_de_acompanamiento: 'Estrés laboral',
          frecuencia: 'mensual',
          primera_sesion: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          ultima_sesion: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          proxima_sesion: null,
          total_sesiones: 15,
          sesiones_bono_restantes: 2,
          requiere_atencion: false,
          created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
        },
        'demo-5': {
          id: 'demo-5',
          nombre: 'Pedro',
          apellidos: 'Sánchez Ruiz',
          nombreCompleto: 'Pedro Sánchez Ruiz',
          email: 'pedro.sanchez@demo.com',
          activo: false,
          en_pausa: false,
          edad: 45,
          area_de_acompanamiento: 'Duelo',
          frecuencia: 'semanal',
          primera_sesion: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
          ultima_sesion: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          proxima_sesion: null,
          total_sesiones: 20,
          sesiones_bono_restantes: 0,
          requiere_atencion: false,
          created_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
        },
        'demo-6': {
          id: 'demo-6',
          nombre: 'Sofía',
          apellidos: 'Torres Moreno',
          nombreCompleto: 'Sofía Torres Moreno',
          email: 'sofia.torres@demo.com',
          activo: true,
          en_pausa: false,
          edad: 29,
          area_de_acompanamiento: 'Relaciones interpersonales',
          frecuencia: 'semanal',
          primera_sesion: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          ultima_sesion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          proxima_sesion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          total_sesiones: 6,
          sesiones_bono_restantes: 5,
          requiere_atencion: false,
          created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
        }
      }
      
      const pacienteDemo = pacientesDemo[pacienteId.value]
      
      if (!pacienteDemo) {
        error.value = 'Paciente no encontrado en datos de demostración'
        loading.value = false
        return
      }
      
      // Sesiones recientes demo
      sesionesRecientes.value = [
        {
          id: 'sesion-1',
          fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          modalidad: 'online',
          nota_terapeuta: 'Sesión muy productiva. Trabajamos técnicas de respiración y mindfulness.'
        },
        {
          id: 'sesion-2',
          fecha: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          modalidad: 'presencial',
          nota_terapeuta: 'Exploramos patrones de pensamiento negativos. Tarea: diario emocional.'
        },
        {
          id: 'sesion-3',
          fecha: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
          modalidad: 'online',
          nota_terapeuta: 'Revisión de progreso. Paciente muestra mejora en autoestima.'
        },
        {
          id: 'sesion-4',
          fecha: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
          modalidad: 'online',
          nota_terapeuta: 'Primera sesión del nuevo ciclo. Establecimos objetivos claros.'
        }
      ]
      
      // Notas demo
      if (pacienteId.value === 'demo-1') {
        notasClinicas.value = `Progreso continuo en el manejo de la ansiedad.

• Ha logrado identificar sus disparadores emocionales
• Practica técnicas de respiración regularmente
• Mejora notable en autoestima
• Continuar trabajando en asertividad

Próximos objetivos:
- Enfrentar situaciones sociales con mayor confianza
- Reducir autocrítica
- Fortalecer red de apoyo`
      } else if (pacienteId.value === 'demo-2') {
        notasClinicas.value = `Últimas sesiones muestran incremento en estrés.

Observaciones:
• Dificultad para establecer límites
• Patrones de pensamiento rumiativos
• Alteraciones en el sueño
• Requiere seguimiento cercano

Estrategias aplicadas:
- Técnicas de mindfulness
- Reestructuración cognitiva
- Plan de autocuidado

IMPORTANTE: Considerar evaluar necesidad de apoyo adicional si no hay mejora en 2 semanas.`
      } else if (pacienteId.value === 'demo-3') {
        notasClinicas.value = `Excelente evolución en proceso de desarrollo personal.

Logros alcanzados:
✓ Mayor claridad en objetivos vitales
✓ Mejora en comunicación asertiva
✓ Establecimiento de rutinas saludables
✓ Conexión emocional más profunda

Se muestra motivada y comprometida con el proceso.`
      }
      
      notasActualizacion.value = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      
      paciente.value = pacienteDemo
      loading.value = false
      return
    }
    
    // ========================================================================
    // 📊 MODO PRODUCCIÓN: Datos reales de Supabase
    // ========================================================================
    
    // Obtener datos básicos del paciente
    const { data: pacienteData, error: pacienteError } = await supabase
      .from('pacientes')
      .select(`
        id,
        created_at,
        activo,
        area_de_acompanamiento,
        frecuencia,
        metadata,
        profiles!inner(
          nombre_completo,
          email
        )
      `)
      .eq('id', pacienteId.value)
      .eq('psicologa_id', user.value?.id)
      .single()

    if (pacienteError) throw pacienteError
    if (!pacienteData) {
      error.value = 'Paciente no encontrado o no tienes acceso'
      return
    }

    // Obtener primera y última sesión
    const { data: sesiones } = await supabase
      .from('sesiones')
      .select('fecha')
      .eq('paciente_id', pacienteId.value)
      .eq('estado', 'realizada')
      .order('fecha', { ascending: true })

    const primeraSesion = sesiones?.[0]?.fecha || null
    const ultimaSesion = sesiones?.[sesiones.length - 1]?.fecha || null

    // Obtener próxima sesión
    const { data: proximaSesion } = await supabase
      .from('sesiones')
      .select('fecha')
      .eq('paciente_id', pacienteId.value)
      .in('estado', ['pendiente', 'confirmada'])
      .gte('fecha', new Date().toISOString())
      .order('fecha', { ascending: true })
      .limit(1)
      .single()

    // Contar total de sesiones
    const { count: totalSesiones } = await supabase
      .from('sesiones')
      .select('*', { count: 'exact', head: true })
      .eq('paciente_id', pacienteId.value)
      .eq('estado', 'realizada')

    // Obtener sesiones recientes
    const { data: sesionesRecentesData } = await supabase
      .from('sesiones')
      .select('*')
      .eq('paciente_id', pacienteId.value)
      .eq('estado', 'realizada')
      .order('fecha', { ascending: false })
      .limit(5)

    sesionesRecientes.value = sesionesRecentesData || []

    // Obtener bono activo
    const { data: bonoActivo } = await supabase
      .from('bonos')
      .select('sesiones_restantes')
      .eq('paciente_id', pacienteId.value)
      .eq('estado', 'activo')
      .single()

    // Obtener promedio emocional
    const hace7Dias = new Date()
    hace7Dias.setDate(hace7Dias.getDate() - 7)
    
    const { data: emocionesRecientes } = await supabase
      .from('emociones_avanzadas')
      .select('nivel_animo')
      .eq('paciente_id', pacienteId.value)
      .gte('fecha', hace7Dias.toISOString())

    let requiereAtencion = false
    if (emocionesRecientes && emocionesRecientes.length >= 3) {
      const ultimosTres = emocionesRecientes.slice(-3)
      requiereAtencion = ultimosTres.every(e => e.nivel_animo <= 2)
    }

    // Obtener notas clínicas
    const { data: notasData } = await supabase
      .from('notas_terapeuticas')
      .select('contenido, updated_at')
      .eq('paciente_id', pacienteId.value)
      .eq('psicologa_id', user.value?.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (notasData) {
      notasClinicas.value = notasData.contenido
      notasActualizacion.value = notasData.updated_at
    }

    // Parsear nombre completo
    const nombreCompleto = pacienteData.profiles.nombre_completo || ''
    const partesNombre = nombreCompleto.split(' ')
    const nombre = partesNombre[0] || ''
    const apellidos = partesNombre.slice(1).join(' ') || ''

    // Construir objeto paciente
    paciente.value = {
      id: pacienteData.id,
      nombre: nombre,
      apellidos: apellidos,
      nombreCompleto: nombreCompleto,
      email: pacienteData.profiles.email,
      activo: pacienteData.activo,
      en_pausa: pacienteData.metadata?.en_pausa || false,
      edad: pacienteData.metadata?.edad || null,
      area_de_acompanamiento: pacienteData.area_de_acompanamiento,
      frecuencia: pacienteData.frecuencia,
      primera_sesion: primeraSesion,
      ultima_sesion: ultimaSesion,
      proxima_sesion: proximaSesion?.fecha || null,
      total_sesiones: totalSesiones || 0,
      sesiones_bono_restantes: bonoActivo?.sesiones_restantes || 0,
      requiere_atencion: requiereAtencion,
      created_at: pacienteData.created_at
    }
  } catch (err) {
    console.error('Error al cargar paciente:', err)
    error.value = err.message || 'Error desconocido'
  } finally {
    loading.value = false
  }
}

// Guardar notas clínicas
const guardarNotasClinicas = async ({ pacienteId, contenido }) => {
  try {
    // Verificar si ya existe una nota
    const { data: notaExistente } = await supabase
      .from('notas_terapeuticas')
      .select('id')
      .eq('paciente_id', pacienteId)
      .eq('psicologa_id', user.value?.id)
      .single()

    if (notaExistente) {
      // Actualizar
      const { error: updateError } = await supabase
        .from('notas_terapeuticas')
        .update({ 
          contenido: contenido,
          updated_at: new Date().toISOString()
        })
        .eq('id', notaExistente.id)

      if (updateError) throw updateError
    } else {
      // Crear nueva
      const { error: insertError } = await supabase
        .from('notas_terapeuticas')
        .insert({
          paciente_id: pacienteId,
          psicologa_id: user.value?.id,
          contenido: contenido
        })

      if (insertError) throw insertError
    }

    notasClinicas.value = contenido
    notasActualizacion.value = new Date().toISOString()
  } catch (err) {
    console.error('Error al guardar notas:', err)
    throw err
  }
}

// Computados
const iniciales = computed(() => {
  if (!paciente.value) return ''
  const nombreInicial = paciente.value.nombre.charAt(0).toUpperCase()
  const apellidoInicial = paciente.value.apellidos ? paciente.value.apellidos.charAt(0).toUpperCase() : ''
  return `${nombreInicial}${apellidoInicial}`
})

const avatarColor = computed(() => {
  if (!paciente.value) return '#D8AFA0'
  const colors = ['#D8AFA0', '#C89B8A', '#B7C6B0', '#A8C5B5', '#D4A5A5', '#C4B5A0']
  const index = paciente.value.id.charCodeAt(0) % colors.length
  return colors[index]
})

const estadoVinculoTexto = computed(() => {
  if (!paciente.value) return ''
  if (!paciente.value.activo) return 'Finalizado'
  if (paciente.value.en_pausa) return 'En pausa'
  return 'En proceso'
})

const estadoVinculoClasses = computed(() => {
  if (!paciente.value) return ''
  if (!paciente.value.activo) {
    return 'bg-gray-100 text-gray-600'
  }
  if (paciente.value.en_pausa) {
    return 'bg-yellow-100 text-yellow-700'
  }
  return 'bg-green-100 text-green-700'
})

// Funciones auxiliares
const formatearFecha = (fecha) => {
  if (!fecha) return 'No registrada'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

const formatearFechaCompleta = (fecha) => {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleString('es-ES', { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatearFechaCorta = (fecha) => {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Acciones
const agendarSesion = () => {
  // TODO: Implementar
  alert('Función de agendar sesión en desarrollo')
}

const editarPaciente = () => {
  // TODO: Implementar
  alert('Función de editar paciente en desarrollo')
}

// Lifecycle
onMounted(() => {
  cargarPaciente()
})

// Recargar si cambia el ID
watch(() => route.params.id, () => {
  if (route.params.id) {
    cargarPaciente()
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

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
