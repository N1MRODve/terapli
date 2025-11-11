# 🔄 Corrección: Problema de Redirección después de Logout → Login

## 🐛 **Problema Identificado**

Después de cerrar sesión e intentar iniciar sesión nuevamente, el sistema no redirigía correctamente al dashboard correspondiente según el rol del usuario.

### Causa Raíz:
1. **`window.location.href`**: La función `signOut()` usaba `window.location.href = '/login'` que causaba problemas de estado en Nuxt
2. **Estado persistente**: Los estados de Nuxt (`useState`) no se limpiaban correctamente entre sesiones
3. **Fragmentación de estado**: El estado del usuario persistía parcialmente, confundiendo al middleware de roles

---

## ✅ **Solución Implementada**

### 1. **Corrección de `signOut()`**
```typescript
// ❌ ANTES - Causaba problemas
setTimeout(() => {
  window.location.href = '/login'
}, 100)

// ✅ DESPUÉS - Usa navegación de Nuxt
await navigateTo('/login', { replace: true, external: false })
```

### 2. **Limpieza Mejorada de Estado**
```typescript
// En signOut()
session.value = null
userProfile.value = null
isLoadingProfile = false

// Limpiar localStorage, sessionStorage y cookies de Supabase
localStorage.clear()
sessionStorage.clear()

// Limpiar cookies específicas de Supabase
const cookiesToClear = ['sb-access-token', 'sb-refresh-token', 'supabase-auth-token']
cookiesToClear.forEach(cookieName => {
  document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
})
```

### 3. **Auth State Listener Mejorado**
```typescript
if (event === 'SIGNED_OUT') {
  console.warn('⚠️ [Auth] Sesión cerrada, limpiando perfil y estado')
  userProfile.value = null
  isLoadingProfile = false
  
  // Limpiar también el estado de Nuxt
  const userState = useState('user-profile')
  const sessionState = useState('supabase-session')
  userState.value = null
  sessionState.value = null
  return
}
```

### 4. **Login con Limpieza Previa**
```typescript
const signInWithEmail = async (email: string, password: string) => {
  // Limpiar estado anterior completamente
  userProfile.value = null
  session.value = null
  isLoadingProfile = false
  
  // También limpiar estados de Nuxt
  if (process.client) {
    const userState = useState('user-profile')
    const sessionState = useState('supabase-session')
    userState.value = null
    sessionState.value = null
  }
  
  // Proceder con el login...
}
```

---

## 🧪 **Cómo Probar la Corrección**

### Flujo de Prueba:
1. **Login inicial**: Inicia sesión → Verifica redirección correcta
2. **Logout**: Cierra sesión → Verifica limpieza de estado
3. **Login nuevo**: Inicia sesión nuevamente → Verifica redirección correcta

### Consola Debug:
```
🧹 [Auth] Limpiando estado antes del login...
✅ [Auth] Login exitoso, estableciendo nueva sesión
🔐 [Auth State Change] TOKEN_REFRESHED
✅ [Auth] Usuario autenticado sin perfil, cargando...
[useSupabase] ✅ Perfil cargado correctamente: usuario@test.com Rol: psicologa
[auth-role] Usuario con rol: psicologa accediendo a: /dashboard
```

### URLs de Redirección por Rol:
- **Psicóloga**: `/terapeuta/dashboard`
- **Coordinadora**: `/coordinadora/dashboard`  
- **Paciente**: `/paciente/dashboard`

---

## 🎯 **Archivos Modificados**

- ✅ `/composables/useSupabase.ts`
  - Función `signOut()` corregida
  - Auth state listener mejorado
  - Función `signInWithEmail()` con limpieza previa

---

## 🔍 **Verificaciones**

- [ ] Login → Logout → Login funciona correctamente
- [ ] No hay fragmentos de estado entre sesiones
- [ ] Redirección al dashboard correcto según rol
- [ ] No hay bucles de redirección
- [ ] Estado completamente limpio después de logout

---

## 📝 **Notas Técnicas**

### Estados que se limpian:
- `session.value`
- `userProfile.value` 
- `isLoadingProfile`
- `useState('user-profile')`
- `useState('supabase-session')`
- `localStorage`
- `sessionStorage`
- Cookies de Supabase

### Beneficios de la corrección:
- ✅ Navegación nativa de Nuxt (no `window.location`)
- ✅ Estado completamente limpio entre sesiones
- ✅ Redirección confiable según roles
- ✅ Mejor debugging y logs
- ✅ No hay race conditions entre estados