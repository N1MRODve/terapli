# ✅ Checklist de Integración - Mejoras de Agenda

## 📋 Fase 1: Verificación de Base (COMPLETADO ✅)

- [x] **Archivos creados correctamente**
  - [x] `utils/timezone.ts` (500+ líneas)
  - [x] `utils/appointment-validation.ts` (400+ líneas)
  - [x] `utils/agenda-logger.ts` (250+ líneas)
  - [x] `server/api/appointments/validate-conflict.post.ts`
  - [x] `server/api/appointments/create.post.ts`
  - [x] `server/api/appointments/[id]/update.patch.ts`
  - [x] `composables/useAgendaEnhanced.ts`
  - [x] `tests/utils/timezone.test.ts`
  - [x] `tests/utils/appointment-validation.test.ts`
  - [x] `AGENDA_MEJORAS_RESUMEN.md`

- [x] **Tests ejecutados**
  ```bash
  npm run test
  # Verificar que pasan ~45 tests
  ```

- [x] **Build sin errores**
  ```bash
  npm run build
  # Verificar que no hay errores de TypeScript
  ```

---

## 📋 Fase 2: Integración Básica (SIGUIENTE PASO)

### 2.1. Actualizar `useCitas.ts` para usar nuevas APIs

```typescript
// composables/useCitas.ts

// Importar validación y logging
import { validateAppointment, formatValidationError } from '~/utils/appointment-validation'
import { agendaLogger } from '~/utils/agenda-logger'

// En la función crearCita(), agregar:
async function crearCita(params: CrearCitaParams) {
  // 1. Validar primero (server-side)
  const validation = await $fetch('/api/appointments/validate-conflict', {
    method: 'POST',
    body: {
      fecha_cita: params.fecha,
      hora_inicio: params.hora_inicio,
      hora_fin: params.hora_fin,
      terapeuta_id: terapeutaId
    }
  })

  if (!validation.valid) {
    agendaLogger.warn('conflict', 'Validación fallida', validation)
    return {
      success: false,
      error: formatValidationError(validation)
    }
  }

  // 2. Crear usando nuevo endpoint
  const response = await $fetch('/api/appointments/create', {
    method: 'POST',
    body: { /* ... */ }
  })

  // 3. Log del evento
  agendaLogger.create(response.data.id, params.fecha, params.hora_inicio)

  return response
}
```

**Checklist:**
- [ ] Reemplazar `supabase.from('citas').insert()` por `$fetch('/api/appointments/create')`
- [ ] Agregar validación previa con `/api/appointments/validate-conflict`
- [ ] Agregar logging con `agendaLogger`
- [ ] Probar creación de cita desde UI existente

### 2.2. Actualizar `AgendaTerapeuta.vue` para drag & drop mejorado

```vue
<!-- components/AgendaTerapeuta.vue -->

<script setup lang="ts">
import { useAgendaEnhanced } from '~/composables/useAgendaEnhanced'

const { moveAppointment } = useAgendaEnhanced()

// Reemplazar función onDrop existente
const onDrop = async (event: DragEvent, fecha: string, hora: string) => {
  event.preventDefault()

  if (!citaArrastrada.value) return

  const result = await moveAppointment(
    citaArrastrada.value.id,
    fecha,
    hora
  )

  if (!result.success) {
    // Mostrar error UX-friendly
    alert(result.error)
  }

  citaArrastrada.value = null
}
</script>
```

**Checklist:**
- [ ] Importar `useAgendaEnhanced`
- [ ] Reemplazar lógica de `onDrop` con `moveAppointment()`
- [ ] Verificar que el rollback automático funciona en caso de error
- [ ] Probar drag & drop en semana con citas

---

## 📋 Fase 3: Mejoras de UX (A IMPLEMENTAR)

### 3.1. Click-to-Create en Grid

**Archivo:** `components/agenda/AgendaGrid.vue`

```vue
<template>
  <!-- En cada celda del grid -->
  <div
    @click="handleCellClick(dia.fecha, hora)"
    class="celda-hora cursor-pointer hover:bg-purple-50 transition-colors"
  >
    <!-- Eventos existentes -->
    <AgendaEventCard v-for="cita in citasPorDiaHora(dia.fecha, hora)" ... />
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['clickCreate'])

function handleCellClick(fecha: string, hora: string) {
  // Verificar que la celda está vacía
  const citasEnCelda = citasPorDiaHora(fecha, hora)
  if (citasEnCelda.length > 0) return

  // Emitir evento para abrir modal
  emit('clickCreate', { fecha, hora })

  // Log
  agendaLogger.clickCreate(fecha, hora)
}
</script>
```

**En `AgendaTerapeuta.vue`:**
```vue
<AgendaGrid
  @clickCreate="abrirModalNuevaCita"
/>

<script setup lang="ts">
function abrirModalNuevaCita({ fecha, hora }: { fecha: string; hora: string }) {
  // Pre-rellenar modal con fecha y hora
  modalNuevaCita.value = {
    visible: true,
    fecha_precargada: fecha,
    hora_inicio_precargada: hora
  }
}
</script>
```

**Checklist:**
- [ ] Detectar click en celda vacía
- [ ] Emitir evento `clickCreate` con fecha/hora
- [ ] Abrir modal con datos pre-rellenados
- [ ] Probar creación rápida desde click

### 3.2. Drag-to-Select Range

```vue
<!-- AgendaGrid.vue -->
<script setup lang="ts">
const dragSelecting = ref(false)
const selectionStart = ref<{ fecha: string; hora: string } | null>(null)
const selectionEnd = ref<{ fecha: string; hora: string } | null>(null)

function handleMouseDown(event: MouseEvent, fecha: string, hora: string) {
  // Solo si es click izquierdo y celda vacía
  if (event.button !== 0) return
  if (citasPorDiaHora(fecha, hora).length > 0) return

  dragSelecting.value = true
  selectionStart.value = { fecha, hora }
  selectionEnd.value = { fecha, hora }
}

function handleMouseEnter(fecha: string, hora: string) {
  if (!dragSelecting.value) return

  selectionEnd.value = { fecha, hora }
}

function handleMouseUp() {
  if (!dragSelecting.value) return

  // Calcular rango seleccionado
  const startTime = selectionStart.value!.hora
  const endTime = addMinutes(selectionEnd.value!.hora, 60) // +1 hora

  // Abrir modal con rango
  emit('dragSelectCreate', {
    fecha: selectionStart.value!.fecha,
    hora_inicio: startTime,
    hora_fin: endTime
  })

  // Reset
  dragSelecting.value = false
  selectionStart.value = null
  selectionEnd.value = null
}
</script>
```

**Checklist:**
- [ ] Detectar mousedown en celda vacía
- [ ] Tracking de mouse movement para expandir selección
- [ ] Visual feedback (highlight de celdas seleccionadas)
- [ ] Al soltar, abrir modal con rango completo
- [ ] Probar selección de 1-3 horas

### 3.3. Modal Mejorado con Autocompletar

**Archivo:** `components/ModalNuevaCitaEnhanced.vue` (NUEVO)

```vue
<template>
  <div class="modal">
    <!-- Autocomplete de paciente -->
    <div>
      <label>Paciente</label>
      <input
        v-model="searchPaciente"
        @input="buscarPacientes"
        placeholder="Buscar por nombre, email o teléfono..."
      />

      <!-- Resultados -->
      <div v-if="resultadosPacientes.length > 0" class="autocomplete-results">
        <div
          v-for="paciente in resultadosPacientes"
          :key="paciente.id"
          @click="seleccionarPaciente(paciente)"
          class="autocomplete-item"
        >
          {{ paciente.nombre_completo }}
          <span class="text-gray-500">{{ paciente.email }}</span>
        </div>
      </div>

      <!-- Botón crear paciente rápido -->
      <button
        v-if="searchPaciente && resultadosPacientes.length === 0"
        @click="crearPacienteRapido"
        class="btn-secondary"
      >
        + Crear paciente "{{ searchPaciente }}"
      </button>
    </div>

    <!-- Campos de cita -->
    <div>
      <label>Fecha</label>
      <input
        type="date"
        v-model="form.fecha_cita"
        :min="hoy"
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label>Hora inicio</label>
        <input type="time" v-model="form.hora_inicio" />
      </div>
      <div>
        <label>Hora fin</label>
        <input type="time" v-model="form.hora_fin" />
      </div>
    </div>

    <!-- Selector de estado -->
    <div>
      <label>Estado</label>
      <select v-model="form.estado">
        <option value="pending">Pendiente</option>
        <option value="confirmed">Confirmada</option>
      </select>
    </div>

    <!-- Botones contextuales -->
    <div class="flex gap-2">
      <button @click="guardar" class="btn-primary">
        Guardar
      </button>
      <button
        v-if="form.estado === 'pending'"
        @click="guardarYConfirmar"
        class="btn-success"
      >
        Guardar y Confirmar
      </button>
      <button @click="cerrar" class="btn-secondary">
        Cancelar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePacientes } from '~/composables/usePacientes'
import { useAgendaEnhanced } from '~/composables/useAgendaEnhanced'

const { buscarPacientes: searchPacientes } = usePacientes()
const { createAppointment } = useAgendaEnhanced()

const searchPaciente = ref('')
const resultadosPacientes = ref([])
const form = ref({
  paciente_id: '',
  fecha_cita: props.fecha_precargada || '',
  hora_inicio: props.hora_inicio_precargada || '',
  hora_fin: props.hora_fin_precargada || '',
  estado: 'pending',
  modalidad: 'online'
})

const buscarPacientes = async () => {
  // Debounced search
  const results = await searchPacientes(searchPaciente.value)
  resultadosPacientes.value = results
}

const seleccionarPaciente = (paciente: any) => {
  form.value.paciente_id = paciente.id
  searchPaciente.value = paciente.nombre_completo
  resultadosPacientes.value = []
}

const guardar = async () => {
  const result = await createAppointment(form.value)
  if (result.success) {
    emit('citaCreada', result.data)
    cerrar()
  } else {
    alert(result.error)
  }
}

const guardarYConfirmar = async () => {
  form.value.estado = 'confirmed'
  await guardar()
}
</script>
```

**Checklist:**
- [ ] Crear componente `ModalNuevaCitaEnhanced.vue`
- [ ] Implementar búsqueda de pacientes (debounced)
- [ ] Agregar opción "Crear paciente rápido"
- [ ] Botones contextuales según estado
- [ ] Validación antes de enviar (client-side)
- [ ] Probar creación completa desde modal

### 3.4. Filtros Avanzados con Chips

**Archivo:** `components/agenda/AgendaFilters.vue`

```vue
<template>
  <div class="filtros-container">
    <!-- Botón de filtros con contador -->
    <button @click="toggleFiltros" class="btn-filtros">
      Filtros
      <span v-if="filtrosActivos > 0" class="badge">{{ filtrosActivos }}</span>
    </button>

    <!-- Panel de filtros (colapsable) -->
    <div v-if="mostrarFiltros" class="filtros-panel">
      <!-- Estado -->
      <div>
        <label>Estado</label>
        <div class="flex gap-2">
          <button
            v-for="estado in estados"
            :key="estado.value"
            @click="toggleEstado(estado.value)"
            :class="{ active: estadosSeleccionados.includes(estado.value) }"
            class="chip"
          >
            {{ estado.label }}
          </button>
        </div>
      </div>

      <!-- Paciente -->
      <div>
        <label>Paciente</label>
        <select v-model="filtros.paciente_id">
          <option value="">Todos</option>
          <option v-for="p in pacientes" :key="p.id" :value="p.id">
            {{ p.nombre_completo }}
          </option>
        </select>
      </div>

      <!-- Tipo -->
      <div>
        <label>Modalidad</label>
        <div class="flex gap-2">
          <button
            v-for="tipo in ['online', 'presencial', 'telefonica']"
            :key="tipo"
            @click="toggleTipo(tipo)"
            :class="{ active: tiposSeleccionados.includes(tipo) }"
            class="chip"
          >
            {{ tipo }}
          </button>
        </div>
      </div>

      <!-- Toggle mostrar canceladas -->
      <div>
        <label>
          <input type="checkbox" v-model="filtros.mostrar_canceladas" />
          Mostrar canceladas
        </label>
      </div>

      <!-- Botones -->
      <div class="flex gap-2">
        <button @click="aplicarFiltros" class="btn-primary">Aplicar</button>
        <button @click="limpiarFiltros" class="btn-secondary">Limpiar</button>
      </div>
    </div>

    <!-- Chips de filtros activos (siempre visibles) -->
    <div class="chips-activos flex gap-2">
      <span
        v-for="estado in estadosSeleccionados"
        :key="estado"
        class="chip active"
      >
        {{ estado }}
        <button @click="removeEstado(estado)">×</button>
      </span>

      <span v-if="filtros.paciente_id" class="chip active">
        {{ getPacienteNombre(filtros.paciente_id) }}
        <button @click="filtros.paciente_id = ''">×</button>
      </span>

      <span
        v-for="tipo in tiposSeleccionados"
        :key="tipo"
        class="chip active"
      >
        {{ tipo }}
        <button @click="removeTipo(tipo)">×</button>
      </span>

      <span v-if="filtros.mostrar_canceladas" class="chip active">
        Mostrar canceladas
        <button @click="filtros.mostrar_canceladas = false">×</button>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const filtros = ref({
  estados: [] as string[],
  paciente_id: '',
  tipos: [] as string[],
  mostrar_canceladas: false
})

const filtrosActivos = computed(() => {
  let count = filtros.value.estados.length
  if (filtros.value.paciente_id) count++
  count += filtros.value.tipos.length
  if (filtros.value.mostrar_canceladas) count++
  return count
})

watch(filtros, (newFiltros) => {
  emit('filtrosChanged', newFiltros)
  agendaLogger.filterChange(newFiltros)
}, { deep: true })
</script>
```

**Checklist:**
- [ ] Botón "Filtros" con contador
- [ ] Panel de filtros colapsable
- [ ] Chips persistentes de filtros activos
- [ ] Eliminar chip individual con "×"
- [ ] Botón "Limpiar todo"
- [ ] Emitir evento cuando cambian filtros
- [ ] Integrar con lista de citas

---

## 📋 Fase 4: Migración de Base de Datos (OPCIONAL)

### 4.1. Crear migración SQL

```sql
-- migrations/add_timestamp_columns.sql

-- 1. Agregar nuevas columnas
ALTER TABLE citas
  ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ;

-- 2. Migrar datos existentes
UPDATE citas
SET
  start_at = (fecha_cita || ' ' || hora_inicio)::TIMESTAMPTZ,
  end_at = (fecha_cita || ' ' || hora_fin)::TIMESTAMPTZ
WHERE start_at IS NULL;

-- 3. Crear índices
CREATE INDEX IF NOT EXISTS idx_citas_start_at ON citas(start_at);
CREATE INDEX IF NOT EXISTS idx_citas_terapeuta_start ON citas(terapeuta_id, start_at);

-- 4. (Opcional) Hacer NOT NULL después de verificar migración
-- ALTER TABLE citas
--   ALTER COLUMN start_at SET NOT NULL,
--   ALTER COLUMN end_at SET NOT NULL;

-- 5. (Opcional) Deprecar columnas antiguas en el futuro
-- ALTER TABLE citas
--   DROP COLUMN fecha_cita,
--   DROP COLUMN hora_inicio,
--   DROP COLUMN hora_fin;
```

**Checklist:**
- [ ] Ejecutar migración en desarrollo
- [ ] Verificar que datos migran correctamente
- [ ] Actualizar `useCitas.ts` para usar `start_at`/`end_at`
- [ ] Actualizar RPC functions si es necesario
- [ ] Ejecutar en producción después de pruebas exhaustivas

### 4.2. Actualizar queries para usar timestamptz

```typescript
// composables/useCitas.ts

// ANTES
const { data } = await supabase
  .from('citas')
  .select('*')
  .eq('fecha_cita', fecha)
  .order('hora_inicio')

// DESPUÉS (con timestamptz)
import { toUTC, fromUTC } from '~/utils/timezone'

const startOfDay = toUTC(fecha, '00:00')
const endOfDay = toUTC(fecha, '23:59')

const { data } = await supabase
  .from('citas')
  .select('*')
  .gte('start_at', startOfDay)
  .lt('start_at', endOfDay)
  .order('start_at')

// Convertir resultados a formato UI
const citasUI = data.map(cita => {
  const { date, time: hora_inicio } = fromUTC(cita.start_at)
  const { time: hora_fin } = fromUTC(cita.end_at)

  return {
    ...cita,
    fecha_cita: date,
    hora_inicio,
    hora_fin
  }
})
```

**Checklist:**
- [ ] Actualizar `getCitas` para usar timestamps
- [ ] Actualizar `getCitasRango` para usar timestamps
- [ ] Convertir UTC → Local en todas las queries
- [ ] Convertir Local → UTC en todas las inserciones/updates
- [ ] Probar en diferentes zonas horarias (dev tools)

---

## 📋 Fase 5: Testing End-to-End

### 5.1. Test de Creación de Cita

```bash
# Manual testing checklist
1. [ ] Click en celda vacía → modal abre con fecha/hora pre-rellenada
2. [ ] Buscar paciente → autocomplete funciona
3. [ ] Crear paciente rápido → modal inline aparece
4. [ ] Seleccionar horario que se superpone → error claro
5. [ ] Crear cita válida → aparece inmediatamente en grid
6. [ ] Verificar en DB que está en UTC
7. [ ] Recargar página → cita sigue visible con hora correcta
```

### 5.2. Test de Drag & Drop

```bash
1. [ ] Arrastrar cita a celda vacía → mueve inmediatamente
2. [ ] Arrastrar a celda ocupada → error, rollback a posición original
3. [ ] Arrastrar a otro día → actualiza fecha correctamente
4. [ ] Verificar duración se mantiene
5. [ ] Ver logs en consola → eventos drag_start, drag_end, move
```

### 5.3. Test de Estados

```bash
1. [ ] Crear cita en estado "pendiente"
2. [ ] Cambiar a "confirmada" → funciona
3. [ ] Cambiar a "realizada" → funciona
4. [ ] Intentar cambiar de "realizada" a "pendiente" → error
5. [ ] Ver logs → evento status_change registrado
```

### 5.4. Test de Filtros

```bash
1. [ ] Activar filtro "confirmada" → solo muestra confirmadas
2. [ ] Agregar filtro de paciente → combina filtros
3. [ ] Ver chips de filtros activos → aparecen correctamente
4. [ ] Eliminar chip → filtro se quita
5. [ ] Botón "Limpiar" → todos los filtros se resetean
```

### 5.5. Test de Performance

```bash
1. [ ] Cargar semana con 50+ citas → <1 segundo
2. [ ] Drag & drop → <500ms respuesta
3. [ ] Validación → <300ms respuesta
4. [ ] Búsqueda de pacientes → <200ms (debounced)
5. [ ] Ver logs en consola → no hay warnings
```

---

## 📋 Fase 6: Documentación Final

- [ ] **Actualizar README.md** con nuevas funcionalidades
- [ ] **Crear guía de uso** para terapeutas
- [ ] **Documentar APIs** (Swagger/OpenAPI opcional)
- [ ] **Screenshots** de nuevas funcionalidades
- [ ] **Video demo** (opcional, 2-3 minutos)

---

## 🚀 Comandos Rápidos

```bash
# Tests
npm run test
npm run test:watch
npm run test -- timezone

# Build
npm run build

# Dev
npm run dev

# Lint
npm run lint

# Ver logs de agenda en consola del navegador
agendaLogger.getBuffer()
agendaLogger.downloadLogs()
```

---

## ✅ Estado Actual

**Completado:**
- ✅ Fase 1: Verificación de Base (100%)
- ✅ Fase 2: Integración Básica (0% - Siguiente paso)

**Pendiente:**
- 🔲 Fase 3: Mejoras de UX (0%)
- 🔲 Fase 4: Migración DB (0% - Opcional)
- 🔲 Fase 5: Testing E2E (0%)
- 🔲 Fase 6: Documentación Final (0%)

**Próximo paso:** Integrar `useAgendaEnhanced` en archivos existentes y probar creación/edición de citas.

---

**Fecha**: 2025-12-22
**Versión**: 1.0.0
