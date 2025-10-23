# 🚀 SOLUCIÓN: Crear Usuario para Panel de Coordinación

## ❌ Problema: "Credenciales incorrectas"

**Causa**: El usuario no existe en la base de datos o la contraseña está mal configurada.

---

## ✅ SOLUCIÓN (3 minutos)

### Opción 1: Usando Supabase Dashboard (RECOMENDADO)

#### Paso 1: Ir al SQL Editor

1. Abre tu navegador
2. Ve a: https://supabase.com/dashboard/project/TU_PROYECTO
3. En el menú lateral, click en **SQL Editor**

#### Paso 2: Ejecutar Script

1. Copia TODO el contenido del archivo: `crear_usuario_dashboard.sql`
2. Pégalo en el SQL Editor
3. Click en **"Run"** o presiona **Ctrl/Cmd + Enter**

#### Paso 3: Verificar

Deberías ver este resultado:

```
✅ Usuario creado exitosamente
Email: coordinacion@local.test
Email confirmado: true
Rol: coordinacion
```

#### Paso 4: Probar Login

```bash
# En tu terminal, inicia la app
npm run dev
```

Luego abre: http://localhost:3000/coordinacion/login

**Credenciales:**
```
Email:    coordinacion@local.test
Password: Admin123!
```

---

### Opción 2: Si prefieres usar UI (Más Simple)

#### Paso 1: Crear Usuario en Authentication

1. Ve a: **Authentication** > **Users**
2. Click en **"Add User"**
3. Completa:
   ```
   Email: coordinacion@local.test
   Password: Admin123!
   ```
4. ✅ Activa **"Auto Confirm User"**
5. Click **"Create User"**

#### Paso 2: Configurar Metadata

Después de crear el usuario:

1. Click en el usuario recién creado
2. Busca **User Metadata** 
3. Click **"Edit"** o el ícono de lápiz
4. Pega este JSON:
   ```json
   {
     "rol": "coordinacion",
     "nombre": "Coordinación Test"
   }
   ```
5. Click **"Save"**

#### Paso 3: Actualizar Profile

Ve al **SQL Editor** y ejecuta:

```sql
UPDATE profiles 
SET 
  rol = 'coordinacion',
  nombre = 'Coordinación Test'
WHERE email = 'coordinacion@local.test';
```

#### Paso 4: Verificar

```sql
SELECT email, rol FROM profiles WHERE email = 'coordinacion@local.test';
```

Debería mostrar:
```
email                    | rol
-------------------------|-------------
coordinacion@local.test  | coordinacion
```

---

## 🔍 VERIFICACIÓN RÁPIDA

Si aún no funciona, ejecuta esto en SQL Editor:

```sql
-- Ver si el usuario existe
SELECT 
  email, 
  email_confirmed_at IS NOT NULL as confirmado,
  raw_user_meta_data->>'rol' as rol
FROM auth.users 
WHERE email = 'coordinacion@local.test';

-- Ver el perfil
SELECT email, nombre, rol 
FROM profiles 
WHERE email = 'coordinacion@local.test';
```

**Resultado esperado:**
- ✅ Usuario existe en `auth.users`
- ✅ Email confirmado = true
- ✅ Metadata tiene `rol: "coordinacion"`
- ✅ Perfil existe en `profiles` con `rol = 'coordinacion'`

---

## 🐛 Si sigue sin funcionar

### Debug 1: Verificar contraseña

El script usa `crypt('Admin123!', gen_salt('bf'))` para encriptar la contraseña.

Si quieres cambiarla, ejecuta:

```sql
UPDATE auth.users
SET encrypted_password = crypt('TU_NUEVA_PASSWORD', gen_salt('bf'))
WHERE email = 'coordinacion@local.test';
```

### Debug 2: Ver errores en la consola del navegador

1. Abre el navegador (Chrome/Firefox)
2. Presiona **F12** para abrir DevTools
3. Ve a la pestaña **Console**
4. Intenta hacer login
5. Copia cualquier error que aparezca y avísame

### Debug 3: Ver errores del servidor

En la terminal donde corre `npm run dev`, busca mensajes de error después de intentar login.

---

## 📋 RESUMEN

**Método más rápido:**

1. Ve a Supabase Dashboard
2. SQL Editor
3. Pega el contenido de `crear_usuario_dashboard.sql`
4. Run
5. Login en `/coordinacion/login` con:
   - Email: `coordinacion@local.test`
   - Password: `Admin123!`

---

## 🆘 NECESITAS AYUDA

Si después de esto sigue sin funcionar:

1. Envíame el resultado de este query:
   ```sql
   SELECT email, email_confirmed_at, raw_user_meta_data 
   FROM auth.users 
   WHERE email = 'coordinacion@local.test';
   ```

2. Y también este:
   ```sql
   SELECT * FROM profiles WHERE email = 'coordinacion@local.test';
   ```

3. Y los errores de la consola del navegador (F12)

Con esa info puedo ayudarte a resolver el problema exacto. 😊
