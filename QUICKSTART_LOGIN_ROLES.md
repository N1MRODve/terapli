# 🚀 Quick Start: Sistema de Login con Roles

## ⚡ Setup en 5 Minutos

### 1️⃣ Ejecutar Migración en Supabase

```bash
# Opción A: Usando Supabase CLI
npx supabase db push

# Opción B: Copiar y pegar en SQL Editor
# Ve a: https://supabase.com/dashboard/project/YOUR_PROJECT/sql
# Ejecuta: supabase/migrations/20251023_setup_roles_and_policies.sql
```

### 2️⃣ Crear Usuario de Prueba Psicóloga

Ve a: **Supabase Dashboard → Authentication → Users → Add User**

```
Email: psicologa@test.com
Password: Test123456!
Email Confirm: true
User Metadata (JSON):
{
  "nombre": "Dra. María González",
  "rol": "psicologa"
}
```

### 3️⃣ Actualizar el Rol en la Tabla Profiles

En **SQL Editor**:

```sql
-- Verificar que el perfil se creó
SELECT * FROM public.profiles WHERE email = 'psicologa@test.com';

-- Si el rol no es 'psicologa', actualizarlo:
UPDATE public.profiles 
SET rol = 'psicologa', nombre = 'Dra. María González'
WHERE email = 'psicologa@test.com';
```

### 4️⃣ Crear Usuario de Prueba Paciente

```
Email: paciente@test.com
Password: Test123456!
Email Confirm: true
User Metadata (JSON):
{
  "nombre": "Juan Pérez",
  "rol": "paciente"
}
```

Actualizar rol si es necesario:
```sql
UPDATE public.profiles 
SET rol = 'paciente', nombre = 'Juan Pérez'
WHERE email = 'paciente@test.com';
```

### 5️⃣ Probar el Sistema

```bash
npm run dev
```

Ir a: http://localhost:3000/login

**Prueba 1:**
- Email: `psicologa@test.com`
- Password: `Test123456!`
- ✅ Debe redirigir a `/terapeuta/dashboard`

**Prueba 2:**
- Logout
- Email: `paciente@test.com`
- Password: `Test123456!`
- ✅ Debe redirigir a `/paciente/dashboard`

**Prueba 3:**
- Como psicóloga, intentar ir a `/paciente`
- ✅ Debe redirigir de vuelta a `/terapeuta/dashboard`

---

## 🎯 Verificación Rápida

### ✅ Checklist:

- [ ] Migración ejecutada en Supabase
- [ ] Usuario psicóloga creado
- [ ] Usuario paciente creado
- [ ] Roles actualizados en tabla profiles
- [ ] Login como psicóloga funciona
- [ ] Login como paciente funciona
- [ ] Redirección automática funciona
- [ ] Middleware bloquea acceso cruzado

---

## 🔧 Si Algo No Funciona

### Problema: "No se puede obtener el rol"

**Solución rápida:**
```sql
-- Verificar que el usuario tiene perfil
SELECT * FROM public.profiles WHERE email = 'TU_EMAIL';

-- Si no existe, crear manualmente:
INSERT INTO public.profiles (id, email, nombre, rol)
VALUES (
  'USER_UUID_FROM_AUTH_USERS',
  'email@example.com',
  'Nombre Completo',
  'psicologa'
);
```

### Problema: "Usuario redirige a lugar equivocado"

**Solución:**
```sql
-- Verificar el rol actual
SELECT email, rol FROM public.profiles;

-- Corregir rol si es necesario
UPDATE public.profiles 
SET rol = 'psicologa'  -- o 'paciente' o 'coordinadora'
WHERE email = 'TU_EMAIL';
```

### Problema: "Error de tipos TypeScript"

**Solución:**
```bash
# Reiniciar el servidor dev
Ctrl+C
npm run dev
```

---

## 📖 Más Información

- **Documentación técnica**: `TEST_LOGIN_ROLES.md`
- **Guía de uso**: `ROLES_GUIA_USO.md`
- **Resumen completo**: `SISTEMA_LOGIN_ROLES_COMPLETADO.md`

---

## 🎉 ¡Listo!

Ya tienes un sistema de login profesional con roles funcionando.

**Próximos pasos recomendados:**
1. Crear más usuarios de prueba
2. Personalizar los dashboards según rol
3. Agregar validación de permisos en componentes
4. Configurar políticas RLS específicas por tabla

---

**¿Necesitas ayuda?** Revisa la documentación o contacta al equipo de desarrollo.
