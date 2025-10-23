<script setup>
const supabase = useSupabaseClient()
const user = useSupabaseUser()

onMounted(async () => {
  console.log('✅ Supabase conectado correctamente')
  console.log('Usuario actual:', user.value)
  
  // Test de conexión con la tabla pacientes
  const { data, error } = await supabase.from('pacientes').select('*').limit(1)
  console.log('Datos de pacientes:', data)
  if (error) {
    console.error('Error al consultar pacientes:', error)
  }
  
  // Test de conexión con la tabla emociones_avanzadas
  const { data: emociones, error: errorEmociones } = await supabase
    .from('emociones_avanzadas')
    .select('*')
    .limit(1)
  console.log('Datos de emociones_avanzadas:', emociones)
  if (errorEmociones) {
    console.error('Error al consultar emociones_avanzadas:', errorEmociones)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-[#F9F7F3] to-[#EAD5D3] p-8">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-2xl shadow-lg p-8 border border-[#EAD5D3]/30">
        <h1 class="text-3xl font-['Lora'] font-medium text-[#5D4A44] mb-6">
          🧪 Test de Conexión Supabase
        </h1>
        
        <div class="space-y-4 font-['Lato'] text-[#5D4A44]">
          <div class="bg-[#F9F7F3] rounded-lg p-4">
            <h2 class="font-semibold mb-2">Estado del Usuario:</h2>
            <pre class="text-xs overflow-auto">{{ user || 'No autenticado' }}</pre>
          </div>
          
          <div class="bg-[#EAD5D3]/20 rounded-lg p-4">
            <h2 class="font-semibold mb-2">Instrucciones:</h2>
            <ol class="list-decimal list-inside space-y-2 text-sm">
              <li>Abre la consola del navegador (F12)</li>
              <li>Verifica que aparezca "✅ Supabase conectado correctamente"</li>
              <li>Revisa si hay datos o errores de las consultas</li>
              <li>Si hay errores de RLS, verifica que las políticas estén configuradas</li>
            </ol>
          </div>
          
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 class="font-semibold text-green-800 mb-2">✅ Verificación en Curso</h2>
            <p class="text-sm text-green-700">
              La página está verificando la conexión con Supabase.
              Revisa la consola del navegador para ver los resultados.
            </p>
          </div>
          
          <div class="mt-6">
            <NuxtLink 
              to="/" 
              class="inline-block px-6 py-3 bg-[#D8AFA0] text-white rounded-lg hover:bg-[#c99d8e] transition-colors font-medium"
            >
              ← Volver al inicio
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
