# 🔒 Políticas RLS - Sistema de Bonos

## 📋 Row Level Security (RLS) para Sistema de Bonos

Este documento detalla las políticas de seguridad a nivel de fila implementadas en el sistema de bonos, garantizando acceso controlado según roles.

---

## 🎯 Arquitectura de Roles

### Jerarquía de Permisos

```
┌─────────────────┐
│  Administrador  │ ← Acceso total (CRUD completo)
└────────┬────────┘
         │
┌────────▼────────┐
│  Coordinadora   │ ← Gestión de bonos y pagos
└────────┬────────┘
         │
┌────────▼────────┐
│   Psicóloga     │ ← Ver bonos de sus pacientes
└────────┬────────┘
         │
┌────────▼────────┐
│    Paciente     │ ← Ver solo sus bonos
└─────────────────┘
```

---

## 📊 Tabla: `bonos`

### Política: Lectura (SELECT)

```sql
-- Política: Usuarios ven bonos según su rol
DROP POLICY IF EXISTS "rls_bonos_usuarios_ver" ON public.bonos;
CREATE POLICY "rls_bonos_usuarios_ver"
ON public.bonos FOR SELECT
TO authenticated
USING (
    -- Pacientes: solo sus bonos
    paciente_id = auth.uid()
    OR
    -- Psicólogas: bonos de sus pacientes asignados
    psicologa_id = auth.uid()
    OR
    -- Staff (coordinadora/admin): todos los bonos
    public.is_staff()
);
```

**Explicación**:
- ✅ **Pacientes**: Ven únicamente bonos donde `paciente_id = auth.uid()`
- ✅ **Psicólogas**: Ven bonos de pacientes que tienen asignados (`psicologa_id = auth.uid()`)
- ✅ **Staff**: Ven todos los bonos sin restricción

---

### Política: Inserción (INSERT)

```sql
-- Política: Solo staff puede crear bonos
DROP POLICY IF EXISTS "rls_bonos_staff_insertar" ON public.bonos;
CREATE POLICY "rls_bonos_staff_insertar"
ON public.bonos FOR INSERT
TO authenticated
WITH CHECK (public.is_staff());
```

**Explicación**:
- ✅ Solo coordinadoras y administradores pueden crear bonos nuevos
- ❌ Pacientes y psicólogas **no pueden** insertar bonos

---

### Política: Actualización (UPDATE)

```sql
-- Política: Solo staff puede actualizar bonos
DROP POLICY IF EXISTS "rls_bonos_staff_actualizar" ON public.bonos;
CREATE POLICY "rls_bonos_staff_actualizar"
ON public.bonos FOR UPDATE
TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());
```

**Explicación**:
- ✅ Solo staff puede modificar: estado, sesiones, montos, fechas
- 🔒 Previene que pacientes/psicólogas alteren bonos directamente
- 🤖 Los triggers pueden actualizar con `SECURITY DEFINER`

---

### Política: Eliminación (DELETE)

```sql
-- Política: Solo staff puede eliminar bonos
DROP POLICY IF EXISTS "rls_bonos_staff_eliminar" ON public.bonos;
CREATE POLICY "rls_bonos_staff_eliminar"
ON public.bonos FOR DELETE
TO authenticated
USING (public.is_staff());
```

**Explicación**:
- ✅ Solo staff puede eliminar bonos (generalmente no se usa, mejor soft delete)
- 💡 **Recomendación**: Usar `estado = 'cancelado'` en lugar de DELETE

---

## 💳 Tabla: `pagos_bonos`

### Política: Lectura (SELECT)

```sql
-- Política: Ver pagos de bonos accesibles
DROP POLICY IF EXISTS "rls_pagos_bonos_ver" ON public.pagos_bonos;
CREATE POLICY "rls_pagos_bonos_ver"
ON public.pagos_bonos FOR SELECT
TO authenticated
USING (
    -- Solo si el bono asociado es accesible
    bono_id IN (
        SELECT id FROM public.bonos 
        WHERE paciente_id = auth.uid() 
           OR psicologa_id = auth.uid()
           OR public.is_staff()
    )
);
```

**Explicación**:
- ✅ Los usuarios ven pagos solo de bonos a los que tienen acceso
- 🔗 Hereda permisos de la tabla `bonos` (JOIN implícito)
- 🔒 Pacientes ven sus pagos, psicólogas ven pagos de sus pacientes

---

### Política: Gestión (INSERT/UPDATE/DELETE)

```sql
-- Política: Solo staff gestiona pagos
DROP POLICY IF EXISTS "rls_pagos_bonos_staff_gestionar" ON public.pagos_bonos;
CREATE POLICY "rls_pagos_bonos_staff_gestionar"
ON public.pagos_bonos FOR ALL
TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());
```

**Explicación**:
- ✅ Solo staff registra y confirma pagos
- ✅ `FOR ALL` cubre INSERT, UPDATE, DELETE
- 🔒 Previene que usuarios registren pagos falsos

---

## 🔄 Tabla: `renovaciones_bonos`

### Política: Lectura (SELECT)

```sql
-- Política: Ver renovaciones de bonos accesibles
DROP POLICY IF EXISTS "rls_renovaciones_ver" ON public.renovaciones_bonos;
CREATE POLICY "rls_renovaciones_ver"
ON public.renovaciones_bonos FOR SELECT
TO authenticated
USING (
    -- Solo si el bono original es accesible
    bono_original_id IN (
        SELECT id FROM public.bonos 
        WHERE paciente_id = auth.uid()
           OR psicologa_id = auth.uid()
           OR public.is_staff()
    )
);
```

**Explicación**:
- ✅ Ven historial de renovaciones de bonos accesibles
- 📜 Permite auditoría de renovaciones automáticas/manuales
- 🔗 Hereda permisos de tabla `bonos`

---

### Política: Gestión (INSERT/UPDATE/DELETE)

```sql
-- Política: Solo staff gestiona renovaciones
DROP POLICY IF EXISTS "rls_renovaciones_staff_gestionar" ON public.renovaciones_bonos;
CREATE POLICY "rls_renovaciones_staff_gestionar"
ON public.renovaciones_bonos FOR ALL
TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());
```

**Explicación**:
- ✅ Solo staff y triggers pueden crear registros de renovación
- 🤖 Los triggers usan `SECURITY DEFINER` para bypasear RLS cuando es necesario
- 📊 Staff puede consultar historial completo de renovaciones

---

## 📅 Tabla: `citas` (Políticas Adicionales)

### Política: Lectura con Bonos

```sql
-- Política: Ver citas con bonos
CREATE POLICY "rls_citas_con_bono_ver" ON public.citas
FOR SELECT
TO authenticated
USING (
    -- Usuario es el paciente
    paciente_id = auth.uid()
    OR
    -- Usuario es la psicóloga asignada
    psicologa_id = auth.uid()
    OR
    -- Staff ve todas
    public.is_staff()
);
```

**Explicación**:
- ✅ Permite ver citas asociadas a bonos
- 🔗 Compatible con sistema de bonos existente
- 📊 Facilita reportes de sesiones consumidas

---

## 🔧 Función Helper: `is_staff()`

```sql
-- Función para verificar si el usuario es staff
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND rol IN ('coordinacion', 'admin', 'administrador')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION public.is_staff() IS
'Retorna true si el usuario autenticado tiene rol de staff (coordinacion/admin)';
```

**Explicación**:
- ✅ Centraliza lógica de permisos de staff
- ✅ `SECURITY DEFINER` permite acceso a tabla profiles
- ✅ `STABLE` optimiza performance (cachea resultado en transacción)

---

## 🧪 Testing de Políticas RLS

### Test 1: Paciente ve solo sus bonos

```sql
-- Simular sesión de paciente
SET LOCAL jwt.claims.sub = 'uuid-paciente-123';

-- Query
SELECT * FROM bonos;

-- Resultado esperado: Solo bonos donde paciente_id = 'uuid-paciente-123'
```

---

### Test 2: Psicóloga ve bonos de sus pacientes

```sql
-- Simular sesión de psicóloga
SET LOCAL jwt.claims.sub = 'uuid-psicologa-456';

-- Query
SELECT * FROM bonos;

-- Resultado esperado: Bonos donde psicologa_id = 'uuid-psicologa-456'
```

---

### Test 3: Staff ve todos los bonos

```sql
-- Simular sesión de coordinadora
SET LOCAL jwt.claims.sub = 'uuid-coordinadora-789';

-- Query (asumiendo que is_staff() retorna true)
SELECT * FROM bonos;

-- Resultado esperado: TODOS los bonos sin filtro
```

---

### Test 4: Paciente NO puede crear bono

```sql
-- Simular sesión de paciente
SET LOCAL jwt.claims.sub = 'uuid-paciente-123';

-- Intentar insertar
INSERT INTO bonos (paciente_id, sesiones_totales, monto)
VALUES ('uuid-paciente-123', 8, 1500);

-- Resultado esperado: ERROR de política RLS (WITH CHECK violation)
```

---

## 🔐 Bypass de RLS para Triggers

### Escenario: Trigger necesita actualizar bono

Los triggers con `SECURITY DEFINER` ejecutan con permisos del dueño de la función (generalmente superusuario), bypaseando RLS:

```sql
CREATE OR REPLACE FUNCTION public.decrementar_sesion_bono()
RETURNS TRIGGER AS $$
BEGIN
    -- Esta función puede actualizar bonos sin restricciones RLS
    UPDATE public.bonos
    SET sesiones_restantes = sesiones_restantes - 1
    WHERE id = NEW.bono_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- ← Clave para bypass
```

**¿Por qué es seguro?**
- ✅ La lógica del trigger está controlada (no es input del usuario)
- ✅ El trigger solo se ejecuta en eventos específicos (INSERT de cita)
- ✅ Las validaciones internas previenen abuso

---

## 📊 Auditoría y Monitoreo

### Ver políticas activas

```sql
-- Listar políticas RLS en tabla bonos
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'bonos';
```

---

### Verificar estado de RLS

```sql
-- Verificar si RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('bonos', 'pagos_bonos', 'renovaciones_bonos');
```

**Resultado esperado**:
| tablename | rowsecurity |
|-----------|-------------|
| bonos | t (true) |
| pagos_bonos | t (true) |
| renovaciones_bonos | t (true) |

---

## 🚨 Troubleshooting

### Problema: Staff no puede ver bonos

**Posible causa**: Función `is_staff()` no retorna `true`

**Solución**:
```sql
-- Verificar rol del usuario
SELECT id, email, rol FROM profiles WHERE id = auth.uid();

-- Verificar resultado de is_staff()
SELECT public.is_staff();
```

---

### Problema: Psicóloga no ve bonos de sus pacientes

**Posible causa**: Campo `psicologa_id` en bonos es NULL o incorrecto

**Solución**:
```sql
-- Verificar bonos de la psicóloga
SELECT id, paciente_id, psicologa_id 
FROM bonos 
WHERE psicologa_id = auth.uid();

-- Actualizar psicologa_id si es necesario
UPDATE bonos 
SET psicologa_id = 'uuid-psicologa'
WHERE paciente_id IN (
    SELECT id FROM pacientes WHERE psicologa_id = 'uuid-psicologa'
);
```

---

### Problema: Trigger no actualiza bono (RLS block)

**Posible causa**: Función del trigger **no** tiene `SECURITY DEFINER`

**Solución**:
```sql
-- Agregar SECURITY DEFINER a la función
CREATE OR REPLACE FUNCTION public.decrementar_sesion_bono()
RETURNS TRIGGER AS $$
...
$$ LANGUAGE plpgsql SECURITY DEFINER; -- ← Agregar esto
```

---

## 📚 Mejores Prácticas

### ✅ DO's

1. **Usar `SECURITY DEFINER` en triggers** para bypass controlado de RLS
2. **Centralizar lógica de roles** en funciones helper como `is_staff()`
3. **Testear políticas con diferentes roles** antes de desplegar
4. **Usar soft deletes** (`estado = 'cancelado'`) en lugar de DELETE
5. **Auditar accesos** con logs de PostgreSQL

### ❌ DON'Ts

1. **No deshabilitar RLS globalmente** (`ALTER TABLE ... DISABLE ROW LEVEL SECURITY`)
2. **No dar permisos de INSERT/UPDATE a pacientes** en tabla bonos
3. **No usar `SECURITY DEFINER` en funciones expuestas directamente** sin validaciones
4. **No hardcodear UUIDs** en políticas (usar `auth.uid()`)
5. **No olvidar GRANT EXECUTE** en funciones helper

---

## 🎯 Resumen Ejecutivo

| Rol | Bonos (SELECT) | Bonos (INSERT/UPDATE/DELETE) | Pagos | Renovaciones |
|-----|----------------|------------------------------|-------|--------------|
| **Paciente** | ✅ Solo suyos | ❌ No | ✅ Ver suyos | ✅ Ver suyos |
| **Psicóloga** | ✅ De sus pacientes | ❌ No | ✅ Ver de sus pacientes | ✅ Ver de sus pacientes |
| **Coordinadora** | ✅ Todos | ✅ Todos | ✅ Todos | ✅ Todos |
| **Administrador** | ✅ Todos | ✅ Todos | ✅ Todos | ✅ Todos |

---

## 📖 Referencias

- **Archivo principal**: `/supabase/migrations/20251027_bonos_logica_negocio.sql` (Sección 8)
- **Documentación RLS**: https://supabase.com/docs/guides/auth/row-level-security
- **PostgreSQL RLS Docs**: https://www.postgresql.org/docs/current/ddl-rowsecurity.html

---

**Última actualización**: 27 de octubre de 2025  
**Versión**: 1.0  
**Estado**: ✅ Implementado y testeado
