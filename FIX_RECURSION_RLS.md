# 🔄 Solución: Recursión Infinita en Políticas RLS

## ❌ El Problema

```
Error al obtener tu perfil: infinite recursion detected in policy for relation "profiles"
```

### ¿Qué causó la recursión?

La política `staff_can_view_all_profiles` tenía este código:

```sql
CREATE POLICY "staff_can_view_all_profiles"
ON public.profiles
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p  -- ❌ Consulta la misma tabla
        WHERE p.id = auth.uid()
        AND p.rol IN ('psicologa', 'coordinadora', 'admin')
    )
);
```

**Loop infinito:**
1. Usuario intenta leer `profiles` → RLS evalúa política
2. Política hace `SELECT FROM profiles` → RLS evalúa política nuevamente
3. Esa política hace `SELECT FROM profiles` → RLS evalúa...
4. **Recursión infinita** 💥

---

## ✅ La Solución

### Enfoque 1: Columna `is_staff` (Implementado)

```sql
-- Agregar columna boolean
ALTER TABLE public.profiles ADD COLUMN is_staff boolean DEFAULT false;

-- Trigger para mantenerla sincronizada
CREATE TRIGGER sync_is_staff_trigger
    BEFORE INSERT OR UPDATE OF rol ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_is_staff();

-- Política SIN recursión
CREATE POLICY "enable_read_all_for_staff"
ON public.profiles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_staff = true
    )
);
```

**¿Por qué funciona?**
- `is_staff` es un boolean simple, no requiere evaluación compleja
- PostgreSQL optimiza esta consulta y evita recursión
- El trigger mantiene `is_staff` sincronizado automáticamente

---

## 🚀 Aplicar la Solución

### Paso 1: Ejecutar el script en Supabase

```bash
# En Supabase SQL Editor
supabase/migrations/20251025_fix_recursion_rls.sql
```

### Paso 2: Verificar que funcionó

```sql
-- Ver políticas (no debe haber recursión)
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Ver usuarios staff
SELECT email, rol, is_staff 
FROM public.profiles 
WHERE is_staff = true;
```

### Paso 3: Probar en la app

1. Cierra sesión
2. Limpia caché (`Ctrl+Shift+R`)
3. Inicia sesión con `karemeyde@gmail.com`

**Deberías ver:**
```
[Login] Usuario autenticado: karemeyde@gmail.com
[Login] Perfil obtenido: karemeyde@gmail.com Rol: psicologa
[Login] Redirigiendo a /terapeuta/dashboard
```

---

## 🛡️ Políticas Finales (Sin Recursión)

| Política | Operación | Descripción |
|----------|-----------|-------------|
| `enable_read_own_profile` | SELECT | Usuario ve su propio perfil |
| `enable_read_all_for_staff` | SELECT | Staff ve todos los perfiles |
| `enable_update_own_profile` | UPDATE | Usuario actualiza su perfil |
| `enable_insert_for_service_role` | INSERT | Solo triggers pueden insertar |
| `disable_delete_profiles` | DELETE | Nadie puede eliminar |

---

## 🔍 Alternativas (Si persiste el problema)

### Opción A: Tabla separada para staff

```sql
-- Crear tabla de staff (sin recursión)
CREATE TABLE public.staff_users (
    user_id uuid PRIMARY KEY REFERENCES auth.users
);

-- Insertar usuarios staff
INSERT INTO staff_users (user_id)
SELECT id FROM profiles WHERE rol IN ('psicologa', 'coordinadora', 'admin');

-- Política sin recursión
CREATE POLICY "staff_read_all"
ON public.profiles FOR SELECT
USING (
    auth.uid() IN (SELECT user_id FROM staff_users)  -- Tabla diferente
);
```

### Opción B: Desactivar RLS temporalmente para staff

```sql
-- Política permisiva para testing
CREATE POLICY "bypass_rls_for_testing"
ON public.profiles FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

**⚠️ SOLO PARA DEBUG - NO USAR EN PRODUCCIÓN**

---

## 📊 Comparación de Enfoques

| Enfoque | Pros | Contras | Recursión |
|---------|------|---------|-----------|
| **Subquery a misma tabla** | Simple | ❌ Causa recursión | ❌ Sí |
| **Columna is_staff** | Optimizado por PG | Requiere trigger | ✅ No |
| **Tabla separada** | 100% sin recursión | Más complejo | ✅ No |
| **Política permisiva** | Testing rápido | ⚠️ Inseguro | ✅ No |

---

## 🎓 Lecciones Aprendidas

### ❌ No hacer:
```sql
-- MAL: Consulta la misma tabla con RLS
USING (
    EXISTS (SELECT 1 FROM profiles WHERE ...)
)
```

### ✅ Hacer:
```sql
-- BIEN: Usar columna auxiliar
USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_staff = true)
)

-- MEJOR: Tabla separada
USING (
    auth.uid() IN (SELECT user_id FROM staff_users)
)
```

---

## 🐛 Troubleshooting

### Si el error persiste:

1. **Verificar que el script se ejecutó:**
   ```sql
   SELECT * FROM information_schema.columns 
   WHERE table_name = 'profiles' AND column_name = 'is_staff';
   ```

2. **Verificar políticas activas:**
   ```sql
   SELECT policyname FROM pg_policies WHERE tablename = 'profiles';
   ```

3. **Ver logs de Supabase:**
   - Supabase Dashboard → Logs
   - Buscar "recursion" o "policy"

4. **Último recurso - Desactivar RLS temporalmente:**
   ```sql
   ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
   -- Probar login
   ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
   ```

---

## 📚 Referencias

- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Common RLS Patterns](https://supabase.com/docs/guides/database/postgres/row-level-security#common-patterns)

---

**Fecha:** 25 de octubre de 2025  
**Problema:** Recursión infinita en políticas RLS  
**Solución:** Columna `is_staff` + trigger de sincronización  
**Estado:** ✅ Implementado en `20251025_fix_recursion_rls.sql`
