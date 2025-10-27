# 🔧 FIX: Error INVALID_PSICOLOGA

## 🚨 Error Detectado

```javascript
❌ RPC devolvió error: {
  code: 'INVALID_PSICOLOGA',
  error: 'La psicóloga especificada no existe'
}
```

## 🔍 Causa Raíz

La función RPC `crear_paciente_simple()` valida que el `psicologa_id` exista en la tabla `psicologas`, pero el usuario solo existe en la tabla `profiles`.

**Flujo problemático:**
```
Usuario inicia sesión
  ↓
auth.uid() existe en profiles ✅
  ↓
Intenta crear paciente
  ↓
RPC busca auth.uid() en psicologas ❌
  ↓
ERROR: INVALID_PSICOLOGA
```

## ✅ Solución Implementada

He creado un **trigger automático** que sincroniza `profiles` → `psicologas`:

### Componentes

1. **Función:** `sync_psicologa_from_profile()`
   - Se ejecuta automáticamente
   - Inserta/actualiza en `psicologas` cuando `rol = 'psicologa'`
   - Usa `ON CONFLICT` para evitar duplicados
   - Incluye logging para debugging

2. **Trigger:** `tr_sync_psicologa`
   - Se activa en `INSERT` o `UPDATE` de `profiles`
   - Monitorea cambios en `rol`, `nombre`, `email`
   - Ejecuta la función de sincronización

3. **Sincronización inicial:**
   - Migra psicólogas existentes en `profiles` a `psicologas`
   - Solo crea registros que no existan

## 🚀 Aplicar la Solución

### Paso 1: Ejecutar Migración

```bash
1. Abrir: supabase/migrations/20251027_sync_profiles_psicologas.sql
2. Copiar TODO
3. Pegar en Supabase SQL Editor
4. Ejecutar ▶️
```

**Resultado esperado:**
```
✅ Columna updated_at ya existe en psicologas
✅ Trigger tr_sync_psicologa creado exitosamente
📊 ESTADÍSTICAS DE SINCRONIZACIÓN:
   Psicólogas en profiles: X
   Psicólogas en tabla psicologas: X
   Psicólogas sincronizadas: X
✅ Todas las psicólogas están sincronizadas
```

### Paso 2: Verificar Sincronización

```sql
-- Ver todas las psicólogas sincronizadas
SELECT 
  p.id,
  p.nombre as profile_nombre,
  p.email,
  ps.nombre_completo,
  ps.activo,
  CASE 
    WHEN ps.id IS NOT NULL THEN '✅ Sincronizada'
    ELSE '❌ Sin sincronizar'
  END as estado
FROM profiles p
LEFT JOIN psicologas ps ON p.id = ps.id
WHERE p.rol = 'psicologa';
```

**Todas deben mostrar** `✅ Sincronizada`

### Paso 3: Probar Crear Paciente

```bash
1. Ir a "Nuevo Paciente"
2. Llenar datos
3. Click "Crear Paciente"
4. Verificar consola: "✅ Paciente creado exitosamente"
5. NO debería aparecer error INVALID_PSICOLOGA ✅
```

## 🔄 Funcionamiento del Trigger

### Escenario 1: Crear Nueva Psicóloga

```sql
INSERT INTO profiles (id, email, nombre, rol)
VALUES (gen_random_uuid(), 'nueva@psicologa.com', 'Nueva', 'psicologa');
```

**Resultado automático:**
```sql
-- Trigger ejecuta automáticamente:
INSERT INTO psicologas (id, nombre_completo, email, activo)
VALUES (<uuid>, 'Nueva', 'nueva@psicologa.com', true);
```

### Escenario 2: Actualizar Psicóloga Existente

```sql
UPDATE profiles
SET nombre = 'Nombre Actualizado'
WHERE id = <uuid> AND rol = 'psicologa';
```

**Resultado automático:**
```sql
-- Trigger ejecuta automáticamente:
UPDATE psicologas
SET nombre_completo = 'Nombre Actualizado',
    updated_at = now()
WHERE id = <uuid>;
```

### Escenario 3: Cambiar Rol a Psicóloga

```sql
UPDATE profiles
SET rol = 'psicologa'
WHERE id = <uuid>;
```

**Resultado automático:**
```sql
-- Trigger ejecuta automáticamente:
INSERT INTO psicologas (id, nombre_completo, email, activo)
VALUES (<uuid>, ...) ON CONFLICT DO UPDATE;
```

### Escenario 4: Cambiar Rol de Psicóloga a Otro

```sql
UPDATE profiles
SET rol = 'coordinadora'
WHERE id = <uuid> AND rol = 'psicologa';
```

**Resultado automático:**
```sql
-- Trigger ejecuta automáticamente:
UPDATE psicologas
SET activo = false
WHERE id = <uuid>;
```

## 📊 Verificaciones Incluidas

La migración incluye verificaciones automáticas:

1. ✅ Columna `updated_at` existe en `psicologas`
2. ✅ Función de sincronización creada
3. ✅ Trigger configurado
4. ✅ Psicólogas existentes migradas
5. ✅ Conteo de registros sincronizados
6. ✅ Query de verificación visual

## 🐛 Troubleshooting

### Error: "permission denied for table psicologas"

**Causa:** Trigger no tiene permisos para insertar en `psicologas`

**Solución:** La función ya usa `SECURITY DEFINER`, pero verificar políticas RLS:
```sql
-- Verificar que service_role puede insertar
SELECT * FROM pg_policies WHERE tablename = 'psicologas';
```

### Error: "column updated_at does not exist"

**Causa:** Tabla `psicologas` no tiene columna `updated_at`

**Solución:** La migración la crea automáticamente, pero si falla:
```sql
ALTER TABLE psicologas ADD COLUMN updated_at timestamptz DEFAULT now();
```

### Psicóloga no se sincroniza

**Causa:** Trigger no se está ejecutando

**Verificación:**
```sql
-- Ver triggers activos
SELECT * FROM pg_trigger WHERE tgname = 'tr_sync_psicologa';

-- Ver logs (si los RAISE NOTICE están activos)
-- Logs aparecen en Supabase Dashboard → Database → Logs
```

**Solución:** Re-ejecutar migración completa

### Error persiste después de migración

**Causa:** Cache o sesión antigua

**Solución:**
```bash
1. Cerrar sesión
2. localStorage.clear() en consola
3. Refrescar página
4. Iniciar sesión de nuevo
5. Intentar crear paciente
```

## ✅ Checklist de Validación

- [ ] Migración ejecutada sin errores
- [ ] Mensaje "✅ Todas las psicólogas están sincronizadas"
- [ ] Query de verificación muestra todas con estado `✅ Sincronizada`
- [ ] Trigger `tr_sync_psicologa` existe en `pg_trigger`
- [ ] Función `sync_psicologa_from_profile` existe
- [ ] Crear paciente NO genera error INVALID_PSICOLOGA
- [ ] Paciente creado exitosamente con `psicologa_id` correcto

## 🎯 Resultado Esperado

**ANTES:**
```
1. Usuario (psicóloga) inicia sesión
2. Existe en profiles ✅
3. NO existe en psicologas ❌
4. Intenta crear paciente
5. Error: INVALID_PSICOLOGA ❌
```

**DESPUÉS:**
```
1. Usuario (psicóloga) inicia sesión
2. Existe en profiles ✅
3. Trigger sincroniza a psicologas ✅
4. Existe en psicologas ✅
5. Crea paciente exitosamente ✅
6. No hay error ✅
```

## 📝 Mantenimiento Futuro

El trigger se mantiene automáticamente. Solo necesitas:

1. **Crear nueva psicóloga:**
   ```sql
   INSERT INTO profiles (email, nombre, rol)
   VALUES ('nueva@email.com', 'Nombre', 'psicologa');
   -- Automáticamente se sincroniza en psicologas ✅
   ```

2. **Actualizar psicóloga:**
   ```sql
   UPDATE profiles
   SET nombre = 'Nuevo Nombre'
   WHERE id = <uuid>;
   -- Automáticamente se actualiza en psicologas ✅
   ```

3. **No requiere acción manual** - Todo es automático 🎉

---

**Fecha:** 27 de octubre de 2025  
**Prioridad:** 🔴 CRÍTICA - Bloquea creación de pacientes  
**Estado:** ✅ Solución lista para aplicar  
**Archivo:** `/supabase/migrations/20251027_sync_profiles_psicologas.sql`
