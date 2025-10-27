# ⚡ Sistema de Bonos - Cheat Sheet

## 🚀 Inicio Rápido (60 segundos)

### Backend: Ejecutar Ahora
```sql
-- En Supabase SQL Editor
-- Copiar y ejecutar: 20251027_bonos_logica_negocio.sql
```

### Frontend: Uso Básico
```typescript
// Confirmar pago
const { data } = await supabase.rpc('fn_confirmar_pago_bono', {
  p_pago_id: 'uuid'
})
```

---

## 📊 3 Tablas Principales

| Tabla | Propósito | Campo Clave |
|-------|-----------|-------------|
| **bonos** | Paquetes de sesiones | `sesiones_restantes` (auto-decrementa) |
| **pagos_bonos** | Registro de pagos | `confirmado` (activa trigger) |
| **renovaciones_bonos** | Historial | `tipo_renovacion` (automatica/manual) |

---

## ⚙️ 3 Triggers Automáticos

```
1. INSERT cita → sesiones_restantes - 1
2. UPDATE pago.confirmado=true → bono.estado='activo'
3. UPDATE bono.estado='completado' → crear nuevo bono
```

---

## 🔐 Permisos RLS (3 Niveles)

```
Paciente:   VER solo suyos
Psicóloga:  VER de sus pacientes
Staff:      CRUD completo
```

---

## 🧪 Testing Rápido

```sql
-- 1. Crear bono pendiente
INSERT INTO bonos (...) VALUES (...);

-- 2. Confirmar pago → activo
SELECT fn_confirmar_pago_bono('uuid-pago');

-- 3. Crear cita → sesiones - 1
INSERT INTO citas (bono_id=...) VALUES (...);

-- 4. Verificar
SELECT sesiones_restantes FROM bonos WHERE id='...';
```

---

## 📁 5 Documentos

1. **INSTALACION**: Paso a paso (15 pág)
2. **RESUMEN**: Visión general (12 pág)
3. **RPC**: Frontend RPC (10 pág)
4. **RLS**: Seguridad (10 pág)
5. **INDICE**: Navegación (este)

---

## 🎯 Estados del Bono

```
pendiente → activo → completado → (renovación automática) → pendiente
                  ↓
               vencido (si fecha_fin < hoy)
```

---

## 🔧 Funciones Esenciales

```sql
-- RPC Frontend
fn_confirmar_pago_bono(p_pago_id)

-- Mantenimiento
verificar_vencimiento_bonos()  -- Ejecutar diario con pg_cron

-- Renovación Manual
fn_renovar_bono_manual(p_bono_id, p_usuario_id, ...)
```

---

## ⚠️ Puntos Críticos

- ✅ `consumo_registrado` previene doble consumo
- ✅ `SECURITY DEFINER` en triggers bypass RLS
- ✅ `FOR UPDATE` locks previenen race conditions
- ✅ pg_cron ejecuta a las 2 AM diario

---

## 🐛 Troubleshooting Express

| Error | Fix |
|-------|-----|
| `is_staff() no existe` | Crear función helper primero |
| Trigger no ejecuta | Agregar `SECURITY DEFINER` |
| RLS bloquea | Verificar rol en profiles |
| Tipos no generan | `npx supabase link` primero |

---

## 🎬 Siguiente Paso

**AHORA**: Ejecutar `20251027_bonos_logica_negocio.sql`  
**DESPUÉS**: Tests manuales (5 tests en INSTALACION.md)  
**LUEGO**: Frontend composable

---

**Docs completas**: `BONOS_INDICE.md` → Navegación a docs detalladas
