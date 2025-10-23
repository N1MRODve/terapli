# 🔗 Integración del Panel Emocional en Dashboard

## Opción 1: Reemplazar el feedback emocional actual

Si quieres reemplazar la sección de feedback emocional existente (3 emojis simples) por el panel completo:

### Antes (dashboard.vue actual - líneas 26-50):
```vue
<!-- Feedback emocional -->
<div class="rounded-xl bg-white shadow-sm border border-[#EAD5D3]/30 p-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h3 class="text-lg font-['Lora'] font-medium text-[#5D4A44] mb-1">
        ¿Cómo te sientes hoy?
      </h3>
      <!-- ... resto del código ... -->
    </div>
  </div>
</div>
```

### Después (dashboard.vue con Panel Emocional):
```vue
<!-- Panel Emocional Avanzado -->
<PanelEmocionalAvanzado />
```

---

## Opción 2: Agregar como sección adicional

Si prefieres mantener el feedback simple y agregar el panel como sección separada:

```vue
<template>
  <div>
    <LoadingSpinner v-if="loading" text="Cargando tu espacio personal..." full-height />

    <div v-else class="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <!-- Header dinámico con saludo -->
      <div class="bg-gradient-to-br from-[#D8AFA0] via-[#EAD5D3] to-[#F9F7F3] rounded-2xl p-8 shadow-sm">
        <!-- ... header ... -->
      </div>

      <!-- Feedback emocional simple (MANTENER) -->
      <div class="rounded-xl bg-white shadow-sm border border-[#EAD5D3]/30 p-6">
        <!-- ... 3 emojis simples ... -->
      </div>

      <!-- Grid principal: Próxima sesión + Progreso del bono -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- ... cards ... -->
      </div>

      <!-- NUEVO: Panel Emocional Avanzado -->
      <PanelEmocionalAvanzado />

      <!-- Mensaje motivacional -->
      <div class="rounded-xl bg-gradient-to-r from-[#F9F7F3] to-white shadow-sm border border-[#EAD5D3]/30 p-8">
        <!-- ... -->
      </div>
    </div>
  </div>
</template>
```

---

## Opción 3: Tab para alternar entre versiones

Si quieres dar a los pacientes la opción de elegir la versión simple o avanzada:

```vue
<template>
  <div>
    <LoadingSpinner v-if="loading" text="Cargando tu espacio personal..." full-height />

    <div v-else class="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <!-- Header dinámico con saludo -->
      <div class="bg-gradient-to-br from-[#D8AFA0] via-[#EAD5D3] to-[#F9F7F3] rounded-2xl p-8 shadow-sm">
        <!-- ... header ... -->
      </div>

      <!-- Toggle entre versión simple y avanzada -->
      <div class="flex justify-end">
        <div class="bg-[#F9F7F3] p-1 rounded-xl inline-flex">
          <button
            @click="versionEmocional = 'simple'"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-[\'Lato\'] transition-all duration-200',
              versionEmocional === 'simple'
                ? 'bg-white text-[#5D4A44] shadow-sm'
                : 'text-[#5D4A44]/60 hover:text-[#5D4A44]'
            ]"
          >
            Vista simple
          </button>
          <button
            @click="versionEmocional = 'avanzada'"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-[\'Lato\'] transition-all duration-200',
              versionEmocional === 'avanzada'
                ? 'bg-white text-[#5D4A44] shadow-sm'
                : 'text-[#5D4A44]/60 hover:text-[#5D4A44]'
            ]"
          >
            Vista avanzada 🌿
          </button>
        </div>
      </div>

      <!-- Feedback emocional simple -->
      <div v-if="versionEmocional === 'simple'" class="rounded-xl bg-white shadow-sm border border-[#EAD5D3]/30 p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 class="text-lg font-['Lora'] font-medium text-[#5D4A44] mb-1">
              ¿Cómo te sientes hoy?
            </h3>
            <p class="text-sm text-[#5D4A44]/70 font-['Lato']">
              Tu bienestar emocional importa. Comparte cómo te sientes.
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <button
              v-for="emoji in emojisEstado"
              :key="emoji.value"
              @click="registrarEstadoAnimo(emoji.value)"
              :class="[
                'group relative w-14 h-14 rounded-full transition-all duration-200',
                estadoAnimoHoy === emoji.value 
                  ? 'bg-[#D8AFA0] scale-110 shadow-md' 
                  : 'bg-[#F9F7F3] hover:bg-[#EAD5D3] hover:scale-105'
              ]"
              :title="emoji.label"
            >
              <span class="text-2xl">{{ emoji.icon }}</span>
              <span 
                v-if="estadoAnimoHoy === emoji.value"
                class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#D8AFA0] rounded-full"
              ></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Panel Emocional Avanzado -->
      <PanelEmocionalAvanzado v-else />

      <!-- Grid principal: Próxima sesión + Progreso del bono -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- ... cards ... -->
      </div>

      <!-- Mensaje motivacional -->
      <div class="rounded-xl bg-gradient-to-r from-[#F9F7F3] to-white shadow-sm border border-[#EAD5D3]/30 p-8">
        <!-- ... -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ... imports y estados existentes ...

// NUEVO: Estado para alternar entre versiones
const versionEmocional = ref('simple') // o 'avanzada'

// Guardar preferencia en localStorage
watch(versionEmocional, (nueva) => {
  localStorage.setItem('versionEmocional', nueva)
})

onMounted(() => {
  cargarDatos()
  
  // Cargar preferencia guardada
  const preferencia = localStorage.getItem('versionEmocional')
  if (preferencia) {
    versionEmocional.value = preferencia
  }
})
</script>
```

---

## Opción 4: Como página independiente

Si prefieres no modificar el Dashboard y crear una página separada:

### Crear `/pages/paciente/mi-bienestar.vue`

```vue
<template>
  <div class="max-w-4xl mx-auto px-4 py-6 space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-['Lora'] font-medium text-[#5D4A44] mb-2">
        Mi Bienestar Emocional 🌿
      </h1>
      <p class="text-[#5D4A44]/70 font-['Lato']">
        Registra y observa tu evolución emocional día a día
      </p>
    </div>

    <!-- Panel Emocional -->
    <PanelEmocionalAvanzado />

    <!-- Gráficos adicionales (futuro) -->
    <!-- <GraficoEvolucion /> -->
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'paciente',
  middleware: 'auth'
})
</script>
```

### Añadir enlace en el layout de paciente

En `/layouts/paciente.vue`, agregar el link en la navegación:

```vue
<NuxtLink
  to="/paciente/mi-bienestar"
  :class="[
    'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200',
    $route.path === '/paciente/mi-bienestar'
      ? 'bg-[#D8AFA0] text-white shadow-sm'
      : 'text-[#5D4A44]/70 hover:bg-[#F9F7F3] hover:text-[#5D4A44]'
  ]"
>
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
  <span class="font-['Lato'] font-medium">Mi Bienestar</span>
</NuxtLink>
```

---

## ✅ Recomendación

**Opción 1** es la más limpia y directa: reemplazar el feedback simple por el panel completo.

**Opción 4** es ideal si quieres dar más protagonismo al bienestar emocional como módulo independiente.

---

## 🚀 Pasos para implementar (Opción 1 - Recomendada)

1. Abre `/pages/paciente/dashboard.vue`

2. Busca la sección de "Feedback emocional" (aproximadamente líneas 26-50)

3. Reemplaza todo ese bloque `<div class="rounded-xl bg-white...">...</div>` por:
   ```vue
   <!-- Panel Emocional Avanzado -->
   <PanelEmocionalAvanzado />
   ```

4. **Opcional**: Elimina del script los estados relacionados con el feedback simple:
   ```typescript
   // Puedes eliminar estas líneas:
   const estadoAnimoHoy = ref<string | null>(null)
   const emojisEstado = [...]
   const registrarEstadoAnimo = (estado: string) => {...}
   ```

5. Guarda y recarga el navegador

¡Listo! El panel emocional avanzado estará integrado en el Dashboard. 🎉
