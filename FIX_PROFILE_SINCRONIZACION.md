# 🔧 FIX: Sincronización Profile ID y Email de Pacientes

## 📋 Problema Identificado

Al crear un nuevo paciente, se presentaban **dos problemas críticos**:

1. **`profile_id` quedaba NULL** - No se creaba el registro en la tabla `profiles`
2. **Email incorrecto** - Se guardaba el email del terapeuta en lugar del email del paciente

### Causa Raíz

El flujo original insertaba directamente en la tabla `pacientes` sin:
- Crear el registro en `profiles` primero
- Establecer la relación mediante `profile_id`

```typescript
// ❌ FLUJO ANTERIOR (INCORRECTO)
const { data } = await supabase
  .from('pacientes')
  .insert({
    psicologa_id: userId,  // ← Email del terapeuta
    email: formulario.email, // ← Email del paciente
    profile_id: null  // ← Sin sincronizar con profiles
  })
```

## ✅ Solución Implementada

### Arquitectura de la Solución

```
┌─────────────────────────────────────────────────────────┐
│              FLUJO CORREGIDO                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Terapeuta crea paciente en modal                   │
│     └─> Email del PACIENTE (no del terapeuta)          │
│                                                         │
│  2. Llamada a RPC: crear_paciente_simple()             │
│     ├─> Crea registro en profiles                      │
│     │   └─> email: paciente@example.com                │
│     │   └─> rol: 'paciente'                            │
│     │   └─> id: <uuid generado>                        │
│     │                                                   │
│     └─> Crea registro en pacientes                     │
│         └─> profile_id: <uuid de profiles>             │
│         └─> email: paciente@example.com                │
│         └─> psicologa_id: <uuid del terapeuta>         │
│                                                         │
│  3. Sincronización automática                          │
│     └─> profiles.id === pacientes.profile_id          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Componentes de la Solución

#### 1. Función SQL RPC: `crear_paciente_simple()`

Ubicación: `/supabase/migrations/20251027_fix_crear_paciente_profile.sql`

**Características:**

- ✅ Crea el registro en `profiles` primero
- ✅ Sincroniza automáticamente con `pacientes` usando el `profile_id` correcto
- ✅ Validación de email duplicado
- ✅ Manejo de errores robusto con códigos específicos
- ✅ Idempotente (se puede ejecutar múltiples veces sin duplicar)
- ✅ `SECURITY DEFINER` para ejecutarse con privilegios elevados

**Parámetros:**

```sql
CREATE OR REPLACE FUNCTION public.crear_paciente_simple(
  p_email text,              -- Email del PACIENTE
  p_nombre_completo text,    -- Nombre completo
  p_telefono text DEFAULT NULL,
  p_area_acompanamiento text DEFAULT NULL,
  p_tipo_bono text DEFAULT NULL,
  p_psicologa_id uuid DEFAULT NULL,  -- ID del TERAPEUTA
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
```

**Respuesta:**

```json
{
  "success": true,
  "paciente_id": "uuid-del-paciente",
  "profile_id": "uuid-del-profile",
  "email": "paciente@example.com",
  "mensaje": "Paciente creado exitosamente"
}
```

**Errores Manejados:**

```json
// Email duplicado
{
  "success": false,
  "error": "Ya existe un paciente o profile con ese email",
  "code": "DUPLICATE_EMAIL",
  "email": "paciente@example.com"
}

// Psicóloga inválida
{
  "success": false,
  "error": "La psicóloga especificada no existe",
  "code": "INVALID_PSICOLOGA",
  "psicologa_id": "uuid-invalido"
}
```

#### 2. Modal Actualizado: `ModalNuevoPaciente.vue`

**Cambios Principales:**

```typescript
// ✅ FLUJO NUEVO (CORRECTO)
const { data: rpcResult, error: rpcError } = await supabase.rpc('crear_paciente_simple', {
  p_email: formulario.value.email,  // ← Email del PACIENTE
  p_nombre_completo: nombreCompleto,
  p_telefono: formulario.value.telefono || null,
  p_area_acompanamiento: formulario.value.area_acompanamiento || null,
  p_tipo_bono: formulario.value.tipo_bono || null,
  p_psicologa_id: userId,  // ← ID del TERAPEUTA
  p_metadata: {
    nombre: formulario.value.nombre,
    apellido: formulario.value.apellido,
    fecha_nacimiento: formulario.value.fecha_nacimiento,
    // ... más metadata
  }
})

// Validar respuesta
if (!rpcResult || !rpcResult.success) {
  throw new Error(rpcResult?.error || 'Error desconocido')
}

// Obtener IDs correctos
const pacienteId = rpcResult.paciente_id
const profileId = rpcResult.profile_id
```

**Mejoras en Logging:**

```typescript
console.log('🆕 Creando nuevo paciente...')
console.log('📝 Llamando a crear_paciente_simple...')
console.log('✅ Paciente creado exitosamente:', rpcResult)
console.log('❌ Error en RPC:', rpcError)
```

## 🚀 Instrucciones de Aplicación

### Paso 1: Ejecutar Migración SQL

1. **Abrir Supabase Dashboard:**
   - Ir a [https://app.supabase.com](https://app.supabase.com)
   - Seleccionar tu proyecto `psicokarem`

2. **Navegar a SQL Editor:**
   - Menú lateral → "SQL Editor"
   - Click en "New query"

3. **Copiar y Ejecutar:**
   - Abrir: `/supabase/migrations/20251027_fix_crear_paciente_profile.sql`
   - Copiar **TODO** el contenido
   - Pegar en el editor SQL
   - Click en "Run" (▶️)

4. **Verificar Resultado:**
   ```
   ✅ Funciones creadas:
      - crear_paciente_con_profile (con auth)
      - crear_paciente_simple (sin auth) ← RECOMENDADA
   
   📝 Uso desde el cliente:
      const { data } = await supabase.rpc('crear_paciente_simple', { ... })
   ```

### Paso 2: Verificar Código del Modal

El archivo `ModalNuevoPaciente.vue` ya está actualizado con el nuevo flujo.

**No requiere cambios adicionales** ✅

### Paso 3: Probar el Flujo Completo

1. **Crear Paciente de Prueba:**
   - Abrir modal "Nuevo Paciente"
   - Llenar datos:
     - Nombre: `Juan`
     - Apellido: `Pérez`
     - Email: `juan.perez.test@example.com` (usar email único)
     - Teléfono: `123456789`
     - Área de acompañamiento: `Ansiedad`
     - Tipo de bono: `Quincenal`
   - Click en "Crear Paciente"

2. **Verificar en Consola del Navegador:**
   ```
   🆕 Creando nuevo paciente...
   📝 Llamando a crear_paciente_simple...
   ✅ Paciente creado exitosamente: {
     success: true,
     paciente_id: "xxx-xxx-xxx",
     profile_id: "yyy-yyy-yyy",
     email: "juan.perez.test@example.com"
   }
   ```

3. **Verificar en Base de Datos:**

   **Opción A: Desde Supabase Dashboard**
   - Ir a "Table Editor"
   - Abrir tabla `profiles`
   - Buscar email: `juan.perez.test@example.com`
   - ✅ Debe existir un registro con:
     - `email`: juan.perez.test@example.com
     - `nombre`: Juan Pérez
     - `rol`: paciente
   
   - Abrir tabla `pacientes`
   - Buscar mismo email
   - ✅ Debe tener `profile_id` rellenado (no NULL)

   **Opción B: Query SQL**
   ```sql
   -- Verificar sincronización
   SELECT 
     p.id as profile_id,
     p.email as profile_email,
     p.nombre as profile_nombre,
     pac.id as paciente_id,
     pac.profile_id as paciente_profile_id,
     pac.email as paciente_email,
     pac.nombre_completo
   FROM profiles p
   INNER JOIN pacientes pac ON p.id = pac.profile_id
   WHERE p.email = 'juan.perez.test@example.com';
   ```

   **Resultado esperado:**
   ```
   profile_id         | profile_email              | profile_nombre | paciente_id        | paciente_profile_id | paciente_email             | nombre_completo
   -------------------|----------------------------|----------------|--------------------|--------------------|----------------------------|----------------
   xxx-xxx-xxx        | juan.perez.test@example.com| Juan Pérez     | yyy-yyy-yyy        | xxx-xxx-xxx        | juan.perez.test@example.com| Juan Pérez
   ```

   ✅ **Confirmación:** `profile_id` === `paciente_profile_id`

## 📊 Comparación Antes/Después

### ANTES (❌ Incorrecto)

| Campo | Tabla `profiles` | Tabla `pacientes` |
|-------|------------------|-------------------|
| Email | terapeuta@example.com | paciente@example.com |
| profile_id | N/A | **NULL** ❌ |
| Relación | ❌ No existe | ❌ Sin sincronizar |

**Problemas:**
- Profile no creado para el paciente
- `profile_id` NULL → Foreign key sin vincular
- Email del terapeuta guardado incorrectamente

### DESPUÉS (✅ Correcto)

| Campo | Tabla `profiles` | Tabla `pacientes` |
|-------|------------------|-------------------|
| Email | paciente@example.com | paciente@example.com |
| profile_id | uuid-xxx-xxx | uuid-xxx-xxx |
| Relación | ✅ Existe | ✅ Sincronizado |

**Mejoras:**
- Profile creado correctamente
- `profile_id` sincronizado con foreign key
- Email correcto en ambas tablas

## 🔍 Verificación de Políticas RLS

La migración incluye una política RLS para que las psicólogas puedan ver los profiles de sus pacientes:

```sql
CREATE POLICY "Psicólogas pueden ver profiles de sus pacientes"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Si es su propio profile
  id = auth.uid()
  OR
  -- Si es un paciente de la psicóloga
  EXISTS (
    SELECT 1 FROM public.pacientes
    WHERE pacientes.profile_id = profiles.id
    AND pacientes.psicologa_id = auth.uid()
  )
);
```

**Probar Política:**

```sql
-- Como terapeuta, deberías ver profiles de tus pacientes
SELECT * FROM profiles 
WHERE id IN (
  SELECT profile_id FROM pacientes 
  WHERE psicologa_id = auth.uid()
);
```

## 🐛 Troubleshooting

### Error: "function crear_paciente_simple does not exist"

**Causa:** La migración SQL no se ejecutó correctamente.

**Solución:**
1. Verificar que ejecutaste el script completo en Supabase SQL Editor
2. Comprobar que no hubo errores en la ejecución
3. Ejecutar verificación:
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name LIKE '%crear_paciente%';
   ```
   Deberías ver: `crear_paciente_simple` y `crear_paciente_con_profile`

### Error: "Ya existe un paciente o profile con ese email"

**Causa:** Email duplicado (es una validación intencional).

**Soluciones:**
1. Usar un email diferente
2. Si quieres reutilizar el email, eliminar el registro anterior:
   ```sql
   -- Cuidado: esto elimina datos permanentemente
   DELETE FROM pacientes WHERE email = 'email@duplicado.com';
   DELETE FROM profiles WHERE email = 'email@duplicado.com';
   ```

### `profile_id` sigue siendo NULL

**Causa:** Paciente creado antes de aplicar la migración.

**Solución:** Migrar pacientes existentes:

```sql
-- Crear profiles para pacientes sin profile_id
INSERT INTO profiles (id, email, nombre, telefono, rol)
SELECT 
  gen_random_uuid(),
  p.email,
  p.nombre_completo,
  p.telefono,
  'paciente'
FROM pacientes p
WHERE p.profile_id IS NULL
AND p.email IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM profiles pr WHERE pr.email = p.email
)
ON CONFLICT (email) DO NOTHING;

-- Actualizar profile_id en pacientes
UPDATE pacientes pac
SET profile_id = pr.id
FROM profiles pr
WHERE pac.email = pr.email
AND pac.profile_id IS NULL;

-- Verificar
SELECT 
  COUNT(*) as total_pacientes,
  COUNT(profile_id) as con_profile,
  COUNT(*) - COUNT(profile_id) as sin_profile
FROM pacientes;
```

**Resultado esperado:**
```
total_pacientes | con_profile | sin_profile
----------------|-------------|------------
       10       |     10      |      0
```

### Error: "permission denied for function crear_paciente_simple"

**Causa:** Permisos no configurados correctamente.

**Solución:**
```sql
-- Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION public.crear_paciente_simple TO authenticated;
GRANT EXECUTE ON FUNCTION public.crear_paciente_con_profile TO authenticated;

-- Verificar permisos
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%crear_paciente%';
```

Deberías ver `security_type = 'DEFINER'`

## 📚 Referencias Técnicas

### Estructura de Tablas

**profiles:**
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE,
  nombre text,
  telefono text,
  rol user_role DEFAULT 'paciente',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**pacientes:**
```sql
CREATE TABLE pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  psicologa_id uuid REFERENCES psicologas(id),
  email text,
  nombre_completo text,
  telefono text,
  tipo_bono text CHECK (tipo_bono IN ('a_demanda', 'quincenal', 'semanal')),
  activo boolean DEFAULT true,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Foreign Keys

```
profiles.id (PK) ←──── pacientes.profile_id (FK)
         ↑
         │
    auth.users.id
```

### Flujo de Datos

```
ModalNuevoPaciente.vue
        ↓
   supabase.rpc('crear_paciente_simple', { ... })
        ↓
   [SQL Function]
   1. INSERT INTO profiles
   2. INSERT INTO pacientes (con profile_id)
        ↓
   [Response JSON]
   { success: true, paciente_id, profile_id }
        ↓
   [Modal] Crear bono, sesión, notas...
```

## ✅ Checklist de Validación

- [ ] Migración SQL ejecutada sin errores
- [ ] Función `crear_paciente_simple` existe en base de datos
- [ ] Código de `ModalNuevoPaciente.vue` actualizado
- [ ] Paciente de prueba creado exitosamente
- [ ] `profile_id` no es NULL en tabla `pacientes`
- [ ] Email del paciente correcto en ambas tablas
- [ ] Consola del navegador muestra logs correctos
- [ ] Query de verificación devuelve datos sincronizados
- [ ] Política RLS permite acceso correcto
- [ ] No hay errores en consola del navegador

## 🎉 Resultado Final

Con esta solución implementada:

✅ **Cada paciente tiene su propio profile**
✅ **El `profile_id` se sincroniza automáticamente**
✅ **El email del paciente se guarda correctamente (no el del terapeuta)**
✅ **La relación foreign key funciona correctamente**
✅ **Las políticas RLS permiten acceso apropiado**
✅ **Manejo de errores robusto con mensajes claros**
✅ **Validación de emails duplicados**
✅ **Código más limpio y mantenible**

---

**Fecha de Implementación:** 27 de octubre de 2025  
**Archivos Modificados:**
- `/supabase/migrations/20251027_fix_crear_paciente_profile.sql` (NUEVO)
- `/components/ModalNuevoPaciente.vue` (ACTUALIZADO)

**Estado:** ✅ **COMPLETADO Y LISTO PARA USAR**
