<template>
  <div class="bg-white rounded-2xl shadow-sm border border-[#E2E8F0]/40 p-6 space-y-6">
    <!-- Título -->
    <div>
      <h2 class="text-xl font-serif text-[#2D3748] mb-1">Tu registro emocional 🌿</h2>
      <p class="text-sm font-sans text-[#2D3748]/70">
        Registra cómo te sientes hoy y observa tu evolución emocional con el tiempo.
      </p>
    </div>

    <!-- Paso 1: Estado general -->
    <div>
      <p class="text-sm font-sans text-[#2D3748]/70 mb-3">¿Cómo te sientes en general?</p>
      <div class="flex justify-between gap-2">
        <button
          v-for="nivel in niveles"
          :key="nivel.valor"
          @click="estado = nivel.valor"
          :class="[
            'flex flex-col items-center p-3 rounded-xl transition-all duration-300 flex-1',
            estado === nivel.valor 
              ? 'bg-[#5550F2]/20 scale-105 shadow-sm' 
              : 'opacity-70 hover:opacity-100 hover:bg-[#F2F2F2]'
          ]"
          :title="nivel.texto"
        >
          <span class="text-3xl mb-1">{{ nivel.icono }}</span>
          <span class="text-xs font-sans text-[#2D3748] text-center">{{ nivel.texto }}</span>
        </button>
      </div>
    </div>

    <!-- Paso 2: Emociones específicas -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <p class="text-sm font-sans text-[#2D3748]/70">
          Selecciona hasta 3 emociones que te representen hoy
        </p>
        <span 
          v-if="emociones.length > 0"
          class="text-xs font-sans text-[#5550F2] font-medium"
        >
          {{ emociones.length }}/3
        </span>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="emocion in listaEmociones"
          :key="emocion"
          @click="toggleEmocion(emocion)"
          :class="[
            'px-3 py-1.5 rounded-full border text-sm font-[\'Lato\'] transition-all duration-200',
            emociones.includes(emocion)
              ? 'bg-[#5550F2] text-white border-[#5550F2] shadow-sm scale-105'
              : 'border-[#E2E8F0]/70 text-[#2D3748]/70 hover:border-[#5550F2]/40 hover:bg-[#F2F2F2]'
          ]"
        >
          {{ emocion }}
        </button>
      </div>
    </div>

    <!-- Paso 3: Factores influyentes -->
    <div>
      <p class="text-sm font-sans text-[#2D3748]/70 mb-3">
        ¿Qué crees que influyó en tu estado de ánimo?
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="factor in influenciasDisponibles"
          :key="factor"
          @click="toggleInfluencia(factor)"
          :class="[
            'px-3 py-1.5 rounded-full border text-sm font-[\'Lato\'] transition-all duration-200',
            influencias.includes(factor)
              ? 'bg-[#E2E8F0] border-[#5550F2] text-[#2D3748] shadow-sm'
              : 'border-[#E2E8F0]/70 text-[#2D3748]/70 hover:border-[#5550F2]/40 hover:bg-[#F2F2F2]'
          ]"
        >
          {{ factor }}
        </button>
      </div>
    </div>

    <!-- Paso 4: Reflexión -->
    <div>
      <p class="text-sm font-sans text-[#2D3748]/70 mb-2">
        ¿Quieres dejar una reflexión? (opcional)
      </p>
      <textarea
        v-model="reflexion"
        rows="3"
        class="w-full border border-[#E2E8F0]/60 rounded-xl p-3 text-sm text-[#2D3748] font-sans focus:ring-2 focus:ring-[#5550F2]/30 focus:border-[#5550F2] transition-all resize-none"
        placeholder="Por ejemplo: hoy me sentí más tranquila después de practicar respiración..."
        maxlength="500"
      ></textarea>
      <div class="flex justify-end mt-1">
        <span class="text-xs text-[#2D3748]/50 font-sans">
          {{ reflexion.length }}/500
        </span>
      </div>
    </div>

    <!-- Mensajes de feedback -->
    <div
      v-if="mensajeExito"
      class="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start space-x-2"
    >
      <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-sm font-sans text-green-800">{{ mensajeExito }}</p>
    </div>

    <div
      v-if="mensajeError"
      class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2"
    >
      <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-sm font-sans text-red-800">{{ mensajeError }}</p>
    </div>

    <!-- Guardar -->
    <div class="flex justify-end">
      <button
        @click="guardarRegistro"
        :disabled="guardando || !estado"
        class="px-6 py-2.5 bg-[#5550F2] hover:bg-[#C89B8A] text-white rounded-xl font-sans font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="guardando" class="flex items-center space-x-2">
          <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Guardando...</span>
        </span>
        <span v-else>Guardar registro</span>
      </button>
    </div>

    <!-- Vista rápida de últimos días -->
    <div v-if="registros.length > 0" class="border-t border-[#E2E8F0]/40 pt-6 mt-6">
      <h3 class="text-base font-serif text-[#2D3748] mb-4">Evolución reciente 💫</h3>
      <div class="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
        <div
          v-for="registro in registrosRecientes"
          :key="registro.id"
          class="flex flex-col items-center min-w-[60px] cursor-pointer group"
          @click="verDetalleRegistro(registro)"
        >
          <div
            class="w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 group-hover:scale-110 group-hover:shadow-md"
            :class="{
              'bg-green-100': registro.estado_general === 'muy bien' || registro.estado_general === 'bien',
              'bg-yellow-100': registro.estado_general === 'neutral',
              'bg-red-100': registro.estado_general === 'mal' || registro.estado_general === 'muy mal'
            }"
          >
            <span class="text-xl">
              {{ iconoPorEstado(registro.estado_general) }}
            </span>
          </div>
          <span class="text-[10px] mt-1.5 text-[#2D3748]/70 font-sans text-center">
            {{ formatearFecha(registro.fecha) }}
          </span>
        </div>
      </div>
      
      <!-- Mensaje de ánimo según la evolución -->
      <div v-if="mensajeEvolucion" class="mt-4 p-3 bg-[#F2F2F2] rounded-lg">
        <p class="text-sm font-sans text-[#2D3748] italic">
          {{ mensajeEvolucion }}
        </p>
      </div>
    </div>

    <!-- Modal de detalle del registro (opcional) -->
    <div
      v-if="registroSeleccionado"
      @click="registroSeleccionado = null"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div
        @click.stop
        class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4"
      >
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-serif text-[#2D3748] mb-1">
              Registro del {{ formatearFechaCompleta(registroSeleccionado.fecha) }}
            </h3>
            <div class="flex items-center space-x-2">
              <span class="text-2xl">{{ iconoPorEstado(registroSeleccionado.estado_general) }}</span>
              <span class="text-sm font-sans text-[#2D3748]/70 capitalize">
                {{ registroSeleccionado.estado_general }}
              </span>
            </div>
          </div>
          <button
            @click="registroSeleccionado = null"
            class="text-[#2D3748]/50 hover:text-[#2D3748] transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="registroSeleccionado.emociones?.length > 0">
          <p class="text-xs font-sans text-[#2D3748]/70 mb-2">Emociones:</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="emocion in registroSeleccionado.emociones"
              :key="emocion"
              class="px-2 py-1 bg-[#5550F2]/20 text-[#2D3748] rounded-full text-xs font-sans"
            >
              {{ emocion }}
            </span>
          </div>
        </div>

        <div v-if="registroSeleccionado.influencias?.length > 0">
          <p class="text-xs font-sans text-[#2D3748]/70 mb-2">Factores influyentes:</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="influencia in registroSeleccionado.influencias"
              :key="influencia"
              class="px-2 py-1 bg-[#E2E8F0]/50 text-[#2D3748] rounded-full text-xs font-sans"
            >
              {{ influencia }}
            </span>
          </div>
        </div>

        <div v-if="registroSeleccionado.reflexion">
          <p class="text-xs font-sans text-[#2D3748]/70 mb-2">Reflexión:</p>
          <p class="text-sm font-sans text-[#2D3748] italic leading-relaxed">
            "{{ registroSeleccionado.reflexion }}"
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { getUserId } = useSupabase()

// Configuración de niveles emocionales
const niveles = [
  { valor: 'muy bien', icono: '😁', texto: 'Muy bien' },
  { valor: 'bien', icono: '🙂', texto: 'Bien' },
  { valor: 'neutral', icono: '😐', texto: 'Neutral' },
  { valor: 'mal', icono: '😔', texto: 'Mal' },
  { valor: 'muy mal', icono: '😢', texto: 'Muy mal' }
]

const listaEmociones = [
  'Agradecido', 
  'Tranquilo', 
  'Motivado', 
  'Ansioso', 
  'Triste', 
  'Cansado', 
  'Esperanzado', 
  'En paz', 
  'Irritado', 
  'Reflexivo',
  'Conectado',
  'Abrumado'
]

const influenciasDisponibles = [
  'Familia', 
  'Trabajo', 
  'Sueño', 
  'Relaciones', 
  'Salud', 
  'Ejercicio', 
  'Tiempo libre', 
  'Alimentación',
  'Terapia',
  'Clima'
]

// Estados reactivos
const estado = ref('')
const emociones = ref([])
const influencias = ref([])
const reflexion = ref('')
const registros = ref([])
const guardando = ref(false)
const mensajeExito = ref('')
const mensajeError = ref('')
const registroSeleccionado = ref(null)

// Computed
const registrosRecientes = computed(() => {
  return registros.value.slice(-7).reverse()
})

const mensajeEvolucion = computed(() => {
  if (registros.value.length < 3) return null
  
  const ultimos3 = registros.value.slice(-3)
  const estadosPositivos = ultimos3.filter(r => 
    r.estado_general === 'bien' || r.estado_general === 'muy bien'
  ).length
  
  if (estadosPositivos >= 2) {
    return '¡Qué bien! Veo que has tenido días positivos recientemente. Celebra tu progreso 💚'
  } else if (estadosPositivos === 0) {
    return 'Han sido días difíciles. Recuerda que está bien no estar bien. Sé amable contigo misma 🌸'
  } else {
    return 'Tu estado emocional fluctúa, y eso es completamente normal. Sigue registrando tu evolución 🌿'
  }
})

// Funciones de utilidad
const iconoPorEstado = (estadoValor) => {
  const match = niveles.find(n => n.valor === estadoValor)
  return match ? match.icono : '🙂'
}

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'short' 
  })
}

const formatearFechaCompleta = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES', { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  })
}

// Toggle de emociones (máximo 3)
const toggleEmocion = (emocion) => {
  if (emociones.value.includes(emocion)) {
    emociones.value = emociones.value.filter(e => e !== emocion)
  } else {
    if (emociones.value.length < 3) {
      emociones.value = [...emociones.value, emocion]
    }
  }
}

// Toggle de influencias (sin límite)
const toggleInfluencia = (factor) => {
  if (influencias.value.includes(factor)) {
    influencias.value = influencias.value.filter(f => f !== factor)
  } else {
    influencias.value = [...influencias.value, factor]
  }
}

// Ver detalle de un registro
const verDetalleRegistro = (registro) => {
  registroSeleccionado.value = registro
}

// Guardar registro en Supabase
const guardarRegistro = async () => {
  if (!estado.value) {
    mensajeError.value = 'Por favor, selecciona cómo te sientes hoy.'
    setTimeout(() => { mensajeError.value = '' }, 3000)
    return
  }

  guardando.value = true
  mensajeExito.value = ''
  mensajeError.value = ''

  try {
    if (!process.client) return
    
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    
    const userId = getUserId()
    if (!userId) {
      mensajeError.value = 'Debes iniciar sesión para guardar el registro.'
      setTimeout(() => { mensajeError.value = '' }, 4000)
      return
    }

    const nuevo = {
      paciente_id: userId,
      estado_general: estado.value,
      emociones: emociones.value,
      influencias: influencias.value,
      reflexion: reflexion.value || null,
      fecha: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('emociones_avanzadas')
      .insert([nuevo])
      .select()
      .single()

    if (error) {
      console.error('Error al guardar registro:', error)
      mensajeError.value = 'No se pudo guardar el registro. Intenta de nuevo.'
      setTimeout(() => { mensajeError.value = '' }, 4000)
    } else {
      registros.value.push(data)
      mensajeExito.value = '✨ Registro guardado. Gracias por compartir cómo te sientes.'
      
      // Limpiar formulario
      estado.value = ''
      emociones.value = []
      influencias.value = []
      reflexion.value = ''
      
      setTimeout(() => { mensajeExito.value = '' }, 4000)
    }
  } catch (error) {
    console.error('Error inesperado:', error)
    mensajeError.value = 'Ocurrió un error inesperado. Intenta de nuevo.'
    setTimeout(() => { mensajeError.value = '' }, 4000)
  } finally {
    guardando.value = false
  }
}

// Cargar registros previos
const cargarRegistros = async () => {
  if (!process.client) return

  try {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    
    const userId = getUserId()
    if (!userId) return

    const { data, error } = await supabase
      .from('emociones_avanzadas')
      .select('*')
      .eq('paciente_id', userId)
      .order('fecha', { ascending: true })

    if (error) {
      console.error('Error cargando registros:', error)
    } else {
      registros.value = data || []
    }
  } catch (error) {
    console.error('Error inesperado al cargar registros:', error)
  }
}

// Lifecycle
onMounted(() => {
  cargarRegistros()
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
