# 🚀 Guía Rápida - Sistema de Diseño

> Referencia rápida de las clases y componentes más utilizados

---

## 📦 Tarjetas y Contenedores

```html
<!-- Tarjeta básica -->
<div class="card">...</div>

<!-- Tarjeta elevada (destacada) -->
<div class="card-elevated">...</div>

<!-- Tarjeta interactiva (hover + click) -->
<div class="card-interactive">...</div>

<!-- Panel con secciones -->
<div class="panel">
  <div class="panel-header">...</div>
  <div class="panel-body">...</div>
  <div class="panel-footer">...</div>
</div>
```

---

## 🔘 Botones

```html
<!-- Primario (acción principal) -->
<button class="btn-primary">Guardar</button>

<!-- Secundario -->
<button class="btn-secondary">Cancelar</button>

<!-- Outline (borde) -->
<button class="btn-outline">Ver más</button>

<!-- Ghost (transparente) -->
<button class="btn-ghost">Editar</button>

<!-- Tamaños -->
<button class="btn-primary btn-sm">Pequeño</button>
<button class="btn-primary btn-lg">Grande</button>

<!-- Con estado disabled -->
<button class="btn-primary" disabled>Cargando...</button>
```

---

## 📝 Formularios

```html
<!-- Input de texto -->
<input type="text" class="input" placeholder="Escribe aquí" />

<!-- Con error -->
<input type="email" class="input input-error" />
<p class="form-error">Correo inválido</p>

<!-- Select -->
<select class="select">
  <option>Selecciona</option>
</select>

<!-- Textarea -->
<textarea class="textarea" rows="4"></textarea>

<!-- Checkbox -->
<input type="checkbox" class="checkbox" />

<!-- Radio -->
<input type="radio" class="radio" />

<!-- Label -->
<label class="label">Nombre completo</label>

<!-- Hint -->
<p class="form-hint">Información adicional</p>
```

---

## 🏷️ Badges

```html
<!-- Colores -->
<span class="badge-primary">Primario</span>
<span class="badge-secondary">Secundario</span>
<span class="badge-success">Éxito</span>
<span class="badge-warning">Advertencia</span>
<span class="badge-error">Error</span>

<!-- Estados de citas -->
<span class="badge-pendiente">Pendiente</span>
<span class="badge-confirmada">Confirmada</span>
<span class="badge-realizada">Realizada</span>
<span class="badge-cancelada">Cancelada</span>
```

---

## 🔔 Alertas

```html
<!-- Éxito -->
<div class="alert-success">
  <IconCheck />
  <p>Operación exitosa</p>
</div>

<!-- Advertencia -->
<div class="alert-warning">
  <IconAlert />
  <p>Atención requerida</p>
</div>

<!-- Error -->
<div class="alert-error">
  <IconX />
  <p>Error al procesar</p>
</div>

<!-- Info -->
<div class="alert-info">
  <IconInfo />
  <p>Información importante</p>
</div>
```

---

## 🎨 Colores

### Texto
```html
<p class="text-cafe">Texto principal (#5D4A44)</p>
<p class="text-cafe/70">Texto secundario (70% opacidad)</p>
<p class="text-cafe/60">Texto terciario (60% opacidad)</p>
<p class="text-terracota">Texto de marca (#C97C5D)</p>
```

### Fondos
```html
<div class="bg-base-bg">Fondo principal (#FDFBF9)</div>
<div class="bg-base-bg-secondary">Fondo secundario (#F9F7F3)</div>
<div class="bg-terracota">Fondo terracota</div>
<div class="bg-white">Fondo blanco</div>
```

### Bordes
```html
<div class="border border-cafe/5">Borde sutil</div>
<div class="border border-cafe/10">Borde normal</div>
<div class="border border-cafe/20">Borde visible</div>
<div class="border border-terracota/30">Borde terracota</div>
```

---

## 🔤 Tipografía

### Tamaños
```html
<h1 class="text-4xl font-serif font-bold">Título H1</h1>
<h2 class="text-3xl font-serif font-semibold">Título H2</h2>
<h3 class="text-2xl font-serif font-semibold">Título H3</h3>
<p class="text-base">Texto normal (15px)</p>
<span class="text-sm">Texto pequeño (14px)</span>
<span class="text-xs">Texto muy pequeño (12px)</span>
```

### Pesos
```html
<p class="font-light">Light (300)</p>
<p class="font-normal">Normal (400)</p>
<p class="font-medium">Medium (500)</p>
<p class="font-semibold">Semibold (600)</p>
<p class="font-bold">Bold (700)</p>
```

---

## 📏 Espaciado

### Padding
```html
<div class="p-2">8px todo alrededor</div>
<div class="p-4">16px todo alrededor</div>
<div class="p-6">24px todo alrededor (común)</div>
<div class="px-4 py-2">16px horizontal, 8px vertical</div>
```

### Margin
```html
<div class="m-4">Margin 16px</div>
<div class="mt-4">Margin top 16px</div>
<div class="mb-6">Margin bottom 24px</div>
<div class="mx-auto">Centrar horizontalmente</div>
```

### Gap (Flexbox/Grid)
```html
<div class="flex gap-2">Gap 8px</div>
<div class="flex gap-4">Gap 16px (común)</div>
<div class="flex gap-6">Gap 24px</div>
<div class="grid gap-4">Grid gap 16px</div>
```

---

## 🌑 Sombras

```html
<div class="shadow-xs">Extra pequeña</div>
<div class="shadow-sm">Pequeña</div>
<div class="shadow">Normal (default)</div>
<div class="shadow-md">Media (hover)</div>
<div class="shadow-lg">Grande (modales)</div>
<div class="shadow-xl">Extra grande</div>
<div class="shadow-glow">Brillo terracota</div>
```

---

## 📐 Bordes Redondeados

```html
<div class="rounded-sm">6px</div>
<div class="rounded">8px (default)</div>
<div class="rounded-lg">16px</div>
<div class="rounded-xl">20px (común)</div>
<div class="rounded-2xl">24px (modales)</div>
<div class="rounded-full">Circular</div>
```

---

## 🎬 Animaciones

### Animaciones de Entrada
```html
<div class="animate-fade-in">Fade in básico</div>
<div class="animate-fade-in-up">Fade in desde abajo</div>
<div class="animate-fade-in-down">Fade in desde arriba</div>
<div class="animate-scale-in">Scale in</div>
```

### Delays (Animaciones Escalonadas)
```html
<div class="animate-fade-in-up delay-100">Item 1</div>
<div class="animate-fade-in-up delay-200">Item 2</div>
<div class="animate-fade-in-up delay-300">Item 3</div>
```

### Efectos Hover
```html
<div class="hover-lift">Se eleva</div>
<div class="hover-glow">Brilla</div>
<div class="hover-scale">Crece</div>
<div class="transition-all duration-200 hover:shadow-md">Transición</div>
```

---

## 🖼️ Avatares

```html
<div class="avatar-sm">32x32px</div>
<div class="avatar-base">40x40px (default)</div>
<div class="avatar-lg">48x48px</div>
<div class="avatar-xl">64x64px</div>

<!-- Con imagen -->
<div class="avatar-base">
  <img src="avatar.jpg" alt="Usuario" />
</div>
```

---

## 📱 Modal

```html
<!-- Overlay -->
<div class="modal-overlay"></div>

<!-- Modal container -->
<div class="modal">
  <div class="modal-content">
    <div class="modal-header">
      <h3>Título</h3>
    </div>
    <div class="modal-body">
      <p>Contenido</p>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary">Cancelar</button>
      <button class="btn-primary">Confirmar</button>
    </div>
  </div>
</div>
```

---

## 🔗 Enlaces

```html
<!-- Enlace principal (terracota) -->
<a href="#" class="link">Enlace</a>

<!-- Enlace suave -->
<a href="#" class="link-muted">Enlace secundario</a>

<!-- Con transición -->
<a href="#" class="text-cafe hover:text-terracota transition-colors">
  Enlace con hover
</a>
```

---

## 📊 Listas

```html
<!-- Item de lista interactivo -->
<div class="list-item">
  <IconUser />
  <span>Usuario</span>
</div>

<!-- Item activo -->
<div class="list-item-active">
  <IconHome />
  <span>Dashboard</span>
</div>

<!-- Divisor -->
<div class="divider"></div>
```

---

## 🎯 Layout

### Contenedores
```html
<!-- Responsive -->
<div class="container-responsive">
  <!-- max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -->
</div>

<!-- Anchos específicos -->
<div class="max-w-container-sm mx-auto">576px máximo</div>
<div class="max-w-container-md mx-auto">768px máximo</div>
<div class="max-w-container-lg mx-auto">1024px máximo</div>
```

### Flexbox Common Patterns
```html
<!-- Centrado -->
<div class="flex items-center justify-center">Centrado</div>

<!-- Espacio entre elementos -->
<div class="flex items-center justify-between">
  <span>Izquierda</span>
  <span>Derecha</span>
</div>

<!-- Columna con gap -->
<div class="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Grid Common Patterns
```html
<!-- 2 columnas en desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>Col 1</div>
  <div>Col 2</div>
</div>

<!-- 3 columnas en desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Card</div>
  <div>Card</div>
  <div>Card</div>
</div>
```

---

## 🌫️ Glassmorphism

```html
<!-- Cristal suave -->
<div class="glass">
  <!-- bg-white/80 backdrop-blur-md -->
</div>

<!-- Cristal fuerte -->
<div class="glass-strong">
  <!-- bg-white/90 backdrop-blur-lg -->
</div>
```

---

## 🎨 Gradientes

```html
<!-- Fondo cálido -->
<div class="gradient-warm">Beige suave</div>

<!-- Gradiente terracota -->
<div class="gradient-terracota">Terracota</div>

<!-- Texto con gradiente -->
<h1 class="text-gradient-terracota">Título</h1>
```

---

## ⚡ Loading States

```html
<!-- Spinner -->
<span class="spinner"></span>

<!-- Skeleton -->
<div class="skeleton-text"></div>
<div class="skeleton-title"></div>
<div class="skeleton-avatar"></div>
```

---

## 🎭 Estados Interactivos

### Focus Ring
```html
<button class="focus-ring">
  <!-- focus:outline-none focus:ring-2 -->
</button>
```

### Clickable
```html
<div class="clickable">
  <!-- cursor-pointer hover:scale-[1.01] active:scale-[0.99] -->
</div>
```

---

## 📱 Responsive Utilities

```html
<!-- Ocultar en mobile -->
<div class="hidden md:block">Desktop only</div>

<!-- Ocultar en desktop -->
<div class="block md:hidden">Mobile only</div>

<!-- Tamaños responsive -->
<div class="text-base md:text-lg">Responsive text</div>
<div class="p-4 md:p-6 lg:p-8">Responsive padding</div>

<!-- Grid responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- 1 col mobile, 2 col tablet, 4 col desktop -->
</div>
```

---

## 🎯 Breakpoints

```
sm:  640px   - Mobile grande / Tablet pequeña
md:  768px   - Tablet
lg:  1024px  - Desktop pequeño
xl:  1280px  - Desktop
2xl: 1536px  - Desktop grande
```

**Uso:**
```html
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- 100% mobile, 50% tablet, 33% desktop -->
</div>
```

---

## 💡 Tips Rápidos

### ✅ Mejores Prácticas

```html
<!-- ✅ BIEN: Usar componentes -->
<div class="card">...</div>

<!-- ❌ EVITAR: Repetir clases -->
<div class="bg-white rounded-xl border border-cafe/5 shadow-sm p-6">...</div>

<!-- ✅ BIEN: Espaciado consistente -->
<div class="p-6 gap-4">...</div>

<!-- ❌ EVITAR: Valores arbitrarios -->
<div class="p-[23px] gap-[15px]">...</div>

<!-- ✅ BIEN: Opacidad con slash -->
<p class="text-cafe/70">...</p>

<!-- ❌ EVITAR: Colores hexadecimales directos -->
<p class="text-[#5D4A44]">...</p>
```

---

## 🚀 Atajos de Teclado VS Code

```
cmd + d     - Seleccionar siguiente coincidencia
cmd + shift + l - Seleccionar todas las coincidencias
opt + ↑/↓   - Mover línea arriba/abajo
opt + shift + ↑/↓ - Duplicar línea
```

---

## 📚 Recursos

- 📄 Documentación completa: `SISTEMA_DISENO.md`
- 💻 Variables CSS: `assets/css/design-tokens.css`
- 🧩 Componentes: `assets/css/components.css`
- ⚙️ Config Tailwind: `tailwind.config.js`

---

**🎨 Happy Styling!**
