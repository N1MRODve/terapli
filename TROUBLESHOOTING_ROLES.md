# 🔧 Troubleshooting: Sistema de Roles

## ❌ Error: `id=eq.undefined` en consultas a Supabase

### Síntoma:
```
Failed to load resource: the server responded with a status of 500
pcbchuaezokqppwsbnty.supabase.co/rest/v1/profiles?select=*&id=eq.undefined
Error al cargar perfil: Object
No se pudo obtener el rol del usuario
```

### Causa:
El sistema intenta cargar el perfil del usuario **antes** de que la sesión se haya establecido completamente.

### Solución:
✅ **Ya está implementada** en la versión actual:

1. **Validación en `loadUserProfile()`**:
   - Verifica que `user.value?.id` existe antes de consultar
   - Retorna `null` si no hay usuario autenticado

2. **Validación en `getUserRole()`**:
   - Verifica que hay usuario antes de intentar obtener el rol
   - Logs informativos para debugging

3. **Middleware auth-role mejorado**:
   - No intenta validar roles sin sesión activa
   - Deja que `auth.ts` maneje la redirección al login

4. **Login con timeout**:
   - Espera 100ms antes de cargar el perfil
   - Da tiempo a que Supabase Auth actualice el estado

---

## ❌ Error: Bucle de redirección infinito

### Síntoma:
El navegador muestra "Too many redirects" o la página se queda cargando indefinidamente.

### Causa:
El middleware redirige en un bucle entre rutas.

### Solución:
```typescript
// El middleware verifica si ya está en la ruta correcta
if (currentPath.startsWith(basePath)) {
  return // No redirige
}
```

---

## ❌ Error: Usuario no puede acceder a su dashboard

### Síntoma:
Después del login, el usuario es redirigido al login nuevamente.

### Diagnóstico:

1. **Verificar que el perfil existe en Supabase**:
```sql
SELECT * FROM public.profiles WHERE email = 'tu@email.com';
```

2. **Verificar el rol del usuario**:
```sql
SELECT email, rol FROM public.profiles;
```

3. **Verificar que el enum está correcto**:
```sql
SELECT enum_range(NULL::user_role);
-- Debe retornar: {paciente,psicologa,coordinadora}
```

### Solución:

Si el perfil no existe:
```sql
INSERT INTO public.profiles (id, email, nombre, rol)
VALUES (
  'USER_UUID',  -- Obtener de auth.users
  'tu@email.com',
  'Nombre Completo',
  'psicologa'  -- o 'coordinadora' o 'paciente'
);
```

Si el rol es incorrecto:
```sql
UPDATE public.profiles 
SET rol = 'psicologa'  -- Cambiar según corresponda
WHERE email = 'tu@email.com';
```

---

## ❌ Error: "No match found for location with path"

### Síntoma:
```
[Vue Router warn]: No match found for location with path "/contacto"
```

### Causa:
La ruta no existe en el router.

### Solución:
1. **Crear la página** si debería existir:
```bash
touch pages/contacto.vue
```

2. **O actualizar los enlaces** para usar rutas existentes.

---

## 🐛 Debugging

### Habilitar logs detallados:

Los logs ya están implementados con prefijos:
- `[useSupabase]` - Composable de autenticación
- `[Login]` - Página de login
- `[auth-role]` - Middleware de roles

### Ver logs en el navegador:

1. Abrir DevTools (F12)
2. Ir a la pestaña Console
3. Buscar los prefijos mencionados

### Ejemplo de logs normales:

```
[Login] Usuario autenticado: psicologa@test.com
[useSupabase] Perfil cargado: psicologa@test.com Rol: psicologa
[Login] Redirigiendo usuario con rol 'psicologa' a /terapeuta/dashboard
[auth-role] Usuario con rol: psicologa accediendo a: /terapeuta/dashboard
```

---

## ✅ Checklist de Verificación

Cuando algo no funciona, verifica en orden:

- [ ] ¿El usuario está autenticado? (Verificar en Supabase Dashboard > Authentication)
- [ ] ¿El perfil existe en la tabla `profiles`?
- [ ] ¿El rol es uno de: `paciente`, `psicologa`, `coordinadora`?
- [ ] ¿Las políticas RLS están habilitadas y correctas?
- [ ] ¿El navegador tiene cookies habilitadas?
- [ ] ¿Hay errores en la consola del navegador?
- [ ] ¿El servidor de desarrollo está corriendo sin errores?

---

## 📋 Comandos Útiles

### Ver usuarios y sus roles:
```sql
SELECT 
  p.email,
  p.nombre,
  p.rol,
  p.created_at,
  u.confirmed_at
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC;
```

### Ver políticas RLS activas:
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles';
```

### Limpiar sesión en el navegador:
```javascript
// En la consola del navegador:
localStorage.clear()
sessionStorage.clear()
location.reload()
```

---

## 🆘 Soporte

Si después de seguir estos pasos el problema persiste:

1. **Revisar los logs del servidor**:
   ```bash
   npm run dev
   ```

2. **Verificar la versión de Supabase**:
   ```bash
   npm list @nuxtjs/supabase
   ```

3. **Revisar la documentación**:
   - `TEST_LOGIN_ROLES.md` - Documentación técnica
   - `ROLES_GUIA_USO.md` - Guía de uso
   - `QUICKSTART_LOGIN_ROLES.md` - Setup rápido

---

## 🔍 Problemas Conocidos

### PWA con Service Worker
El error de Workbox (`non-precached-url`) es un warning del PWA y **no afecta** el sistema de roles. Puede ser ignorado en desarrollo.

### Extensions de Chrome
Algunas extensiones pueden interferir con las cookies/sesión. Prueba en modo incógnito si hay problemas.

---

**Última actualización**: 23 de octubre de 2025
