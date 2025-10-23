# 🔑 Crear Usuario de Coordinación - Guía Rápida

## 📝 Credenciales Recomendadas

```
Email:    coordinacion@psicologakarem.com
Password: Coord2025!
Rol:      coordinacion
```

---

## 🚀 Opción 1: Crear desde Supabase Dashboard (RECOMENDADO)

### Paso 1: Acceder a Supabase Dashboard

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto: **psicokarem**
3. En el menú lateral, haz clic en **Authentication**

### Paso 2: Crear Usuario

1. Click en **Users**
2. Click en el botón **Add User** (arriba a la derecha)
3. Completa el formulario:

```
Email address: coordinacion@psicologakarem.com
Password:      Coord2025!
```

4. **IMPORTANTE**: Activa el toggle **"Auto Confirm User"** ✓
5. Click en **Create User**

### Paso 3: Configurar Metadata

Después de crear el usuario:

1. En la lista de usuarios, haz click en el usuario recién creado
2. Busca la sección **User Metadata**
3. Click en **Edit**
4. Agrega este JSON:

```json
{
  "rol": "coordinacion",
  "nombre": "Coordinación Clínica"
}
```

5. Click en **Save**

### Paso 4: Actualizar tabla Profiles

Ve a **SQL Editor** y ejecuta:

```sql
UPDATE profiles 
SET 
  rol = 'coordinacion',
  nombre = 'Coordinación Clínica'
WHERE email = 'coordinacion@psicologakarem.com';
```

---

## 🚀 Opción 2: Crear desde SQL (AVANZADO)

### Paso 1: Ejecutar en SQL Editor

```sql
-- Primero debes tener la extensión de Supabase Auth instalada
-- Ejecuta esto si no existe el usuario:

-- NOTA: Esto solo funciona si tienes acceso directo a auth.users
-- Es mejor usar el Dashboard (Opción 1)

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'coordinacion@psicologakarem.com',
  crypt('Coord2025!', gen_salt('bf')), -- Requiere extensión pgcrypto
  now(),
  '{"rol": "coordinacion", "nombre": "Coordinación Clínica"}'::jsonb,
  now(),
  now()
);
```

⚠️ **ADVERTENCIA**: Esta opción es más compleja y puede fallar. **Usa la Opción 1**.

---

## ✅ Verificar que Funciona

### 1. Verificar en SQL Editor

```sql
-- Ver usuario en auth.users
SELECT 
  email,
  raw_user_meta_data->>'rol' as rol,
  email_confirmed_at
FROM auth.users
WHERE email = 'coordinacion@psicologakarem.com';

-- Ver usuario en profiles
SELECT 
  email,
  nombre,
  rol
FROM profiles
WHERE email = 'coordinacion@psicologakarem.com';
```

Deberías ver:
- ✅ Email confirmado (no NULL)
- ✅ Rol = "coordinacion"
- ✅ Nombre = "Coordinación Clínica"

### 2. Probar Login

1. Inicia tu aplicación:
```bash
npm run dev
```

2. Navega a: `http://localhost:3000/coordinacion/login`

3. Ingresa:
```
Email:    coordinacion@psicologakarem.com
Password: Coord2025!
```

4. Click en **Iniciar sesión**

5. Deberías ser redirigido a: `/coordinacion/dashboard` ✅

---

## 🐛 Solución de Problemas

### Error: "Invalid login credentials"

**Causa**: El usuario no existe o la contraseña es incorrecta.

**Solución**:
1. Verifica que el usuario existe en Authentication > Users
2. Si no existe, créalo (Opción 1)
3. Si existe, resetea la contraseña desde el Dashboard

### Error: "No tienes permisos de coordinación"

**Causa**: El rol no está configurado correctamente.

**Solución**:
```sql
-- Actualizar metadata en auth.users
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{rol}',
  '"coordinacion"'
)
WHERE email = 'coordinacion@psicologakarem.com';

-- Actualizar en profiles
UPDATE profiles 
SET rol = 'coordinacion'
WHERE email = 'coordinacion@psicologakarem.com';
```

### Error: "Email not confirmed"

**Causa**: El email del usuario no está confirmado.

**Solución**:
```sql
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'coordinacion@psicologakarem.com';
```

---

## 📋 Checklist de Verificación

Antes de intentar hacer login, verifica:

- [ ] ✅ Usuario creado en Supabase Auth
- [ ] ✅ Email confirmado (auto-confirm activado)
- [ ] ✅ Metadata con `{"rol": "coordinacion"}` configurado
- [ ] ✅ Tabla `profiles` tiene el rol actualizado
- [ ] ✅ Script `supabase_coordinacion_setup.sql` ejecutado
- [ ] ✅ Aplicación corriendo en `localhost:3000`
- [ ] ✅ Navegas a `/coordinacion/login`

---

## 🎯 Resumen Rápido

### Credenciales de Demo

```
URL:      http://localhost:3000/coordinacion/login
Email:    coordinacion@psicologakarem.com  
Password: Coord2025!
```

### Pasos Mínimos

1. **Crear usuario** en Supabase Dashboard (Authentication > Users > Add User)
2. **Activar** "Auto Confirm User" ✓
3. **Agregar metadata**: `{"rol": "coordinacion"}`
4. **Ejecutar SQL**: `UPDATE profiles SET rol = 'coordinacion' WHERE email = 'coordinacion@psicologakarem.com';`
5. **Login** en `/coordinacion/login`

---

## 🆘 ¿Necesitas Ayuda?

Si después de seguir estos pasos aún no puedes acceder:

1. **Verifica logs del navegador** (F12 > Console)
2. **Revisa la consola del servidor** (terminal donde corre `npm run dev`)
3. **Ejecuta queries de verificación** en SQL Editor
4. **Revisa que el script de setup** se ejecutó correctamente

---

**¡Listo! Con esto deberías poder acceder al panel de coordinación.** 🎉

Si tienes problemas, avísame y te ayudo a resolverlos paso a paso.
