# 🚀 Corrección Completa del Error 500 en Login

## 📊 Estado Actual

### Problema identificado:
```
Error 500 al obtener perfil después de login exitoso
Usuario: karemeyde@gmail.com
ID: d618017c-ea73-4d69-af50-32afb824f407
```

### Causa raíz:
1. **Tabla `profiles` no existe o está mal configurada**
2. **Políticas RLS bloqueando el acceso**
3. **Usuario sin perfil en la tabla `profiles`**

---

## 🛠️ Archivos Modificados/Creados

### 1. **Script de Migración SQL** ✅
📁 `supabase/migrations/20251025_fix_profiles_rls.sql`

**Qué hace:**
- Crea el tipo `user_role` (paciente, psicologa, coordinadora, admin)
- Crea la tabla `profiles` con estructura correcta
- Configura políticas RLS correctamente
- Crea triggers para auto-crear perfiles
- Crea perfiles para usuarios existentes en auth.users
- Incluye verificaciones y diagnósticos

**Cómo usarlo:**
```sql
-- En Supabase Dashboard > SQL Editor
-- Copiar y pegar el contenido completo
-- Ejecutar con Run o Ctrl+Enter
```

---

### 2. **Guía de Solución Completa** ✅
📁 `SOLUCION_ERROR_500_PERFIL.md`

**Contenido:**
- Diagnóstico detallado del problema
- Solución paso a paso con capturas
- Verificaciones necesarias
- Troubleshooting avanzado
- Checklist de verificación
- Prevención para el futuro

**Para quién:**
- Desarrolladores
- Administradores de Supabase
- Personal técnico

---

### 3. **Script de Diagnóstico Node.js** ✅
📁 `scripts/test-supabase-connection.js`

**Qué hace:**
- Verifica conexión con Supabase
- Prueba acceso a tabla `profiles`
- Detecta problemas de RLS
- Muestra perfiles existentes
- Identifica si el usuario tiene perfil

**Cómo usarlo:**
```bash
# Instalar dependencias si es necesario
npm install @supabase/supabase-js dotenv

# Ejecutar
node scripts/test-supabase-connection.js
```

**Output esperado:**
```
🔍 Diagnóstico de Conexión Supabase
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Variables de entorno:
✓ SUPABASE_URL: ✅ Configurada
✓ SUPABASE_ANON_KEY: ✅ Configurada
✓ SUPABASE_SERVICE_ROLE_KEY: ✅ Configurada

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  Probando conexión básica...
✅ Conexión exitosa con tabla profiles
   Total de perfiles: 3

...
```

---

### 4. **Mejoras en el código** ✅

#### `pages/login.vue`
**Cambios:**
- Logs más detallados de errores
- Mensajes de error específicos según código
- Mejor manejo de errores de RLS

**Nuevo comportamiento:**
```javascript
if (error.code === 'PGRST116') {
  errorMessage.value = 'No se encontró tu perfil. Por favor, contacta a soporte para crear tu cuenta.'
} else if (error.code === '42501') {
  errorMessage.value = 'No tienes permisos para acceder. Verifica tu configuración de cuenta.'
}
```

#### `composables/useSupabase.ts`
**Cambios:**
- Logs más detallados en `loadUserProfile()`
- Muestra código y detalles del error
- Mejor diagnóstico de problemas

---

## 🎯 Solución Rápida (5 minutos)

### Paso 1: Ejecutar migración en Supabase
1. Abre [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a SQL Editor
3. Copia el contenido de `supabase/migrations/20251025_fix_profiles_rls.sql`
4. Pega y ejecuta

### Paso 2: Verificar que tu usuario tiene perfil
```sql
SELECT * FROM public.profiles WHERE email = 'karemeyde@gmail.com';
```

Si no existe, créalo:
```sql
INSERT INTO public.profiles (id, email, nombre, rol)
VALUES (
    'd618017c-ea73-4d69-af50-32afb824f407'::uuid,
    'karemeyde@gmail.com',
    'Karem Peña',
    'psicologa'::user_role
);
```

### Paso 3: Probar login
1. Cierra sesión
2. Limpia caché del navegador
3. Inicia sesión nuevamente

---

## 🔍 Diagnóstico Avanzado

### Si el problema persiste después de aplicar la solución:

#### 1. Ejecutar script de diagnóstico
```bash
node scripts/test-supabase-connection.js
```

#### 2. Verificar logs de Supabase
- Ir a Logs en Supabase Dashboard
- Buscar errores en tiempo real

#### 3. Probar consulta manualmente
```sql
-- En SQL Editor, simular la consulta de la app
SELECT rol, nombre, email
FROM public.profiles
WHERE id = 'd618017c-ea73-4d69-af50-32afb824f407'::uuid;
```

#### 4. Verificar políticas RLS
```sql
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'profiles';
```

Deberías ver al menos estas políticas:
- `authenticated_users_select_own_profile`
- `authenticated_users_update_own_profile`
- `staff_select_all_profiles`

---

## ✅ Checklist de Verificación

- [ ] Script `20251025_fix_profiles_rls.sql` ejecutado
- [ ] Tabla `profiles` existe y tiene estructura correcta
- [ ] RLS habilitado en tabla `profiles`
- [ ] 5 políticas RLS creadas
- [ ] Usuario `karemeyde@gmail.com` tiene perfil
- [ ] Rol del usuario es `psicologa`
- [ ] Login funciona sin error 500
- [ ] Redirección a dashboard funciona
- [ ] Logs en consola muestran perfil cargado

---

## 📝 Flujo Correcto Esperado

### 1. Login exitoso
```javascript
[Login] Usuario autenticado: karemeyde@gmail.com ID: d618017c-ea73-4d69-af50-32afb824f407
```

### 2. Obtención de perfil
```javascript
[Login] Obteniendo perfil para usuario: d618017c-ea73-4d69-af50-32afb824f407
[Login] Perfil obtenido: karemeyde@gmail.com Rol: psicologa
```

### 3. Redirección
```javascript
[Login] Redirigiendo usuario con rol 'psicologa' a /terapeuta/dashboard
```

---

## 🔐 Políticas RLS Configuradas

### Lectura (SELECT)
1. **usuarios autenticados ven su propio perfil**
   ```sql
   USING (auth.uid() = id)
   ```

2. **staff ve todos los perfiles**
   ```sql
   USING (EXISTS (
     SELECT 1 FROM profiles p
     WHERE p.id = auth.uid()
     AND p.rol IN ('psicologa', 'coordinadora', 'admin')
   ))
   ```

### Escritura (UPDATE)
1. **usuarios actualizan su propio perfil**
   ```sql
   USING (auth.uid() = id)
   WITH CHECK (auth.uid() = id)
   ```

2. **coordinadoras actualizan otros perfiles**
   ```sql
   USING (EXISTS (
     SELECT 1 FROM profiles p
     WHERE p.id = auth.uid()
     AND p.rol IN ('coordinadora', 'admin')
   ))
   ```

### Inserción (INSERT)
1. **solo coordinadoras y admins crean perfiles**
   ```sql
   WITH CHECK (EXISTS (
     SELECT 1 FROM profiles p
     WHERE p.id = auth.uid()
     AND p.rol IN ('coordinadora', 'admin')
   ))
   ```

---

## 🎓 Para Prevenir Problemas Futuros

### Al crear nuevos usuarios:

1. **Método automático** (recomendado)
   - El trigger `handle_new_user()` crea el perfil automáticamente
   - Solo asegúrate de que el trigger esté activo

2. **Método manual** (cuando sea necesario)
   ```sql
   INSERT INTO public.profiles (id, email, nombre, rol)
   SELECT 
       u.id,
       u.email,
       'Nombre del Usuario',
       'paciente'::user_role
   FROM auth.users u
   WHERE u.email = 'nuevo@usuario.com';
   ```

### Al cambiar roles:
```sql
UPDATE public.profiles
SET rol = 'psicologa'::user_role
WHERE email = 'usuario@email.com';
```

---

## 📞 Soporte

Si después de seguir todos los pasos el problema persiste:

1. **Revisa los logs completos** en la consola del navegador
2. **Ejecuta el script de diagnóstico**: `node scripts/test-supabase-connection.js`
3. **Copia los logs** y compártelos para análisis
4. **Verifica las políticas RLS** en Supabase Dashboard

---

## 📚 Recursos

- 📄 `SOLUCION_ERROR_500_PERFIL.md` - Guía detallada
- 📄 `supabase/migrations/20251025_fix_profiles_rls.sql` - Script de corrección
- 📄 `scripts/test-supabase-connection.js` - Diagnóstico automatizado
- 🔗 [Documentación de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- 🔗 [SQL Editor](https://supabase.com/docs/guides/database/overview#the-sql-editor)

---

**Fecha:** 25 de octubre de 2025  
**Versión:** 1.0  
**Estado:** ✅ Solución completa implementada
