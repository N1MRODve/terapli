# 🌿 Guía Completa: Sistema de Bienestar Emocional

Integración completa de **PanelEmocionalAvanzado** + **VisualizacionEmocional** en el dashboard del paciente.

## 🎯 Visión General

El sistema de bienestar emocional consta de dos componentes complementarios:

1. **PanelEmocionalAvanzado**: Registro diario (input)
2. **VisualizacionEmocional**: Análisis y evolución (output)

Juntos crean un ciclo completo de autoconocimiento emocional.

---

## 📋 Opción 1: Integración en Dashboard Existente (RECOMENDADA)

### Reemplazar feedback emocional simple por sistema completo

**Archivo**: `/pages/paciente/dashboard.vue`

#### Paso 1: Localizar la sección a reemplazar

Buscar (aproximadamente líneas 26-50):
```vue
<!-- Feedback emocional -->
<div class="rounded-xl bg-white shadow-sm border border-[#EAD5D3]/30 p-6">
  <!-- ... 3 emojis simples ... -->
</div>
```

#### Paso 2: Reemplazar con los nuevos componentes

```vue
<!-- NUEVO: Panel Emocional Avanzado (Registro) -->
<PanelEmocionalAvanzado />

<!-- NUEVO: Visualización Emocional (Análisis) -->
<VisualizacionEmocional />
```

#### Paso 3: Código completo del Dashboard actualizado

```vue
<template>
  <div>
    <LoadingSpinner v-if="loading" text="Cargando tu espacio personal..." full-height />

    <div v-else class="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <!-- Header dinámico con saludo -->
      <div class="bg-gradient-to-br from-[#D8AFA0] via-[#EAD5D3] to-[#F9F7F3] rounded-2xl p-8 shadow-sm">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h1 class="text-3xl sm:text-4xl font-['Lora'] font-medium text-[#5D4A44] mb-2">
              {{ saludo }}, {{ nombrePaciente }}
            </h1>
            <p class="text-[#5D4A44]/80 font-['Lato'] text-base max-w-2xl leading-relaxed">
              {{ mensajeBienvenida }}
            </p>
          </div>
          <div class="hidden sm:block">
            <div class="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center">
              <svg class="w-8 h-8 text-[#5D4A44]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- NUEVO: Panel Emocional Avanzado (Registro) -->
      <PanelEmocionalAvanzado />

      <!-- NUEVO: Visualización Emocional (Análisis y gráficos) -->
      <VisualizacionEmocional />

      <!-- Grid principal: Próxima sesión + Progreso del bono -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- ... contenido existente sin cambios ... -->
      </div>

      <!-- Mensaje motivacional -->
      <div class="rounded-xl bg-gradient-to-r from-[#F9F7F3] to-white shadow-sm border border-[#EAD5D3]/30 p-8">
        <!-- ... contenido existente sin cambios ... -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'paciente',
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const { getBonos, getSesiones } = usePacientes()

// Estados (YA NO NECESITAS estadoAnimoHoy ni emojisEstado)
const loading = ref(true)
const nombrePaciente = ref('')
const proximaSesion = ref<any>(null)
const bonoActivo = ref<any>(null)

// ... resto del código existente sin cambios ...
</script>
```

---

## ✅ Pasos para Implementar

### 1. Verificar migración de base de datos

```bash
# Ir a Supabase → SQL Editor
# Copiar y ejecutar el contenido de:
# /supabase/migrations/20250119000000_create_emociones_avanzadas.sql
```

### 2. Instalar dependencias (ya hecho)

```bash
npm install chart.js vue-chartjs
```

### 3. Modificar Dashboard

Abrir `/pages/paciente/dashboard.vue` y:

**Eliminar** (líneas 26-66 aproximadamente):
```vue
<!-- Feedback emocional -->
<div class="rounded-xl bg-white shadow-sm border border-[#EAD5D3]/30 p-6">
  <!-- ... todo este bloque ... -->
</div>
```

**Reemplazar con**:
```vue
<!-- Panel Emocional Avanzado -->
<PanelEmocionalAvanzado />

<!-- Visualización Emocional -->
<VisualizacionEmocional />
```

**Eliminar del script**:
```typescript
const estadoAnimoHoy = ref<string | null>(null)

const emojisEstado = [
  { value: 'mal', icon: '😔', label: 'Me siento mal' },
  { value: 'regular', icon: '😐', label: 'Me siento regular' },
  { value: 'bien', icon: '😊', label: 'Me siento bien' }
]

const registrarEstadoAnimo = (estado: string) => {
  estadoAnimoHoy.value = estado
  console.log('Estado de ánimo registrado:', estado)
}
```

### 4. Guardar y verificar

- Guardar archivo
- El servidor recargará automáticamente
- Ir a `http://localhost:3001/paciente/dashboard`
- Login como paciente
- Deberías ver los dos nuevos componentes

---

## 🎯 Orden Visual Recomendado

```
┌─────────────────────────────────────┐
│  Header con saludo dinámico         │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  PanelEmocionalAvanzado             │
│  (Registrar estado emocional)       │
│  - 5 niveles                        │
│  - 3 emociones                      │
│  - Factores influyentes             │
│  - Reflexión                        │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  VisualizacionEmocional             │
│  (Análisis y evolución)             │
│  - Gráfico temporal                 │
│  - 4 estadísticas                   │
│  - Emociones frecuentes             │
│  - Factores influyentes             │
│  - Insight personalizado            │
└─────────────────────────────────────┘
           ↓
┌───────────────┬─────────────────────┐
│ Próxima       │  Progreso           │
│ Sesión        │  del Bono           │
└───────────────┴─────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Mensaje motivacional               │
└─────────────────────────────────────┘
```

---

## 📱 Preview de funcionalidad

### PanelEmocionalAvanzado
```
┌────────────────────────────────────────┐
│ Tu registro emocional 🌿               │
│                                        │
│ ¿Cómo te sientes en general?          │
│  😢   😔   😐   🙂   😁                │
│                                        │
│ Selecciona hasta 3 emociones (2/3)    │
│  [Agradecido] [Tranquilo] Motivado    │
│   Ansioso Triste Cansado...           │
│                                        │
│ ¿Qué crees que influyó...?            │
│  [Familia] [Sueño] Trabajo...         │
│                                        │
│ ¿Quieres dejar una reflexión?         │
│  [Hoy me sentí mejor después...]      │
│                                        │
│               [Guardar registro]       │
│                                        │
│ Evolución reciente 💫                  │
│  😊   😐   🙂   😁   🙂   😊   😁     │
│  11o  12o  13o  14o  15o  16o  17o    │
└────────────────────────────────────────┘
```

### VisualizacionEmocional
```
┌────────────────────────────────────────┐
│ Evolución emocional 📈                 │
│              [7 días] [30 días]        │
│                                        │
│ muy bien  •         •──────•          │
│ bien      │    •───•│       │          │
│ neutral   •───•     │       •          │
│ mal       │         │                  │
│ muy mal   │___________________         │
│           10o 11o 12o 13o 14o 15o 16o  │
│                                        │
│ [12]     [🙂]    [😁]      [5]        │
│ registros promedio mejor día  racha    │
│                                        │
│ Emociones más presentes 🌈             │
│ [Tranquilo × 8] [Agradecido × 6]      │
│ [Motivado × 5] [En paz × 4]           │
│                                        │
│ Factores que más influyen 💡          │
│ 😴 Sueño 10×    👨‍👩‍👧‍👦 Familia 8×        │
│ 🏃‍♀️ Ejercicio 6×  🎨 Tiempo libre 5×    │
│                                        │
│ 💡 Reflexión sobre tu evolución        │
│ "Tu bienestar ha mejorado...          │
│  'Sueño' parece estar influyendo      │
│  positivamente 💚"                     │
└────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### Error: "Failed to resolve component"
```bash
# Los componentes deben estar en /components/
# Nuxt los auto-importa, no necesitas import manual
```

### Error: "Chart is not defined"
```bash
# Asegúrate de instalar las dependencias:
npm install chart.js vue-chartjs

# Y reiniciar el servidor:
npm run dev
```

### No aparecen datos en visualización
```sql
-- Verificar que la tabla existe en Supabase:
SELECT * FROM emociones_avanzadas;

-- Verificar RLS:
SELECT * FROM pg_policies WHERE tablename = 'emociones_avanzadas';
```

### Gráfico no se muestra
```javascript
// Verificar importaciones en VisualizacionEmocional.vue:
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, ... } from 'chart.js'
ChartJS.register(...)
```

---

## 🚀 Próximos Pasos

Después de implementar:

1. **Probar el flujo completo**:
   - Registrar varios estados emocionales
   - Cambiar rango de tiempo (7d/30d)
   - Verificar que el gráfico se actualiza
   - Leer el insight personalizado

2. **Personalizar**:
   - Agregar más emociones si lo deseas
   - Modificar colores del gráfico
   - Ajustar textos de insights

3. **Compartir con terapeuta** (futuro):
   - Agregar botón "Compartir con terapeuta"
   - Exportar PDF con evolución
   - Enviar insight específico por mensajes

---

**Sistema de Bienestar Emocional listo para usar 🌿✨**

Dashboard → Panel de Registro → Visualización → Autoconocimiento 💚
