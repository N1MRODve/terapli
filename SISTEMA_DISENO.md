# 🎨 Sistema de Diseño - Psicóloga Karem

## 📋 Índice

1. [Introducción](#introducción)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Design Tokens](#design-tokens)
4. [Colores](#colores)
5. [Tipografía](#tipografía)
6. [Componentes](#componentes)
7. [Espaciado](#espaciado)
8. [Sombras y Efectos](#sombras-y-efectos)
9. [Animaciones](#animaciones)
10. [Uso en Componentes Vue](#uso-en-componentes-vue)
11. [Mejores Prácticas](#mejores-prácticas)

---

## 🎯 Introducción

Este sistema de diseño proporciona una base sólida, coherente y escalable para toda la plataforma "Psicóloga Karem". Está construido sobre **design tokens** (variables CSS) integrados con **Tailwind CSS**, permitiendo:

- ✅ Consistencia visual en toda la aplicación
- ✅ Fácil mantenimiento y actualización de estilos
- ✅ Componentes reutilizables y modulares
- ✅ Escalabilidad a largo plazo
- ✅ Experiencia de usuario serena, profesional y accesible

---

## 📁 Estructura de Archivos

```
assets/css/
├── design-tokens.css   # Variables CSS (colores, espaciado, tipografía)
├── components.css      # Componentes reutilizables (@layer components)
├── typography.css      # Sistema tipográfico
└── main.css           # Archivo principal que importa todo

tailwind.config.js     # Configuración extendida de Tailwind
```

### Orden de Carga

```css
/* main.css */
@import './design-tokens.css';  /* 1. Variables */
@tailwind base;                 /* 2. Reset de Tailwind */
@import './components.css';     /* 3. Componentes */
@import './typography.css';     /* 4. Tipografía */
@tailwind components;           /* 5. Componentes Tailwind */
@tailwind utilities;            /* 6. Utilities Tailwind */
```

---

## 🎨 Design Tokens

Todos los valores de diseño están centralizados en variables CSS (`design-tokens.css`):

```css
:root {
  --color-bg-primary: #FDFBF9;
  --color-brand-primary: #C97C5D;
  --spacing-base: 1rem;
  --radius-base: 0.5rem;
  --font-size-base: 0.9375rem;
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  /* ...más tokens */
}
```

Estos tokens son **consumidos por Tailwind** a través de `tailwind.config.js`, permitiendo usar clases como:

```html
<div class="bg-base-bg text-cafe rounded-lg p-4">
  Contenido
</div>
```

---

## 🌈 Colores

### Paleta Principal

| Color | Variable CSS | Clase Tailwind | Hex | Uso |
|-------|-------------|----------------|-----|-----|
| **Fondo Principal** | `--color-bg-primary` | `bg-base-bg` | `#FDFBF9` | Fondo principal cálido |
| **Fondo Secundario** | `--color-bg-secondary` | `bg-base-bg-secondary` | `#F9F7F3` | Fondo alternativo |
| **Terracota** | `--color-brand-primary` | `bg-terracota` | `#C97C5D` | Color de marca principal |
| **Terracota Claro** | `--color-brand-light` | `bg-terracota-light` | `#E8BAAA` | Hover, fondos suaves |
| **Café** | `--color-cafe` | `text-cafe` | `#5D4A44` | Texto principal |
| **Rosa** | `--color-accent-rose` | `bg-rosa` | `#EAD5D3` | Acentos complementarios |

### Colores Semánticos

```html
<!-- Éxito -->
<span class="text-success">✓ Guardado correctamente</span>

<!-- Advertencia -->
<div class="bg-warning-light border border-warning text-yellow-700">
  ⚠️ Atención requerida
</div>

<!-- Error -->
<p class="text-error">❌ Error al guardar</p>

<!-- Info -->
<div class="alert-info">ℹ️ Información importante</div>
```

### Estados de Citas

```html
<span class="badge-pendiente">Pendiente</span>
<span class="badge-confirmada">Confirmada</span>
<span class="badge-realizada">Realizada</span>
<span class="badge-cancelada">Cancelada</span>
```

---

## 🔤 Tipografía

### Familias Tipográficas

```css
--font-serif: 'Lora', Georgia, serif;      /* Títulos */
--font-sans: 'Inter', sans-serif;           /* Cuerpo */
--font-mono: 'SF Mono', Monaco, monospace;  /* Código */
```

### Jerarquía de Tamaños

| Nivel | Clase | Tamaño | Uso |
|-------|-------|--------|-----|
| Display | `text-7xl` | 72px | Hero sections |
| H1 | `text-4xl` | 36px | Títulos principales |
| H2 | `text-3xl` | 30px | Títulos de sección |
| H3 | `text-2xl` | 24px | Subtítulos |
| Body | `text-base` | 15px | Texto cuerpo |
| Small | `text-sm` | 14px | Texto secundario |
| Caption | `text-xs` | 12px | Etiquetas pequeñas |

### Ejemplo de Uso

```vue
<template>
  <div>
    <h1 class="text-4xl font-serif font-bold text-cafe mb-4">
      Bienvenida a tu espacio
    </h1>
    
    <h2 class="text-2xl font-serif font-semibold text-cafe/90 mb-3">
      Próximas sesiones
    </h2>
    
    <p class="text-base text-cafe/80 leading-relaxed">
      Aquí encontrarás toda la información sobre tus citas programadas.
    </p>
    
    <span class="text-xs text-cafe/60">
      Última actualización: hace 5 minutos
    </span>
  </div>
</template>
```

---

## 🧩 Componentes

### Tarjetas (Cards)

```html
<!-- Tarjeta básica -->
<div class="card">
  <h3>Título de tarjeta</h3>
  <p>Contenido</p>
</div>

<!-- Tarjeta elevada -->
<div class="card-elevated">
  Contenido destacado
</div>

<!-- Tarjeta interactiva -->
<div class="card-interactive">
  Haz clic aquí
</div>

<!-- Panel con secciones -->
<div class="panel">
  <div class="panel-header">
    <h3>Encabezado</h3>
  </div>
  <div class="panel-body">
    Contenido principal
  </div>
  <div class="panel-footer">
    Acciones
  </div>
</div>
```

### Botones

```html
<!-- Primario -->
<button class="btn-primary">
  Guardar cambios
</button>

<!-- Secundario -->
<button class="btn-secondary">
  Cancelar
</button>

<!-- Outline -->
<button class="btn-outline">
  Ver más
</button>

<!-- Ghost -->
<button class="btn-ghost">
  <IconEdit class="w-4 h-4" />
  Editar
</button>

<!-- Tamaños -->
<button class="btn-primary btn-sm">Pequeño</button>
<button class="btn-primary">Normal</button>
<button class="btn-primary btn-lg">Grande</button>

<!-- Con icono -->
<button class="btn-primary">
  <IconCheck class="w-5 h-5" />
  Confirmar
</button>
```

### Inputs y Formularios

```html
<div class="form-group">
  <label class="label" for="email">
    Correo electrónico
  </label>
  
  <input 
    type="email" 
    id="email"
    class="input"
    placeholder="tu@email.com"
  />
  
  <p class="form-hint">
    Te enviaremos confirmaciones a este correo
  </p>
</div>

<!-- Select -->
<select class="select">
  <option>Selecciona una opción</option>
  <option>Opción 1</option>
</select>

<!-- Textarea -->
<textarea class="textarea" rows="4">
  Escribe aquí...
</textarea>

<!-- Checkbox -->
<label class="flex items-center gap-2">
  <input type="checkbox" class="checkbox" />
  <span>Acepto los términos</span>
</label>
```

### Badges

```html
<span class="badge-primary">Activo</span>
<span class="badge-success">Completado</span>
<span class="badge-warning">Pendiente</span>
<span class="badge-error">Cancelado</span>

<!-- Con punto indicador -->
<span class="badge-success flex items-center gap-1.5">
  <span class="status-dot-success"></span>
  Online
</span>
```

### Alertas

```html
<div class="alert-success">
  <IconCheckCircle class="w-5 h-5" />
  <div>
    <p class="font-semibold">¡Guardado correctamente!</p>
    <p class="text-sm">Los cambios se aplicaron exitosamente.</p>
  </div>
</div>

<div class="alert-warning">
  <IconAlertTriangle class="w-5 h-5" />
  <p>Por favor, revisa los datos antes de continuar.</p>
</div>

<div class="alert-error">
  <IconX class="w-5 h-5" />
  <p>Error al procesar la solicitud.</p>
</div>
```

### Modales

```html
<!-- Overlay -->
<div class="modal-overlay"></div>

<!-- Modal -->
<div class="modal">
  <div class="modal-content">
    <div class="modal-header">
      <h3 class="text-xl font-serif font-semibold">Título del modal</h3>
    </div>
    
    <div class="modal-body">
      <p>Contenido del modal</p>
    </div>
    
    <div class="modal-footer">
      <button class="btn-secondary">Cancelar</button>
      <button class="btn-primary">Confirmar</button>
    </div>
  </div>
</div>
```

---

## 📏 Espaciado

Sistema basado en múltiplos de **4px**:

```html
<!-- Padding -->
<div class="p-4">Padding 16px</div>
<div class="p-6">Padding 24px (común para tarjetas)</div>

<!-- Margin -->
<div class="mt-4 mb-6">Margin top 16px, bottom 24px</div>

<!-- Gap (Flexbox/Grid) -->
<div class="flex gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Espaciado de sección -->
<section class="section-padding">
  <!-- py-20 md:py-28, px-6 -->
</section>

<!-- Contenedor responsive -->
<div class="container-responsive">
  <!-- max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -->
</div>
```

---

## 🌑 Sombras y Efectos

### Sombras

```html
<!-- Sombras sutiles -->
<div class="shadow-xs">Extra pequeña</div>
<div class="shadow-sm">Pequeña</div>
<div class="shadow">Default (tarjetas)</div>
<div class="shadow-md">Media (hover)</div>
<div class="shadow-lg">Grande (modal)</div>
<div class="shadow-xl">Extra grande</div>

<!-- Sombra especial -->
<div class="shadow-glow">Efecto glow (terracota)</div>
<div class="shadow-focus">Focus ring</div>
```

### Glassmorphism

```html
<div class="glass">
  <!-- bg-white/80 backdrop-blur-md -->
  Efecto cristal suave
</div>

<div class="glass-strong">
  <!-- bg-white/90 backdrop-blur-lg -->
  Efecto cristal fuerte
</div>
```

### Gradientes

```html
<!-- Fondo cálido -->
<div class="gradient-warm">
  <!-- Gradiente beige suave -->
</div>

<!-- Gradiente terracota -->
<div class="gradient-terracota">
  <!-- Gradiente terracota -->
</div>

<!-- Texto con gradiente -->
<h1 class="text-gradient-terracota">
  Título con gradiente
</h1>
```

---

## 🎬 Animaciones

### Animaciones Predefinidas

```html
<!-- Fade in básico -->
<div class="animate-fade-in">
  Aparece suavemente
</div>

<!-- Fade in desde abajo -->
<div class="animate-fade-in-up">
  Sube mientras aparece
</div>

<!-- Fade in desde arriba -->
<div class="animate-fade-in-down">
  Baja mientras aparece
</div>

<!-- Scale in -->
<div class="animate-scale-in">
  Crece mientras aparece
</div>

<!-- Delays para animaciones escalonadas -->
<div class="animate-fade-in-up delay-100">Item 1</div>
<div class="animate-fade-in-up delay-200">Item 2</div>
<div class="animate-fade-in-up delay-300">Item 3</div>
```

### Efectos Hover

```html
<!-- Elevación -->
<div class="hover-lift">
  Se eleva al hacer hover
</div>

<!-- Glow -->
<div class="hover-glow">
  Brilla al hacer hover
</div>

<!-- Scale -->
<div class="hover-scale">
  Crece al hacer hover
</div>

<!-- Combinados -->
<div class="card-interactive hover-lift hover-glow">
  Tarjeta interactiva completa
</div>
```

### Transiciones

```html
<!-- Transición suave -->
<div class="transition-all duration-200">
  Transición de todas las propiedades
</div>

<!-- Transición de colores -->
<a class="text-cafe hover:text-terracota transition-colors duration-200">
  Enlace
</a>
```

### Calm Button (Respiración)

```html
<button class="btn-primary calm-button">
  <!-- Animación de respiración suave (8s) -->
  Reservar cita
</button>
```

---

## 💻 Uso en Componentes Vue

### Ejemplo Completo: Tarjeta de Cita

```vue
<template>
  <div class="card hover-lift">
    <!-- Header con badge de estado -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="avatar-base">
          <img :src="paciente.avatar" :alt="paciente.nombre" />
        </div>
        <div>
          <h3 class="text-lg font-serif font-semibold text-cafe">
            {{ paciente.nombre }}
          </h3>
          <p class="text-sm text-cafe/60">
            {{ cita.fecha }} · {{ cita.hora }}
          </p>
        </div>
      </div>
      
      <span :class="badgeClass">
        {{ cita.estado }}
      </span>
    </div>
    
    <!-- Información adicional -->
    <div class="flex items-center gap-4 text-sm text-cafe/70 mb-4">
      <div class="flex items-center gap-1.5">
        <IconClock class="w-4 h-4" />
        <span>{{ cita.duracion }} min</span>
      </div>
      
      <div class="flex items-center gap-1.5">
        <IconVideo v-if="cita.modalidad === 'online'" class="w-4 h-4" />
        <IconMapPin v-else class="w-4 h-4" />
        <span>{{ cita.modalidad }}</span>
      </div>
    </div>
    
    <!-- Acciones -->
    <div class="flex gap-2">
      <button class="btn-primary flex-1">
        <IconCheck class="w-4 h-4" />
        Confirmar
      </button>
      
      <button class="btn-outline">
        <IconEdit class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  cita: Object,
  paciente: Object
})

const badgeClass = computed(() => {
  const badges = {
    pendiente: 'badge-pendiente',
    confirmada: 'badge-confirmada',
    realizada: 'badge-realizada',
    cancelada: 'badge-cancelada'
  }
  return badges[props.cita.estado] || 'badge-secondary'
})
</script>
```

### Ejemplo: Formulario

```vue
<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Nombre -->
    <div class="form-group">
      <label class="label" for="nombre">
        Nombre completo
      </label>
      <input 
        type="text"
        id="nombre"
        v-model="form.nombre"
        class="input"
        :class="{ 'input-error': errors.nombre }"
        placeholder="María García"
      />
      <p v-if="errors.nombre" class="form-error">
        {{ errors.nombre }}
      </p>
    </div>
    
    <!-- Email -->
    <div class="form-group">
      <label class="label" for="email">
        Correo electrónico
      </label>
      <input 
        type="email"
        id="email"
        v-model="form.email"
        class="input"
        placeholder="maria@ejemplo.com"
      />
      <p class="form-hint">
        Te enviaremos recordatorios de citas
      </p>
    </div>
    
    <!-- Modalidad -->
    <div class="form-group">
      <label class="label">
        Modalidad preferida
      </label>
      <div class="flex gap-4">
        <label class="flex items-center gap-2">
          <input 
            type="radio"
            name="modalidad"
            value="presencial"
            v-model="form.modalidad"
            class="radio"
          />
          <span>Presencial</span>
        </label>
        
        <label class="flex items-center gap-2">
          <input 
            type="radio"
            name="modalidad"
            value="online"
            v-model="form.modalidad"
            class="radio"
          />
          <span>Online</span>
        </label>
      </div>
    </div>
    
    <!-- Botones -->
    <div class="flex gap-3 justify-end">
      <button 
        type="button"
        class="btn-secondary"
        @click="$emit('cancel')"
      >
        Cancelar
      </button>
      
      <button 
        type="submit"
        class="btn-primary"
        :disabled="loading"
      >
        <span v-if="!loading">Guardar</span>
        <span v-else class="flex items-center gap-2">
          <span class="spinner"></span>
          Guardando...
        </span>
      </button>
    </div>
  </form>
</template>

<script setup>
const form = ref({
  nombre: '',
  email: '',
  modalidad: 'presencial'
})

const errors = ref({})
const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  // Lógica de envío
  loading.value = false
}
</script>
```

---

## ✅ Mejores Prácticas

### 1. Usar Clases de Componentes Reutilizables

❌ **Evitar:**
```html
<div class="bg-white rounded-xl border border-cafe/5 shadow-sm p-6">
  Contenido
</div>
```

✅ **Preferir:**
```html
<div class="card">
  Contenido
</div>
```

### 2. Consistencia en Espaciado

✅ Usa siempre el sistema de espaciado (múltiplos de 4px):
- `p-4` (16px) para padding interior de elementos pequeños
- `p-6` (24px) para padding de tarjetas
- `gap-4` para espaciado entre elementos

### 3. Jerarquía Visual Clara

```html
<!-- Título principal -->
<h1 class="text-4xl font-serif font-bold text-cafe mb-6">
  Dashboard
</h1>

<!-- Sección -->
<h2 class="text-2xl font-serif font-semibold text-cafe mb-4">
  Próximas citas
</h2>

<!-- Subsección -->
<h3 class="text-xl font-serif font-medium text-cafe/90 mb-3">
  Hoy
</h3>

<!-- Cuerpo -->
<p class="text-base text-cafe/80 leading-relaxed">
  Descripción
</p>
```

### 4. Estados Interactivos

Siempre incluir estados hover, focus y active:

```html
<button class="
  btn-primary
  hover:bg-terracota/90
  focus:ring-2 focus:ring-terracota/50
  active:scale-95
  transition-all duration-200
">
  Botón
</button>
```

### 5. Accesibilidad

```html
<!-- Focus visible -->
<a href="#" class="focus-ring">
  Enlace
</a>

<!-- Contraste suficiente -->
<p class="text-cafe">  <!-- #5D4A44 sobre #FDFBF9 = AA ✓ -->
  Texto legible
</p>

<!-- Tamaños mínimos para elementos interactivos -->
<button class="min-h-[44px] min-w-[44px]">
  <!-- Mínimo 44x44px para táctil -->
</button>
```

### 6. Responsive Design

```html
<div class="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4 
  md:gap-6
">
  <!-- Mobile: 1 columna -->
  <!-- Tablet: 2 columnas -->
  <!-- Desktop: 3 columnas -->
</div>
```

### 7. Animaciones Sutiles

✅ Usa animaciones para mejorar la UX, no para distraer:

```html
<!-- Bueno: transición suave -->
<div class="transition-all duration-200 hover:shadow-md">
  Tarjeta
</div>

<!-- Evitar: animaciones agresivas -->
<div class="animate-bounce">  ❌
  Muy distractor
</div>
```

### 8. Nomenclatura Semántica

```html
<!-- Bueno: describe el propósito -->
<button class="btn-primary">Guardar</button>

<!-- Evitar: describe el estilo -->
<button class="bg-terracota text-white rounded-xl px-4 py-2">
  Guardar
</button>
```

---

## 🚀 Extensibilidad

### Agregar Nuevos Componentes

1. Define el componente en `assets/css/components.css`:

```css
@layer components {
  .my-new-component {
    @apply bg-white rounded-xl p-6 shadow-md;
    /* Estilos personalizados */
  }
}
```

2. Úsalo en tu aplicación:

```html
<div class="my-new-component">
  Contenido
</div>
```

### Agregar Nuevos Tokens

1. Define en `design-tokens.css`:

```css
:root {
  --color-my-custom: #ABC123;
}
```

2. Extiende en `tailwind.config.js`:

```js
colors: {
  'my-custom': '#ABC123'
}
```

3. Usa en componentes:

```html
<div class="bg-my-custom">
  Contenido
</div>
```

---

## 📚 Referencias Rápidas

### Archivos Principales

- `assets/css/design-tokens.css` → Variables CSS globales
- `assets/css/components.css` → Componentes reutilizables
- `assets/css/main.css` → Archivo principal
- `tailwind.config.js` → Configuración de Tailwind

### Clases Más Usadas

```
Tarjetas:     card, card-elevated, card-interactive
Botones:      btn-primary, btn-secondary, btn-outline
Inputs:       input, select, textarea, checkbox
Badges:       badge-primary, badge-success, badge-warning
Espaciado:    p-4, p-6, gap-4, gap-6
Texto:        text-cafe, text-cafe/70, text-terracota
Sombras:      shadow-sm, shadow, shadow-md
Animaciones:  animate-fade-in-up, hover-lift
```

---

## 🎨 Paleta de Colores Visual

```
🟤 Café (Principal)     #5D4A44  text-cafe
🟠 Terracota (Marca)    #C97C5D  bg-terracota
🟣 Rosa (Acento)        #EAD5D3  bg-rosa
⚪ Fondo Principal      #FDFBF9  bg-base-bg
⚪ Fondo Secundario     #F9F7F3  bg-base-bg-secondary
🟢 Éxito                #54BF83  text-success
🟡 Advertencia          #F2C94C  text-warning
🔴 Error                #E85D4A  text-error
🔵 Info                 #5B9BD5  text-info
```

---

## 📞 Soporte

Para dudas o sugerencias sobre el sistema de diseño, consulta:

- 📄 Este documento (`SISTEMA_DISENO.md`)
- 💻 Código fuente en `assets/css/`
- 🎨 Ejemplos en componentes Vue existentes

---

**Versión:** 1.0  
**Última actualización:** Octubre 2025  
**Mantenido por:** Equipo de Desarrollo Psicóloga Karem
