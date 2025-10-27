# 🔧 FIX: Error de Login - No se puede cargar perfil

## 🚨 Error Detectado

```
[Error] [Login] No se pudo cargar el perfil después de todos los intentos
```

## 🔍 Causa Raíz

Las **políticas RLS (Row Level Security)** de la tabla `profiles` estaban mal configuradas o faltaban, impidiendo que los usuarios lean su propio perfil después de autenticarse.

## ✅ Solución Implementada

He creado una migración SQL que:

1. **Elimina políticas problemáticas** existentes
2. **Crea 5 nuevas políticas** correctamente configuradas:
   - ✅ `users_select_own_profile` - Usuario ve su propio perfil
   - ✅ `users_update_own_profile` - Usuario actualiza su perfil
   - ✅ `system_insert_profiles` - Sistema crea profiles
   - ✅ `psicologas_select_pacientes_profiles` - Psicólogas ven pacientes
   - ✅ `service_role_select_all_profiles` - Admin ve todo

## 🚀 Aplicar la Solución

### Paso 1: Ejecutar Migración SQL

```bash
1. Abrir Supabase Dashboard → SQL Editor
2. Copiar: supabase/migrations/20251027_fix_rls_profiles.sql
3. Pegar y ejecutar (▶️)
```

**Resultado esperado:**
```
✅ Total de políticas en profiles: 5
✅ Políticas RLS configuradas correctamente
```

### Paso 2: Verificar Políticas

Ejecutar query de verificación:

```sql
SELECT 
  policyname,
  roles,
  cmd as comando
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
```

**Debe mostrar:**
```
policyname                              | roles          | comando
----------------------------------------|----------------|--------
psicologas_select_pacientes_profiles    | authenticated  | SELECT
service_role_select_all_profiles        | service_role   | SELECT
system_insert_profiles                  | authenticated  | INSERT
users_select_own_profile                | authenticated  | SELECT
users_update_own_profile                | authenticated  | UPDATE
```

### Paso 3: Probar Login

```bash
1. Cerrar sesión completamente
2. Iniciar sesión nuevamente
3. Verificar que NO aparece el error
4. Confirmar que se carga el perfil correctamente
```

## 🔍 Políticas Explicadas

### 1. `users_select_own_profile`
```sql
-- Permite leer el propio perfil
USING (id = auth.uid())
```
✅ **Soluciona:** Error de "no se pudo cargar el perfil"

### 2. `users_update_own_profile`
```sql
-- Permite actualizar el propio perfil
USING (id = auth.uid())
WITH CHECK (id = auth.uid())
```
✅ **Permite:** Editar nombre, teléfono, avatar, etc.

### 3. `system_insert_profiles`
```sql
-- Permite crear profiles (necesario para registro y RPC)
WITH CHECK (true)
```
✅ **Permite:** Función `crear_paciente_simple()` crear profiles

### 4. `psicologas_select_pacientes_profiles`
```sql
-- Psicólogas ven profiles de sus pacientes
USING (
  id = auth.uid() OR
  EXISTS (SELECT ... FROM pacientes WHERE ...) OR
  (is_staff = true)
)
```
✅ **Permite:** Gestión de pacientes y acceso de coordinadores

### 5. `service_role_select_all_profiles`
```sql
-- Admin backend ve todos los profiles
USING (true)
```
✅ **Permite:** Operaciones administrativas y migraciones

## 🐛 Troubleshooting

### Error persiste después de migración

**Causa:** Cache del navegador o sesión antigua.

**Solución:**
```bash
1. Cerrar todas las pestañas de la app
2. Limpiar localStorage:
   - F12 → Console
   - localStorage.clear()
   - sessionStorage.clear()
3. Cerrar sesión en Supabase:
   - await supabase.auth.signOut()
4. Refrescar página
5. Iniciar sesión de nuevo
```

### Error: "new row violates row-level security policy"

**Causa:** Política INSERT muy restrictiva.

**Solución:**
```sql
-- Verificar que existe system_insert_profiles
SELECT * FROM pg_policies 
WHERE policyname = 'system_insert_profiles';

-- Si no existe, ejecutar solo esa política
CREATE POLICY "system_insert_profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (true);
```

### Error: "permission denied for table profiles"

**Causa:** RLS no está habilitado o políticas mal configuradas.

**Solución:**
```sql
-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Re-ejecutar migración completa
\i supabase/migrations/20251027_fix_rls_profiles.sql
```

## ✅ Verificación Final

### Query de Prueba 1: Ver propio perfil
```sql
-- Ejecutar como usuario autenticado
SELECT * FROM profiles WHERE id = auth.uid();
```
**Debe devolver:** 1 fila con tus datos ✅

### Query de Prueba 2: Contar políticas
```sql
SELECT COUNT(*) as total_politicas
FROM pg_policies
WHERE tablename = 'profiles';
```
**Debe devolver:** 5 políticas ✅

### Query de Prueba 3: Test de login
```javascript
// En la consola del navegador
const { data: { user } } = await supabase.auth.getUser()
console.log('Usuario:', user?.id)

const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()

console.log('Perfil:', profile)
```
**Debe mostrar:** Objeto profile con tus datos ✅

## 📋 Checklist de Aplicación

- [ ] Ejecutar migración `20251027_fix_rls_profiles.sql`
- [ ] Verificar que muestra "✅ Políticas RLS configuradas correctamente"
- [ ] Verificar que hay 5 políticas en pg_policies
- [ ] Cerrar sesión completamente
- [ ] Limpiar localStorage/sessionStorage
- [ ] Iniciar sesión de nuevo
- [ ] Confirmar que NO aparece el error
- [ ] Confirmar que el perfil se carga correctamente
- [ ] Probar crear un paciente nuevo (usar RPC)

## 🎯 Resultado Esperado

**ANTES (❌):**
```
1. Usuario inicia sesión
2. Auth exitoso ✅
3. Intenta cargar perfil...
4. Error: No se pudo cargar el perfil ❌
5. Usuario no puede usar la app ❌
```

**DESPUÉS (✅):**
```
1. Usuario inicia sesión
2. Auth exitoso ✅
3. Carga perfil desde profiles ✅
4. Perfil disponible en toda la app ✅
5. Usuario puede usar todas las funciones ✅
```

---

**Fecha:** 27 de octubre de 2025  
**Prioridad:** 🔴 CRÍTICA - Bloquea login  
**Estado:** ✅ Solución lista para aplicar  
**Tiempo de aplicación:** 2 minutos  
**Archivos:**
- `/supabase/migrations/20251027_fix_rls_profiles.sql` (NUEVO)
- `/FIX_LOGIN_PROFILE_RLS.md` (este archivo)
