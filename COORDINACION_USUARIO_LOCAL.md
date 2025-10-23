# 🚀 Crear Usuario Local - Servidor de Desarrollo

## 🔑 Credenciales Listas para Usar

```
📧 Email:    coordinacion@local.test
🔒 Password: Admin123!
🌐 URL:      http://localhost:3000/coordinacion/login
```

---

## ⚡ Instalación Rápida (2 pasos)

### Paso 1: Ejecutar Scripts SQL

```bash
cd /Users/dieterlorenzo/psicologakarem/psicokarem

# 1. Ejecutar el setup principal (si aún no lo has hecho)
supabase db reset
# o
psql -h localhost -U postgres -d postgres -f supabase_coordinacion_setup.sql

# 2. Crear el usuario local
psql -h localhost -U postgres -d postgres -f supabase_crear_usuario_local.sql
```

### Paso 2: Iniciar la App y Probar

```bash
# Iniciar el servidor
npm run dev

# Abrir en el navegador
open http://localhost:3000/coordinacion/login
```

**Ingresar:**
- Email: `coordinacion@local.test`
- Password: `Admin123!`

---

## 🎯 Método Alternativo (si usas Supabase CLI)

```bash
# 1. Asegúrate de que Supabase está corriendo
supabase start

# 2. Ejecutar el setup
supabase db reset
cat supabase_coordinacion_setup.sql | supabase db execute

# 3. Crear usuario local
cat supabase_crear_usuario_local.sql | supabase db execute

# 4. Iniciar app
npm run dev
```

---

## 🔧 Si usas Supabase Studio (Interfaz Web Local)

1. **Abrir Studio**
   ```bash
   supabase start
   # Busca la línea: Studio URL: http://localhost:54323
   open http://localhost:54323
   ```

2. **Ir a SQL Editor**
   - Click en "SQL Editor" en el menú lateral

3. **Ejecutar Setup Principal**
   - Copiar todo el contenido de `supabase_coordinacion_setup.sql`
   - Pegarlo en el editor
   - Click en "Run"

4. **Crear Usuario Local**
   - Copiar todo el contenido de `supabase_crear_usuario_local.sql`
   - Pegarlo en el editor
   - Click en "Run"

5. **Verificar**
   - Deberías ver: `✅ Usuario de coordinación creado exitosamente`
   - Y las credenciales mostradas

---

## ✅ Verificar que Funciona

### Opción 1: Desde SQL

```bash
# Conectarte a tu base de datos local
psql -h localhost -U postgres -d postgres

# Ejecutar dentro de psql:
SELECT email, raw_user_meta_data->>'rol' as rol 
FROM auth.users 
WHERE email = 'coordinacion@local.test';

# Deberías ver:
#          email          |     rol      
# ------------------------+--------------
#  coordinacion@local.test | coordinacion
```

### Opción 2: Desde Supabase Studio

```bash
supabase start
open http://localhost:54323

# Ve a: Table Editor > auth > users
# Busca: coordinacion@local.test
# Verifica que existe y tiene email_confirmed_at
```

---

## 🎬 Demo Completo

```bash
# 1. Limpia y resetea la base de datos
supabase db reset

# 2. Ejecuta los scripts
cat supabase_coordinacion_setup.sql | supabase db execute
cat supabase_crear_usuario_local.sql | supabase db execute

# 3. Inicia la app
npm run dev

# 4. Abre el navegador
open http://localhost:3000/coordinacion/login

# 5. Ingresa las credenciales:
# Email: coordinacion@local.test
# Password: Admin123!

# 6. ¡Deberías ver el dashboard! 🎉
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

**Solución:**
```bash
# Inicia Supabase local
supabase start

# Verifica que está corriendo
supabase status
```

### Error: "Invalid login credentials"

**Solución:**
```bash
# Re-ejecutar el script de usuario
cat supabase_crear_usuario_local.sql | supabase db execute

# Verificar que existe
echo "SELECT email FROM auth.users WHERE email = 'coordinacion@local.test';" | supabase db execute
```

### Error: "No tienes permisos de coordinación"

**Solución:**
```bash
# Verificar y actualizar el rol
echo "UPDATE profiles SET rol = 'coordinacion' WHERE email = 'coordinacion@local.test';" | supabase db execute

# Verificar metadata
echo "UPDATE auth.users SET raw_user_meta_data = '{\"rol\":\"coordinacion\"}' WHERE email = 'coordinacion@local.test';" | supabase db execute
```

---

## 📝 Resumen

### Para trabajar en local necesitas:

1. **Supabase corriendo localmente**
   ```bash
   supabase start
   ```

2. **Scripts ejecutados**
   ```bash
   cat supabase_coordinacion_setup.sql | supabase db execute
   cat supabase_crear_usuario_local.sql | supabase db execute
   ```

3. **App corriendo**
   ```bash
   npm run dev
   ```

4. **Login con credenciales locales**
   - Email: `coordinacion@local.test`
   - Password: `Admin123!`

---

## 🎁 Bonus: Datos de Prueba

Si quieres tener datos de prueba para ver el dashboard poblado:

```bash
# Edita supabase_crear_usuario_local.sql
# Descomenta la sección "BONUS: Crear datos de prueba"
# Re-ejecuta el script
cat supabase_crear_usuario_local.sql | supabase db execute
```

Esto creará:
- ✅ Un paciente de prueba
- ✅ Un terapeuta de prueba
- ✅ Una sesión para hoy
- ✅ Un pago pendiente

---

**¡Listo! Ya puedes trabajar localmente con el panel de coordinación** 🎉

Si tienes algún error, avísame y te ayudo a resolverlo.
