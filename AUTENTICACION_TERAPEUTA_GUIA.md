# 🔐 Sistema de Autenticación de Terapeutas - Guía Completa

## 📋 Descripción General

Sistema de autenticación seguro y exclusivo para el acceso de terapeutas al panel de gestión clínica de Karem Peña. Implementado con **Nuxt 3 + Supabase + TailwindCSS**.

---

## 🎯 Características Implementadas

### ✅ Página de Login
- **Ubicación**: `/pages/terapeuta/login.vue`
- Formulario con validación de correo y contraseña
- Mensajes de error empáticos y claros
- Spinner de carga durante la autenticación
- Diseño responsive y consistente con la identidad visual
- Sin layout (página independiente)

### ✅ Middleware de Protección
- **Ubicación**: `/middleware/auth-terapeuta.ts`
- Valida autenticación del usuario
- Verifica rol en tabla `profiles`
- Redirige según estado:
  - Sin autenticación → `/terapeuta/login`
  - Sin rol permitido → `/` (home)
- Roles permitidos: `psicologa`, `admin`, `coordinadora`

### ✅ Botón de Logout
- Integrado en el layout de terapeuta (desktop y mobile)
- Confirmación antes de cerrar sesión
- Cierre seguro de sesión en Supabase
- Redirección automática al login

### ✅ Configuración de Base de Datos
- **Script SQL**: `/supabase/auth_terapeuta_setup.sql`
- Tabla `profiles` con campo `rol`
- Funciones auxiliares para validación
- Políticas RLS (Row Level Security)
- Triggers automáticos

---

## 🚀 Cómo Usar el Sistema

### 1️⃣ Configurar Base de Datos en Supabase

Ejecuta el script SQL en tu proyecto de Supabase:

```bash
# Opción A: Desde Supabase Dashboard
# 1. Ve a SQL Editor
# 2. Copia y pega el contenido de /supabase/auth_terapeuta_setup.sql
# 3. Ejecuta el script

# Opción B: Desde CLI de Supabase
supabase db reset
supabase db push
```

### 2️⃣ Crear el Primer Terapeuta

#### Método 1: Desde Supabase Dashboard

1. Ve a **Authentication** → **Users**
2. Clic en "Add user" → "Create new user"
3. Ingresa:
   - Email: `karem@example.com`
   - Password: (tu contraseña segura)
   - Confirm password
4. Clic en "Create user"
5. Ve a **Table Editor** → `profiles`
6. Busca el usuario recién creado
7. Edita el campo `rol` a `psicologa`
8. Actualiza el campo `nombre` a `Karem Peña`

#### Método 2: Con SQL

```sql
-- Primero crea el usuario en Supabase Auth (Dashboard)
-- Luego ejecuta este UPDATE con el UUID del usuario:

UPDATE public.profiles 
SET 
  rol = 'psicologa',
  nombre = 'Karem Peña',
  telefono = '+34 600 000 000'
WHERE email = 'karem@example.com';
```

### 3️⃣ Probar el Login

1. Inicia tu servidor de desarrollo:
```bash
npm run dev
```

2. Navega a:
```
http://localhost:3000/terapeuta/login
```

3. Ingresa las credenciales:
   - Email: `karem@example.com`
   - Password: (la que configuraste)

4. Deberías ser redirigida a:
```
http://localhost:3000/terapeuta/dashboard
```

---

## 🔒 Seguridad Implementada

### Validaciones en el Login
- ✅ Email y contraseña requeridos
- ✅ Verificación de credenciales en Supabase
- ✅ Validación de rol en tabla `profiles`
- ✅ Cierre de sesión si el rol no es válido
- ✅ Mensajes de error sin exponer información sensible

### Middleware de Protección
- ✅ Se aplica automáticamente a todas las rutas `/terapeuta/*`
- ✅ Excluye la ruta `/terapeuta/login`
- ✅ Verifica sesión activa
- ✅ Valida rol en cada petición
- ✅ Cierra sesión automáticamente si hay errores

### Row Level Security (RLS)
- ✅ Los usuarios solo ven su propio perfil
- ✅ Los terapeutas pueden ver todos los perfiles (gestión)
- ✅ Solo se permite actualizar el propio perfil
- ✅ El campo `rol` no es editable por usuarios normales

---

## 🎨 Diseño Visual

### Paleta de Colores
- **Fondo**: `#F9F7F3` (beige cálido)
- **Acento**: `#D8AFA0` (terracota suave)
- **Hover**: `#C89B8A` (terracota oscuro)
- **Texto**: `#5D4A44` (café oscuro)
- **Bordes**: `#EAD5D3` (rosa pálido)

### Tipografía
- **Títulos**: `font-['Lora']` (serif, elegante)
- **Cuerpo**: `font-['Lato']` (sans-serif, legible)

### Componentes
- Bordes redondeados (`rounded-lg`, `rounded-xl`)
- Sombras suaves (`shadow-sm`)
- Transiciones fluidas (`transition-colors`, `transition-all`)
- Estados de hover y focus bien definidos

---

## 📁 Estructura de Archivos

```
psicokarem/
├── pages/
│   └── terapeuta/
│       └── login.vue           # Página de inicio de sesión
├── middleware/
│   └── auth-terapeuta.ts       # Protección de rutas
├── layouts/
│   └── terapeuta.vue           # Layout con botón logout
├── supabase/
│   └── auth_terapeuta_setup.sql # Script de configuración DB
└── AUTENTICACION_TERAPEUTA_GUIA.md # Este documento
```

---

## 🧪 Testing

### Test Manual de Login

1. **Sin credenciales**:
   - Dejar campos vacíos → No permitir envío
   
2. **Credenciales incorrectas**:
   - Email: `incorrecto@test.com`
   - Password: `wrongpass`
   - Resultado: "Correo o contraseña incorrectos"

3. **Usuario sin rol de terapeuta**:
   - Crear usuario con rol `paciente`
   - Intentar login
   - Resultado: "Acceso no autorizado"

4. **Login exitoso**:
   - Email: `karem@example.com`
   - Password: (correcta)
   - Resultado: Redirección a `/terapeuta/dashboard`

### Test Manual de Middleware

1. **Sin autenticación**:
   - Navegar directamente a `/terapeuta/dashboard`
   - Resultado: Redirección a `/terapeuta/login`

2. **Con autenticación pero sin rol**:
   - Login como paciente
   - Navegar a `/terapeuta/pacientes`
   - Resultado: Cierre de sesión + redirección a `/`

3. **Con autenticación y rol correcto**:
   - Login como terapeuta
   - Navegar por todas las rutas `/terapeuta/*`
   - Resultado: Acceso permitido

### Test Manual de Logout

1. **Cancelar logout**:
   - Clic en "Cerrar sesión"
   - Clic en "Cancelar" en el diálogo
   - Resultado: Sesión sigue activa

2. **Confirmar logout**:
   - Clic en "Cerrar sesión"
   - Clic en "Aceptar" en el diálogo
   - Resultado: Sesión cerrada + redirección a login

---

## 🐛 Troubleshooting

### ❌ Error: "No overload matches this call"

**Problema**: Los tipos de TypeScript no incluyen la tabla `profiles`.

**Solución**:
```bash
# Regenerar tipos desde Supabase
npx supabase gen types typescript --project-id [TU_PROJECT_ID] > types/database.types.ts
```

### ❌ Error: "relation 'profiles' does not exist"

**Problema**: La tabla `profiles` no existe en Supabase.

**Solución**:
```bash
# Ejecutar el script de configuración
# Desde Supabase Dashboard → SQL Editor
# Pegar contenido de /supabase/auth_terapeuta_setup.sql
```

### ❌ No puedo hacer login

**Problema**: Usuario no tiene el rol correcto.

**Solución**:
```sql
-- Verificar roles en Table Editor → profiles
SELECT id, email, nombre, rol FROM profiles;

-- Actualizar rol si es necesario
UPDATE profiles SET rol = 'psicologa' WHERE email = 'tu@email.com';
```

### ❌ El middleware no se aplica

**Problema**: El archivo de middleware no tiene la extensión correcta.

**Solución**:
```bash
# Verificar que el archivo sea:
middleware/auth-terapeuta.ts  # ✅ Correcto
# NO:
middleware/auth-terapeuta.global.ts  # ❌ Se aplica a TODAS las rutas
```

---

## 🔄 Próximas Mejoras

### Funcionalidades Pendientes
- [ ] Recuperación de contraseña
- [ ] Cambio de contraseña desde el panel
- [ ] Login con 2FA (autenticación de dos factores)
- [ ] Registro de intentos de login fallidos
- [ ] Notificación por email al inicio de sesión
- [ ] Sesiones concurrentes (limitar dispositivos)

### Mejoras de UX
- [ ] Recordar email en el formulario
- [ ] Mostrar último inicio de sesión
- [ ] Indicador de fuerza de contraseña
- [ ] Modo oscuro en página de login
- [ ] Animaciones de transición mejoradas

---

## 📞 Soporte

Si encuentras problemas o tienes dudas:

1. Revisa la sección de **Troubleshooting**
2. Verifica los logs en la consola del navegador
3. Revisa los logs de Supabase en el Dashboard
4. Consulta la documentación oficial:
   - [Nuxt 3 Auth](https://nuxt.com/docs/guide/directory-structure/middleware)
   - [Supabase Auth](https://supabase.com/docs/guides/auth)

---

## 📝 Changelog

### Versión 1.0.0 (2025-10-19)
- ✅ Implementación inicial del sistema de autenticación
- ✅ Página de login funcional y estilizada
- ✅ Middleware de protección de rutas
- ✅ Botón de logout en el layout
- ✅ Script SQL de configuración completo
- ✅ Documentación completa

---

## 👩‍💻 Autor

Desarrollado para **Karem Peña - Gestión Clínica**  
© 2025 Todos los derechos reservados
