# ⚡ Solución Rápida: Error 500 en Login

## 🎯 Para resolver el problema AHORA (3 pasos)

### Paso 1: Diagnóstico (30 segundos)
1. Ve a [Supabase Dashboard](https://app.supabase.com/project/pcbchuaezokqppwsbnty/editor)
2. Abre **SQL Editor**
3. Copia y pega este script:
   ```
   supabase/migrations/verificar_estado_profiles.sql
   ```
4. Ejecuta (Ctrl+Enter o botón Run)

### Paso 2: Aplicar Solución (1 minuto)
1. En el mismo SQL Editor, crea una nueva query
2. Copia y pega este script:
   ```
   supabase/migrations/20251025_fix_profiles_rls.sql
   ```
3. Ejecuta (Ctrl+Enter o botón Run)
4. Espera a que termine (verás mensajes de confirmación)

### Paso 3: Crear tu perfil (30 segundos)
```sql
-- Ejecutar en SQL Editor
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

### ✅ Verificar que funcionó
```sql
-- Ver tu perfil
SELECT * FROM public.profiles 
WHERE email = 'karemeyde@gmail.com';
```

**Deberías ver:**
| id | email | nombre | rol | created_at |
|----|-------|--------|-----|------------|
| d618017c-... | karemeyde@gmail.com | Karem Peña | psicologa | 2025-10-25... |

---

## 🧪 Probar el Login

1. **Cierra sesión** si estás logueado
2. **Limpia caché** (Ctrl+Shift+R en Chrome/Firefox)
3. **Inicia sesión** con `karemeyde@gmail.com`

**Deberías ver en la consola:**
```
[Login] Usuario autenticado: karemeyde@gmail.com ID: d618017c-ea73-4d69-af50-32afb824f407
[Login] Obteniendo perfil para usuario: d618017c-ea73-4d69-af50-32afb824f407
[Login] Perfil obtenido: karemeyde@gmail.com Rol: psicologa
[Login] Redirigiendo usuario con rol 'psicologa' a /terapeuta/dashboard
```

---

## 🐛 Si sigue sin funcionar

### Opción 1: Script de diagnóstico automático
```bash
node scripts/test-supabase-connection.js
```

### Opción 2: Verificar RLS manualmente
```sql
-- Ver políticas RLS
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';
```

Deberías ver al menos:
- `authenticated_users_select_own_profile` (SELECT)
- `authenticated_users_update_own_profile` (UPDATE)
- `staff_select_all_profiles` (SELECT)

### Opción 3: Desactivar RLS temporalmente (SOLO DEBUG)
```sql
-- ⚠️ SOLO PARA PROBAR - NO DEJAR ASÍ
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Después de probar, REACTIVAR:
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

---

## 📚 Documentación Completa

Si necesitas más detalles:
- 📄 **FIX_ERROR_500_RESUMEN_EJECUTIVO.md** - Resumen completo
- 📄 **SOLUCION_ERROR_500_PERFIL.md** - Guía detallada paso a paso
- 📄 **supabase/migrations/20251025_fix_profiles_rls.sql** - Script de solución
- 📄 **scripts/test-supabase-connection.js** - Diagnóstico automatizado

---

## ⏱️ Tiempo total estimado: **2-3 minutos**

✅ **Paso 1:** Diagnóstico (30s)  
✅ **Paso 2:** Aplicar solución (1m)  
✅ **Paso 3:** Crear perfil (30s)  
✅ **Verificar:** Login funciona (30s)

---

## 🎉 Resultado Esperado

Después de estos pasos:
- ✅ Login funciona sin error 500
- ✅ Perfil se carga correctamente
- ✅ Redirección automática a /terapeuta/dashboard
- ✅ Sistema completamente funcional

---

**¿Problemas?** Ejecuta `node scripts/test-supabase-connection.js` para diagnóstico detallado.
