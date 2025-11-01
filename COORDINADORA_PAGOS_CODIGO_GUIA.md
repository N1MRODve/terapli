# 🔧 Guía de Código - Vista Pagos Coordinadora

**Para Desarrolladores**  
**Proyecto:** Psicóloga Karem  
**Archivo:** `pages/coordinadora/pagos.vue`

---

## 📚 Índice de Snippets

1. [Estructura del Template](#estructura-template)
2. [Computed Properties](#computed-properties)
3. [Funciones de Formato](#funciones-formato)
4. [Sistema de Toast](#sistema-toast)
5. [Animaciones CSS](#animaciones-css)
6. [Componentes Reutilizables](#componentes-reutilizables)

---

## <a name="estructura-template"></a>1. Estructura del Template

### Header con Ícono Clock

```vue
<div class="bg-[#FFF6EC] border-t-4 border-[#EFCB9D] px-6 md:px-8 py-6">
  <div class="flex items-start justify-between gap-4">
    <div class="flex-1">
      <div class="flex items-center gap-3 mb-2">
        <!-- Ícono Clock -->
        <div class="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
          <svg class="w-6 h-6 text-[#C57A3E]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <h2 class="text-2xl font-serif font-bold text-[#C57A3E]">
          Bonos Pendientes de Confirmar
        </h2>
      </div>
      <p class="text-sm text-neutral-600 leading-relaxed ml-13">
        Gestiona aquí los pagos pendientes y el seguimiento financiero de cada paciente.
      </p>
    </div>
    <!-- Contador -->
    <div class="text-right flex-shrink-0">
      <p class="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-1">Pendientes</p>
      <p class="text-5xl font-bold text-[#C57A3E] leading-none">{{ bonosPendientes.length }}</p>
    </div>
  </div>
</div>
```

**Por qué funciona:**
- Ícono SVG en lugar de emoji (escalable, sin problemas de fuentes)
- Color `#C57A3E` (terracota) coherente con marca
- Contador grande (5xl) atrae atención
- Subtítulo añade contexto sin saturar

---

### Barra de Progreso Animada

```vue
<div v-if="bonosPendientes.length > 0 || bonosConfirmados.length > 0" 
     class="bg-neutral-100 h-1.5 relative overflow-hidden">
  <div 
    class="absolute inset-y-0 left-0 bg-gradient-to-r from-[#54BF83] to-[#B46E4B] transition-all duration-700 ease-out"
    :style="{ width: `${progresoConfirmados}%` }"
  ></div>
</div>
```

**Script correspondiente:**
```javascript
const progresoConfirmados = computed(() => {
  const total = bonosPendientes.value.length + bonosConfirmados.value.length
  if (total === 0) return 100
  return Math.round((bonosConfirmados.value.length / total) * 100)
})
```

**Por qué funciona:**
- Gradiente verde→terracota transmite progreso
- `duration-700` + `ease-out` = animación fluida
- Computed reactivo se actualiza automáticamente
- Altura 1.5px = sutil pero visible

---

### Card de Estadística Reutilizable

```vue
<div class="bg-white rounded-xl p-5 shadow-sm border border-neutral-200 hover:shadow-md transition-all duration-200">
  <div class="flex items-center gap-4">
    <!-- Ícono con gradiente de fondo -->
    <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#F4A261]/20 to-[#F4A261]/10 flex items-center justify-center flex-shrink-0">
      <svg class="w-7 h-7 text-[#F4A261]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    </div>
    <!-- Contenido -->
    <div>
      <p class="text-xs text-neutral-500 uppercase font-semibold tracking-wide mb-1">Bonos Pendientes</p>
      <p class="text-3xl font-bold text-neutral-800">{{ bonosPendientes.length }}</p>
    </div>
  </div>
</div>
```

**Variables de color:**
```javascript
// Colores para diferentes tarjetas
const cardColors = {
  pendientes: '#F4A261',  // Naranja suave
  total: '#B46E4B',       // Terracota
  atencion: '#E9C46A',    // Amarillo cálido
  confirmados: '#54BF83'  // Verde éxito
}
```

---

## <a name="computed-properties"></a>2. Computed Properties

### Cálculo de Progreso

```javascript
const progresoConfirmados = computed(() => {
  const total = bonosPendientes.value.length + bonosConfirmados.value.length
  if (total === 0) return 100 // Si no hay datos, mostrar 100%
  return Math.round((bonosConfirmados.value.length / total) * 100)
})
```

**Uso en template:**
```vue
<div :style="{ width: `${progresoConfirmados}%` }"></div>
```

---

### Filtrado de Bonos Urgentes

```javascript
const bonosUrgentes = computed(() => {
  return bonosPendientes.value.filter(bono => 
    bono.sesiones_restantes <= 1
  ).length
})
```

**Alternativa con reduce:**
```javascript
const bonosUrgentes = computed(() => {
  return bonosPendientes.value.reduce((count, bono) => {
    return count + (bono.sesiones_restantes <= 1 ? 1 : 0)
  }, 0)
})
```

---

## <a name="funciones-formato"></a>3. Funciones de Formato

### Formatear Precio

```javascript
const formatearPrecio = (valor) => {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor || 0)
}
```

**Ejemplo de salida:**
```
formatearPrecio(1234.5)   // "1.234,50"
formatearPrecio(42)       // "42,00"
formatearPrecio(null)     // "0,00"
```

---

### Formatear Fecha

```javascript
const formatearFecha = (fecha) => {
  if (!fecha) return 'No especificada'
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
```

**Ejemplo de salida:**
```
formatearFecha('2025-10-15')  // "15 oct 2025"
formatearFecha(null)          // "No especificada"
```

---

### Obtener Iniciales

```javascript
const obtenerIniciales = (nombre) => {
  if (!nombre) return '?'
  const partes = nombre.split(' ')
  if (partes.length >= 2) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase()
  }
  return nombre.substring(0, 2).toUpperCase()
}
```

**Ejemplo de salida:**
```
obtenerIniciales('Ana Beltrán')      // "AB"
obtenerIniciales('Carlos')           // "CA"
obtenerIniciales(null)               // "?"
```

---

## <a name="sistema-toast"></a>4. Sistema de Toast

### Función Principal

```javascript
const mostrarToast = (mensaje, tipo = 'info') => {
  // Crear elemento
  const toast = document.createElement('div')
  toast.className = `fixed top-4 right-4 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transform transition-all duration-300 ${
    tipo === 'success' ? 'bg-[#54BF83] text-white' : 
    tipo === 'error' ? 'bg-red-500 text-white' : 
    'bg-neutral-800 text-white'
  }`
  
  // Contenido
  toast.innerHTML = `
    <span class="text-lg">${tipo === 'success' ? '✓' : tipo === 'error' ? '✕' : 'ℹ'}</span>
    <span class="font-medium">${mensaje}</span>
  `
  
  // Añadir al DOM
  document.body.appendChild(toast)
  
  // Animar entrada
  setTimeout(() => {
    toast.style.transform = 'translateX(0)'
  }, 10)
  
  // Remover después de 3s
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(100%)'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 3000)
}
```

### Uso en Funciones

```javascript
// Éxito
mostrarToast('✅ Pago confirmado exitosamente', 'success')

// Error
mostrarToast('❌ Error al confirmar pago: ' + error.message, 'error')

// Info
mostrarToast('ℹ️ Procesando solicitud...', 'info')
```

---

### Mejora con Composable (Opcional)

```javascript
// composables/useToast.js
export const useToast = () => {
  const show = (mensaje, tipo = 'info', duracion = 3000) => {
    // ... lógica del toast
  }
  
  const success = (mensaje) => show(mensaje, 'success')
  const error = (mensaje) => show(mensaje, 'error')
  const info = (mensaje) => show(mensaje, 'info')
  
  return { show, success, error, info }
}

// Uso en componente
const toast = useToast()
toast.success('Pago confirmado')
```

---

## <a name="animaciones-css"></a>5. Animaciones CSS

### Shimmer Loading

```css
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.animate-shimmer {
  animation: shimmer 2s ease-in-out infinite;
}
```

**Uso en template:**
```vue
<div class="bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] rounded-xl h-32 animate-shimmer"></div>
```

---

### Transiciones Suaves

```css
/* Aplicar a todos los elementos interactivos */
* {
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
```

**Cubic-bezier personalizado:**
```css
/* Bounce out */
transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Ease out back */
transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

---

### Hide Scrollbar (Mobile)

```css
@media (max-width: 768px) {
  .overflow-x-auto::-webkit-scrollbar {
    display: none;
  }
  
  .overflow-x-auto {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}
```

---

## <a name="componentes-reutilizables"></a>6. Componentes Reutilizables

### Card Estadística

```vue
<!-- components/CardEstadistica.vue -->
<template>
  <div class="bg-white rounded-xl p-5 shadow-sm border border-neutral-200 hover:shadow-md transition-all duration-200">
    <div class="flex items-center gap-4">
      <div 
        class="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
        :class="`bg-gradient-to-br from-[${color}]/20 to-[${color}]/10`"
      >
        <slot name="icon"></slot>
      </div>
      <div>
        <p class="text-xs text-neutral-500 uppercase font-semibold tracking-wide mb-1">
          {{ label }}
        </p>
        <p class="text-3xl font-bold text-neutral-800">
          {{ valor }}
        </p>
        <p v-if="subtexto" class="text-xs text-neutral-500 mt-0.5">
          {{ subtexto }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  valor: [String, Number],
  subtexto: String,
  color: {
    type: String,
    default: '#F4A261'
  }
})
</script>
```

**Uso:**
```vue
<CardEstadistica 
  label="Bonos Pendientes" 
  :valor="42" 
  color="#F4A261"
>
  <template #icon>
    <svg class="w-7 h-7 text-[#F4A261]"><!-- SVG --></svg>
  </template>
</CardEstadistica>
```

---

### Avatar con Badge

```vue
<!-- components/AvatarBadge.vue -->
<template>
  <div class="relative flex-shrink-0">
    <div 
      class="rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
      :class="sizeClasses"
      :style="{ background: `linear-gradient(135deg, ${color1}, ${color2})` }"
    >
      {{ iniciales }}
    </div>
    <div 
      v-if="badge"
      class="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
      :class="badgeColor"
    >
      <span class="text-white text-xs font-bold">{{ badge }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  nombre: String,
  size: {
    type: String,
    default: 'md' // sm, md, lg
  },
  badge: String,
  badgeColor: {
    type: String,
    default: 'bg-red-500'
  },
  color1: {
    type: String,
    default: '#C57A3E'
  },
  color2: {
    type: String,
    default: '#B46E4B'
  }
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-12 h-12 text-base',
    md: 'w-16 h-16 text-xl',
    lg: 'w-20 h-20 text-2xl'
  }
  return sizes[props.size] || sizes.md
})

const iniciales = computed(() => {
  if (!props.nombre) return '?'
  const partes = props.nombre.split(' ')
  if (partes.length >= 2) {
    return `${partes[0][0]}${partes[1][0]}`.toUpperCase()
  }
  return props.nombre.substring(0, 2).toUpperCase()
})
</script>
```

**Uso:**
```vue
<AvatarBadge 
  nombre="Ana Beltrán" 
  size="lg" 
  badge="!"
  badge-color="bg-red-500"
/>
```

---

## 🎨 Utilidades de Tailwind Personalizadas

### En `tailwind.config.js`

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'terracota': {
          50: '#FFF6EC',
          100: '#EFCB9D',
          400: '#C57A3E',
          500: '#B46E4B',
        },
        'exito': '#54BF83',
        'atencion': '#E9C46A',
        'pendiente': '#F4A261'
      },
      animation: {
        'shimmer': 'shimmer 2s ease-in-out infinite'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        }
      }
    }
  }
}
```

**Uso simplificado:**
```vue
<div class="bg-terracota-50 border-terracota-100">
  <p class="text-terracota-400">Texto</p>
</div>
```

---

## 🔍 Tips de Debugging

### Console Logs Útiles

```javascript
// Ver progreso calculado
console.log('Progreso:', progresoConfirmados.value, '%')

// Ver datos cargados
console.log('Pendientes:', bonosPendientes.value.length)
console.log('Confirmados:', bonosConfirmados.value.length)

// Ver estructura de bono
console.log('Bono:', JSON.stringify(bono, null, 2))
```

---

### Vue DevTools

```javascript
// Exponer datos para debugging
if (import.meta.env.DEV) {
  window.__PAGOS_DEBUG__ = {
    pendientes: bonosPendientes,
    confirmados: bonosConfirmados,
    progreso: progresoConfirmados
  }
}
```

---

## 📚 Recursos Adicionales

- **Tailwind CSS:** https://tailwindcss.com/docs
- **Vue 3 Composition API:** https://vuejs.org/guide/introduction.html
- **Lucide Icons:** https://lucide.dev/icons/
- **Intl.NumberFormat:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat

---

**Desarrollado con 💚 para Psicóloga Karem**  
**Última actualización:** 31 de octubre de 2025
