# 💳 Sistema de Estado de Pago para Bonos

## 📋 Resumen Ejecutivo

Se ha implementado un sistema de control de estado de pago para los bonos, separando el **estado del ciclo de vida** (pendiente/activo/finalizado) del **estado financiero** (pagado/no pagado).

### 🎯 Problema Resuelto

**Antes**: Un bono podía estar "activo" pero no había forma de saber si estaba pagado o no.

**Ahora**: 
- ✅ Los bonos tienen un campo `pagado` (boolean) independiente del campo `estado`
- ✅ La coordinadora puede confirmar pagos manualmente desde el panel de pacientes
- ✅ Se muestra visualmente si un bono está "Pendiente de pago" o "Pagado"
- ✅ Los clientes pueden iniciar sesiones y pagar después, o pagar por adelantado

---

## 🗂️ Cambios en la Base de Datos

### Nuevas Columnas en `bonos`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `pagado` | `boolean` | Indica si el bono ha sido pagado (default: `false`) |
| `fecha_pago` | `timestamptz` | Fecha y hora en que se confirmó el pago |
| `metodo_pago` | `text` | Método de pago: transferencia, tarjeta, efectivo, bizum, paypal, otro |
| `pagado_por` | `uuid` | ID de la coordinadora que confirmó el pago |

### Nuevas Funciones RPC

#### 1. `confirmar_pago_bono(p_bono_id, p_metodo_pago)`

Marca un bono como pagado y registra la transacción.

**Parámetros:**
- `p_bono_id` (uuid): ID del bono a marcar como pagado
- `p_metodo_pago` (text): Método de pago utilizado (default: 'transferencia')

**Comportamiento:**
- Marca el bono como `pagado = true`
- Registra `fecha_pago`, `metodo_pago` y `pagado_por`
- Si el bono estaba en estado `'pendiente'`, lo cambia automáticamente a `'activo'`
- Registra la transacción en `pagos_bonos` si la tabla existe

**Retorno:**
```json
{
  "success": true,
  "bono_id": "uuid",
  "fecha_pago": "2025-10-29T...",
  "metodo_pago": "transferencia"
}
```

#### 2. `revertir_pago_bono(p_bono_id)`

Revierte el estado de pago (en caso de error).

---

## 🖥️ Cambios en el Frontend

### 1. Componente `BonosPaciente.vue`

**Nuevos elementos visuales:**
- Badge "💳 Sin pagar" (amarillo) cuando `pagado = false`
- Badge "✓ Pagado" (verde) cuando `pagado = true`
- Alerta naranja: "Pendiente de pago" para bonos activos no pagados
- Botón "💳 Confirmar pago" (solo visible si no está pagado)

**Nuevo evento emitido:**
- `@confirmar-pago` - Se emite cuando la coordinadora hace clic en confirmar pago

### 2. Página `coordinadora/pacientes.vue`

**Nueva función:**
```javascript
handleConfirmarPago(bono)
```

**Flujo:**
1. Muestra prompt para seleccionar método de pago
2. Llama a `supabase.rpc('confirmar_pago_bono', {...})`
3. Muestra mensaje de éxito/error
4. Recarga los detalles del paciente para actualizar la vista

---

## 🚀 Cómo Aplicar la Migración

### Opción 1: Desde Supabase Dashboard (Recomendado)

1. Accede a tu proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor**
3. Abre el archivo `/supabase/migrations/20251029_agregar_estado_pago_bonos.sql`
4. Copia todo el contenido
5. Pégalo en el SQL Editor
6. Haz clic en **Run** ▶️
7. Verifica que no haya errores

### Opción 2: Desde CLI (Local)

```bash
# Si tienes Supabase CLI configurado
npx supabase db push

# O aplicar la migración específica
npx supabase migration up
```

### Opción 3: Ejecutar SQL Directamente

Si ya tienes acceso directo a PostgreSQL:

```bash
psql -h aws-0-us-east-1.pooler.supabase.com \
     -p 6543 \
     -d postgres \
     -U postgres.hjlmuvrxrhcfsjgxovyg \
     -f supabase/migrations/20251029_agregar_estado_pago_bonos.sql
```

---

## 📊 Verificación Post-Migración

### 1. Verificar Nuevas Columnas

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'bonos' 
  AND column_name IN ('pagado', 'fecha_pago', 'metodo_pago', 'pagado_por');
```

**Resultado esperado:**
```
 column_name  | data_type | is_nullable | column_default 
--------------+-----------+-------------+----------------
 pagado       | boolean   | NO          | false
 fecha_pago   | timestamp | YES         | NULL
 metodo_pago  | text      | YES         | NULL
 pagado_por   | uuid      | YES         | NULL
```

### 2. Verificar Funciones RPC

```sql
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name IN ('confirmar_pago_bono', 'revertir_pago_bono');
```

**Resultado esperado:**
```
     routine_name     | routine_type 
----------------------+--------------
 confirmar_pago_bono  | FUNCTION
 revertir_pago_bono   | FUNCTION
```

### 3. Verificar Estado de Bonos Existentes

```sql
SELECT id, paciente_id, estado, pagado, 
       sesiones_totales, sesiones_restantes
FROM bonos
ORDER BY created_at DESC
LIMIT 5;
```

---

## 🎮 Cómo Usar el Sistema

### Para la Coordinadora

#### 1. Ver Estado de Pago de un Bono

1. Abre el panel de **Pacientes**
2. Haz clic en "Ver detalles" de un paciente
3. En la sección **"Bonos del Paciente"**, verás:
   - Badge **"💳 Sin pagar"** (amarillo) - Bono no pagado
   - Badge **"✓ Pagado"** (verde) - Bono pagado
   - Alerta naranja si hay bonos activos sin pagar

#### 2. Confirmar un Pago

1. En el bono que no está pagado, haz clic en **"💳 Confirmar pago"**
2. Selecciona el método de pago:
   - 1 = Transferencia
   - 2 = Tarjeta
   - 3 = Efectivo
   - 4 = Bizum
   - 5 = PayPal
   - 6 = Otro
3. El sistema:
   - Marca el bono como pagado
   - Si estaba "pendiente", lo activa automáticamente
   - Registra fecha, método y quién confirmó el pago
4. La vista se actualiza automáticamente

#### 3. Revertir un Pago (en caso de error)

Si marcaste un pago por error, puedes revertirlo desde SQL:

```sql
SELECT public.revertir_pago_bono('uuid-del-bono');
```

---

## 🔄 Flujos de Trabajo

### Flujo 1: Cliente Paga por Adelantado

```
1. Coordinadora crea el bono → estado = 'pendiente', pagado = false
2. Cliente realiza el pago
3. Coordinadora confirma el pago → pagado = true, estado = 'activo'
4. Cliente usa las sesiones
5. Cuando se agotan → estado = 'finalizado', pagado = true
```

### Flujo 2: Cliente Paga al Final

```
1. Coordinadora crea el bono → estado = 'pendiente', pagado = false
2. Coordinadora activa el bono manualmente → estado = 'activo', pagado = false
3. Cliente usa las sesiones (el sistema muestra "Pendiente de pago")
4. Cliente realiza el pago
5. Coordinadora confirma el pago → pagado = true
6. Cuando se agotan → estado = 'finalizado', pagado = true
```

### Flujo 3: Cliente Paga Durante el Uso

```
1. Coordinadora crea y activa el bono → estado = 'activo', pagado = false
2. Cliente usa 2 sesiones
3. Cliente realiza el pago
4. Coordinadora confirma el pago → pagado = true
5. Cliente continúa usando sesiones
6. Cuando se agotan → estado = 'finalizado', pagado = true
```

---

## 🎨 Estados Visuales

| Estado del Bono | Pagado | Badge | Alerta | Botón Visible |
|----------------|--------|-------|--------|---------------|
| Pendiente | No | 🔵 Pendiente + 💳 Sin pagar | 💳 Pendiente de pago | Confirmar pago |
| Pendiente | Sí | 🔵 Pendiente + ✓ Pagado | - | Ver detalles |
| Activo | No | 🟢 Activo + 💳 Sin pagar | 💳 Pendiente de pago | Confirmar pago |
| Activo | Sí | 🟢 Activo + ✓ Pagado | - | Renovar |
| Finalizado | - | ⚫ Finalizado | - | Ver detalles |

---

## 🐛 Solución de Problemas

### Problema: La función RPC no existe

**Síntoma:** Error "function confirmar_pago_bono does not exist"

**Solución:**
```sql
-- Verificar que la función existe
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'confirmar_pago_bono';

-- Si no existe, ejecutar la migración completa
```

### Problema: Columna 'pagado' no existe

**Síntoma:** Error "column 'pagado' does not exist"

**Solución:**
```sql
-- Verificar columnas
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'bonos' AND column_name = 'pagado';

-- Si no existe, ejecutar la migración
```

### Problema: Bonos existentes no muestran estado de pago

**Síntoma:** Todos los bonos antiguos aparecen como "no pagados"

**Solución:**

Por defecto, todos los bonos existentes se marcan como `pagado = false`. La coordinadora debe:

1. Revisar cada bono manualmente
2. Si ya está pagado, confirmar el pago desde el panel
3. O ejecutar SQL para marcar masivamente:

```sql
-- Marcar todos los bonos finalizados como pagados
UPDATE bonos
SET pagado = true, 
    fecha_pago = created_at,
    metodo_pago = 'transferencia'
WHERE estado = 'finalizado' 
  AND pagado = false;
```

---

## 📝 Notas Importantes

1. **Independencia de Estados**: El campo `pagado` es completamente independiente del campo `estado`. Un bono puede estar activo pero no pagado.

2. **Activación Automática**: Cuando confirmas el pago de un bono en estado `'pendiente'`, se activa automáticamente.

3. **Historial de Pagos**: Si existe la tabla `pagos_bonos`, cada confirmación de pago se registra allí también.

4. **Permisos RLS**: Solo las coordinadoras pueden modificar el estado de pago. Las terapeutas solo pueden verlo.

5. **Reversión de Pagos**: Usar con precaución y solo en caso de error. Los pagos revertidos no mantienen historial.

---

## 🔐 Seguridad

- Las funciones RPC usan `SECURITY DEFINER` para ejecutarse con privilegios elevados
- Solo usuarios con rol `coordinadora` deberían poder llamar a estas funciones
- El campo `pagado_por` registra quién confirmó el pago para auditoría

---

## 📚 Referencias

- Archivo de migración: `/supabase/migrations/20251029_agregar_estado_pago_bonos.sql`
- Componente: `/components/BonosPaciente.vue`
- Página: `/pages/coordinadora/pacientes.vue`
- Documentación de bonos: `BONOS_SISTEMA_COMPLETADO.md`

---

**Fecha de implementación:** 29 de octubre de 2025  
**Versión:** 1.0  
**Estado:** ✅ Completado
