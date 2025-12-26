# 🎨 MEJORAS AGENDA - Fase 5: Selección de Rango y UX Avanzada

## ✅ Estado: PARCIALMENTE COMPLETADO

**Fecha de implementación:** 2025-12-22
**Duración estimada total:** 6-8 horas
**Progreso actual:** ~30% (2/8 tareas completadas)

---

## 📋 Tareas Solicitadas

### ✅ A) Selección automática de hora en la agenda - COMPLETADO

#### Implementación realizada:

**1. Selección de rango con click-drag** ([AgendaTerapeuta.vue](components/AgendaTerapeuta.vue)):

```typescript
// Estado para selección de rango
const seleccionando = ref(false)
const rangoSeleccion = ref<{
  fechaInicio: string
  horaInicio: string
  fechaFin: string
  horaFin: string
} | null>(null)

// Funciones de selección
const onCeldaMouseDown = (fecha: string, hora: string, event: MouseEvent) => {
  // Inicia selección solo si celda vacía
  if (citaArrastrada.value || citasPorDiaHora(fecha, hora).length > 0) return

  seleccionando.value = true
  rangoSeleccion.value = { fechaInicio: fecha, horaInicio: hora, fechaFin: fecha, horaFin: hora }
}

const onCeldaMouseEnter = (fecha: string, hora: string) => {
  // Actualiza fin del rango mientras arrastra
  if (!seleccionando.value || !rangoSeleccion.value) return
  rangoSeleccion.value.fechaFin = fecha
  rangoSeleccion.value.horaFin = hora
}

const onCeldaMouseUp = (event: MouseEvent) => {
  // Abre modal con rango pre-seleccionado
  const horaFinCalculada = calcularHoraFin(horaFin, 60) // +60 min por defecto

  fechaPreseleccionada.value = fechaInicio
  horaPreseleccionada.value = horaInicio
  horaFinPreseleccionada.value = horaFinCalculada

  mostrarModalNuevaCita.value = true
}
```

**2. Resaltado visual de celdas seleccionadas**:

Clase CSS aplicada durante selección:
```vue
:class="[
  esHoy(dia.fecha) ? 'bg-blue-50/20' : '',
  esCeldaObjetivo(dia.fecha, hora) ? 'bg-blue-100 ring-2 ring-blue-500 ring-inset' : '',
  esCeldaEnRango(dia.fecha, hora) ? 'bg-[#027368]/20 ring-2 ring-[#027368] ring-inset' : ''
]"
```

Resaltado verde teal (#027368) indica el rango seleccionado visualmente.

**3. Eventos de mouse en celdas del calendario**:

```vue
<div
  @mousedown="citasPorDiaHora(dia.fecha, hora).length === 0 ? onCeldaMouseDown(dia.fecha, hora, $event) : null"
  @mouseenter="onCeldaMouseEnter(dia.fecha, hora)"
  @click="citasPorDiaHora(dia.fecha, hora).length === 0 && !seleccionando ? handleSlotClick({ date: dia.fecha, horaInicio: hora }) : null"
>
```

**4. Listener global para mouseup**:

```typescript
onMounted(async () => {
  await loadTerapeutaAppointments()
  document.addEventListener('mouseup', onCeldaMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mouseup', onCeldaMouseUp)
})
```

**5. Actualización del modal enhanced** ([ModalNuevaCitaEnhanced.vue](components/ModalNuevaCitaEnhanced.vue)):

```typescript
// Nueva prop horaFinal
const props = defineProps<{
  isOpen: boolean
  fechaInicial?: string
  horaInicial?: string
  horaFinal?: string  // ← NUEVO
}>()

// Watch actualizado para usar horaFinal si existe
watch(() => formData.value.hora_inicio, (newHora) => {
  if (newHora && !props.horaFinal) {
    // Solo auto-calcular si no viene horaFinal de props
    const totalMinutes = hours * 60 + minutes + 50
    formData.value.hora_fin = calcularHoraFin(totalMinutes)
  }
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.fechaInicial) formData.value.fecha_cita = props.fechaInicial
    if (props.horaInicial) formData.value.hora_inicio = props.horaInicial
    if (props.horaFinal) formData.value.hora_fin = props.horaFinal  // ← NUEVO
  }
})
```

**Compatibilidad con atajos y botón "Nueva Cita":**
- ✅ Si se abre el modal sin props, campos vacíos como antes
- ✅ Click simple (sin arrastrar) usa duración por defecto de 50 minutos
- ✅ Click-drag usa el rango seleccionado
- ✅ Atajo "n" funciona igual (sin props)

---

### ⏳ B) Mejoras del modal de Nueva Cita - EN PROGRESO

#### 1. ✅ Búsqueda y creación rápida de pacientes - YA IMPLEMENTADO (Fase 4)

Ya está completamente funcional:
- Búsqueda inteligente por nombre/email/teléfono
- Dropdown con resultados en tiempo real
- Botón "Crear paciente" con subformulario inline
- Auto-selección después de crear

#### 2. ⏳ Resumen del paciente seleccionado - PENDIENTE

**Objetivo:** Mostrar panel de lectura con:
- Estado (activo/en pausa)
- Última sesión
- Próxima sesión
- Evolución/progreso
- Notas clínicas importantes

**Ubicación sugerida:** Debajo del paciente seleccionado en el modal

**Código pendiente:**
```vue
<!-- A implementar en ModalNuevaCitaEnhanced.vue -->
<PacienteResumen
  v-if="pacienteSeleccionado"
  :paciente-id="pacienteSeleccionado.id"
/>
```

#### 3. ⏳ Detalles de programación mejorados - PARCIALMENTE IMPLEMENTADO

**✅ Ya implementado:**
- Fecha y hora con pre-selección desde click-drag
- Hora fin auto-calculada o desde selección de rango

**⏳ Pendiente:**
- Selector de duración (15, 30, 45, 60 min)
- Ajuste automático de hora fin al cambiar duración
- Modificación manual de hora fin

**Código pendiente:**
```vue
<!-- Selector de duración -->
<div class="grid grid-cols-4 gap-2">
  <button
    v-for="duracion in [15, 30, 45, 60]"
    :key="duracion"
    @click="ajustarDuracion(duracion)"
    :class="duracionSeleccionada === duracion ? 'bg-[#027368] text-white' : 'bg-gray-100'"
  >
    {{ duracion }} min
  </button>
</div>
```

#### 4. ⏳ Tipo de sesión con campos condicionales - PARCIALMENTE IMPLEMENTADO

**✅ Ya implementado:**
- Selector de modalidad (Presencial/Online/Teléfono)
- Campo de ubicación (si presencial)
- Campo de enlace videollamada (si online)

**⏳ Pendiente:**
- Mejorar validación de campos condicionales
- Añadir selector de estado (Pendiente/Confirmada)

**Código pendiente:**
```vue
<!-- Selector de estado -->
<label>Estado inicial</label>
<select v-model="formData.estado">
  <option value="pending">Pendiente</option>
  <option value="confirmed">Confirmada</option>
</select>
```

#### 5. ⏳ Repetición de citas - NO IMPLEMENTADO

**Objetivo:** Crear citas recurrentes (semanal, quincenal, mensual)

**Diseño propuesto:**
```vue
<!-- Selector de repetición -->
<div v-if="mostrarRepeticion">
  <label>Repetir</label>
  <select v-model="repeticion.frecuencia">
    <option value="none">No repetir</option>
    <option value="weekly">Semanal</option>
    <option value="biweekly">Quincenal</option>
    <option value="monthly">Mensual</option>
  </select>

  <label v-if="repeticion.frecuencia !== 'none'">
    Número de repeticiones
  </label>
  <input v-model.number="repeticion.cantidad" type="number" min="1" max="52" />
</div>
```

**Lógica backend necesaria:**
```typescript
async function crearCitasRecurrentes(baseParams: CreateAppointmentParams, repeticion: { frecuencia: string, cantidad: number }) {
  const citas = []

  for (let i = 0; i < repeticion.cantidad; i++) {
    const fecha = calcularFechaRecurrente(baseParams.fecha_cita, repeticion.frecuencia, i)
    citas.push(await createAppointment({ ...baseParams, fecha_cita: fecha }))
  }

  return citas
}
```

#### 6. ⏳ Notas y adjuntos - NO IMPLEMENTADO

**✅ Ya implementado:**
- Campo de observaciones (textarea)

**⏳ Pendiente:**
- Drag & drop de archivos adjuntos
- Validación de tamaño/tipo de archivo
- Subida a Supabase Storage

**Código pendiente:**
```vue
<!-- Zona de drag & drop -->
<div
  class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center"
  @dragover.prevent
  @drop.prevent="handleFileDrop"
>
  <input type="file" ref="fileInput" class="hidden" @change="handleFileSelect" />
  <p class="text-sm text-gray-600">Arrastra archivos aquí o haz click para seleccionar</p>
  <button @click="$refs.fileInput.click()">Seleccionar archivo</button>
</div>

<!-- Lista de archivos -->
<div v-for="file in archivosAdjuntos" :key="file.name">
  {{ file.name }} ({{ formatFileSize(file.size) }})
  <button @click="removeFile(file)">×</button>
</div>
```

#### 7. ⏳ Validación mejorada de solapes - PARCIALMENTE IMPLEMENTADO

**✅ Ya implementado (Fase 4):**
- Validación en tiempo real
- Mensaje de error si hay conflicto

**⏳ Pendiente:**
- Sugerencias de horarios libres alternativos
- Vista de disponibilidad

**Código pendiente:**
```typescript
async function sugerirHorariosAlternativos(fecha: string, duracionMinutos: number) {
  const horariosLibres = []

  for (const hora of horasDelDia) {
    const validation = await validateAppointment({
      fecha_cita: fecha,
      hora_inicio: hora,
      hora_fin: calcularHoraFin(hora, duracionMinutos)
    })

    if (validation.valid) {
      horariosLibres.push(hora)
    }
  }

  return horariosLibres
}
```

**UI sugerida:**
```vue
<div v-if="validationMessage?.type === 'error'">
  <p class="text-red-800">{{ validationMessage.text }}</p>
  <div v-if="horariosAlternativos.length > 0" class="mt-3">
    <p class="text-sm font-medium">Horarios disponibles:</p>
    <div class="flex gap-2 mt-2">
      <button
        v-for="hora in horariosAlternativos"
        :key="hora"
        @click="seleccionarHorario(hora)"
        class="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-sm hover:bg-emerald-200"
      >
        {{ hora }}
      </button>
    </div>
  </div>
</div>
```

#### 8. ⏳ Accesibilidad - PARCIALMENTE IMPLEMENTADO

**✅ Ya implementado:**
- Modal se cierra con Esc (HeadlessUI)
- Orden lógico de tabulación

**⏳ Pendiente:**
- Añadir `aria-label` en todos los botones
- `aria-required` en campos obligatorios
- Anuncios de estado para lectores de pantalla

**Código pendiente:**
```vue
<input
  v-model="formData.fecha_cita"
  aria-label="Fecha de la cita"
  aria-required="true"
/>

<button
  @click="createAppointment"
  aria-label="Crear nueva cita"
  :aria-disabled="!canSubmit"
>
  Guardar
</button>

<!-- Región de anuncios -->
<div role="status" aria-live="polite" class="sr-only">
  {{ announcements }}
</div>
```

---

## 📊 Progreso por Tarea

| Tarea | Estado | Progreso | Complejidad |
|-------|--------|----------|-------------|
| A) Selección de rango click-drag | ✅ Completo | 100% | Media |
| B1) Búsqueda pacientes | ✅ Completo | 100% | Alta |
| B2) Resumen paciente | ⏳ Pendiente | 0% | Media |
| B3) Detalles programación | 🟡 Parcial | 40% | Media |
| B4) Tipo sesión condicional | 🟡 Parcial | 60% | Baja |
| B5) Repetición citas | ⏳ Pendiente | 0% | Alta |
| B6) Notas y adjuntos | 🟡 Parcial | 20% | Media |
| B7) Validación mejorada | 🟡 Parcial | 50% | Media |
| B8) Accesibilidad | 🟡 Parcial | 40% | Baja |

**Progreso total estimado: 30%** (2 de 8 tareas completadas completamente)

---

## 📝 Archivos Modificados

### Completados:
1. ✅ [components/AgendaTerapeuta.vue](components/AgendaTerapeuta.vue) - Líneas 75-92, 300-406, 568-578, 862-872
2. ✅ [components/ModalNuevaCitaEnhanced.vue](components/ModalNuevaCitaEnhanced.vue) - Líneas 388-393, 645-681

### Pendientes de crear:
3. ⏳ components/PacienteResumen.vue
4. ⏳ composables/useRecurringAppointments.ts
5. ⏳ server/api/appointments/suggest-times.ts

---

## 🧪 Testing Manual

### ✅ Funcionalidad completada (A - Selección de rango):

**Probar selección de rango:**
1. Ir a `/terapeuta/agenda`
2. En vista calendario, hacer mousedown en una celda vacía
3. Sin soltar, arrastrar hacia abajo (2-3 horas)
4. Soltar mouseup
5. ✅ Verificar que se resalta el rango en verde
6. ✅ Verificar que se abre el modal con fecha/hora inicio/fin
7. ✅ Verificar que hora_fin es correcta (1 hora después de última celda seleccionada)

**Probar click simple (sin drag):**
1. Click en celda vacía (sin arrastrar)
2. ✅ Verificar que abre modal con hora_inicio pre-seleccionada
3. ✅ Verificar que hora_fin = hora_inicio + 50 min

**Probar compatibilidad:**
1. Botón "Nueva Cita"
2. ✅ Verificar que campos están vacíos
3. Atajo "n"
4. ✅ Verificar que campos están vacíos

### ⏳ Funcionalidad pendiente (B2-B8):

- [ ] Crear paciente desde modal y ver resumen automático
- [ ] Cambiar duración y verificar que hora_fin se actualiza
- [ ] Seleccionar modalidad y ver campos condicionales
- [ ] Crear cita recurrente semanal (4 semanas)
- [ ] Subir archivo adjunto a cita
- [ ] Intentar crear cita en horario ocupado y ver sugerencias
- [ ] Navegar modal completo solo con teclado

---

## 🚀 Próximos Pasos Sugeridos

### Prioridad Alta (Completar Fase 5):

1. **Crear componente PacienteResumen** (2-3 horas)
   - Mostrar última sesión, próxima sesión, evolución
   - Integrar en ModalNuevaCitaEnhanced

2. **Selector de duración** (1 hora)
   - Botones 15/30/45/60 min
   - Auto-ajuste de hora_fin

3. **Validación con sugerencias** (2 horas)
   - Endpoint `/api/appointments/suggest-times`
   - UI para mostrar horarios alternativos

### Prioridad Media (Features avanzados):

4. **Citas recurrentes** (3-4 horas)
   - Composable useRecurringAppointments
   - Lógica de creación múltiple
   - Validación de cada cita individual

5. **Adjuntos de archivos** (2-3 horas)
   - Drag & drop
   - Subida a Supabase Storage
   - Gestión de permisos

### Prioridad Baja (Polish):

6. **Accesibilidad completa** (1-2 horas)
   - aria-labels en todos los elementos
   - Anuncios de estado
   - Testing con lector de pantalla

---

## 💡 Lecciones Aprendidas

1. **Click-drag requiere listener global de mouseup** - Si solo escuchas en la celda, se pierde el evento al salir del elemento
2. **Preservar compatibilidad** - Importante mantener flujos existentes (botón, atajo) al agregar nuevas funcionalidades
3. **Calcular hora fin es tricky** - Manejar edge cases (23:30 + 60 min = 00:30 del día siguiente)
4. **Resaltado visual es clave** - Feedback inmediato mejora UX significativamente

---

## 📖 Referencias Técnicas

- [MDN - Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [MDN - Mouse Events](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent)
- [HeadlessUI Dialog Accessibility](https://headlessui.com/vue/dialog)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Estado actual: Build en progreso, 2/8 tareas completadas**
**Siguiente paso: Esperar confirmación del usuario sobre qué priorizar**
