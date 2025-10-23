# 📅 Sistema de Agenda - Documentación

## Descripción General

El módulo de **Agenda** permite al terapeuta gestionar sus citas de manera eficiente con múltiples vistas de calendario y herramientas de búsqueda rápida de disponibilidad.

---

## 🎯 Funcionalidades Principales

### 1. **Múltiples Vistas de Calendario**

#### Vista Diaria
- Visualización detallada de todas las citas del día seleccionado
- Información completa de cada cita:
  - Nombre del paciente
  - Hora de inicio y fin
  - Tipo de sesión (presencial, online, telefónica)
  - Estado de la cita
  - Notas adicionales
- Navegación rápida entre días
- Botón "Hoy" para volver a la fecha actual

#### Vista Semanal
- Calendario de 7 días (domingo a sábado)
- Vista compacta de todas las citas
- Contador de citas por día
- Navegación por semanas
- Clic en cualquier día para ver detalles

#### Vista Mensual
- Calendario completo del mes
- Indicadores visuales de citas programadas
- Máximo 2 citas visibles por día + contador
- Navegación entre meses
- Resalte del día actual

### 2. **Búsqueda Rápida de Disponibilidad** ⚡

Herramienta especial para encontrar espacios disponibles rápidamente:

- **Búsqueda automática**: Escanea los próximos 14 días hábiles
- **Horario laboral**: 9:00 AM - 6:00 PM
- **Excluye fines de semana**: Solo días laborables
- **Hasta 20 resultados**: Primeras 20 disponibilidades encontradas
- **Selección rápida**: Clic en un espacio para ir directamente a ese día

#### Casos de Uso
- Paciente llama pidiendo cita urgente
- Necesitas reagendar una sesión cancelada
- Planificación rápida de nuevas sesiones
- Verificación de disponibilidad sin revisar día por día

### 3. **Estados de Citas**

#### Confirmada ✅
- Cita acordada y confirmada con el paciente
- Color: Verde
- Acción disponible: Marcar como completada

#### Pendiente ⏳
- Cita propuesta pero sin confirmar
- Color: Amarillo
- Requiere seguimiento con el paciente

#### Cancelada ❌
- Cita cancelada (no aparece en búsquedas de disponibilidad)
- Color: Rojo
- Se mantiene en el historial

#### Completada ✓
- Sesión realizada
- Color: Azul
- Estado final

### 4. **Tipos de Sesión**

| Tipo | Icono | Descripción |
|------|-------|-------------|
| Presencial | 🏥 | Sesión en consultorio |
| Online | 💻 | Videollamada/telemedicina |
| Telefónica | 📞 | Llamada telefónica |

---

## 🎨 Diseño y UX

### Código de Colores

```
- Terracota (#B8756B): Acción principal, día actual
- Verde: Citas confirmadas
- Amarillo: Citas pendientes
- Rojo: Citas canceladas
- Azul: Citas completadas
- Morado-Rosa: Búsqueda rápida de disponibilidad
```

### Elementos Visuales

- **Transiciones suaves**: Animaciones de 0.3s
- **Hover states**: Feedback visual en todos los elementos interactivos
- **Bordes de estado**: Borde izquierdo coloreado según estado de cita
- **Badges**: Etiquetas visuales para estados
- **Iconos descriptivos**: Emojis para mejor comprensión

---

## 📊 Estructura de Datos

### Interfaz Cita

```typescript
interface Cita {
  id: string
  paciente_id: string
  paciente_nombre: string
  terapeuta_id: string
  fecha: string              // YYYY-MM-DD
  hora_inicio: string        // HH:MM
  hora_fin: string          // HH:MM
  tipo: 'presencial' | 'online' | 'telefonica'
  estado: 'confirmada' | 'pendiente' | 'cancelada' | 'completada'
  notas?: string
  created_at: string
}
```

### Interfaz HorarioDisponible

```typescript
interface HorarioDisponible {
  fecha: string      // YYYY-MM-DD
  hora: string       // HH:MM
  disponible: boolean
}
```

---

## 🔧 Composable: useCitas()

### Métodos Principales

#### `getCitas(terapeutaId?: string)`
Obtiene todas las citas del terapeuta ordenadas por fecha.

```typescript
const citas = await getCitas()
```

#### `getCitasPorDia(fecha: string, terapeutaId?: string)`
Obtiene citas de un día específico.

```typescript
const citasHoy = await getCitasPorDia('2025-10-19')
```

#### `getCitasRango(fechaInicio: string, fechaFin: string, terapeutaId?: string)`
Obtiene citas en un rango de fechas.

```typescript
const citasSemana = await getCitasRango('2025-10-14', '2025-10-20')
```

#### `buscarDisponibilidad(dias: number = 14, duracion: number = 60)`
Busca espacios disponibles en los próximos N días.

```typescript
const disponibilidades = await buscarDisponibilidad(14)
// Retorna hasta 20 espacios disponibles
```

#### `crearCita(cita: Partial<Cita>)`
Crea una nueva cita.

```typescript
const resultado = await crearCita({
  paciente_id: 'pac-123',
  paciente_nombre: 'María García',
  fecha: '2025-10-20',
  hora_inicio: '10:00',
  hora_fin: '11:00',
  tipo: 'presencial',
  estado: 'confirmada'
})
```

#### `actualizarEstadoCita(citaId: string, nuevoEstado: string)`
Actualiza el estado de una cita existente.

```typescript
await actualizarEstadoCita('cita-123', 'completada')
```

---

## 🎭 Modo Demo

Actualmente el módulo funciona en **modo demostración** con 7 citas de prueba:

- 4 citas para hoy
- 2 citas para mañana
- 1 cita para pasado mañana

### Datos Demo Incluidos

- Variedad de tipos de sesión (presencial, online, telefónica)
- Diferentes estados de citas
- Distribución realista de horarios
- Nombres de pacientes de ejemplo

### Desactivar Modo Demo

Cuando la tabla `citas` esté configurada en Supabase:

1. Abrir `composables/useCitas.ts`
2. Cambiar `MODO_DEMO = false`
3. Descomentar el código de queries a Supabase
4. Eliminar las líneas de retorno de datos demo

---

## 📋 Integración con Supabase

### Schema Requerido

```sql
CREATE TABLE citas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) NOT NULL,
  terapeuta_id UUID REFERENCES auth.users(id) NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  tipo VARCHAR(20) CHECK (tipo IN ('presencial', 'online', 'telefonica')),
  estado VARCHAR(20) CHECK (estado IN ('confirmada', 'pendiente', 'cancelada', 'completada')),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX idx_citas_terapeuta ON citas(terapeuta_id);
CREATE INDEX idx_citas_paciente ON citas(paciente_id);
CREATE INDEX idx_citas_fecha ON citas(fecha);
CREATE INDEX idx_citas_estado ON citas(estado);

-- RLS Policies
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Terapeutas pueden ver sus citas"
  ON citas FOR SELECT
  USING (auth.uid() = terapeuta_id);

CREATE POLICY "Terapeutas pueden crear citas"
  ON citas FOR INSERT
  WITH CHECK (auth.uid() = terapeuta_id);

CREATE POLICY "Terapeutas pueden actualizar sus citas"
  ON citas FOR UPDATE
  USING (auth.uid() = terapeuta_id);
```

---

## 🚀 Próximas Mejoras

### Funcionalidades Planificadas

1. **Recordatorios Automáticos**
   - Notificaciones por email/SMS
   - Configuración de tiempo de anticipación
   - Confirmación de asistencia

2. **Integración con Google Calendar**
   - Sincronización bidireccional
   - Exportar/importar eventos
   - Compartir disponibilidad

3. **Sala de Espera Virtual**
   - Para sesiones online
   - Notificación de llegada del paciente
   - Link de videollamada

4. **Estadísticas de Agenda**
   - Tasa de cancelación
   - Tipos de sesión más frecuentes
   - Horarios con mayor ocupación
   - Análisis de disponibilidad

5. **Citas Recurrentes**
   - Programar sesiones semanales/mensuales
   - Patrones personalizados
   - Gestión de series de citas

6. **Vista de Múltiples Terapeutas**
   - Para clínicas con varios profesionales
   - Asignación de pacientes
   - Gestión de salas

7. **Confirmación de Citas**
   - Estado "por confirmar"
   - Envío automático de recordatorios
   - Confirmación por parte del paciente

---

## 🎯 Flujo de Trabajo Típico

### Escenario 1: Paciente Llama Pidiendo Cita

1. Terapeuta accede a la agenda
2. Hace clic en "Buscar Disponibilidad" ⚡
3. El sistema muestra 20+ espacios disponibles en próximos 14 días
4. Terapeuta ofrece opciones al paciente
5. Clic en el espacio seleccionado
6. El sistema navega al día correspondiente
7. Crear nueva cita (funcionalidad pendiente de UI)

### Escenario 2: Revisión Diaria de Agenda

1. Abrir vista "Día" (por defecto)
2. Ver todas las citas programadas para hoy
3. Revisar notas y tipos de sesión
4. Marcar citas como "Completadas" tras realizarlas

### Escenario 3: Planificación Semanal

1. Cambiar a vista "Semana"
2. Ver distribución de citas en los próximos 7 días
3. Identificar días con poca ocupación
4. Planificar tareas administrativas en espacios libres

### Escenario 4: Análisis Mensual

1. Cambiar a vista "Mes"
2. Ver panorama completo del mes
3. Identificar patrones de ocupación
4. Planificar vacaciones o ausencias

---

## 💡 Consejos de Uso

### Para el Terapeuta

- **Usa la búsqueda rápida**: Ahorra tiempo al ofrecer citas
- **Marca citas completadas**: Mantén tu agenda actualizada
- **Agrega notas**: Contexto útil para preparar sesiones
- **Revisa semanalmente**: Anticipa tu carga de trabajo

### Para el Desarrollo

- **Modo demo primero**: Prueba funcionalidades antes de conectar BD
- **Validación de horarios**: Evita solapamientos de citas
- **Estados consistentes**: Mantén la lógica de estados clara
- **Optimiza queries**: Usa índices en fechas y estados

---

## 🐛 Troubleshooting

### Problema: No se muestran citas

**Solución**: Verificar que `MODO_DEMO` esté en `true` o que la tabla `citas` exista en Supabase.

### Problema: Búsqueda de disponibilidad no encuentra espacios

**Solución**: 
- Verificar que hay espacios libres en horario laboral (9-18h)
- Revisar que no todos los slots estén ocupados
- Confirmar que está buscando en días hábiles

### Problema: Errores de TypeScript

**Solución**: Las queries comentadas a Supabase generarán errores hasta que la tabla `citas` exista. Es normal y esperado.

---

## 📝 Historial de Cambios

### Versión 1.0 (Octubre 2025)
- ✅ Vista diaria con navegación
- ✅ Vista semanal con calendario
- ✅ Vista mensual completa
- ✅ Búsqueda rápida de disponibilidad (14 días)
- ✅ Estados de citas (confirmada, pendiente, cancelada, completada)
- ✅ Tipos de sesión (presencial, online, telefónica)
- ✅ Modo demo con 7 citas de prueba
- ✅ Diseño responsive y accesible
- ✅ Animaciones y transiciones suaves

---

## 📚 Recursos Relacionados

- **Composable**: `composables/useCitas.ts`
- **Página**: `pages/terapeuta/agenda.vue`
- **Layout**: `layouts/terapeuta.vue`
- **Componentes**: `LoadingSpinner.vue`, `EmptyState.vue`

---

## 🎨 Personalización

### Cambiar Horario Laboral

En `useCitas.ts`, método `buscarDisponibilidad()`:

```typescript
const horasDisponibles = [
  '09:00', '10:00', '11:00', '12:00',  // Mañana
  '14:00', '15:00', '16:00', '17:00'   // Tarde
]
```

Modificar según horario del consultorio.

### Cambiar Duración de Sesiones

Por defecto: 60 minutos

```typescript
buscarDisponibilidad(dias: number = 14, duracion: number = 60)
```

Cambiar el parámetro `duracion` según necesidades.

### Días Laborables

Actualmente excluye domingos (0) y sábados (6):

```typescript
const diaSemana = fecha.getDay()
if (diaSemana === 0 || diaSemana === 6) continue
```

Modificar según tu horario de trabajo.

---

## 🏆 Mejores Prácticas

1. **Mantén estados actualizados**: Marca citas como completadas al finalizar
2. **Usa notas**: Agrega contexto útil para cada sesión
3. **Revisa disponibilidad**: Usa la herramienta de búsqueda regularmente
4. **Planifica con anticipación**: Usa vista mensual para visión global
5. **Confirma citas**: Cambia de "pendiente" a "confirmada" tras confirmar

---

## 🔐 Seguridad y Privacidad

- ✅ RLS en Supabase (cada terapeuta solo ve sus citas)
- ✅ Validación de permisos
- ✅ Datos sensibles protegidos
- ✅ No se exponen datos de otros terapeutas

---

## 📱 Responsive Design

- ✅ Desktop: Vista completa con todos los elementos
- ✅ Tablet: Calendario adaptado, menús colapsables
- ✅ Mobile: Vista simplificada, navegación táctil optimizada

---

**Documentado**: Octubre 2025  
**Autor**: Sistema de Gestión Psicológica  
**Versión**: 1.0
