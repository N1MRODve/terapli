# 🚀 Agenda Rediseñada - Guía Rápida de Implementación

## ✅ Estado Actual

**Componentes Completados** (6/7):
- ✅ `types.ts` - Sistema de tipos compartidos
- ✅ `AgendaLegend.vue` - Leyenda de estados  
- ✅ `AgendaEventCard.vue` - Tarjeta de evento
- ✅ `AgendaHeader.vue` - Header con navegación
- ✅ `AgendaFilters.vue` - Filtros avanzados
- ✅ `AgendaGrid.vue` - Grilla (día/semana/mes)
- ⚠️ `pages/agenda/index.vue` - Orquestador (requiere ajustes de interfaz)

---

## ⚠️ Ajustes Requeridos en `pages/agenda/index.vue`

El composable `useAgenda()` usa una estructura de datos diferente a la esperada:

### Nombres de Propiedades Correctos

| AgendaEvent (esperado) | Cita (real useAgenda) |
|---|---|
| `fecha` | `fecha_cita` |
| `horaInicio` | `hora_inicio` |
| `horaFin` | `hora_fin` |
| `paciente.nombre` | `paciente.nombre_completo` |
| `terapeuta` (objeto) | `terapeuta_id` (solo ID) |
| `notas` | `observaciones` |
| `enlace` | ❌ No existe |

### Función Correcta para Cargar Citas
```typescript
// ❌ Incorrecto
const { obtenerCitas } = useAgenda()

// ✅ Correcto
const { getCitasDelTerapeuta, citas, loading } = useAgenda()

onMounted(() => {
  getCitasDelTerapeuta()
})
```

### Mapeo Correcto de Eventos
```typescript
const eventosMapeados = computed((): AgendaEvent[] => {
  if (!citas.value?.length) return []
  
  return citas.value.map(cita => ({
    id: cita.id,
    pacienteNombre: cita.paciente?.nombre_completo || 'Sin paciente', // ✅
    pacienteId: cita.paciente_id,
    estado: cita.estado as AgendaEvent['estado'],
    fecha: cita.fecha_cita, // ✅ fecha_cita
    horaInicio: cita.hora_inicio, // ✅ hora_inicio
    horaFin: cita.hora_fin, // ✅ hora_fin
    modalidad: cita.modalidad as AgendaEvent['modalidad'],
    bono: cita.bono ? {
      id: cita.bono.id,
      sesionesRestantes: cita.bono.sesiones_restantes,
      sesionesTotales: cita.bono.sesiones_totales
    } : null,
    terapeuta: undefined, // ❌ useAgenda solo devuelve terapeuta_id
    notas: cita.observaciones || undefined, // ✅ observaciones
    areaTerapeutica: cita.area_terapeutica || undefined,
    tipoSesion: cita.tipo_sesion as AgendaEvent['tipoSesion'] || undefined
  }))
})
```

### Ajuste en Modales

**ModalDetallesCita** espera `isOpen` en lugar de `v-model`:
```vue
<!-- ❌ Incorrecto -->
<ModalDetallesCita
  v-model="mostrarModalDetalles"
  :cita-id="citaSeleccionada"
/>

<!-- ✅ Correcto -->
<ModalDetallesCita
  :isOpen="mostrarModalDetalles"
  :citaId="citaSeleccionada"
  @close="mostrarModalDetalles = false"
/>
```

---

## 📝 Archivos que Requieren Actualización

### 1. `/pages/agenda/index.vue`
Aplicar los ajustes mencionados arriba:
- Cambiar `obtenerCitas()` → `getCitasDelTerapeuta()`
- Cambiar `cargando` → `loading`
- Ajustar mapeo de eventos (propiedades correctas)
- Corregir props de `ModalDetallesCita`
- Remover lógica de `terapeutas` computed (no disponible sin join extra)

### 2. (Opcional) Extender `useAgenda` para incluir terapeuta
Si necesitas mostrar nombres de terapeutas en eventos, debes:

**Opción A**: Modificar `getCitasDelTerapeuta()` para incluir join:
```typescript
.select(`
  id,
  fecha_cita,
  hora_inicio,
  hora_fin,
  estado,
  modalidad,
  observaciones,
  paciente_id,
  terapeuta_id,
  terapeuta:perfiles!terapeuta_id ( 
    id,
    nombre
  ),
  bono_id,
  ...
`)
```

**Opción B**: Hacer query separado para terapeutas:
```typescript
const terapeutas = ref([])

onMounted(async () => {
  const { data } = await supabase
    .from('perfiles')
    .select('id, nombre')
    .eq('rol', 'terapeuta')
  
  terapeutas.value = data || []
})
```

---

## 🎯 Pasos para Finalizar

### Paso 1: Actualizar `pages/agenda/index.vue`
```bash
# Modificar líneas 34-35
const { getCitasDelTerapeuta, citas, loading, reprogramarCita } = useAgenda()

# Línea 65: Cambiar nombre de propiedad
pacienteNombre: cita.paciente?.nombre_completo || 'Sin paciente',

# Línea 68: Cambiar fecha
fecha: cita.fecha_cita,

# Líneas 77-80: Remover terapeuta (no disponible sin join)
terapeuta: undefined,

# Línea 82: Cambiar notas
notas: cita.observaciones || undefined,

# Línea 81: Remover enlace (no existe en BD)
// enlace: cita.enlace || undefined, // ❌ Quitar esta línea

# Línea 161: Cambiar onMounted
onMounted(() => {
  getCitasDelTerapeuta()
  // ... resto del código
})

# Líneas 369-374: Corregir ModalDetallesCita
<ModalDetallesCita
  :isOpen="mostrarModalDetalles"
  :citaId="citaSeleccionada"
  @close="mostrarModalDetalles = false; citaSeleccionada = null"
/>
```

### Paso 2: (Opcional) Añadir Enlace a BD
Si necesitas mostrar enlaces de videollamada, crea migración:
```sql
ALTER TABLE citas
ADD COLUMN enlace_videollamada TEXT;
```

### Paso 3: Probar en Desarrollo
```bash
npm run dev
# Navegar a /agenda
```

### Paso 4: Feature Flag en Producción
```vue
<!-- En header o menú -->
<button @click="$router.push('/agenda?legacyFallback=false')">
  🆕 Probar Nueva Agenda
</button>

<button @click="$router.push('/agenda?legacyFallback=true')">
  ⬅️ Volver a Agenda Clásica
</button>
```

---

## 🔍 Testing Checklist

- [ ] Vista DÍA muestra bloques horarios correctamente
- [ ] Vista SEMANA muestra grid de 7 días
- [ ] Vista MES muestra calendario mensual
- [ ] Filtros funcionan (búsqueda, estados, pacientes)
- [ ] Drag & drop reprograma citas
- [ ] Click en slot vacío abre modal nueva cita
- [ ] Click en evento abre detalles
- [ ] Dark mode persiste en localStorage
- [ ] Vista persiste en query params
- [ ] Keyboard shortcuts funcionan (j/k/t/n/f)
- [ ] Responsive en móvil/tablet/desktop
- [ ] No hay errores en consola

---

## 📚 Documentación Relacionada

- `AGENDA_REDISENO_VISUAL_RESUMEN.md` - Resumen ejecutivo completo
- `AGENDA_MEJORADA_GUIA.md` - Guía original de mejoras
- `composables/useAgenda.ts` - Composable de lógica de agenda
- `components/agenda/types.ts` - Sistema de tipos

---

## 💡 Tips de Desarrollo

1. **Sin Terapeutas Disponibles**: Si no tienes join de terapeutas, oculta el filtro:
```vue
<div v-if="false">
  <label>Terapeuta</label>
  <select v-model="terapeutaSeleccionado">...</select>
</div>
```

2. **Reprogramar con useAgenda**:
```typescript
await reprogramarCita(eventoId, nuevoSlot.date, nuevoSlot.horaInicio)
```

3. **Dark Mode Manual**:
```vue
<button @click="darkMode = !darkMode">
  {{ darkMode ? '🌙' : '☀️' }}
</button>
```

---

**¡La arquitectura de componentes está completa! Solo faltan ajustes de interfaz para conectar con `useAgenda` real.**
