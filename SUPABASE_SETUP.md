# 🗄️ Configuración de Supabase

## 📋 Índice
- [Introducción](#introducción)
- [Instalación](#instalación)
- [Configuración Inicial](#configuración-inicial)
- [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
- [Uso en el Proyecto](#uso-en-el-proyecto)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [CLI de Supabase (Opcional)](#cli-de-supabase-opcional)
- [Mejores Prácticas](#mejores-prácticas)

---

## 🎯 Introducción

Este proyecto utiliza **Supabase** como backend-as-a-service para:
- 🔐 Autenticación de pacientes
- 💾 Base de datos PostgreSQL
- 🔒 Row Level Security (RLS)
- 📨 Mensajería entre psicóloga y pacientes
- 📊 Gestión de sesiones y bonos

## 📦 Instalación

La dependencia ya está instalada en el proyecto:

```json
"@supabase/supabase-js": "^2.75.0"
```

Si necesitas reinstalar:

```bash
npm install @supabase/supabase-js
```

## ⚙️ Configuración Inicial

### 1. Crear un Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Guarda las credenciales:
   - **Project URL**: `https://tu-proyecto.supabase.co`
   - **Anon Key**: La clave pública (anon/public)

### 2. Configurar Variables de Entorno

Edita el archivo `.env` en la raíz del proyecto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

**⚠️ IMPORTANTE:**
- Nunca subas el archivo `.env` a Git
- El archivo `.env.example` sirve como plantilla
- Usa solo la **Anon Key** (clave pública), NO la Service Key

### 3. Ejecutar Migraciones

Ve al editor SQL de Supabase Dashboard y ejecuta:

```bash
# Archivo: supabase/migrations/20251011083808_create_base_schema.sql
```

O copia y pega el contenido del archivo en el editor SQL.

## 🗂️ Estructura de la Base de Datos

### Tablas Principales

#### 1. `pacientes`
```sql
- id (uuid, PK)
- email (text, unique)
- nombre (text)
- telefono (text)
- notas_iniciales (text)
- created_at (timestamptz)
```

#### 2. `bonos`
```sql
- id (uuid, PK)
- paciente_id (uuid, FK → pacientes)
- sesiones_totales (int)
- sesiones_usadas (int)
- precio (numeric)
- activo (boolean)
- created_at (timestamptz)
```

#### 3. `sesiones`
```sql
- id (uuid, PK)
- paciente_id (uuid, FK → pacientes)
- bono_id (uuid, FK → bonos, nullable)
- fecha (timestamptz)
- estado (text) → 'programada', 'completada', 'cancelada'
- notas (text)
- created_at (timestamptz)
```

#### 4. `pagos`
```sql
- id (uuid, PK)
- paciente_id (uuid, FK → pacientes)
- bono_id (uuid, FK → bonos, nullable)
- monto (numeric)
- metodo (text)
- estado (text) → 'pendiente', 'completado', 'fallido'
- created_at (timestamptz)
```

#### 5. `recursos`
```sql
- id (uuid, PK)
- titulo (text)
- descripcion (text)
- url (text)
- tipo (text) → 'ejercicio', 'lectura', 'audio'
- publico (boolean)
- created_at (timestamptz)
```

#### 6. `mensajes`
```sql
- id (uuid, PK)
- paciente_id (uuid, FK → pacientes)
- contenido (text)
- de_psicologa (boolean)
- leido (boolean)
- created_at (timestamptz)
```

### 🔒 Seguridad (RLS)

Todas las tablas tienen **Row Level Security** habilitado:

- ✅ Pacientes solo ven sus propios datos
- ✅ Recursos públicos visibles para todos
- ✅ Mensajes filtrados por paciente
- ✅ Sesiones y bonos privados por paciente

## 🛠️ Uso en el Proyecto

### Archivos de Configuración

```
📁 proyecto/
├── 📁 types/
│   └── database.types.ts          # Tipos TypeScript generados
├── 📁 plugins/
│   └── supabase.client.ts         # Plugin de inicialización
├── 📁 composables/
│   ├── useSupabase.ts             # Composable principal
│   └── usePacientes.ts            # Composable para pacientes
├── 📁 utils/
│   └── supabase.ts                # Cliente Supabase
└── .env                            # Variables de entorno
```

### Composables Disponibles

#### 1. **`useSupabase()`** - Composable Principal

```typescript
const { 
  supabase,           // Cliente de Supabase
  user,               // Usuario autenticado (readonly)
  session,            // Sesión actual (readonly)
  isAuthenticated,    // Boolean computed
  signInWithEmail,    // Login con email/password
  signUpWithEmail,    // Registro
  signOut,            // Cerrar sesión
  resetPassword,      // Recuperar contraseña
  updatePassword      // Actualizar contraseña
} = useSupabase()
```

#### 2. **`usePacientes()`** - Gestión de Pacientes

```typescript
const {
  getPaciente,          // Obtener datos del paciente
  createPaciente,       // Crear paciente
  updatePaciente,       // Actualizar paciente
  getBonos,             // Obtener todos los bonos
  getBonosActivos,      // Obtener bonos con sesiones disponibles
  getSesiones,          // Obtener todas las sesiones
  getProximasSesiones,  // Obtener sesiones futuras
  getMensajes,          // Obtener mensajes
  enviarMensaje,        // Enviar mensaje
  marcarMensajeLeido,   // Marcar mensaje como leído
  getRecursosPublicos   // Obtener recursos públicos
} = usePacientes()
```

## 💡 Ejemplos de Uso

### Ejemplo 1: Login de Paciente

```vue
<script setup lang="ts">
const { signInWithEmail, isAuthenticated } = useSupabase()
const email = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  const { data, error: loginError } = await signInWithEmail(email.value, password.value)
  
  if (loginError) {
    error.value = loginError.message
  } else {
    // Redirigir al dashboard
    navigateTo('/paciente')
  }
}
</script>

<template>
  <form @submit.prevent="handleLogin">
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Contraseña" />
    <button type="submit">Iniciar Sesión</button>
    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>
```

### Ejemplo 2: Mostrar Próximas Sesiones

```vue
<script setup lang="ts">
const { getProximasSesiones } = usePacientes()
const { user } = useSupabase()
const sesiones = ref([])

onMounted(async () => {
  if (user.value) {
    const { data } = await getProximasSesiones()
    if (data) sesiones.value = data
  }
})
</script>

<template>
  <div class="sesiones">
    <h2>Próximas Sesiones</h2>
    <div v-for="sesion in sesiones" :key="sesion.id" class="sesion-card">
      <p>📅 {{ new Date(sesion.fecha).toLocaleDateString('es-ES') }}</p>
      <p>🕐 {{ new Date(sesion.fecha).toLocaleTimeString('es-ES') }}</p>
      <p>Estado: {{ sesion.estado }}</p>
    </div>
  </div>
</template>
```

### Ejemplo 3: Enviar Mensaje

```vue
<script setup lang="ts">
const { enviarMensaje } = usePacientes()
const mensaje = ref('')
const enviando = ref(false)

const enviar = async () => {
  if (!mensaje.value.trim()) return
  
  enviando.value = true
  const { data, error } = await enviarMensaje(mensaje.value)
  
  if (!error) {
    mensaje.value = ''
    // Mostrar confirmación
  }
  
  enviando.value = false
}
</script>

<template>
  <div class="chat">
    <textarea v-model="mensaje" placeholder="Escribe tu mensaje..."></textarea>
    <button @click="enviar" :disabled="enviando">
      {{ enviando ? 'Enviando...' : 'Enviar' }}
    </button>
  </div>
</template>
```

### Ejemplo 4: Proteger una Página

```vue
<!-- pages/paciente.vue -->
<script setup lang="ts">
const { isAuthenticated, user } = useSupabase()

// Middleware inline
definePageMeta({
  middleware: 'auth'
})

// O verificación manual
if (!isAuthenticated.value) {
  navigateTo('/login')
}
</script>

<template>
  <div v-if="isAuthenticated">
    <h1>Bienvenido, {{ user?.email }}</h1>
    <!-- Contenido del dashboard -->
  </div>
</template>
```

### Ejemplo 5: Consulta Personalizada

```vue
<script setup lang="ts">
const { supabase } = useSupabase()
const estadisticas = ref(null)

const cargarEstadisticas = async () => {
  const { data } = await supabase
    .from('sesiones')
    .select('estado')
    .eq('paciente_id', user.value?.id)
  
  // Procesar estadísticas
  const completadas = data?.filter(s => s.estado === 'completada').length
  const programadas = data?.filter(s => s.estado === 'programada').length
  
  estadisticas.value = { completadas, programadas }
}

onMounted(cargarEstadisticas)
</script>
```

## 🖥️ CLI de Supabase (Opcional)

Para desarrollo local y gestión de migraciones:

### Instalación

```bash
# Instalar globalmente
npm install -g supabase

# O con Homebrew (macOS)
brew install supabase/tap/supabase
```

### Comandos Útiles

```bash
# Inicializar Supabase en el proyecto
supabase init

# Iniciar Supabase local
supabase start

# Detener Supabase local
supabase stop

# Crear nueva migración
supabase migration new nombre_migracion

# Aplicar migraciones
supabase db push

# Generar tipos TypeScript
supabase gen types typescript --local > types/database.types.ts

# O desde el proyecto remoto
supabase gen types typescript --project-id "tu-proyecto-id" > types/database.types.ts
```

### Configuración Local

```bash
# Archivo: supabase/config.toml (se crea con supabase init)
```

Supabase local corre en:
- API: `http://localhost:54321`
- Studio: `http://localhost:54323`
- DB: `postgresql://postgres:postgres@localhost:54322/postgres`

## ✅ Mejores Prácticas

### 1. **Tipos TypeScript**

Siempre usa los tipos generados:

```typescript
import type { Database } from '~/types/database.types'

type Paciente = Database['public']['Tables']['pacientes']['Row']
type PacienteInsert = Database['public']['Tables']['pacientes']['Insert']
```

### 2. **Manejo de Errores**

```typescript
const { data, error } = await supabase.from('pacientes').select('*')

if (error) {
  console.error('Error:', error.message)
  // Mostrar mensaje al usuario
  return
}

// Usar data de forma segura
```

### 3. **Realtime (Subscripciones)**

Para actualizaciones en tiempo real:

```typescript
const { supabase } = useSupabase()

const channel = supabase
  .channel('mensajes-nuevos')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'mensajes',
      filter: `paciente_id=eq.${user.value?.id}`
    },
    (payload) => {
      console.log('Nuevo mensaje:', payload.new)
      // Actualizar UI
    }
  )
  .subscribe()

// Limpiar al desmontar
onUnmounted(() => {
  supabase.removeChannel(channel)
})
```

### 4. **Paginación**

Para grandes conjuntos de datos:

```typescript
const { data } = await supabase
  .from('sesiones')
  .select('*')
  .range(0, 9) // Primeras 10 filas
  .order('fecha', { ascending: false })
```

### 5. **Búsqueda**

```typescript
const { data } = await supabase
  .from('recursos')
  .select('*')
  .ilike('titulo', `%${searchTerm}%`)
```

## 🔐 Seguridad

### Variables de Entorno

- ✅ Usa `.env` para desarrollo local
- ✅ Configura variables en tu plataforma de hosting (Vercel, Netlify)
- ❌ NUNCA subas credenciales a Git
- ❌ NUNCA uses la Service Key en el cliente

### Row Level Security

El esquema ya incluye políticas RLS. Para modificarlas:

```sql
-- Ver políticas actuales
SELECT * FROM pg_policies WHERE tablename = 'pacientes';

-- Crear nueva política
CREATE POLICY "policy_name"
  ON table_name
  FOR SELECT
  TO authenticated
  USING (condition);
```

## 🚀 Deploy

1. **Asegúrate de tener las variables configuradas** en tu plataforma
2. **Ejecuta las migraciones** en Supabase Dashboard
3. **Despliega tu aplicación** normalmente

```bash
# Build
npm run build

# Preview local
npm run preview
```

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime)

---

## 🆘 Troubleshooting

### Error: "Invalid API key"
- Verifica que las variables de entorno estén correctamente configuradas
- Reinicia el servidor de desarrollo

### Error: "Row Level Security"
- Verifica que el usuario esté autenticado
- Revisa las políticas RLS en Supabase Dashboard

### Tipos no encontrados
```bash
# Regenerar tipos
supabase gen types typescript --project-id "tu-proyecto-id" > types/database.types.ts
```

---

**¿Necesitas ayuda?** Consulta la documentación oficial o abre un issue en el repositorio.
