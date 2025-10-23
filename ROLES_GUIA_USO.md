# 🎯 Guía de Uso: Sistema de Login con Roles

## 📖 Cómo Usar el Sistema de Roles

### 1. En Componentes Vue

#### Verificar el rol del usuario:

```vue
<template>
  <div>
    <div v-if="isPsicologa">
      <!-- Contenido solo para psicólogas -->
      <h2>Panel de Psicóloga</h2>
    </div>
    
    <div v-if="isPaciente">
      <!-- Contenido solo para pacientes -->
      <h2>Espacio de Bienestar</h2>
    </div>
    
    <div v-if="isCoordinacion">
      <!-- Contenido solo para coordinación -->
      <h2>Panel de Coordinación</h2>
    </div>
  </div>
</template>

<script setup lang="ts">
const { isPsicologa, isPaciente, isCoordinacion } = useRoles()
</script>
```

#### Mostrar el nombre del usuario y su rol:

```vue
<template>
  <div class="user-info">
    <p>{{ userProfile?.nombre }}</p>
    <span class="role-badge">{{ getRoleName(userProfile?.rol) }}</span>
  </div>
</template>

<script setup lang="ts">
const { userProfile, getRoleName } = useRoles()
</script>
```

#### Verificar múltiples roles:

```vue
<template>
  <div>
    <button v-if="canAccessAdminPanel" @click="goToAdmin">
      Panel Administrativo
    </button>
  </div>
</template>

<script setup lang="ts">
const { hasAnyRole } = useRoles()

const canAccessAdminPanel = computed(() => 
  hasAnyRole(['psicologa', 'coordinadora'])
)
</script>
```

#### Redirigir al dashboard correcto:

```vue
<template>
  <button @click="goHome">
    Ir a mi dashboard
  </button>
</template>

<script setup lang="ts">
const { goToDashboard } = useRoles()

const goHome = async () => {
  await goToDashboard()
}
</script>
```

### 2. En Middleware Personalizado

```typescript
// middleware/solo-psicologas.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isPsicologa } = useRoles()
  
  if (!isPsicologa.value) {
    return navigateTo('/acceso-denegado')
  }
})
```

Uso en una página:

```vue
<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'solo-psicologas']
})
</script>
```

### 3. En Composables

```typescript
// composables/usePacientes.ts
export const usePacientes = () => {
  const { isPsicologa, isCoordinacion } = useRoles()
  
  const canEditPacientes = computed(() => 
    isPsicologa.value || isCoordinacion.value
  )
  
  const getPacientes = async () => {
    if (!canEditPacientes.value) {
      throw new Error('No tienes permisos para ver pacientes')
    }
    
    // ... lógica para obtener pacientes
  }
  
  return {
    canEditPacientes,
    getPacientes
  }
}
```

### 4. En API Routes (Server)

```typescript
// server/api/pacientes/index.get.ts
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'No autenticado'
    })
  }
  
  // Obtener el perfil del usuario
  const { data: profile } = await client
    .from('profiles')
    .select('rol')
    .eq('id', user.id)
    .single()
  
  // Verificar permisos
  if (profile?.rol !== 'psicologa' && profile?.rol !== 'coordinadora') {
    throw createError({
      statusCode: 403,
      message: 'No tienes permisos para acceder a este recurso'
    })
  }
  
  // ... lógica de la API
})
```

## 🔑 API del Composable `useRoles`

### Propiedades Reactivas:

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `userProfile` | `Ref<UserProfile \| null>` | Perfil completo del usuario |
| `isPsicologa` | `ComputedRef<boolean>` | true si el usuario es psicóloga |
| `isPaciente` | `ComputedRef<boolean>` | true si el usuario es paciente |
| `isCoordinacion` | `ComputedRef<boolean>` | true si el usuario es coordinación |

### Métodos:

| Método | Parámetros | Retorno | Descripción |
|--------|------------|---------|-------------|
| `hasRole(role)` | `UserRole` | `boolean` | Verifica si tiene un rol específico |
| `hasAnyRole(roles)` | `UserRole[]` | `boolean` | Verifica si tiene alguno de los roles |
| `getUserRole()` | - | `Promise<UserRole \| null>` | Obtiene el rol del usuario |
| `getRoleName(role?)` | `UserRole?` | `string` | Obtiene el nombre del rol en español |
| `getDashboardPath(role?)` | `UserRole?` | `string` | Obtiene la ruta del dashboard |
| `goToDashboard()` | - | `Promise<void>` | Navega al dashboard del usuario |

## 🎨 Ejemplos de UI

### Badge de Rol:

```vue
<template>
  <span :class="roleClasses">
    {{ getRoleName(userProfile?.rol) }}
  </span>
</template>

<script setup lang="ts">
const { userProfile, getRoleName } = useRoles()

const roleClasses = computed(() => {
  const base = 'px-3 py-1 rounded-full text-sm font-medium'
  
  const colors = {
    psicologa: 'bg-purple-100 text-purple-800',
    coordinadora: 'bg-blue-100 text-blue-800',
    paciente: 'bg-green-100 text-green-800'
  }
  
  return `${base} ${colors[userProfile.value?.rol || 'paciente']}`
})
</script>
```

### Menú Condicional:

```vue
<template>
  <nav>
    <NuxtLink to="/dashboard">Dashboard</NuxtLink>
    
    <!-- Solo para psicólogas -->
    <template v-if="isPsicologa">
      <NuxtLink to="/terapeuta/pacientes">Pacientes</NuxtLink>
      <NuxtLink to="/terapeuta/agenda">Agenda</NuxtLink>
      <NuxtLink to="/terapeuta/sesiones">Sesiones</NuxtLink>
    </template>
    
    <!-- Solo para pacientes -->
    <template v-if="isPaciente">
      <NuxtLink to="/paciente/recursos">Recursos</NuxtLink>
      <NuxtLink to="/paciente/bienestar">Bienestar</NuxtLink>
    </template>
    
    <!-- Para ambos -->
    <NuxtLink v-if="hasAnyRole(['psicologa', 'paciente'])" to="/mensajes">
      Mensajes
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const { isPsicologa, isPaciente, hasAnyRole } = useRoles()
</script>
```

## 🚨 Importante

### Seguridad:
- ✅ **Nunca confíes solo en las verificaciones del cliente**
- ✅ **Siempre valida permisos en el servidor**
- ✅ **Usa RLS (Row Level Security) en Supabase**
- ✅ **Implementa validación en API routes**

### Buenas Prácticas:
- ✅ Usa `useRoles()` para verificaciones simples en UI
- ✅ Usa middleware para proteger rutas completas
- ✅ Combina middleware (`auth` + `auth-role` + custom)
- ✅ Proporciona feedback claro cuando no hay permisos

## 📝 Checklist de Implementación

Cuando agregues una nueva funcionalidad:

- [ ] ¿Necesita restricción por rol?
- [ ] ¿Implementaste validación en el servidor?
- [ ] ¿Agregaste el middleware correcto a la ruta?
- [ ] ¿Ocultaste elementos UI para roles no autorizados?
- [ ] ¿Probaste con cada tipo de rol?
- [ ] ¿Manejas el caso de rol no autorizado?

## 🎯 Casos de Uso Comunes

### 1. Página solo para psicólogas:
```vue
<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'auth-role']
})

// En el layout de /terapeuta
const { isPsicologa } = useRoles()
onMounted(() => {
  if (!isPsicologa.value) {
    navigateTo('/acceso-denegado')
  }
})
</script>
```

### 2. Botón que cambia según rol:
```vue
<template>
  <button @click="handleAction">
    {{ buttonText }}
  </button>
</template>

<script setup lang="ts">
const { isPsicologa } = useRoles()

const buttonText = computed(() => 
  isPsicologa.value ? 'Gestionar Pacientes' : 'Ver Mi Progreso'
)

const handleAction = () => {
  if (isPsicologa.value) {
    navigateTo('/terapeuta/pacientes')
  } else {
    navigateTo('/paciente/progreso')
  }
}
</script>
```

### 3. Contenido compartido con diferencias:
```vue
<template>
  <div>
    <h1>Mensajes</h1>
    
    <div v-if="isPsicologa">
      <!-- Puede ver mensajes de todos sus pacientes -->
      <MensajesList :filter="'all'" />
    </div>
    
    <div v-else-if="isPaciente">
      <!-- Solo ve sus propios mensajes -->
      <MensajesList :filter="'own'" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { isPsicologa, isPaciente } = useRoles()
</script>
```

## 💡 Tips

1. **Carga el perfil temprano**: El perfil se carga automáticamente en el login
2. **Usa computed properties**: Para reactividad automática
3. **Combina con v-if/v-show**: Para ocultar elementos según rol
4. **Proporciona feedback**: Explica por qué algo no está disponible
5. **Testea todos los roles**: Crea usuarios de prueba para cada rol

---

**¿Preguntas?** Consulta `TEST_LOGIN_ROLES.md` para más detalles sobre la implementación.
