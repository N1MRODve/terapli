# 👤 Vista de Perfil del Paciente - Documentación Completa

## 📌 Resumen

Se ha creado una **vista completa del perfil del paciente** con toda la información necesaria para el seguimiento terapéutico, incluyendo datos personales, bonos, sesiones, estadísticas y funcionalidad de WhatsApp.

---

## ✅ Características Implementadas

### 1. **Encabezado del Paciente** 🎯

**Información mostrada:**
- ✅ Avatar con iniciales y color único
- ✅ Nombre completo del paciente
- ✅ Estado del vínculo (En proceso / En pausa / Finalizado) con color
- ✅ Email de contacto
- ✅ Teléfono (si existe)
- ✅ Área de acompañamiento
- ✅ Frecuencia de sesiones

**Botones de acción:**
- ✅ **💬 Enviar WhatsApp** - Abre WhatsApp con mensaje predeterminado
- ✅ **📅 Agendar sesión** - Abre modal para nueva cita
- ✅ **✏️ Editar** - Editar datos del paciente

---

### 2. **Tarjetas de Resumen** 📊

#### Tarjeta 1: Estadísticas Rápidas
- ✅ Total de sesiones
- ✅ Sesiones completadas (verde)
- ✅ Sesiones pendientes (amarillo)
- ✅ Próximas sesiones (azul)

#### Tarjeta 2: Bono Contratado 🎫
- ✅ Sesiones disponibles (grande y destacado)
- ✅ Sesiones totales
- ✅ Barra de progreso visual
- ✅ Porcentaje de uso
- ✅ Sesiones usadas
- ✅ Precio pagado (formateado en €)
- ✅ Frecuencia sugerida
- ✅ Mensaje si no hay bono activo

#### Tarjeta 3: Datos del Proceso 📋
- ✅ Primera sesión (fecha)
- ✅ Última sesión (fecha)
- ✅ Próxima sesión (fecha + hora + modalidad + estado)
- ✅ Tiempo en proceso (calculado automáticamente)

---

### 3. **Sistema de Tabs** 📑

Navegación por pestañas con badges que muestran la cantidad:

#### Tab 1: Próximas Sesiones 📅
**Muestra:**
- ✅ Lista de sesiones futuras (pendientes + confirmadas)
- ✅ Fecha formateada (ej: "lun, 28 de oct de 2024")
- ✅ Hora de inicio y fin
- ✅ Modalidad con icono (🏥 presencial / 💻 online / 📞 telefónica)
- ✅ Estado con color
- ✅ Observaciones (si existen)
- ✅ Botón "Ver detalles" para abrir modal completo
- ✅ Mensaje si no hay sesiones + botón para agendar primera

**Acciones:**
- Click en "+ Nueva sesión" para agendar
- Click en "Ver detalles" para abrir `ModalDetallesCita`

#### Tab 2: Sesiones Completadas ✅
**Muestra:**
- ✅ Historial de sesiones realizadas
- ✅ Fecha y hora
- ✅ Modalidad con icono y color
- ✅ Badge "✓ Realizada" (azul)
- ✅ **Notas del terapeuta** destacadas en caja blanca
- ✅ Observaciones (si no hay notas)
- ✅ Mensaje si aún no hay sesiones completadas

**Ordenamiento:**
- Más recientes primero

#### Tab 3: Pendientes de Confirmar ⏳
**Muestra:**
- ✅ Sesiones en estado "pendiente"
- ✅ Fondo amarillo destacado
- ✅ Icono ⏳
- ✅ Fecha y hora
- ✅ Modalidad con icono
- ✅ Badge "Pendiente de confirmar"
- ✅ Observaciones

**Acciones:**
- ✅ Botón "✓ Confirmar" - Cambia estado a confirmada
- ✅ Botón "Ver" - Abre modal de detalles

#### Tab 4: Historial Completo 📚
**Muestra:**
- ✅ TODAS las sesiones (pasadas, presentes, futuras)
- ✅ Todos los estados (pendiente, confirmada, realizada, cancelada)
- ✅ Fecha y hora
- ✅ Modalidad con icono
- ✅ Estado con color

**Ordenamiento:**
- Más recientes primero

---

### 4. **Notas Clínicas Privadas** 📝

Componente `NotasPrivadas` integrado:
- ✅ Editor de texto enriquecido
- ✅ Guardado automático en base de datos
- ✅ Última actualización mostrada
- ✅ Solo visible para la terapeuta

---

### 5. **Integración con WhatsApp** 💬

**Función `abrirWhatsApp()`:**

```typescript
const abrirWhatsApp = () => {
  const telefono = pacienteData.value?.telefono
  if (!telefono) {
    alert('Este paciente no tiene teléfono registrado')
    return
  }

  // Limpiar el número
  const numeroLimpio = telefono.replace(/\D/g, '')
  
  // Mensaje predeterminado
  const mensaje = encodeURIComponent(`Hola ${nombreCompleto.value}, ¿cómo estás?`)
  
  // Abrir WhatsApp
  const url = `https://wa.me/${numeroLimpio}?text=${mensaje}`
  window.open(url, '_blank')
}
```

**Funcionalidad:**
- ✅ Verifica que el paciente tenga teléfono registrado
- ✅ Limpia el número (elimina espacios, guiones, etc.)
- ✅ Crea mensaje personalizado con el nombre del paciente
- ✅ Abre WhatsApp Web (desktop) o app (móvil)
- ✅ Mensaje pre-escrito listo para enviar
- ✅ Compatible con números internacionales

**Botón:**
- 💬 Color verde (WhatsApp branding)
- Texto: "Enviar WhatsApp"
- Hover effect
- Ubicación: Cabecera del perfil

---

## 🎨 Diseño Visual

### Colores por Estado

| Estado | Color | Clase CSS |
|--------|-------|-----------|
| **En proceso** | 🟢 Verde | `bg-green-100 text-green-700` |
| **En pausa** | 🟡 Amarillo | `bg-yellow-100 text-yellow-700` |
| **Finalizado** | ⚫ Gris | `bg-gray-100 text-gray-600` |

### Colores por Estado de Sesión

| Estado | Color | Clase CSS |
|--------|-------|-----------|
| **Confirmada** | 🟢 Verde | `bg-green-100 text-green-700` |
| **Pendiente** | 🟡 Amarillo | `bg-yellow-100 text-yellow-700` |
| **Realizada** | 🔵 Azul | `bg-blue-100 text-blue-700` |
| **Cancelada** | 🔴 Rojo | `bg-red-100 text-red-700` |

### Colores por Modalidad

| Modalidad | Icono | Color | Clase CSS |
|-----------|-------|-------|-----------|
| **Presencial** | 🏥 | Verde | `bg-green-100 text-green-700` |
| **Online** | 💻 | Terracota | `bg-terracota/20 text-terracota` |
| **Telefónica** | 📞 | Azul | `bg-blue-100 text-blue-700` |

### Responsive
- ✅ **Desktop**: Grid de 3 columnas
- ✅ **Tablet**: Grid de 2 columnas
- ✅ **Móvil**: 1 columna, scroll vertical

---

## 📊 Lógica de Datos

### Computed Properties

```typescript
// Filtros de sesiones
const sesionesProximas = computed(() => {
  return citas futuras con estado pendiente/confirmada
  ordenadas por fecha ascendente
})

const sesionesCompletadas = computed(() => {
  return citas con estado 'realizada'
  ordenadas por fecha descendente
})

const sesionesPendientes = computed(() => {
  return citas con estado 'pendiente'
  ordenadas por fecha ascendente
})

const todasLasSesiones = computed(() => {
  return todas las citas
  ordenadas por fecha descendente
})

// Estadísticas
const estadisticas = computed(() => ({
  total: todas las citas,
  completadas: sesiones realizadas,
  pendientes: sesiones pendientes,
  proximas: sesiones futuras
}))

// Fechas importantes
const primeraSesion = computed(() => 
  sesión realizada más antigua
)

const ultimaSesion = computed(() => 
  sesión realizada más reciente
)

const proximaSesion = computed(() => 
  primera sesión futura pendiente/confirmada
)
```

### Funciones de Carga

```typescript
// Cargar datos del paciente
await cargarDatosPaciente()
  ↓
  - Obtener paciente de DB
  - Cargar todas las citas (getCitas)
  - Filtrar por paciente_id
  - Cargar bono activo
  - Cargar notas clínicas

// Cargar bono
await cargarBonoActivo()
  ↓
  - Query a tabla 'bonos'
  - Filtrar por paciente_id y activo=true
  - Calcular sesiones disponibles
  - Calcular porcentaje de uso

// Cargar notas
await cargarNotas()
  ↓
  - Query a tabla 'notas_terapeuticas'
  - Filtrar por paciente_id y psicologa_id
  - Ordenar por updated_at DESC
  - Obtener la más reciente
```

---

## 🧪 Cómo Probar

### Test 1: Visualización Básica
```
1. Ir a /terapeuta/pacientes
2. Click en cualquier paciente
3. Verificar que se carga:
   ✅ Avatar con iniciales
   ✅ Nombre completo
   ✅ Estado del vínculo
   ✅ Email y teléfono
   ✅ 3 tarjetas de resumen
   ✅ Tabs de navegación
```

### Test 2: WhatsApp
```
1. En perfil del paciente
2. Click en "💬 Enviar WhatsApp"
3. Verificar que:
   ✅ Abre WhatsApp Web o app
   ✅ Número correcto
   ✅ Mensaje pre-escrito con nombre del paciente
```

**Si no tiene teléfono:**
- ✅ Muestra alert: "Este paciente no tiene teléfono registrado"

### Test 3: Bono Activo
```
Caso 1: Paciente CON bono
✅ Muestra sesiones disponibles
✅ Barra de progreso correcta
✅ Porcentaje de uso
✅ Precio formateado

Caso 2: Paciente SIN bono
✅ Muestra emoji grande difuminado
✅ Mensaje: "No hay bono activo"
✅ Botón "Crear nuevo bono"
```

### Test 4: Tabs de Sesiones

**Tab Próximas:**
```
1. Click en tab "Próximas Sesiones"
2. Verificar:
   ✅ Solo sesiones futuras
   ✅ Solo estados: pendiente/confirmada
   ✅ Ordenadas: más próxima primero
   ✅ Botón "Ver detalles" funciona
```

**Tab Completadas:**
```
1. Click en tab "Completadas"
2. Verificar:
   ✅ Solo sesiones con estado 'realizada'
   ✅ Ordenadas: más reciente primero
   ✅ Notas del terapeuta visibles (si existen)
   ✅ Badge azul "✓ Realizada"
```

**Tab Pendientes:**
```
1. Click en tab "Pendientes"
2. Verificar:
   ✅ Solo sesiones con estado 'pendiente'
   ✅ Fondo amarillo
   ✅ Botón "✓ Confirmar" funciona
   ✅ Al confirmar, se mueve a tab "Próximas"
```

**Tab Historial:**
```
1. Click en tab "Historial"
2. Verificar:
   ✅ Todas las sesiones (todos los estados)
   ✅ Ordenadas: más reciente primero
```

### Test 5: Agendar Sesión
```
1. Click en "📅 Agendar sesión"
2. Verificar:
   ✅ Abre ModalNuevaCita
   ✅ Paciente pre-seleccionado
   ✅ Datos pre-cargados (email, teléfono, frecuencia)
3. Crear cita
4. Verificar:
   ✅ Modal se cierra
   ✅ Datos se refrescan automáticamente
   ✅ Nueva cita aparece en tab "Próximas"
```

### Test 6: Ver Detalles de Cita
```
1. En cualquier tab de sesiones
2. Click en "Ver detalles" de una sesión
3. Verificar:
   ✅ Abre ModalDetallesCita
   ✅ Muestra información completa
   ✅ Incluye datos del bono
   ✅ Incluye otras sesiones del paciente
```

### Test 7: Confirmar Sesión Pendiente
```
1. Tab "Pendientes"
2. Click en "✓ Confirmar"
3. Verificar:
   ✅ Estado cambia a 'confirmada'
   ✅ Sesión desaparece de "Pendientes"
   ✅ Sesión aparece en "Próximas"
   ✅ Badge cambia de amarillo a verde
```

### Test 8: Notas Clínicas
```
1. Scroll hasta "Notas Clínicas Privadas"
2. Escribir contenido
3. Esperar guardado automático
4. Recargar página
5. Verificar:
   ✅ Contenido se mantiene
   ✅ "Última actualización" actualizada
```

### Test 9: Estadísticas
```
Verificar que los números coinciden:
✅ Total sesiones = suma de todas
✅ Completadas = sesiones con estado 'realizada'
✅ Pendientes = sesiones con estado 'pendiente'
✅ Próximas = sesiones futuras (pendiente + confirmada)
```

### Test 10: Responsive
```
Desktop:
✅ Grid de 3 columnas
✅ Tabs en línea horizontal

Tablet:
✅ Grid adapta a 2 columnas
✅ Tabs visibles

Móvil:
✅ Grid de 1 columna
✅ Tabs con scroll horizontal
✅ Botones de acción verticales
✅ WhatsApp accesible
```

---

## 📋 Casos Edge Manejados

| Caso | Manejo |
|------|--------|
| Paciente sin nombre | Muestra "Sin nombre" |
| Paciente sin teléfono | Alert al intentar WhatsApp |
| Paciente sin email | Muestra cadena vacía |
| Sin bono activo | Muestra mensaje + botón crear |
| Sin sesiones | Muestra mensaje apropiado en cada tab |
| Sin notas clínicas | Editor vacío listo para escribir |
| Sin próxima sesión | Muestra "No hay sesión agendada" |
| Primera sesión no registrada | Muestra "Sin registro" |
| Error al cargar | Muestra mensaje de error + botón volver |
| Error al confirmar cita | Alert con mensaje de error |

---

## 🔌 Integraciones

### Con Componentes Existentes

1. **ModalNuevaCita**
   - Recibe paciente pre-seleccionado
   - Emite evento `@cita-creada`
   - Recarga datos automáticamente

2. **ModalDetallesCita**
   - Recibe ID de cita
   - Muestra información completa
   - Incluye datos del bono
   - Incluye próximas sesiones

3. **NotasPrivadas**
   - Recibe pacienteId
   - Recibe contenido inicial
   - Emite evento `@guardar`
   - Guarda en base de datos

### Con Composables

1. **useCitas**
   - Usa `getCitas()` para obtener todas las citas
   - Filtra por `paciente_id`
   - No duplica lógica

2. **useSupabase**
   - Queries directas a tablas
   - Manejo de errores
   - Autenticación automática

---

## 💾 Estructura de Datos

### Paciente
```typescript
{
  id: string
  nombre_completo: string
  email: string
  telefono?: string
  area_de_acompanamiento?: string
  frecuencia?: string
  activo: boolean
  metadata: {
    en_pausa?: boolean
  }
  created_at: string
}
```

### Bono
```typescript
{
  id: string
  paciente_id: string
  sesiones_totales: number
  sesiones_usadas: number
  sesiones_disponibles: number (calculado)
  precio: number
  frecuencia_sugerida?: string
  activo: boolean
  porcentaje_uso: number (calculado)
}
```

### Sesión/Cita
```typescript
{
  id: string
  paciente_id: string
  fecha_cita: string (YYYY-MM-DD)
  hora_inicio: string (HH:MM)
  hora_fin: string (HH:MM)
  modalidad: 'presencial' | 'online' | 'telefonica'
  estado: 'pendiente' | 'confirmada' | 'realizada' | 'cancelada'
  observaciones?: string
  notas_terapeuta?: string
}
```

---

## 🚀 Mejoras Futuras Sugeridas

1. **Edición inline** - Editar datos básicos sin modal
2. **Gráficos de evolución** - Chart.js con progreso emocional
3. **Exportar a PDF** - Historial completo de sesiones
4. **Recordatorios automáticos** - WhatsApp/Email automatizados
5. **Tags/Etiquetas** - Categorizar pacientes
6. **Notas por sesión** - Notas específicas para cada cita
7. **Archivos adjuntos** - Subir documentos (informes, etc.)
8. **Historial de cambios** - Log de modificaciones
9. **Comparar períodos** - Ver evolución mes a mes
10. **Alertas automáticas** - Cuando falte confirmar cita próxima

---

## 📁 Archivos Modificados/Creados

### Modificados
- ✅ `/pages/terapeuta/pacientes/[id].vue` - Vista completa reescrita

### Backup Creado
- ✅ `/pages/terapeuta/pacientes/[id].vue.backup` - Versión anterior guardada

### Componentes Utilizados (existentes)
- ✅ `ModalNuevaCita.vue`
- ✅ `ModalDetallesCita.vue`
- ✅ `NotasPrivadas.vue`
- ✅ `DashboardCard.vue`

### Composables Utilizados (existentes)
- ✅ `useCitas.ts`
- ✅ `useSupabaseClient()`
- ✅ `useSupabaseUser()`
- ✅ `useRoute()`
- ✅ `useRouter()`

---

## ✅ Checklist de Funcionalidades

### Información del Paciente
- [x] Avatar con iniciales y color único
- [x] Nombre completo
- [x] Estado del vínculo con color
- [x] Email
- [x] Teléfono
- [x] Área de acompañamiento
- [x] Frecuencia

### Acciones Rápidas
- [x] Botón WhatsApp funcional
- [x] Botón agendar sesión
- [x] Botón editar (placeholder)

### Resumen
- [x] Estadísticas de sesiones
- [x] Bono activo con progreso visual
- [x] Datos del proceso terapéutico
- [x] Primera, última y próxima sesión

### Sistema de Tabs
- [x] Tab Próximas Sesiones
- [x] Tab Sesiones Completadas
- [x] Tab Pendientes de Confirmar
- [x] Tab Historial Completo
- [x] Badges con contadores

### Sesiones
- [x] Listado con todos los datos
- [x] Iconos por modalidad
- [x] Colores por estado
- [x] Botón "Ver detalles"
- [x] Botón "Confirmar" (pendientes)
- [x] Notas del terapeuta visibles

### Funcionalidades Especiales
- [x] Integración con WhatsApp
- [x] Modal de nueva cita
- [x] Modal de detalles de cita
- [x] Notas clínicas privadas
- [x] Carga y guardado de notas
- [x] Confirmación de citas pendientes
- [x] Recarga automática tras acciones

### UI/UX
- [x] Responsive design
- [x] Loading states
- [x] Error handling
- [x] Mensajes cuando no hay datos
- [x] Colores consistentes
- [x] Iconos intuitivos

---

**Fecha de Implementación**: 26 de octubre de 2025  
**Estado**: ✅ **COMPLETADO Y LISTO PARA PRUEBAS**  
**Compilación**: ✅ Sin errores  
**Archivo**: `/pages/terapeuta/pacientes/[id].vue`
