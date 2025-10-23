# 🔐 Autenticación de Terapeutas - Quick Start

## ⚡ Inicio Rápido

### 1. Configurar Base de Datos
```sql
-- Ejecuta en Supabase SQL Editor:
-- Copia y pega el contenido de /supabase/auth_terapeuta_setup.sql
```

### 2. Crear Primer Terapeuta
```sql
-- 1. Crea el usuario en Supabase Auth Dashboard
-- 2. Actualiza su rol:
UPDATE public.profiles 
SET rol = 'psicologa', nombre = 'Karem Peña'
WHERE email = 'karem@example.com';
```

### 3. Iniciar Aplicación
```bash
npm run dev
```

### 4. Acceder
```
http://localhost:3000/terapeuta/login
```

---

## 📦 Archivos Implementados

- ✅ `/pages/terapeuta/login.vue` - Página de login
- ✅ `/middleware/auth-terapeuta.ts` - Protección de rutas
- ✅ `/layouts/terapeuta.vue` - Layout con logout
- ✅ `/supabase/auth_terapeuta_setup.sql` - Script SQL
- ✅ `/AUTENTICACION_TERAPEUTA_GUIA.md` - Documentación completa

---

## 🎯 Roles Permitidos

El sistema acepta los siguientes roles para acceder al área de terapeutas:

- `psicologa` - Psicóloga/Terapeuta principal
- `admin` - Administrador del sistema
- `coordinadora` - Coordinadora clínica

---

## 🔒 Seguridad

- ✅ Middleware protege todas las rutas `/terapeuta/*`
- ✅ Validación de rol en cada petición
- ✅ RLS (Row Level Security) activado en Supabase
- ✅ Cierre automático de sesión ante errores

---

## 📖 Documentación Completa

Ver: [`AUTENTICACION_TERAPEUTA_GUIA.md`](./AUTENTICACION_TERAPEUTA_GUIA.md)

---

## 🐛 Problemas Comunes

### No puedo hacer login
```sql
-- Verifica tu rol:
SELECT email, rol FROM profiles WHERE email = 'tu@email.com';
```

### Tabla profiles no existe
```bash
# Ejecuta el script SQL en Supabase Dashboard
```

### Errores de TypeScript
```bash
# Regenera los tipos:
npx supabase gen types typescript --project-id [ID] > types/database.types.ts
```

---

**🚀 Sistema listo para producción**
