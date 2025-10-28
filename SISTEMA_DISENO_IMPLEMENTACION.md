# 🎨 Sistema de Diseño - Guía de Implementación

## 📦 Archivos Creados

```
✅ assets/css/design-tokens.css      - Variables CSS globales
✅ assets/css/components.css         - Componentes reutilizables
✅ assets/css/main.css              - Archivo principal actualizado
✅ tailwind.config.js               - Configuración extendida
✅ SISTEMA_DISENO.md                - Documentación completa
✅ SISTEMA_DISENO_QUICK.md          - Guía rápida
✅ pages/ejemplo-sistema-diseno.vue - Página de demostración
```

---

## 🚀 Instalación y Configuración

### 1️⃣ Archivos ya están en su lugar

Todos los archivos CSS y configuraciones ya están creados. **No necesitas mover nada**.

### 2️⃣ Instalar Inter (Font Sans actualizada)

El sistema de diseño usa **Inter** en lugar de Lato para mejor legibilidad. Actualiza `nuxt.config.ts`:

```typescript
googleFonts: {
  families: {
    'Lora': [400, 500, 600, 700],      // Serif (títulos)
    'Inter': [300, 400, 500, 600, 700] // Sans (cuerpo) ← NUEVO
  },
  display: 'swap',
  prefetch: true,
  preconnect: true,
  preload: true
}
```

### 3️⃣ Verificar importación en nuxt.config.ts

Asegúrate de que `main.css` esté importado:

```typescript
css: ['~/assets/css/main.css']
```

### 4️⃣ Reiniciar el servidor de desarrollo

```bash
# Detener servidor (Ctrl+C)
# Luego iniciar nuevamente
npm run dev
```

---

## 🎯 Uso Inmediato

### Aplicar a tus componentes existentes

#### ❌ ANTES (Código repetitivo)

```vue
<template>
  <div class="bg-white rounded-xl border border-cafe/5 shadow-sm p-6 hover:shadow-md transition-all">
    <h3 class="text-xl font-serif font-semibold text-cafe mb-2">
      Título
    </h3>
    <p class="text-sm text-cafe/70">
      Descripción
    </p>
  </div>
</template>
```

#### ✅ DESPUÉS (Con sistema de diseño)

```vue
<template>
  <div class="card hover-glow">
    <h3 class="text-xl font-serif font-semibold text-cafe mb-2">
      Título
    </h3>
    <p class="text-sm text-cafe/70">
      Descripción
    </p>
  </div>
</template>
```

---

## 🔧 Migrando Componentes Existentes

### 1. Identificar patrones repetidos

Busca en tu código:
- `bg-white rounded-xl border border-cafe/5 shadow-sm p-6` → `.card`
- `bg-terracota text-white rounded-xl px-4 py-2` → `.btn-primary`
- `w-full px-4 py-2.5 rounded-lg border` → `.input`

### 2. Reemplazar con clases de componentes

```bash
# Buscar en VS Code
bg-white rounded-xl border border-cafe/5 shadow-sm p-6

# Reemplazar con
card
```

### 3. Ejemplos de migración

#### Botones

```vue
<!-- ANTES -->
<button class="bg-terracota hover:bg-terracota/90 text-white px-4 py-2.5 rounded-xl font-medium transition-all">
  Guardar
</button>

<!-- DESPUÉS -->
<button class="btn-primary">
  Guardar
</button>
```

#### Inputs

```vue
<!-- ANTES -->
<input 
  type="text"
  class="w-full px-4 py-2.5 rounded-lg border border-cafe/10 bg-white focus:outline-none focus:ring-2 focus:ring-terracota/30"
/>

<!-- DESPUÉS -->
<input type="text" class="input" />
```

#### Badges

```vue
<!-- ANTES -->
<span class="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700">
  Activo
</span>

<!-- DESPUÉS -->
<span class="badge-success">Activo</span>
```

---

## 📱 Probar el Sistema

### Acceder a la página de demostración

1. Inicia tu servidor: `npm run dev`
2. Navega a: `http://localhost:3000/ejemplo-sistema-diseno`
3. Verás todos los componentes disponibles

### Inspeccionar en DevTools

1. Abre las DevTools del navegador (F12)
2. Selecciona un elemento
3. Verás las variables CSS aplicadas:

```css
/* Ejemplo de lo que verás */
.card {
  background-color: var(--color-surface); /* #FFFFFF */
  border-radius: var(--radius-lg);        /* 16px */
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-xl);             /* 24px */
}
```

---

## 🎨 Eliminar el Gap Superior

### Problema: Gap entre header y contenido

**Causa:** Padding superior en el body

**Solución aplicada:**

En `assets/css/main.css`, se eliminó:

```css
/* ❌ ANTES - Causaba el gap */
body:not(.layout-paciente) {
  padding-top: 5rem;
}
```

Ahora:

```css
/* ✅ DESPUÉS - Sin padding innecesario */
body {
  @apply font-sans text-cafe bg-base-bg antialiased;
}
```

### Ajustar layouts si es necesario

Si tu header es `fixed`, añade padding solo al main:

```vue
<!-- layouts/terapeuta.vue -->
<template>
  <div class="flex min-h-screen bg-base-bg">
    <Sidebar />
    <main class="flex-1 px-6 py-4 overflow-y-auto">
      <!-- Sin padding-top innecesario -->
      <slot />
    </main>
  </div>
</template>
```

---

## 🔄 Actualizar Componentes Vue Específicos

### Dashboard

```vue
<!-- ANTES -->
<div class="bg-white rounded-xl shadow-md p-6">
  <h2>Dashboard</h2>
</div>

<!-- DESPUÉS -->
<div class="card">
  <h2 class="text-2xl font-serif font-semibold text-cafe mb-4">
    Dashboard
  </h2>
</div>
```

### Pacientes

```vue
<!-- ANTES -->
<div class="bg-white rounded-lg border p-4 hover:shadow-lg transition">
  <div class="flex items-center justify-between">
    <h3>Paciente</h3>
    <span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
      Activo
    </span>
  </div>
</div>

<!-- DESPUÉS -->
<div class="card-interactive">
  <div class="flex items-center justify-between">
    <h3 class="text-lg font-serif font-semibold text-cafe">
      Paciente
    </h3>
    <span class="badge-success">Activo</span>
  </div>
</div>
```

### Agenda

```vue
<!-- ANTES -->
<button class="bg-terracota text-white px-4 py-2 rounded-lg hover:bg-terracota/90">
  Crear cita
</button>

<!-- DESPUÉS -->
<button class="btn-primary">
  <IconPlus class="w-5 h-5" />
  Crear cita
</button>
```

---

## 📊 Checklist de Migración

### Por Componente

- [ ] **Layouts** (`layouts/`)
  - [ ] Eliminar padding-top innecesario
  - [ ] Usar `bg-base-bg` para fondos
  - [ ] Aplicar `custom-scrollbar` si tiene scroll

- [ ] **Páginas** (`pages/`)
  - [ ] Dashboard: Usar `.card`, `.card-interactive`
  - [ ] Pacientes: Usar `.list-item`, `.badge-*`
  - [ ] Agenda: Usar `.btn-primary`, `.badge-confirmada`, etc.
  - [ ] Sesiones: Usar `.panel`, `.panel-header`, `.panel-body`

- [ ] **Componentes** (`components/`)
  - [ ] Botones: Reemplazar con `.btn-primary`, `.btn-secondary`
  - [ ] Modales: Usar `.modal`, `.modal-overlay`, `.modal-content`
  - [ ] Formularios: Usar `.input`, `.select`, `.textarea`
  - [ ] Cards: Reemplazar con `.card` variants

---

## 🎯 Tareas Específicas

### 1. Actualizar colores de terracota

**ANTES:** `#D8AFA0`  
**AHORA:** `#C97C5D` (más vibrante y profesional)

Buscar y reemplazar en archivos:

```bash
# En VS Code, buscar:
#D8AFA0

# Reemplazar con:
#C97C5D
```

O usar la clase de Tailwind:

```vue
<div class="bg-terracota">
  <!-- Ahora usa automáticamente #C97C5D -->
</div>
```

### 2. Unificar espaciado

Buscar patrones inconsistentes:

```bash
# Buscar en VS Code (regex)
(p|m|gap)-[0-9]{2,}

# Reemplazar con valores del sistema (4, 6, 8, 12, 16...)
p-4, p-6, gap-4, gap-6
```

### 3. Actualizar sombras

```bash
# Buscar
shadow-\[.*\]

# Reemplazar con clases predefinidas
shadow-sm, shadow, shadow-md, shadow-lg
```

---

## 🧪 Testing

### 1. Verificar que no se rompió nada

```bash
npm run dev
```

Navega por todas las páginas:
- `/` (Home pública)
- `/paciente/dashboard`
- `/terapeuta/dashboard`
- `/terapeuta/pacientes`
- `/terapeuta/agenda`

### 2. Comprobar responsive

Prueba en diferentes tamaños:
- 📱 Mobile: 375px
- 📱 Tablet: 768px
- 💻 Desktop: 1280px

### 3. Verificar accesibilidad

- ✅ Contraste de colores (Chrome DevTools → Lighthouse)
- ✅ Focus visible en elementos interactivos
- ✅ Tamaños mínimos de botones (44x44px)

---

## 📚 Documentación

### Archivos de referencia

1. **Documentación completa**: `SISTEMA_DISENO.md`
   - Todos los componentes
   - Ejemplos de código
   - Mejores prácticas

2. **Guía rápida**: `SISTEMA_DISENO_QUICK.md`
   - Referencia rápida
   - Clases más usadas
   - Atajos

3. **Ejemplo visual**: `/ejemplo-sistema-diseno`
   - Todos los componentes renderizados
   - Prueba en tiempo real

---

## 🎨 Personalizaciones Futuras

### Agregar nuevos componentes

1. Define en `assets/css/components.css`:

```css
@layer components {
  .my-component {
    @apply bg-white rounded-xl p-6;
    /* Custom styles */
  }
}
```

2. Usa en tus archivos Vue:

```vue
<div class="my-component">
  Contenido
</div>
```

### Modificar design tokens

Edita `assets/css/design-tokens.css`:

```css
:root {
  --color-brand-primary: #NEW_COLOR;
  --spacing-custom: 2.5rem;
}
```

Luego extiende en `tailwind.config.js`:

```js
colors: {
  'brand-custom': '#NEW_COLOR'
}
```

---

## 🚨 Solución de Problemas

### Los estilos no se aplican

1. Reinicia el servidor de desarrollo
2. Limpia caché: `rm -rf .nuxt && npm run dev`
3. Verifica que `main.css` esté importado en `nuxt.config.ts`

### Las clases de Tailwind no funcionan

1. Verifica `tailwind.config.js` para la configuración correcta
2. Asegúrate de que los archivos estén en `content: []`

### Los design tokens no se ven

1. Verifica que `design-tokens.css` esté importado en `main.css`
2. Inspecciona en DevTools si las variables CSS están cargadas

---

## ✅ Próximos Pasos

1. [ ] Actualizar Google Fonts en `nuxt.config.ts` (Inter)
2. [ ] Reiniciar servidor
3. [ ] Probar `/ejemplo-sistema-diseno`
4. [ ] Migrar 1-2 componentes clave (Dashboard, Pacientes)
5. [ ] Verificar que todo funcione correctamente
6. [ ] Continuar migrando el resto progresivamente

---

## 🎯 Beneficios Obtenidos

✅ **Consistencia visual** en toda la aplicación  
✅ **Código más limpio** y mantenible  
✅ **Desarrollo más rápido** (componentes reutilizables)  
✅ **Fácil de escalar** a largo plazo  
✅ **Mejor UX** con animaciones y transiciones coherentes  
✅ **Accesibilidad** mejorada por defecto  

---

## 📞 Soporte

Si tienes dudas:

1. Revisa `SISTEMA_DISENO.md` (documentación completa)
2. Consulta `SISTEMA_DISENO_QUICK.md` (referencia rápida)
3. Prueba en `/ejemplo-sistema-diseno` (ejemplos visuales)
4. Inspecciona el código fuente en `assets/css/`

---

**¡Sistema de diseño listo para usar! 🎉**

_Versión: 1.0 | Octubre 2025_
