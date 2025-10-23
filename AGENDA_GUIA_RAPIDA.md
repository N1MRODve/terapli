# 📅 Sistema de Agenda - Guía Rápida

## ✅ Funcionalidad Implementada

Se ha creado un sistema completo de gestión de agenda para el terapeuta con las siguientes características:

---

## 🎯 Características Principales

### 1. **Tres Vistas de Calendario**

#### 📅 Vista Diaria
- Lista detallada de todas las citas del día
- Navegación con botones Anterior/Siguiente
- Botón "Hoy" para volver a la fecha actual
- Selector de fecha tipo calendario
- Información completa de cada cita:
  - Nombre del paciente
  - Horario (inicio - fin)
  - Tipo de sesión (presencial 🏥, online 💻, telefónica 📞)
  - Estado (confirmada, pendiente, cancelada, completada)
  - Notas privadas
- Acción rápida: Marcar como completada

#### 📆 Vista Semanal
- Calendario de 7 días (domingo a sábado)
- Vista compacta con horarios
- Resalte del día actual
- Contador de citas por día
- Clic en cualquier día para ver detalles

#### 🗓️ Vista Mensual
- Calendario completo del mes
- Indicadores de citas (hasta 2 visibles + contador)
- Navegación entre meses
- Día actual resaltado
- Clic en día para ver detalles

### 2. **⚡ Búsqueda Rápida de Disponibilidad**

**Caso de uso**: Paciente llama pidiendo cita, necesitas encontrar rápidamente un espacio disponible.

Características:
- ✅ Busca en los próximos **14 días hábiles**
- ✅ Excluye **fines de semana** automáticamente
- ✅ Horario laboral: **9:00 AM - 6:00 PM**
- ✅ Muestra hasta **20 espacios disponibles**
- ✅ Formato visual atractivo con tarjetas
- ✅ Información clara: fecha, hora, día de la semana
- ✅ **Selección rápida**: Clic en un espacio → navega a ese día

**Flujo de trabajo**:
1. Paciente llama pidiendo cita
2. Clic en "Buscar Disponibilidad" ⚡
3. Sistema muestra 20+ opciones
4. Ofrecer opciones al paciente
5. Clic en la opción elegida
6. Ver ese día en detalle
7. Crear la cita (UI pendiente)

### 3. **Estados de Citas**

| Estado | Badge | Color | Descripción |
|--------|-------|-------|-------------|
| **Confirmada** | ✅ | Verde | Cita acordada con el paciente |
| **Pendiente** | ⏳ | Amarillo | Propuesta, falta confirmar |
| **Cancelada** | ❌ | Rojo | Cita cancelada (historial) |
| **Completada** | ✓ | Azul | Sesión realizada |

### 4. **Tipos de Sesión**

- **🏥 Presencial**: Sesión en consultorio
- **💻 Online**: Videollamada/telemedicina
- **📞 Telefónica**: Llamada telefónica

---

## 📁 Archivos Creados

```
📁 composables/
  └── useCitas.ts                    # Composable con lógica de citas

📁 pages/terapeuta/
  └── agenda.vue                     # Página principal de agenda

📁 Documentation/
  ├── AGENDA_DOCUMENTACION.md       # Documentación completa
  └── AGENDA_GUIA_RAPIDA.md         # Esta guía
```

---

## 🎭 Modo Demo

Actualmente funciona en **modo demostración** con:
- ✅ 7 citas de prueba
- ✅ Distribución realista (hoy, mañana, pasado mañana)
- ✅ Variedad de tipos y estados
- ✅ Datos de pacientes de ejemplo

**Para desactivar**: Cambiar `MODO_DEMO = false` en `useCitas.ts` cuando la tabla `citas` esté en Supabase.

---

## 🚀 Próximos Pasos

### Pendiente de Implementar:

1. **UI para Crear Citas**
   - Modal con formulario
   - Selección de paciente
   - Configuración de horario
   - Validación de solapamientos

2. **Tabla `citas` en Supabase**
   - Crear schema (ver documentación)
   - Configurar RLS policies
   - Migrar de modo demo a producción

3. **Notificaciones y Recordatorios**
   - Email/SMS automáticos
   - X días/horas antes de la cita
   - Confirmación de asistencia

4. **Integración con Módulo de Pacientes**
   - Vincular citas con expediente
   - Ver historial de sesiones
   - Acceso directo a notas

---

## 🎨 Diseño

### Paleta de Colores

```css
Terracota (#B8756B):  Acción principal, día actual
Verde:                Confirmada
Amarillo:             Pendiente  
Rojo:                 Cancelada
Azul:                 Completada
Morado-Rosa:          Búsqueda rápida
```

### Animaciones

- ✅ Transiciones suaves (0.3s)
- ✅ Slide-down para búsqueda rápida
- ✅ Hover states en todos los elementos
- ✅ Feedback visual claro

---

## 💡 Casos de Uso Principales

### 1. Revisión Diaria
```
Terapeuta → Agenda → Vista Día (default)
Ver todas las citas de hoy
Marcar como completadas tras realizarlas
```

### 2. Ofrecer Cita Rápida
```
Terapeuta → Agenda → Buscar Disponibilidad ⚡
Sistema muestra 20 espacios libres
Clic en espacio → Ver día en detalle
Crear cita (pendiente UI)
```

### 3. Planificación Semanal
```
Terapeuta → Agenda → Vista Semana
Ver distribución de citas en 7 días
Identificar días con poca carga
```

### 4. Visión Mensual
```
Terapeuta → Agenda → Vista Mes
Ver panorama completo del mes
Planificar vacaciones o ausencias
```

---

## 🔧 Personalización

### Cambiar Horario Laboral

En `useCitas.ts`, línea ~145:

```typescript
const horasDisponibles = [
  '09:00', '10:00', '11:00', '12:00',  // Modificar según tu horario
  '14:00', '15:00', '16:00', '17:00'
]
```

### Cambiar Días Laborables

En `useCitas.ts`, línea ~155:

```typescript
const diaSemana = fecha.getDay()
if (diaSemana === 0 || diaSemana === 6) continue  // 0=domingo, 6=sábado
```

### Cambiar Rango de Búsqueda

Por defecto 14 días, modificar en llamada:

```typescript
await buscarDisponibilidad(21)  // Buscar en 21 días
```

---

## 🐛 Troubleshooting

### Error: "Cannot find name 'useCitas'"

**Solución**: Reiniciar servidor de desarrollo

```bash
pkill -f "nuxt"
npm run dev
```

### No se muestran citas

**Verificar**:
- ✅ `MODO_DEMO = true` en `useCitas.ts`
- ✅ Servidor corriendo sin errores
- ✅ Navegador sin caché

### Búsqueda no encuentra espacios

**Causa**: Todas las horas están ocupadas

**Solución**: Verificar que haya espacios libres en horario 9-18h días hábiles

---

## 📊 Datos Demo Incluidos

```typescript
Hoy:
- 09:00 - María González (Presencial, Confirmada)
- 11:00 - Carlos Ruiz (Online, Confirmada)  
- 15:00 - Ana López (Presencial, Confirmada)
- 17:00 - Roberto Sánchez (Online, Confirmada)

Mañana:
- 10:00 - Laura Martínez (Presencial, Confirmada)
- 14:00 - Pedro Gómez (Online, Pendiente)

Pasado mañana:
- 09:00 - Isabel Torres (Presencial, Confirmada)
```

---

## ✨ Ventajas del Sistema

1. **⚡ Rapidez**: Encuentra espacios en segundos
2. **🎯 Precisión**: Solo días hábiles y horario laboral
3. **👀 Visual**: Colores y estados claros
4. **📱 Responsive**: Funciona en cualquier dispositivo
5. **🔒 Seguro**: RLS en Supabase (cuando se implemente)
6. **🎨 Intuitivo**: Diseño limpio y profesional

---

## 🎓 Para Desarrolladores

### Estructura del Composable

```typescript
useCitas()
├── getCitas()              # Todas las citas
├── getCitasPorDia()        # Citas de un día
├── getCitasRango()         # Citas de rango
├── buscarDisponibilidad()  # ⚡ Espacios libres
├── crearCita()            # Crear nueva
└── actualizarEstadoCita() # Cambiar estado
```

### Componentes Usados

- `LoadingSpinner`: Durante carga de datos
- `EmptyState`: Cuando no hay citas

### Navegación

- Click en fecha → Vista diaria
- Click en espacio disponible → Vista diaria de esa fecha
- Botones de navegación temporal

---

## 🏆 Estado Actual

| Funcionalidad | Estado | Notas |
|--------------|--------|-------|
| Vista Diaria | ✅ | Completa y funcional |
| Vista Semanal | ✅ | Completa y funcional |
| Vista Mensual | ✅ | Completa y funcional |
| Búsqueda Rápida | ✅ | Completa y funcional |
| Estados de Citas | ✅ | 4 estados implementados |
| Tipos de Sesión | ✅ | 3 tipos implementados |
| Marcar Completada | ✅ | En vista diaria |
| Crear Cita (UI) | ⏳ | Pendiente |
| Editar Cita | ⏳ | Pendiente |
| Eliminar Cita | ⏳ | Pendiente |
| Tabla en Supabase | ⏳ | Pendiente |
| Notificaciones | ⏳ | Pendiente |

---

## 📞 Soporte

Para dudas sobre:
- **Funcionalidad**: Ver `AGENDA_DOCUMENTACION.md`
- **Schema Supabase**: Ver sección de Integración en documentación
- **Personalización**: Ver sección de Personalización en esta guía

---

**Fecha**: Octubre 2025  
**Versión**: 1.0  
**Estado**: Modo Demo - Funcional  
**Próximo**: Implementar creación de citas y conexión con Supabase
