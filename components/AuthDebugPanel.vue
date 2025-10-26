<template>
  <!-- Botón flotante para abrir/cerrar -->
  <button
    v-if="!panelAbierto"
    @click="panelAbierto = true"
    class="fixed bottom-4 right-4 bg-gray-900 text-white p-3 rounded-full shadow-xl z-50 hover:bg-gray-800 transition-all"
    title="Abrir panel de debug (Cmd/Ctrl+Shift+D)"
  >
    🔍
  </button>

  <!-- Panel de debug -->
  <div 
    v-if="mostrar && panelAbierto" 
    class="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-md z-50 font-mono text-xs"
  >
    <div class="flex justify-between items-center mb-2">
      <h3 class="font-bold text-sm">🔍 Debug: Autenticación</h3>
      <div class="flex gap-2">
        <button @click="panelAbierto = false" class="text-gray-400 hover:text-white" title="Minimizar">−</button>
        <button @click="cerrar" class="text-gray-400 hover:text-white" title="Cerrar">✕</button>
      </div>
    </div>
    
    <div class="space-y-2">
      <!-- Estado del usuario -->
      <div class="border-t border-gray-700 pt-2">
        <div class="flex items-center gap-2">
          <span :class="user ? 'bg-green-500' : 'bg-red-500'" class="w-2 h-2 rounded-full"></span>
          <span class="font-semibold">Usuario:</span>
          <span :class="user ? 'text-green-400' : 'text-red-400'">
            {{ user ? 'Autenticado' : 'No autenticado' }}
          </span>
        </div>
        <div v-if="user" class="ml-4 mt-1 text-gray-400">
          <div>ID: {{ user.id?.substring(0, 8) }}...</div>
          <div>Email: {{ user.email }}</div>
        </div>
      </div>

      <!-- Estado de la sesión -->
      <div class="border-t border-gray-700 pt-2">
        <div class="flex items-center gap-2">
          <span :class="session ? 'bg-green-500' : 'bg-red-500'" class="w-2 h-2 rounded-full"></span>
          <span class="font-semibold">Sesión:</span>
          <span :class="session ? 'text-green-400' : 'text-red-400'">
            {{ session ? 'Activa' : 'Inactiva' }}
          </span>
        </div>
        <div v-if="session" class="ml-4 mt-1 text-gray-400">
          <div>Expira: {{ new Date(session.expires_at * 1000).toLocaleTimeString() }}</div>
        </div>
      </div>

      <!-- Estado del perfil -->
      <div class="border-t border-gray-700 pt-2">
        <div class="flex items-center gap-2">
          <span :class="userProfile ? 'bg-green-500' : 'bg-red-500'" class="w-2 h-2 rounded-full"></span>
          <span class="font-semibold">Perfil:</span>
          <span :class="userProfile ? 'text-green-400' : 'text-red-400'">
            {{ userProfile ? 'Cargado' : 'Sin cargar' }}
          </span>
        </div>
        <div v-if="userProfile" class="ml-4 mt-1 text-gray-400">
          <div>Rol: {{ userProfile.rol }}</div>
          <div>Staff: {{ userProfile.is_staff ? '✅ Sí' : '❌ No' }}</div>
        </div>
      </div>

      <!-- Tiempo transcurrido -->
      <div class="border-t border-gray-700 pt-2">
        <div class="text-gray-400">
          ⏱️ Tiempo desde login: {{ tiempoTranscurrido }}s
        </div>
      </div>

      <!-- Botón para forzar recarga -->
      <div class="border-t border-gray-700 pt-2">
        <button 
          @click="recargarPerfil" 
          :disabled="recargando"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-3 py-2 rounded text-white font-semibold"
        >
          {{ recargando ? '⏳ Recargando...' : '🔄 Recargar Perfil' }}
        </button>
        
        <!-- Botón de emergencia si el perfil no carga -->
        <button 
          v-if="user && !userProfile"
          @click="diagnosticar" 
          class="w-full mt-2 bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded text-white font-semibold"
        >
          🚨 Diagnosticar Problema
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  mostrar: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['cerrar'])

const { user, session, userProfile, loadUserProfile, supabase } = useSupabase()

const tiempoInicio = ref(Date.now())
const tiempoActual = ref(Date.now())
const recargando = ref(false)
const panelAbierto = ref(true) // Abierto por defecto

const tiempoTranscurrido = computed(() => {
  return Math.floor((tiempoActual.value - tiempoInicio.value) / 1000)
})

let intervalo = null

onMounted(() => {
  console.log('🔍 [Debug Panel] Iniciado')
  // Actualizar tiempo cada segundo
  intervalo = setInterval(() => {
    tiempoActual.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (intervalo) {
    clearInterval(intervalo)
  }
})

const cerrar = () => {
  emit('cerrar')
}

const recargarPerfil = async () => {
  recargando.value = true
  console.log('🔄 [Debug Panel] Forzando recarga de perfil...')
  await loadUserProfile()
  recargando.value = false
}

const diagnosticar = async () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🚨 DIAGNÓSTICO COMPLETO DE AUTENTICACIÓN')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  
  // 1. Estado del usuario
  console.log('1️⃣ ESTADO DEL USUARIO (useSupabaseUser):')
  console.log('   - Existe:', !!user.value)
  console.log('   - ID (.id):', user.value?.id)
  console.log('   - ID (.sub):', user.value?.sub)
  console.log('   - Email:', user.value?.email)
  console.log('   - Objeto completo:', JSON.stringify(user.value, null, 2))
  console.log('')
  
  // 2. Estado de la sesión
  console.log('2️⃣ ESTADO DE LA SESIÓN:')
  console.log('   - Existe:', !!session.value)
  console.log('   - Access Token:', session.value?.access_token ? 'Sí (oculto)' : 'No')
  console.log('   - Refresh Token:', session.value?.refresh_token ? 'Sí (oculto)' : 'No')
  console.log('   - Expira en:', session.value?.expires_at ? new Date(session.value.expires_at * 1000).toISOString() : 'N/A')
  console.log('')
  
  // 3. Estado del perfil
  console.log('3️⃣ ESTADO DEL PERFIL (userProfile):')
  console.log('   - Cargado:', !!userProfile.value)
  if (userProfile.value) {
    console.log('   - Email:', userProfile.value.email)
    console.log('   - Rol:', userProfile.value.rol)
    console.log('   - is_staff:', userProfile.value.is_staff)
    console.log('   - Objeto completo:', JSON.stringify(userProfile.value, null, 2))
  } else {
    console.log('   - ❌ Perfil NO cargado')
  }
  console.log('')
  
  // 4. Verificar sesión en Supabase
  console.log('4️⃣ VERIFICACIÓN DE SESIÓN EN SUPABASE:')
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) {
    console.error('   - ❌ Error al obtener sesión:', sessionError)
  } else {
    console.log('   - ✅ Sesión obtenida')
    console.log('   - Usuario ID:', sessionData.session?.user?.id)
    console.log('   - Usuario Email:', sessionData.session?.user?.email)
  }
  console.log('')
  
  // 5. Verificar usuario en Supabase
  console.log('5️⃣ VERIFICACIÓN DE USUARIO EN SUPABASE:')
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) {
    console.error('   - ❌ Error al obtener usuario:', userError)
  } else {
    console.log('   - ✅ Usuario obtenido')
    console.log('   - Usuario ID:', userData.user?.id)
    console.log('   - Usuario Email:', userData.user?.email)
  }
  console.log('')
  
  // 6. Intentar consulta directa a profiles
  const userId = user.value?.id || user.value?.sub
  if (userId) {
    console.log('6️⃣ CONSULTA DIRECTA A TABLA PROFILES:')
    console.log('   - ID a consultar:', userId)
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('   - ❌ ERROR EN CONSULTA:')
      console.error('   - Código:', error.code)
      console.error('   - Mensaje:', error.message)
      console.error('   - Detalles:', error.details)
      console.error('   - Hint:', error.hint)
      console.error('   - Objeto completo:', JSON.stringify(error, null, 2))
    } else {
      console.log('   - ✅ PERFIL ENCONTRADO:')
      console.log('   - Email:', data.email)
      console.log('   - Nombre:', data.nombre)
      console.log('   - Rol:', data.rol)
      console.log('   - is_staff:', data.is_staff)
      console.log('   - Objeto completo:', JSON.stringify(data, null, 2))
    }
  } else {
    console.error('6️⃣ ❌ NO HAY USUARIO ID DISPONIBLE - No se puede consultar profiles')
  }
  console.log('')
  
  // 7. Verificar políticas RLS
  console.log('7️⃣ VERIFICACIÓN DE POLÍTICAS RLS:')
  console.log('   - Intentando consultar sin filtro (debería fallar por RLS)...')
  const { data: allProfiles, error: rlsError } = await supabase
    .from('profiles')
    .select('id, email, rol')
    .limit(1)
  
  if (rlsError) {
    console.log('   - ⚠️ RLS activo (esperado):', rlsError.message)
  } else {
    console.log('   - ⚠️ RLS posiblemente desactivado o permisivo')
    console.log('   - Perfiles obtenidos:', allProfiles?.length || 0)
  }
  console.log('')
  
  // 8. Estado de localStorage
  console.log('8️⃣ ESTADO DE LOCAL STORAGE (Supabase):')
  const localStorageKeys = Object.keys(localStorage).filter(key => key.includes('supabase'))
  console.log('   - Claves encontradas:', localStorageKeys.length)
  localStorageKeys.forEach(key => {
    const value = localStorage.getItem(key)
    console.log(`   - ${key}:`, value ? 'Presente' : 'Ausente')
  })
  console.log('')
  
  // 9. Resumen final
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 RESUMEN DEL DIAGNÓSTICO:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Usuario autenticado:', !!user.value ? '✅ SÍ' : '❌ NO')
  console.log('Sesión activa:', !!session.value ? '✅ SÍ' : '❌ NO')
  console.log('Perfil cargado:', !!userProfile.value ? '✅ SÍ' : '❌ NO')
  console.log('')
  
  if (user.value && !userProfile.value) {
    console.error('⚠️ PROBLEMA DETECTADO:')
    console.error('   Usuario autenticado pero perfil no cargado')
    console.error('   Posibles causas:')
    console.error('   1. Error en políticas RLS de profiles')
    console.error('   2. loadUserProfile() no se ejecutó')
    console.error('   3. Race condition en la carga')
    console.error('   4. Perfil no existe en la tabla profiles')
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

// Watch para detectar cambios
watch(user, (newUser) => {
  console.log('👤 [Debug Panel] Usuario cambió:', newUser ? 'Autenticado' : 'No autenticado')
})

watch(session, (newSession) => {
  console.log('🔐 [Debug Panel] Sesión cambió:', newSession ? 'Activa' : 'Inactiva')
})

watch(userProfile, (newProfile) => {
  console.log('📋 [Debug Panel] Perfil cambió:', newProfile ? `Rol: ${newProfile.rol}` : 'Sin perfil')
})
</script>
