# 💰 Módulo de Sesiones - Gestión Financiera Transparente

## 📋 Descripción General

El **Módulo de Sesiones** es un panel financiero diseñado específicamente para que los terapeutas de la consulta de Karem Peña puedan:

- Ver todas sus sesiones (pasadas y futuras)
- Consultar el estado de cada sesión
- Conocer su impacto financiero directo (70% terapeuta, 30% consulta)
- Visualizar su saldo acumulado e ingresos por confirmar

Este módulo refleja los valores de **transparencia, claridad y bienestar financiero** de la consulta.

---

## 🎯 Características Principales

### 1. Resumen Financiero Visual
Cards superiores con métricas clave:
- 🕓 **Sesiones Pendientes**: Sesiones agendadas sin confirmar pago
- 💚 **Sesiones Confirmadas**: Sesiones con pago confirmado
- ❌ **Sesiones Anuladas**: Sesiones canceladas (sin ingreso)
- 💎 **Saldo Total**: Total de ingresos confirmados (70%)

### 2. Tabla Detallada de Sesiones
Vista completa con:
- Fecha de la sesión
- Nombre del paciente (solo nombre + inicial del apellido)
- Estado de la sesión
- Modalidad (Online/Presencial)
- Precio total
- Pago del terapeuta (70%)
- Emoji indicador de estado

### 3. Filtros Avanzados
- Por **estado** (pendiente, confirmada, anulada)
- Por **mes** (selector de 12 meses)
- Búsqueda en tiempo real

### 4. Estadísticas Adicionales
- **Promedio por sesión**: Ingreso medio del terapeuta
- **Tasa de confirmación**: Porcentaje de sesiones confirmadas
- **Ingresos potenciales**: Suma de sesiones pendientes

---

## 🏗️ Arquitectura del Sistema

### Estructura de Archivos

```
/composables/
  └── useSesiones.ts          # Lógica de negocio y queries

/components/
  ├── ResumenCard.vue          # Card de resumen financiero
  └── TablaSesiones.vue        # Tabla con filtros y responsive

/pages/terapeuta/
  └── sesiones.vue             # Página principal del módulo

/supabase/migrations/
  └── 20251019_modulo_sesiones_financiero.sql  # Schema de BD
```

---

## 📊 Base de Datos

### Tabla: `sesiones`

```sql
id                uuid PRIMARY KEY
paciente_id       uuid REFERENCES pacientes(id)
terapeuta_id      uuid REFERENCES auth.users(id)
fecha             timestamptz
estado            estado_sesion (pendiente|confirmada|anulada|completada)
modalidad         modalidad_sesion (online|presencial)
precio_total      numeric(10,2)
pago_confirmado   boolean DEFAULT false
observaciones     text
created_at        timestamptz
updated_at        timestamptz
```

### Tabla: `pagos_terapeutas`

```sql
id                uuid PRIMARY KEY
terapeuta_id      uuid REFERENCES auth.users(id)
sesion_id         uuid REFERENCES sesiones(id) UNIQUE
monto_terapeuta   numeric(10,2)  -- 70%
monto_consulta    numeric(10,2)  -- 30%
estado_pago       text (pendiente|confirmado|pagado)
fecha_pago        timestamptz
notas             text
created_at        timestamptz
updated_at        timestamptz
```

---

## 💡 Cálculos Financieros

### Distribución de Ingresos

```typescript
const PORCENTAJE_TERAPEUTA = 0.7  // 70%
const PORCENTAJE_CONSULTA = 0.3   // 30%

// Por sesión
montoTerapeuta = precio_total * 0.70
montoConsulta = precio_total * 0.30

// Total confirmado
totalConfirmado = sesiones
  .filter(s => s.estado === 'confirmada' && s.pago_confirmado)
  .reduce((sum, s) => sum + (s.precio_total * 0.70), 0)
```

### Trigger Automático

Cuando `pago_confirmado` cambia a `true`, automáticamente:
1. Se calcula la distribución 70/30
2. Se crea/actualiza un registro en `pagos_terapeutas`
3. Se marca como `estado_pago: 'confirmado'`

```sql
CREATE TRIGGER trigger_registrar_pago_terapeuta
  AFTER UPDATE ON sesiones
  FOR EACH ROW
  WHEN (NEW.pago_confirmado IS DISTINCT FROM OLD.pago_confirmado)
  EXECUTE FUNCTION registrar_pago_terapeuta();
```

---

## 🔒 Seguridad y Privacidad

### Row Level Security (RLS)

#### Políticas en `sesiones`:
```sql
-- Terapeutas solo ven sus propias sesiones
CREATE POLICY "Terapeutas pueden ver sus propias sesiones"
  ON sesiones FOR SELECT
  USING (terapeuta_id = auth.uid() OR is_staff());
```

#### Políticas en `pagos_terapeutas`:
```sql
-- Terapeutas solo ven sus propios pagos
CREATE POLICY "Terapeutas pueden ver sus propios pagos"
  ON pagos_terapeutas FOR SELECT
  USING (terapeuta_id = auth.uid());

-- Solo administración puede gestionar pagos
CREATE POLICY "Admin puede gestionar pagos"
  ON pagos_terapeutas FOR ALL
  USING (is_admin_or_coord());
```

### Privacidad del Paciente

```typescript
// Solo se muestra: "María P." en lugar de "María Pérez"
const formatearNombrePaciente = (nombre: string, apellido: string) => {
  const inicial = apellido ? apellido.charAt(0).toUpperCase() + '.' : ''
  return `${nombre} ${inicial}`.trim()
}
```

---

## 🎨 Diseño UI/UX

### Paleta de Colores por Estado

| Estado | Color | Hex | Uso |
|--------|-------|-----|-----|
| Pendiente | Amarillo suave | `#EAD5D3` (rosa) | Cards y badges |
| Confirmada | Verde suave | `#B7C6B0` | Indicador positivo |
| Anulada | Rojo claro | `#F9DADA` | Estado negativo |
| Total | Terracota | `#D8AFA0` | Saldo principal |

### Emojis por Estado
- 🕓 Pendiente
- 💚 Confirmada
- ❌ Anulada
- ✅ Completada

### Responsive Design

**Desktop:**
- Cards en grid 4 columnas
- Tabla completa con todas las columnas

**Mobile:**
- Cards apiladas en 1 columna
- Tabla se convierte en lista de cards verticales
- Filtros en columna

---

## 🚀 Uso del Composable

### `useSesiones()`

```typescript
// Importar
import { useSesiones } from '~/composables/useSesiones'

// Usar en componente
const { 
  obtenerSesiones, 
  calcularResumenFinanciero,
  formatearMonto,
  formatearFecha,
  formatearNombrePaciente 
} = useSesiones()

// Obtener sesiones
const sesiones = await obtenerSesiones()

// Con filtros
const sesionesFiltradas = await obtenerSesiones({
  estado: 'confirmada',
  mes: 10,
  anio: 2025
})

// Calcular resumen
const resumen = calcularResumenFinanciero(sesiones)
console.log(resumen.montoTerapeuta) // Total del terapeuta
```

---

## 📱 Componentes

### `ResumenCard.vue`

Card visual para mostrar métricas financieras.

**Props:**
```typescript
{
  title: string        // "Pendientes"
  count: number        // Número de sesiones
  amount: number       // Monto en euros
  color: 'amber' | 'green' | 'red' | 'terracota'
  emoji?: string       // "💰"
  subtitle?: string    // "Por confirmar"
  badge?: string       // Texto del badge opcional
}
```

**Ejemplo:**
```vue
<ResumenCard
  title="Confirmadas"
  :count="10"
  :amount="350.00"
  color="green"
  emoji="💚"
  subtitle="Ingresos asegurados"
/>
```

### `TablaSesiones.vue`

Tabla responsive con filtros integrados.

**Props:**
```typescript
{
  sesiones: SesionDetallada[]  // Array de sesiones
}
```

**Características:**
- Filtro por estado y mes
- Vista desktop (tabla) y mobile (cards)
- Totales calculados dinámicamente
- Ordenamiento por fecha descendente

---

## 🔄 Flujo de Trabajo

### 1. Agendación de Sesión
```
Paciente/Admin agenda sesión
    ↓
Se crea en BD con estado='pendiente'
    ↓
Terapeuta la ve en su panel con monto proyectado
```

### 2. Confirmación de Pago
```
Paciente realiza el pago
    ↓
Belmaris marca pago_confirmado=true
    ↓
Trigger automático crea registro en pagos_terapeutas
    ↓
Terapeuta ve el ingreso confirmado en su saldo
```

### 3. Pago Mensual
```
1-5 de cada mes: Procesamiento de pagos
    ↓
Admin/Belmaris marca estado_pago='pagado'
    ↓
Se registra fecha_pago
    ↓
Terapeuta recibe su compensación
```

---

## ⚙️ Configuración

### 1. Aplicar Migración SQL

En Supabase Dashboard → SQL Editor:

```sql
-- Copiar y ejecutar:
supabase/migrations/20251019_modulo_sesiones_financiero.sql
```

### 2. Verificar Políticas RLS

```sql
-- En SQL Editor:
SELECT * FROM pg_policies WHERE tablename IN ('sesiones', 'pagos_terapeutas');
```

### 3. Datos de Prueba (Opcional)

```sql
-- Crear sesión de ejemplo
INSERT INTO sesiones (
  paciente_id,
  terapeuta_id,
  fecha,
  modalidad,
  estado,
  precio_total,
  observaciones
) VALUES (
  'uuid-paciente',
  'uuid-terapeuta',
  now() + interval '3 days',
  'online',
  'pendiente',
  50.00,
  'Primera consulta'
);
```

---

## 📈 Métricas Calculadas

### En el Panel

| Métrica | Cálculo | Descripción |
|---------|---------|-------------|
| **Promedio por sesión** | `montoTerapeuta / confirmadas` | Ingreso medio |
| **Tasa de confirmación** | `(confirmadas / total) * 100` | % de éxito |
| **Ingresos potenciales** | `sum(pendientes) * 0.70` | Por confirmar |

---

## 🔍 Testing

### Casos de Prueba

1. **Sesión pendiente**
   - Crear sesión con `estado='pendiente'`
   - Verificar que aparece en card "Pendientes"
   - Monto debe estar en "Ingresos potenciales"

2. **Confirmar pago**
   - Actualizar `pago_confirmado = true`
   - Verificar trigger crea registro en `pagos_terapeutas`
   - Saldo debe actualizarse automáticamente

3. **Anular sesión**
   - Cambiar `estado='anulada'`
   - Verificar que no suma al saldo
   - Debe aparecer en card "Anuladas"

4. **Filtros**
   - Filtrar por mes: solo sesiones de ese mes
   - Filtrar por estado: solo sesiones con ese estado
   - Combinación de filtros

---

## 🛠️ Mantenimiento

### Funciones SQL Útiles

```sql
-- Ver resumen financiero de un terapeuta
SELECT * FROM obtener_resumen_financiero_terapeuta('uuid-terapeuta');

-- Ver todos los pagos pendientes de procesar
SELECT * FROM pagos_terapeutas 
WHERE estado_pago = 'confirmado' 
AND fecha_pago IS NULL;

-- Marcar pagos como procesados
UPDATE pagos_terapeutas 
SET estado_pago = 'pagado', fecha_pago = now()
WHERE estado_pago = 'confirmado' 
AND terapeuta_id = 'uuid-terapeuta';
```

---

## 🤝 Filosofía del Módulo

Este módulo está construido sobre tres pilares:

1. **Transparencia Total**
   - Visibilidad completa de ingresos
   - Cálculos claros y auditables
   - Historial accesible en todo momento

2. **Respeto y Confianza**
   - Privacidad del paciente (solo iniciales)
   - Datos financieros protegidos (RLS)
   - Comunicación directa con administración

3. **Bienestar Profesional**
   - Interfaz clara y amigable
   - Sin estrés por cálculos manuales
   - Seguridad económica predecible

---

## 📞 Soporte

Para dudas sobre:
- **Pagos**: admin@psicologakarem.com
- **Técnico**: Contactar con el equipo de desarrollo
- **Sesiones**: Coordinación interna

---

## 📝 Changelog

### v1.0.0 (19/10/2025)
- ✅ Módulo de sesiones completo
- ✅ Gestión financiera 70/30
- ✅ Triggers automáticos
- ✅ RLS y seguridad
- ✅ UI responsive y accesible
- ✅ Documentación completa

---

## 🎓 Conceptos Clave

### ¿Qué es el 70/30?

**70%** → Terapeuta (trabajo directo, expertise profesional)  
**30%** → Consulta (plataforma, administración, coordinación, marketing)

### ¿Cuándo se confirma un pago?

Cuando **Belmaris** verifica que el paciente ha completado el pago y marca `pago_confirmado=true` en el sistema.

### ¿Cuándo recibo mi compensación?

Los pagos se procesan **mensualmente** durante los primeros 5 días del mes, incluyendo todas las sesiones confirmadas del mes anterior.

---

**Construido con ❤️ para el equipo de Psicóloga Karem**
