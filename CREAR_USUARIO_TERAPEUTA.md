# 👤 Crear Usuario Terapeuta - Guía Paso a Paso

## 🎯 Objetivo
Crear un usuario con rol de psicoterapeuta para acceder al panel administrativo.

---

## 📋 Opción 1: Desde Supabase Dashboard (Recomendado)

### Paso 1: Crear el usuario en Authentication

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard/project/pcbchuaezokqppwsbnty
2. En el menú lateral, ve a **Authentication** → **Users**
3. Haz clic en el botón **"Add user"** (arriba a la derecha)
4. Selecciona **"Create new user"**
5. Completa el formulario:
   - **Email**: `terapeuta@psicokarem.com` (o el email que prefieras)
   - **Password**: Ingresa una contraseña segura (mínimo 6 caracteres)
   - **Auto Confirm User**: ✅ **ACTIVAR ESTO** (para que no requiera confirmación por email)
6. Haz clic en **"Create user"**
7. **Copia el UUID** del usuario que aparece en la lista (algo como: `a1b2c3d4-...`)

### Paso 2: Actualizar el perfil con el rol

1. En el menú lateral, ve a **Table Editor** → **profiles**
2. Busca el usuario que acabas de crear (por email)
3. Haz clic en la fila para editarla
4. Actualiza estos campos:
   - **rol**: Cambia de `paciente` a `psicologa`
   - **nombre**: `Karem Peña` (o tu nombre)
   - **telefono**: (opcional) `+34 600 000 000`
5. Guarda los cambios

### Paso 3: Probar el acceso

1. Asegúrate de que el servidor de desarrollo esté corriendo:
   ```bash
   npm run dev
   ```

2. Abre tu navegador en:
   ```
   http://localhost:3000/terapeuta/login
   ```

3. Ingresa las credenciales que creaste:
   - Email: `terapeuta@psicokarem.com`
   - Contraseña: (la que definiste)

4. ¡Deberías acceder al dashboard del terapeuta! 🎉

---

## 📋 Opción 2: Con SQL (Avanzado)

Si prefieres hacerlo con SQL, puedes ejecutar este script en **SQL Editor** de Supabase:

```sql
-- PASO 1: Primero necesitas el UUID del usuario creado en Auth
-- Lo obtienes después de crear el usuario manualmente en Authentication > Users

-- PASO 2: Actualiza el perfil (reemplaza 'UUID_DEL_USUARIO' con el UUID real)
UPDATE public.profiles 
SET 
  rol = 'psicologa',
  nombre = 'Karem Peña',
  telefono = '+34 600 000 000',
  updated_at = now()
WHERE id = 'UUID_DEL_USUARIO'::uuid;

-- PASO 3: Verifica que se haya actualizado correctamente
SELECT id, email, nombre, rol, created_at 
FROM public.profiles 
WHERE email = 'terapeuta@psicokarem.com';
```

---

## 📋 Opción 3: Usando el Script Automático (Node.js)

He creado un script que automatiza el proceso. Para usarlo:

```bash
# Instalar dependencias si no las tienes
npm install @supabase/supabase-js

# Ejecutar el script
node scripts/crear-usuario-con-service-role.js
```

El script te pedirá:
- Email del terapeuta
- Contraseña
- Nombre completo
- Teléfono (opcional)

Y creará automáticamente el usuario con todos los permisos necesarios.

---

## 🔐 Credenciales de Ejemplo Sugeridas

Para pruebas, puedes usar:

```
Email: karem@psicokarem.com
Contraseña: Test123456!
Nombre: Karem Peña
Teléfono: +34 600 000 000
```

---

## ✅ Verificar que Todo Funciona

Una vez creado el usuario, verifica:

1. ✅ Puedes iniciar sesión en `/terapeuta/login`
2. ✅ Te redirige al dashboard `/terapeuta`
3. ✅ Ves el menú lateral con todas las opciones
4. ✅ Puedes navegar entre secciones (Pacientes, Sesiones, etc.)

---

## 🆘 Solución de Problemas

### "Error: Invalid login credentials"
- Verifica que el email y contraseña sean correctos
- Asegúrate de que el usuario esté confirmado (Auto Confirm activado)

### "No tienes permisos para acceder"
- Verifica que el campo `rol` en la tabla `profiles` sea `psicologa`, `admin` o `coordinadora`
- Ejecuta este SQL para verificar:
  ```sql
  SELECT email, rol FROM profiles WHERE email = 'tu-email@aqui.com';
  ```

### "Cannot read properties of undefined"
- Verifica que el perfil exista en la tabla `profiles`
- El trigger debería crearlo automáticamente, pero puedes verificar con:
  ```sql
  SELECT * FROM profiles WHERE email = 'tu-email@aqui.com';
  ```

---

## 📞 URLs Útiles

- **Dashboard de Supabase**: https://supabase.com/dashboard/project/pcbchuaezokqppwsbnty
- **Login Local**: http://localhost:3000/terapeuta/login
- **Dashboard Local**: http://localhost:3000/terapeuta

---

## 🎨 Roles Disponibles

- **`admin`**: Acceso completo al sistema
- **`coordinadora`**: Gestión de pacientes y citas
- **`psicologa`**: Acceso al panel del terapeuta
- **`paciente`**: Sin acceso al panel (solo para pacientes)

Para este caso, necesitas el rol **`psicologa`** o **`admin`**.

---

¡Listo! Con estos pasos deberías poder crear y acceder con tu usuario terapeuta. 🚀
