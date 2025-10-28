# 🎨 Integración Frontend - Sistema de Citas y Bonos

> **Guía completa para conectar Nuxt 3 con el sistema de gestión de citas y bonos**

---

## 📋 Índice

1. [Instalación](#-instalación)
2. [Composable useAgenda](#-composable-useagenda)
3. [Componente AgendaTerapeuta](#-componente-agendaterapeuta)
4. [Uso en Páginas](#-uso-en-páginas)
5. [Notificaciones y Toasts](#-notificaciones-y-toasts)
6. [Supabase Realtime](#-supabase-realtime)
7. [Casos de Uso](#-casos-de-uso)
8. [Customización](#-customización)
9. [Troubleshooting](#-troubleshooting)

---

## 🚀 Instalación

### Paso 1: Verificar Backend

Asegúrate de que la migración esté ejecutada:

```bash
# Ver en Supabase Dashboard > SQL Editor
SELECT * FROM public.verificar_sistema_citas_bonos();
```

Debes ver 6 componentes con estado `✅ Existe` o `✅ Activo`.

### Paso 2: Archivos Creados

```
📁 composables/
  └── useAgenda.ts         ← Lógica de negocio y conexión con Supabase

📁 components/
  └── AgendaTerapeuta.vue  ← Vista principal de la agenda
```

### Paso 3: Dependencias

El sistema usa las dependencias estándar de Nuxt 3 + Supabase:

```json
{
  "@nuxtjs/supabase": "^1.x",
  "vue": "^3.x",
  "nuxt": "^3.x"
}
```

No se requieren paquetes adicionales.

---

## 🧩 Composable useAgenda

### Importación

```typescript
import { useAgenda } from '~/composables/useAgenda'
```

### API Completa

#### Estado Reactivo

```typescript
const {
  // 📊 Datos
  citas,                          // ref<Cita[]> - Todas las citas
  loading,                        // ref<boolean> - Estado de carga
  error,                          // ref<string | null> - Error si ocurre

  // 🔍 Computadas
  citasDelDia,                    // Citas de hoy
  citasPendientes,                // Citas pendientes o confirmadas
  citasCompletadas,               // Citas completadas o realizadas
  citasConBonoProximoAgotar,      // Citas con ≤2 sesiones restantes

  // 🔧 Métodos
  getCitasDelTerapeuta,           // Cargar citas
  completarCita,                  // Marcar cita como completada
  obtenerHistorialBono,           // Ver movimientos de un bono
  verificarBonoCitas,             // Verificar estado y detectar inconsistencias

  // 📡 Realtime
  suscribirCitasRealtime,         // Iniciar suscripción
  desuscribirCitasRealtime        // Cerrar suscripción
} = useAgenda()
```

#### Tipos TypeScript

```typescript
interface Cita {
  id: string
  fecha_cita: string
  hora_inicio: string
  hora_fin: string
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'realizada'
  modalidad: string
  observaciones?: string
  paciente_id: string
  terapeuta_id: string
  bono_id?: string
  sesion_descontada: boolean
  consumo_registrado: boolean
  paciente?: {
    id: string
    nombre_completo: string
    telefono?: string
    email?: string
  }
  bono?: {
    id: string
    sesiones_restantes: number
    sesiones_totales: number
    estado: string
  }
}

interface ResultadoCompletar {
  success: boolean
  message: string
  cita_id?: string
  bono_id?: string
  sesiones_antes?: number
  sesiones_despues?: number
  sesiones_totales?: number
  bono_completado?: boolean
  alerta?: boolean
  tipo_alerta?: 'pocas_sesiones' | 'ultima_sesion' | 'bono_agotado'
  mensaje_alerta?: string
  error?: string
  warning?: string
}
```

### Métodos en Detalle

#### `getCitasDelTerapeuta(opciones?)`

Carga las citas del terapeuta autenticado.

```typescript
// Uso básico
await getCitasDelTerapeuta()

// Con opciones
await getCitasDelTerapeuta({
  fechaInicio: '2025-10-01',
  fechaFin: '2025-10-31',
  incluirCompletadas: true
})
```

**Opciones**:
- `fechaInicio`: Fecha mínima (formato: YYYY-MM-DD)
- `fechaFin`: Fecha máxima (formato: YYYY-MM-DD)
- `incluirCompletadas`: Si incluir citas completadas (default: false)

#### `completarCita(citaId)`

Marca una cita como completada y descuenta automáticamente del bono.

```typescript
const resultado = await completarCita('uuid-de-cita')

if (resultado.success) {
  console.log('Sesiones restantes:', resultado.sesiones_despues)
  
  if (resultado.alerta) {
    // Mostrar alerta según tipo
    switch (resultado.tipo_alerta) {
      case 'ultima_sesion':
        alert('⚠️ Última sesión del bono')
        break
      case 'pocas_sesiones':
        alert(`⚠️ Quedan ${resultado.sesiones_despues} sesiones`)
        break
      case 'bono_agotado':
        alert('✅ Bono completado')
        break
    }
  }
} else {
  console.error('Error:', resultado.message)
}
```

**Retorna**:
- `success`: boolean - Si la operación fue exitosa
- `message`: string - Mensaje descriptivo
- `sesiones_antes`: number - Sesiones antes del descuento
- `sesiones_despues`: number - Sesiones después del descuento
- `alerta`: boolean - Si hay alguna alerta
- `mensaje_alerta`: string - Texto de la alerta

#### `obtenerHistorialBono(bonoId)`

Obtiene el historial completo de movimientos de un bono.

```typescript
const historial = await obtenerHistorialBono('uuid-del-bono')

historial.forEach(mov => {
  console.log(`${mov.tipo_movimiento}: ${mov.sesiones_antes} → ${mov.sesiones_despues}`)
})
```

**Retorna**:
```typescript
Array<{
  id: string
  tipo_movimiento: 'descuento' | 'reembolso' | 'ajuste' | 'creacion' | 'cancelacion'
  sesiones_antes: number
  sesiones_despues: number
  sesiones_modificadas: number
  motivo: string
  fecha: string
  cita_id?: string
  metadata: object
}>
```

#### `verificarBonoCitas(bonoId)`

Verifica el estado de un bono y detecta inconsistencias.

```typescript
const verificacion = await verificarBonoCitas('uuid-del-bono')

console.log('Sesiones totales:', verificacion.bono.sesiones_totales)
console.log('Sesiones usadas:', verificacion.bono.sesiones_usadas)
console.log('Sesiones restantes:', verificacion.bono.sesiones_restantes)
console.log('Citas completadas:', verificacion.citas.completadas)
console.log('Citas pendientes:', verificacion.citas.pendientes)

if (verificacion.alerta) {
  console.warn('⚠️', verificacion.mensaje_alerta)
}
```

---

## 🎨 Componente AgendaTerapeuta

### Uso Básico

```vue
<template>
  <div>
    <AgendaTerapeuta />
  </div>
</template>
```

### Características

✅ **Vista completa de citas** con toda la información  
✅ **Filtros dinámicos**: Hoy, Pendientes, Completadas, Todas  
✅ **Alertas visuales** para bonos próximos a agotarse  
✅ **Botones de acción** para completar citas  
✅ **Modal de historial** para ver movimientos del bono  
✅ **Actualización en tiempo real** con Supabase Realtime  
✅ **Responsive** y con buen diseño  

### Props

El componente no requiere props, usa el contexto del usuario autenticado.

### Eventos

No emite eventos, maneja todo internamente.

### Personalización

Puedes personalizar los colores y estilos editando las clases de Tailwind:

```vue
<!-- Cambiar color del botón completar -->
<button class="bg-green-600 hover:bg-green-700">
  ✅ Completar
</button>

<!-- Cambiar color de estado -->
<span class="bg-blue-100 text-blue-800">
  CONFIRMADA
</span>
```

---

## 📄 Uso en Páginas

### Página de Dashboard del Terapeuta

```vue
<!-- pages/terapeuta/dashboard.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'terapeuta'
})
</script>

<template>
  <div>
    <AgendaTerapeuta />
  </div>
</template>
```

### Página Específica de Agenda

```vue
<!-- pages/terapeuta/agenda.vue -->
<script setup lang="ts">
import { useAgenda } from '~/composables/useAgenda'

const { citasDelDia, citasPendientes, loading } = useAgenda()
</script>

<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Mi Agenda</h1>

    <!-- Resumen rápido -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="text-gray-600">Citas de hoy</p>
        <p class="text-3xl font-bold">{{ citasDelDia.length }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <p class="text-gray-600">Citas pendientes</p>
        <p class="text-3xl font-bold">{{ citasPendientes.length }}</p>
      </div>
    </div>

    <!-- Componente completo -->
    <AgendaTerapeuta />
  </div>
</template>
```

### Integración en Dashboard Existente

```vue
<!-- pages/terapeuta/index.vue -->
<script setup lang="ts">
import { useAgenda } from '~/composables/useAgenda'

const { citasDelDia, completarCita } = useAgenda()
</script>

<template>
  <div class="dashboard">
    <!-- Otras secciones del dashboard -->
    <div class="stats">...</div>

    <!-- Sección de citas del día -->
    <section class="citas-hoy">
      <h2>Citas de Hoy</h2>
      <div v-for="cita in citasDelDia" :key="cita.id" class="cita-card">
        <p>{{ cita.paciente?.nombre_completo }}</p>
        <p>{{ cita.hora_inicio }} - {{ cita.hora_fin }}</p>
        <button @click="completarCita(cita.id)">
          Completar
        </button>
      </div>
    </section>

    <!-- Otras secciones -->
  </div>
</template>
```

---

## 🔔 Notificaciones y Toasts

### Sistema de Notificaciones

El composable intenta usar un sistema de toast global si existe:

```typescript
// En tu plugin de toasts (ej: plugins/toast.ts)
export default defineNuxtPlugin(() => {
  return {
    provide: {
      toast: {
        success: (msg: string) => {
          // Tu implementación
          console.log('✅', msg)
        },
        error: (msg: string) => {
          // Tu implementación
          console.error('❌', msg)
        },
        warning: (msg: string) => {
          // Tu implementación
          console.warn('⚠️', msg)
        },
        info: (msg: string) => {
          // Tu implementación
          console.log('ℹ️', msg)
        }
      }
    }
  }
})
```

### Integración con Vue Toastification

```bash
npm install vue-toastification@next
```

```typescript
// plugins/toast.ts
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Toast, {
    position: 'top-right',
    timeout: 3000,
    closeOnClick: true
  })

  // Exponer globalmente
  if (typeof window !== 'undefined') {
    (window as any).$toast = nuxtApp.vueApp.config.globalProperties.$toast
  }
})
```

### Integración con Notivue

```bash
npm install notivue
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['notivue/nuxt'],
  css: ['notivue/notification.css']
})
```

```typescript
// Uso en el composable
import { push } from 'notivue'

const mostrarNotificacion = (tipo: string, mensaje: string) => {
  push[tipo]({
    title: tipo === 'success' ? 'Éxito' : 'Error',
    message: mensaje
  })
}
```

---

## 📡 Supabase Realtime

### Cómo Funciona

El composable se suscribe automáticamente a cambios en la tabla `citas`:

```typescript
// Se ejecuta automáticamente cuando hay un usuario autenticado
watchEffect(() => {
  if (user.value?.id) {
    getCitasDelTerapeuta()
    suscribirCitasRealtime()  // ← Suscripción automática
  }
})
```

### Eventos Escuchados

- **INSERT**: Nueva cita creada
- **UPDATE**: Cita actualizada (ej: completada)
- **DELETE**: Cita eliminada

### Comportamiento

Cuando detecta un cambio:
1. Recarga automáticamente la lista de citas
2. Muestra una notificación según el tipo de evento
3. Actualiza la UI sin recargar la página

### Desactivar Realtime

Si no quieres usar Realtime:

```typescript
// En tu página
const { desuscribirCitasRealtime } = useAgenda()

onMounted(() => {
  desuscribirCitasRealtime()
})
```

### Habilitar RLS en Supabase

Para que Realtime funcione correctamente, asegúrate de tener RLS configurado:

```sql
-- En Supabase Dashboard > Authentication > Policies

-- Política para citas
CREATE POLICY "Terapeutas pueden ver sus citas"
  ON public.citas
  FOR SELECT
  USING (
    terapeuta_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'coordinadora'
    )
  );
```

---

## 💼 Casos de Uso

### Caso 1: Dashboard Simple

```vue
<script setup>
const { citasDelDia, completarCita } = useAgenda()
</script>

<template>
  <div>
    <h2>Citas de Hoy ({{ citasDelDia.length }})</h2>
    <div v-for="cita in citasDelDia" :key="cita.id">
      <p>{{ cita.paciente?.nombre_completo }}</p>
      <button @click="completarCita(cita.id)">Completar</button>
    </div>
  </div>
</template>
```

### Caso 2: Vista con Filtros Personalizados

```vue
<script setup>
const { citas } = useAgenda()
const filtro = ref('todas')

const citasFiltradas = computed(() => {
  if (filtro.value === 'online') {
    return citas.value.filter(c => c.modalidad === 'online')
  }
  if (filtro.value === 'presencial') {
    return citas.value.filter(c => c.modalidad === 'presencial')
  }
  return citas.value
})
</script>

<template>
  <div>
    <select v-model="filtro">
      <option value="todas">Todas</option>
      <option value="online">Online</option>
      <option value="presencial">Presencial</option>
    </select>

    <div v-for="cita in citasFiltradas" :key="cita.id">
      <!-- ... -->
    </div>
  </div>
</template>
```

### Caso 3: Alertas Personalizadas

```vue
<script setup>
const { citasConBonoProximoAgotar, completarCita } = useAgenda()

const completarConConfirmacion = async (cita) => {
  const sesionesRestantes = cita.bono?.sesiones_restantes || 0
  
  if (sesionesRestantes === 1) {
    const confirmar = confirm('Esta es la última sesión del bono. ¿Continuar?')
    if (!confirmar) return
  }
  
  await completarCita(cita.id)
}
</script>

<template>
  <div>
    <div v-if="citasConBonoProximoAgotar.length > 0" class="alerta">
      ⚠️ {{ citasConBonoProximoAgotar.length }} pacientes con pocas sesiones
    </div>
  </div>
</template>
```

### Caso 4: Historial en Modal Personalizado

```vue
<script setup>
const { obtenerHistorialBono } = useAgenda()
const historial = ref([])
const modalAbierto = ref(false)

const verHistorial = async (bonoId) => {
  historial.value = await obtenerHistorialBono(bonoId)
  modalAbierto.value = true
}
</script>

<template>
  <div>
    <button @click="verHistorial('uuid-del-bono')">
      Ver Historial
    </button>

    <div v-if="modalAbierto" class="modal">
      <div v-for="mov in historial" :key="mov.id">
        <p>{{ mov.tipo_movimiento }}</p>
        <p>{{ mov.sesiones_antes }} → {{ mov.sesiones_despues }}</p>
      </div>
    </div>
  </div>
</template>
```

---

## 🎨 Customización

### Cambiar Colores de Estado

```typescript
// En el componente
const coloresEstado = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  confirmada: 'bg-blue-100 text-blue-800',
  completada: 'bg-green-100 text-green-800',
  cancelada: 'bg-red-100 text-red-800'
}
```

### Formato de Fechas Personalizado

```typescript
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const formatearFecha = (fecha: string) => {
  return format(new Date(fecha), "EEEE d 'de' MMMM", { locale: es })
}
```

### Agregar Campos Personalizados

```typescript
// Modificar la query en getCitasDelTerapeuta
let query = supabase
  .from('citas')
  .select(`
    *,
    paciente:pacientes (*),
    bono:bonos (*),
    mi_campo_custom  // ← Agregar aquí
  `)
```

---

## 🚨 Troubleshooting

### Problema: No Se Cargan las Citas

**Diagnóstico**:
```typescript
const { error } = useAgenda()
console.log('Error:', error.value)
```

**Posibles Causas**:
1. Usuario no autenticado
2. RLS bloqueando las queries
3. Relaciones incorrectas en la BD

**Solución**:
```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'citas';

-- Verificar usuario
SELECT auth.uid();
```

### Problema: Realtime No Funciona

**Diagnóstico**:
```typescript
// Ver en la consola del navegador
// Debe aparecer: "✅ [Realtime] Suscripción activa"
```

**Solución**:
```typescript
// Habilitar Realtime en Supabase Dashboard
// Database > Replication > Enable Replication for tabla 'citas'
```

### Problema: No Se Descuenta la Sesión

**Diagnóstico**:
```typescript
const resultado = await completarCita(citaId)
console.log('Resultado:', resultado)
```

**Posibles Causas**:
1. Trigger no activo en Supabase
2. Bono no está en estado 'activo'
3. Ya se descontó previamente

**Solución**:
```sql
-- Verificar trigger
SELECT * FROM pg_trigger WHERE tgrelid = 'citas'::regclass;

-- Ver estado del bono
SELECT * FROM bonos WHERE id = 'uuid-del-bono';
```

### Problema: Errores de TypeScript

**Solución**:
```typescript
// Asegúrate de tener los tipos correctos
import type { Database } from '~/types/supabase'

const supabase = useSupabaseClient<Database>()
```

---

## ✅ Checklist de Implementación

- [ ] Migración de backend ejecutada
- [ ] Composable `useAgenda.ts` creado
- [ ] Componente `AgendaTerapeuta.vue` creado
- [ ] Sistema de toasts configurado
- [ ] Realtime habilitado en Supabase
- [ ] RLS configurado correctamente
- [ ] Página de agenda creada
- [ ] Probado flujo completo: cargar → completar → verificar

---

## 📚 Recursos

- [Documentación del Sistema Backend](./SISTEMA_CITAS_BONOS_GUIA_COMPLETA.md)
- [Guía Rápida](./SISTEMA_CITAS_BONOS_QUICKSTART.md)
- [Migración SQL](../supabase/migrations/20251028_sistema_citas_bonos_consolidado.sql)

---

**¡Listo!** 🎉 Ahora tienes un sistema completo de gestión de citas con descuento automático de bonos, actualización en tiempo real, y una interfaz moderna y funcional.
