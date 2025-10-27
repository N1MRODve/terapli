# 📅 Sistema Completo de Gestión de Citas y Bonos

> **Versión:** 1.0  
> **Fecha:** 26 de octubre de 2025  
> **Autor:** GitHub Copilot  
> **Plataforma:** psicologakarem.com

## 🎯 Objetivo

Sistema completo y robusto de asignación de citas y gestión de pacientes que permite:

1. ✅ Asignar nuevas citas a pacientes
2. 📊 Ver cuántas sesiones tiene cada paciente en su bono
3. 🔄 Descontar automáticamente sesiones al completar citas
4. 🚫 Bloquear asignación si no hay saldo de sesiones
5. 🔒 Garantizar integridad y validaciones desde Supabase

---

## 📁 Estructura del Sistema

### Archivos Principales

```
📁 supabase/migrations/
└── 20251026_sistema_citas_completo.sql   # Schema completo con triggers

📁 composables/
└── useCitasNuevo.ts                      # Composable principal

📁 components/
├── ModalNuevaCita.vue                    # Modal de creación de citas
└── CalendarioCitas.vue                   # Vista de calendario (por crear)

📁 docs/
└── SISTEMA_CITAS_DOCUMENTACION.md        # Este archivo
```

---

## 🗄️ Estructura de Base de Datos

### Tablas Principales

#### 1. **`terapeutas`**

Catálogo de psicólogos/terapeutas del sistema.

```sql
CREATE TABLE terapeutas (
    id uuid PRIMARY KEY,
    nombre_completo text NOT NULL,
    email text UNIQUE NOT NULL,
    telefono text,
    especialidad text,
    num_colegiada text UNIQUE,
    disponibilidad jsonb,          -- Horarios en formato JSON
    activo boolean DEFAULT true,
    metadata jsonb,
    created_at timestamptz,
    updated_at timestamptz
);
```

**Ejemplo de disponibilidad:**
```json
{
  "lunes": ["09:00-13:00", "15:00-19:00"],
  "martes": ["09:00-13:00", "15:00-19:00"],
  "miercoles": ["09:00-13:00", "15:00-19:00"],
  "jueves": ["09:00-13:00", "15:00-19:00"],
  "viernes": ["09:00-13:00"]
}
```

#### 2. **`pacientes`**

Ya existe en el sistema, se utiliza tal cual.

```sql
-- Estructura existente
id uuid PRIMARY KEY
email text
metadata jsonb  -- Contiene nombre, frecuencia, etc.
psicologa_id uuid
area_de_acompanamiento text
frecuencia text
activo boolean
```

#### 3. **`bonos`** (Actualizado)

Bonos de sesiones con nuevas columnas.

```sql
CREATE TABLE bonos (
    id uuid PRIMARY KEY,
    paciente_id uuid NOT NULL REFERENCES pacientes,
    total_sesiones smallint NOT NULL CHECK (total_sesiones > 0),
    sesiones_restantes smallint NOT NULL CHECK (sesiones_restantes >= 0),
    precio_total numeric(10, 2),
    precio_por_sesion numeric(10, 2),        -- NUEVO
    tipo_bono tipo_bono DEFAULT 'mensual',   -- NUEVO (semanal, quincenal, mensual)
    estado estado_bono DEFAULT 'activo',
    fecha_expiracion timestamptz,            -- NUEVO
    notas text,                              -- NUEVO
    metadata jsonb DEFAULT '{}',             -- NUEVO
    created_at timestamptz,
    updated_at timestamptz
);
```

#### 4. **`citas`** (Nueva)

Registro completo de citas programadas.

```sql
CREATE TABLE citas (
    id uuid PRIMARY KEY,
    paciente_id uuid NOT NULL REFERENCES pacientes,
    terapeuta_id uuid NOT NULL REFERENCES terapeutas,
    bono_id uuid REFERENCES bonos,
    
    -- Fecha y hora
    fecha_cita date NOT NULL,
    hora_inicio time NOT NULL,
    hora_fin time NOT NULL,
    duracion_minutos integer GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (hora_fin - hora_inicio)) / 60
    ) STORED,
    
    -- Detalles
    modalidad modalidad_cita NOT NULL DEFAULT 'online',  -- presencial, online, telefonica
    estado estado_cita NOT NULL DEFAULT 'pendiente',     -- pendiente, confirmada, realizada, cancelada
    
    -- Ubicación y enlaces
    ubicacion text,
    enlace_videollamada text,
    
    -- Observaciones
    observaciones text,           -- Visibles para el paciente
    notas_terapeuta text,         -- Privadas del terapeuta
    
    -- Control de bonos
    descontar_de_bono boolean NOT NULL DEFAULT false,
    sesion_descontada boolean NOT NULL DEFAULT false,
    recordatorio_enviado boolean NOT NULL DEFAULT false,
    
    metadata jsonb DEFAULT '{}',
    created_at timestamptz,
    updated_at timestamptz,
    created_by uuid REFERENCES auth.users,
    
    -- Constraints
    CONSTRAINT check_hora_valida CHECK (hora_inicio < hora_fin),
    CONSTRAINT check_duracion_minima CHECK (
        EXTRACT(EPOCH FROM (hora_fin - hora_inicio)) >= 1800  -- Mínimo 30 min
    ),
    CONSTRAINT check_duracion_maxima CHECK (
        EXTRACT(EPOCH FROM (hora_fin - hora_inicio)) <= 14400  -- Máximo 4 horas
    )
);
```

---

## ⚙️ Reglas y Automatismos

### Triggers Implementados

#### 1. **Validación de Disponibilidad**

**Función:** `validar_disponibilidad_terapeuta()`  
**Trigger:** `trigger_validar_disponibilidad`  
**Momento:** BEFORE INSERT OR UPDATE en `citas`

**Funcionalidad:**
- ✅ Verifica que el terapeuta no tenga citas solapadas
- ✅ Previene doble asignación del mismo horario
- ✅ Ignora citas canceladas en la validación

**Ejemplo de error:**
```
ERROR: El terapeuta ya tiene una cita en ese horario. Por favor, elige otro horario.
HINT: Verifica la disponibilidad del terapeuta antes de agendar.
```

#### 2. **Validación de Saldo de Bono**

**Función:** `validar_saldo_bono()`  
**Trigger:** `trigger_validar_saldo_bono`  
**Momento:** BEFORE INSERT OR UPDATE en `citas`

**Funcionalidad:**
- ✅ Valida que el bono exista y esté activo
- ✅ Verifica que tenga sesiones disponibles
- ✅ Confirma que el bono pertenezca al paciente correcto

**Ejemplos de error:**
```
ERROR: El bono no está activo. Estado actual: agotado
HINT: Solo se pueden usar bonos en estado activo.

ERROR: El bono no tiene sesiones disponibles (0 sesiones restantes)
HINT: El paciente debe renovar o comprar un nuevo bono.
```

#### 3. **Descuento Automático de Sesión**

**Función:** `descontar_sesion_bono_automatico()`  
**Trigger:** `trigger_descontar_sesion_bono`  
**Momento:** BEFORE UPDATE en `citas`

**Funcionalidad:**
- ✅ Descuenta automáticamente 1 sesión cuando estado cambia a `realizada`
- ✅ Actualiza el estado del bono a `agotado` si llega a 0 sesiones
- ✅ Genera alertas cuando quedan pocas sesiones (≤ 2)
- ✅ Previene descuentos duplicados con flag `sesion_descontada`
- ✅ Registra eventos en `logs_evento` para auditoría

**Ejemplo de log:**
```
NOTICE: Sesión descontada del bono abc-123. Sesiones restantes: 2

INSERT INTO logs_evento
VALUES (
    'bono_sesiones_bajas',
    {
        "bono_id": "abc-123",
        "sesiones_restantes": 2,
        "mensaje": "Pocas sesiones restantes - Advertir al paciente"
    }
)
```

#### 4. **Registro de Cambios de Estado**

**Función:** `registrar_cambio_estado_cita()`  
**Trigger:** `trigger_registrar_cambio_estado`  
**Momento:** AFTER UPDATE en `citas`

**Funcionalidad:**
- ✅ Registra todos los cambios de estado en `logs_evento`
- ✅ Almacena auditoría completa: quién, cuándo, qué cambió
- ✅ Útil para reportes y seguimiento

---

## 🔒 Seguridad (RLS)

### Políticas Implementadas

#### Tabla `terapeutas`

```sql
-- Lectura: Todos los usuarios autenticados pueden ver terapeutas activos
"Lectura pública de terapeutas activos"
FOR SELECT TO authenticated
USING (activo = true)

-- Escritura: Solo staff puede gestionar terapeutas
"Staff puede gestionar terapeutas"
FOR ALL TO authenticated
USING (is_staff())
WITH CHECK (is_staff())
```

#### Tabla `citas`

```sql
-- Terapeutas ven sus propias citas
"Terapeutas ven sus citas"
FOR SELECT TO authenticated
USING (terapeuta_id IN (...) OR is_staff())

-- Pacientes ven sus propias citas
"Pacientes ven sus citas"
FOR SELECT TO authenticated
USING (paciente_id = auth.uid() OR is_staff())

-- Solo staff y terapeutas pueden crear citas
"Staff y terapeutas crean citas"
FOR INSERT TO authenticated
WITH CHECK (is_staff() OR terapeuta_id IN (...))

-- Solo staff y el terapeuta asignado pueden actualizar
"Staff y terapeuta actualizan citas"
FOR UPDATE TO authenticated
USING (is_staff() OR terapeuta_id IN (...))

-- Solo staff puede eliminar
"Solo staff elimina citas"
FOR DELETE TO authenticated
USING (is_staff())
```

---

## 💻 Uso del Composable

### Importación

```typescript
import { useCitasNuevo } from '~/composables/useCitasNuevo'

const { 
  // Terapeutas
  getTerapeutas,
  getTerapeuta,
  getTerapeutaActual,
  
  // Citas - Lectura
  getCitas,
  getCitasPorDia,
  getCitasRango,
  getCitasPaciente,
  getProximasCitasPaciente,
  
  // Citas - Escritura
  crearCita,
  actualizarEstadoCita,
  actualizarCita,
  cancelarCita,
  eliminarCita,
  
  // Bonos
  obtenerBonoActivo,
  verificarBonoActivo,
  obtenerEstadisticasBono,
  getBonosPaciente,
  
  // Disponibilidad
  verificarDisponibilidadTerapeuta,
  buscarDisponibilidad,
  
  // Utilidades
  formatearFecha,
  calcularHoraFin,
  obtenerNombreDia
} = useCitasNuevo()
```

### Ejemplos de Uso

#### 1. Crear una Nueva Cita

```typescript
const crearNuevaCita = async () => {
  // Verificar bono del paciente primero
  const infoBono = await verificarBonoActivo(pacienteId)
  
  const resultado = await crearCita({
    paciente_id: pacienteId,
    fecha: '2025-10-27',
    hora_inicio: '10:00',
    hora_fin: '11:00',
    modalidad: 'presencial',
    estado: 'confirmada',
    notas: 'Primera sesión',
    descontar_de_bono: infoBono.tiene_bono,
    bono_id: infoBono.bono_id,
    enlace_videollamada: 'https://meet.google.com/xxx-yyyy-zzz'
  })
  
  if (resultado.success) {
    console.log('✅ Cita creada:', resultado.data)
    // Recargar calendario o lista de citas
  } else {
    console.error('❌ Error:', resultado.error)
    // Mostrar mensaje al usuario
  }
}
```

#### 2. Completar una Cita (Descuento Automático)

```typescript
const completarCita = async (citaId: string) => {
  // Al cambiar el estado a 'realizada', el trigger descuenta automáticamente
  const resultado = await actualizarEstadoCita(citaId, 'realizada')
  
  if (resultado.success) {
    console.log('✅ Cita completada y sesión descontada automáticamente')
    console.log(resultado.message)
  } else {
    console.error('❌ Error:', resultado.error)
  }
}
```

#### 3. Verificar Disponibilidad

```typescript
const verificarHorario = async () => {
  const disponible = await verificarDisponibilidadTerapeuta(
    terapeutaId,
    '2025-10-27',
    '10:00',
    '11:00'
  )
  
  if (disponible) {
    console.log('✅ Horario disponible')
  } else {
    console.log('❌ Horario ocupado')
  }
}
```

#### 4. Buscar Próximas Disponibilidades

```typescript
const buscarHorarios = async () => {
  const disponibilidades = await buscarDisponibilidad(
    terapeutaId,
    14,  // Próximos 14 días
    60   // Sesiones de 60 minutos
  )
  
  console.log(`Encontradas ${disponibilidades.length} disponibilidades:`)
  disponibilidades.forEach(d => {
    console.log(`${d.fecha} a las ${d.hora}`)
  })
}
```

#### 5. Obtener Información de Bono

```typescript
const verificarBono = async (pacienteId: string) => {
  const info = await verificarBonoActivo(pacienteId)
  
  if (info.tiene_bono) {
    console.log(`✅ Bono activo: ${info.tipo_bono}`)
    console.log(`📊 ${info.sesiones_restantes} / ${info.total_sesiones} sesiones`)
    
    if (info.sesiones_restantes <= 2) {
      console.warn('⚠️ Pocas sesiones restantes')
    }
  } else {
    console.log('💳 Sin bono activo - Pago individual')
  }
}
```

#### 6. Obtener Citas de la Semana

```typescript
const citasSemanales = async () => {
  const hoy = new Date()
  const finSemana = new Date(hoy)
  finSemana.setDate(finSemana.getDate() + 7)
  
  const citas = await getCitasRango(
    formatearFecha(hoy),
    formatearFecha(finSemana)
  )
  
  console.log(`📅 Citas esta semana: ${citas.length}`)
  
  // Agrupar por día
  const citasPorDia = citas.reduce((acc, cita) => {
    const dia = cita.fecha_cita
    if (!acc[dia]) acc[dia] = []
    acc[dia].push(cita)
    return acc
  }, {})
  
  return citasPorDia
}
```

#### 7. Cancelar Cita con Motivo

```typescript
const cancelarCitaConMotivo = async (citaId: string) => {
  const resultado = await cancelarCita(
    citaId,
    'Paciente solicitó reagendar por motivos personales'
  )
  
  if (resultado.success) {
    console.log('✅ Cita cancelada')
    // La sesión NO se descuenta si se cancela antes de completar
  }
}
```

---

## 📊 Vistas Útiles

### 1. `vista_citas_completas`

Vista consolidada con toda la información relevante de las citas.

```sql
SELECT 
    cita_id,
    fecha_cita,
    hora_inicio,
    hora_fin,
    estado,
    modalidad,
    paciente_nombre,
    paciente_email,
    terapeuta_nombre,
    bono_id,
    sesiones_restantes,
    descontar_de_bono,
    sesion_descontada
FROM vista_citas_completas
WHERE terapeuta_id = 'xxx'
  AND fecha_cita >= CURRENT_DATE
ORDER BY fecha_cita, hora_inicio;
```

### 2. `vista_dashboard_bonos`

Dashboard con estadísticas completas de bonos.

```sql
SELECT 
    paciente_nombre,
    total_sesiones,
    sesiones_restantes,
    porcentaje_usado,
    citas_completadas,
    citas_programadas,
    estado
FROM vista_dashboard_bonos
WHERE estado = 'activo'
ORDER BY sesiones_restantes ASC;
```

---

## 🔧 Funciones de PostgreSQL

### 1. `obtener_estadisticas_bono(bono_id)`

Devuelve estadísticas detalladas de un bono.

```sql
SELECT * FROM obtener_estadisticas_bono('bono-uuid');
```

**Retorna:**
```json
{
  "bono_id": "uuid",
  "paciente_id": "uuid",
  "total_sesiones": 10,
  "sesiones_restantes": 7,
  "sesiones_usadas": 3,
  "porcentaje_usado": 30.00,
  "citas_realizadas": 3,
  "citas_pendientes": 2,
  "estado": "activo"
}
```

### 2. `verificar_disponibilidad_terapeuta(...)`

Verifica si un horario está disponible.

```sql
SELECT verificar_disponibilidad_terapeuta(
    'terapeuta-uuid',
    '2025-10-27'::date,
    '10:00'::time,
    '11:00'::time
);
-- Retorna: true o false
```

### 3. `obtener_proximas_citas_paciente(paciente_id, limite)`

Devuelve las próximas citas programadas.

```sql
SELECT * FROM obtener_proximas_citas_paciente('paciente-uuid', 5);
```

---

## 🚀 Instalación

### Paso 1: Ejecutar Migration SQL

```bash
# Conectar a Supabase
psql "postgresql://..."

# Ejecutar el script
\i supabase/migrations/20251026_sistema_citas_completo.sql
```

O desde Supabase Dashboard:
1. SQL Editor
2. Copiar y pegar el contenido del archivo
3. Ejecutar

### Paso 2: Insertar Terapeutas

```sql
-- Insertar terapeuta principal
INSERT INTO terapeutas (
    nombre_completo, 
    email, 
    telefono,
    especialidad,
    num_colegiada,
    disponibilidad,
    activo
) VALUES (
    'Dra. Karen González',
    'karen@psicologakarem.com',
    '+34 612 345 678',
    'Psicología Clínica',
    'COL-12345',
    '{
        "lunes": ["09:00-13:00", "15:00-19:00"],
        "martes": ["09:00-13:00", "15:00-19:00"],
        "miercoles": ["09:00-13:00", "15:00-19:00"],
        "jueves": ["09:00-13:00", "15:00-19:00"],
        "viernes": ["09:00-13:00"]
    }'::jsonb,
    true
);
```

### Paso 3: Actualizar Tipos de TypeScript

```bash
# Regenerar tipos desde Supabase
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
```

### Paso 4: Usar el Composable

```vue
<script setup>
import { useCitasNuevo } from '~/composables/useCitasNuevo'

const { getCitas, crearCita } = useCitasNuevo()
</script>
```

---

## ✅ Validaciones Implementadas

### Backend (PostgreSQL)

- ✅ Validación de horarios solapados
- ✅ Validación de saldo de sesiones en bono
- ✅ Validación de estado de bono (activo/agotado)
- ✅ Validación de duración mínima/máxima de cita
- ✅ Validación de hora_inicio < hora_fin
- ✅ Prevención de descuentos duplicados

### Frontend (Recomendado)

- ✅ Verificar disponibilidad antes de mostrar horarios
- ✅ Mostrar sesiones restantes antes de agendar
- ✅ Alertar cuando quedan pocas sesiones
- ✅ Validar formato de fecha y hora
- ✅ Confirmar antes de cancelar cita realizada

---

## 📈 Extensibilidad Futura

El sistema está preparado para:

### 1. **Pagos en Línea**
```sql
ALTER TABLE bonos ADD COLUMN stripe_payment_id text;
ALTER TABLE bonos ADD COLUMN metodo_pago text;
```

### 2. **Recordatorios Automáticos**
```sql
-- Ya existe el campo recordatorio_enviado
-- Implementar función de envío vía WhatsApp/Email
```

### 3. **Reportes por Terapeuta**
```sql
CREATE VIEW reporte_mensual_terapeuta AS
SELECT 
    terapeuta_id,
    DATE_TRUNC('month', fecha_cita) as mes,
    COUNT(*) FILTER (WHERE estado = 'realizada') as sesiones_realizadas,
    COUNT(*) FILTER (WHERE estado = 'cancelada') as sesiones_canceladas,
    AVG(duracion_minutos) as duracion_promedio
FROM citas
GROUP BY terapeuta_id, DATE_TRUNC('month', fecha_cita);
```

### 4. **Métricas de Satisfacción**
```sql
ALTER TABLE citas ADD COLUMN valoracion integer CHECK (valoracion BETWEEN 1 AND 5);
ALTER TABLE citas ADD COLUMN comentario_paciente text;
```

---

## 🐛 Solución de Problemas

### Error: "Terapeuta ya tiene cita en ese horario"

**Causa:** Intento de crear cita solapada.  
**Solución:** 
```typescript
// Verificar disponibilidad primero
const disponible = await verificarDisponibilidadTerapeuta(...)
if (!disponible) {
  // Mostrar mensaje al usuario
  return
}
```

### Error: "Bono no tiene sesiones disponibles"

**Causa:** Intentar usar bono agotado.  
**Solución:**
```typescript
// Verificar bono antes de agendar
const info = await verificarBonoActivo(pacienteId)
if (!info.tiene_bono || info.sesiones_restantes === 0) {
  // Ofrecer comprar nuevo bono
  return
}
```

### Sesión no se descuenta automáticamente

**Causa:** Trigger no se ejecutó o estado no cambió a 'realizada'.  
**Verificación:**
```sql
-- Verificar que el trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'trigger_descontar_sesion_bono';

-- Verificar logs
SELECT * FROM logs_evento WHERE tipo = 'cambio_estado_cita' ORDER BY created_at DESC LIMIT 10;
```

---

## 📞 Soporte

Para más información:
- 📧 Email: soporte@psicologakarem.com
- 📚 Documentación completa: [docs.psicologakarem.com](https://docs.psicologakarem.com)
- 🐛 Reportar issues: GitHub Issues

---

## 📝 Changelog

### Versión 1.0 (26 octubre 2025)
- ✅ Sistema completo de citas implementado
- ✅ Triggers de validación y descuento automático
- ✅ Composable useCitasNuevo completo
- ✅ Políticas RLS configuradas
- ✅ Vistas y funciones auxiliares
- ✅ Documentación completa

---

**¡Sistema listo para producción! 🚀**
