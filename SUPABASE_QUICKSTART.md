# 🚀 Guía Rápida de Supabase

## ⚡ Configuración en 5 minutos

### 1. Obtén tus credenciales de Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. En el Dashboard, ve a **Settings** > **API**
3. Copia:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: Tu clave pública

### 2. Configura las variables de entorno

Edita el archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 3. Ejecuta las migraciones

En Supabase Dashboard:
1. Ve a **SQL Editor**
2. Copia el contenido de `supabase/migrations/20251011083808_create_base_schema.sql`
3. Pégalo y ejecuta (**Run**)

### 4. ¡Listo!

Reinicia el servidor de desarrollo:

```bash
npm run dev
```

## 📚 Uso Básico

### Login

```typescript
const { signInWithEmail } = useSupabase()
await signInWithEmail('email@ejemplo.com', 'password')
```

### Obtener datos del paciente

```typescript
const { getPaciente } = usePacientes()
const { data } = await getPaciente()
```

### Proteger una página

```vue
<script setup>
definePageMeta({
  middleware: 'auth'
})
</script>
```

## 📖 Documentación Completa

Lee `SUPABASE_SETUP.md` para:
- Estructura de la base de datos
- Todos los composables disponibles
- Ejemplos de uso avanzado
- CLI de Supabase
- Mejores prácticas

## 🆘 Problemas Comunes

**Error: "Invalid API key"**
- Verifica que las variables en `.env` estén correctas
- Reinicia el servidor

**No puedo ver mis datos**
- Verifica que las migraciones se ejecutaron correctamente
- Revisa las políticas RLS en Supabase Dashboard

**Tipos TypeScript no funcionan**
```bash
# Regenerar tipos (opcional)
supabase gen types typescript --project-id "tu-id" > types/database.types.ts
```
