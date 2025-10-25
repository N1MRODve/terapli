# 🔧 Solución: Error 500 al obtener perfil de usuario

## 📊 Diagnóstico del Problema

### Síntomas observados:
```
[Login] Usuario autenticado: karemeyde@gmail.com ID: d618017c-ea73-4d69-af50-32afb824f407
[Login] Obteniendo perfil para usuario: d618017c-ea73-4d69-af50-32afb824f407
Failed to load resource: the server responded with a status of 500
[Login] Error al obtener perfil: Object
```

### 🔍 Análisis:
1. ✅ **Usuario autenticado correctamente** en Supabase Auth
2. ❌ **Error 500** al consultar la tabla `profiles`
3. 🔐 **Causa probable**: Políticas RLS bloqueando el acceso O tabla `profiles` no existe/incorrecta

---

## 🛠️ Solución Paso a Paso

### **Paso 1: Ejecutar Script de Corrección en Supabase**

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Click en **SQL Editor** en el menú lateral
3. Click en **New Query**
4. Copia y pega el contenido del archivo:
   ```
   supabase/migrations/20251025_fix_profiles_rls.sql
   ```
5. Click en **Run** o presiona `Ctrl+Enter` / `Cmd+Enter`

### **Paso 2: Verificar que todo se ejecutó correctamente**

Deberías ver mensajes como:
```
✓ Tipo user_role creado correctamente (o ya existe)
✓ Tabla profiles creada
✓ Políticas RLS configuradas
✓ Triggers creados
```

### **Paso 3: Verificar tu usuario en la tabla profiles**

Ejecuta esta consulta en SQL Editor:

```sql
-- Ver tu usuario específico
SELECT 
    u.id,
    u.email as auth_email,
    p.email as profile_email,
    p.nombre,
    p.rol,
    p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'karemeyde@gmail.com';
```

**Resultado esperado:**
| id | auth_email | profile_email | nombre | rol | created_at |
|----|------------|---------------|--------|-----|------------|
| d618017c-... | karemeyde@gmail.com | karemeyde@gmail.com | Karem | psicologa | 2025-10-25... |

### **Paso 4: Si tu usuario NO tiene perfil, créalo manualmente**

```sql
-- Crear perfil para tu usuario
INSERT INTO public.profiles (id, email, nombre, rol)
VALUES (
    'd618017c-ea73-4d69-af50-32afb824f407'::uuid,
    'karemeyde@gmail.com',
    'Karem Peña',
    'psicologa'::user_role
)
ON CONFLICT (id) DO UPDATE
SET 
    nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol;
```

### **Paso 5: Verificar las políticas RLS**

```sql
-- Ver todas las políticas de la tabla profiles
SELECT 
    policyname,
    cmd as operacion,
    CASE 
        WHEN cmd = 'SELECT' THEN 'Lectura'
        WHEN cmd = 'UPDATE' THEN 'Actualización'
        WHEN cmd = 'INSERT' THEN 'Inserción'
        WHEN cmd = 'DELETE' THEN 'Eliminación'
    END as tipo
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
```

**Deberías ver 5 políticas:**
1. `authenticated_users_select_own_profile` - SELECT
2. `authenticated_users_update_own_profile` - UPDATE
3. `staff_select_all_profiles` - SELECT
4. `coordinadora_insert_profiles` - INSERT
5. `coordinadora_update_other_profiles` - UPDATE

### **Paso 6: Probar desde la aplicación**

1. **Cierra sesión** si estás logueado
2. **Limpia el caché del navegador** (o abre en modo incógnito)
3. **Inicia sesión** nuevamente con `karemeyde@gmail.com`

Deberías ver en la consola:
```
[Login] Usuario autenticado: karemeyde@gmail.com ID: d618017c-...
[Login] Obteniendo perfil para usuario: d618017c-...
[Login] Perfil obtenido: karemeyde@gmail.com Rol: psicologa
[Login] Redirigiendo usuario con rol 'psicologa' a /terapeuta/dashboard
```

---

## 🔍 Verificación Adicional: Probar la consulta manualmente

### En SQL Editor, ejecuta:

```sql
-- Cambiar el UUID por el tuyo
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "d618017c-ea73-4d69-af50-32afb824f407"}';

-- Probar la consulta que hace tu app
SELECT rol, nombre, email
FROM public.profiles
WHERE id = 'd618017c-ea73-4d69-af50-32afb824f407'::uuid;
```

Si esta consulta funciona, tu app también debería funcionar.

---

## 🐛 Si el problema persiste

### Opción 1: Verificar logs del servidor Supabase

1. Ve a **Logs** en Supabase Dashboard
2. Busca errores relacionados con `profiles`
3. Copia el error exacto

### Opción 2: Desactivar RLS temporalmente (SOLO PARA DEBUG)

**⚠️ ADVERTENCIA: Esto desactiva la seguridad. Solo usar en desarrollo.**

```sql
-- SOLO PARA DEBUG - NO USAR EN PRODUCCIÓN
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Probar login

-- Después, REACTIVAR RLS:
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

Si funciona sin RLS, el problema está en las políticas.

### Opción 3: Ver errores detallados en la app

Modifica temporalmente `pages/login.vue`:

```typescript
// Línea ~170
const { data: profile, error } = await supabase
  .from('profiles')
  .select('rol, nombre, email')
  .eq('id', userId)
  .single()

if (error) {
  console.error('[Login] Error COMPLETO:', JSON.stringify(error, null, 2))
  console.error('[Login] Error code:', error.code)
  console.error('[Login] Error message:', error.message)
  console.error('[Login] Error details:', error.details)
  console.error('[Login] Error hint:', error.hint)
  errorMessage.value = `Error: ${error.message} (${error.code})`
  return
}
```

---

## 📝 Checklist de Verificación

- [ ] Script `20251025_fix_profiles_rls.sql` ejecutado sin errores
- [ ] Tabla `profiles` existe en Supabase
- [ ] RLS está habilitado en `profiles`
- [ ] 5 políticas RLS creadas correctamente
- [ ] Usuario `karemeyde@gmail.com` tiene perfil en tabla `profiles`
- [ ] Rol del usuario está configurado correctamente (`psicologa`)
- [ ] Login funciona sin error 500
- [ ] Redirección automática funciona según el rol

---

## 🎯 Resultado Esperado

Después de aplicar esta solución:

1. ✅ Login funciona correctamente
2. ✅ Perfil se carga sin errores
3. ✅ Redirección automática según rol
4. ✅ No más errores 500
5. ✅ Logs en consola muestran el flujo completo

```
[Login] Usuario autenticado: karemeyde@gmail.com ID: d618017c-ea73-4d69-af50-32afb824f407
[Login] Obteniendo perfil para usuario: d618017c-ea73-4d69-af50-32afb824f407
[Login] Perfil obtenido: karemeyde@gmail.com Rol: psicologa
[Login] Redirigiendo usuario con rol 'psicologa' a /terapeuta/dashboard
```

---

## 📚 Recursos Adicionales

- [Documentación de RLS en Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [SQL Editor en Supabase](https://supabase.com/docs/guides/database/overview#the-sql-editor)
- [Políticas de seguridad](https://supabase.com/docs/guides/database/postgres/row-level-security)

---

## 💡 Prevención para el futuro

### Para crear nuevos usuarios:

1. **Opción A: Registro automático** (recomendado)
   - El trigger `handle_new_user()` crea el perfil automáticamente
   - Usuarios nuevos se crean con rol `paciente` por defecto

2. **Opción B: Creación manual en Supabase Dashboard**
   ```sql
   -- Después de crear el usuario en Authentication
   INSERT INTO public.profiles (id, email, nombre, rol)
   VALUES (
       '<UUID_DEL_USUARIO>'::uuid,
       'email@ejemplo.com',
       'Nombre Completo',
       'paciente'::user_role  -- o 'psicologa', 'coordinadora'
   );
   ```

### Para cambiar roles:

```sql
-- Cambiar rol de un usuario
UPDATE public.profiles
SET rol = 'psicologa'::user_role
WHERE email = 'email@ejemplo.com';
```

---

**¿Necesitas más ayuda?** Revisa los logs detallados en la consola del navegador y en Supabase Dashboard.
