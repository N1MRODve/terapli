# 🎨 Mockup Visual v2 - Vista Pagos Coordinadora

## 📐 Jerarquía Visual Simplificada

### Nivel 1: Sección Bonos Pendientes (Prioritaria)

```
╔═══════════════════════════════════════════════════════════╗
║  🕐 BONOS PENDIENTES DE CONFIRMAR          Pendientes: 42 ║
║  Gestiona aquí los pagos pendientes...                    ║
╠═══════════════════════════════════════════════════════════╣
║  🟢 Progreso: ████████████░░░░░░ 65% confirmados          ║
╠═══════════════════════════════════════════════════════════╣
║  ┌─────────┐  ┌─────────┐  ┌─────────┐                  ║
║  │🟠 Bonos │  │💰 Total │  │⚠️ Atenc.│                  ║
║  │   42    │  │3,240€   │  │   8     │                  ║
║  └─────────┘  └─────────┘  └─────────┘                  ║
╠═══════════════════════════════════════════════════════════╣
║  [Card Bono Pendiente 1] → Botón "Confirmar Pago"        ║
║  [Card Bono Pendiente 2] → Botón "Confirmar Pago"        ║
║  [Card Bono Pendiente 3] → Botón "Confirmar Pago"        ║
╚═══════════════════════════════════════════════════════════╝
```

### Nivel 2: Sección Historial Confirmados

```
╔═══════════════════════════════════════════════════════════╗
║  📊 HISTORIAL DE PAGOS CONFIRMADOS  [Filtro Mes ▼]       ║
║  Bonos ya registrados y confirmados por coordinación.     ║
╠═══════════════════════════════════════════════════════════╣
║  ┌─────────┐  ┌─────────┐  ┌─────────┐                  ║
║  │✅ Confir│  │💵 Total │  │📈 Prom. │                  ║
║  │   58    │  │12,480€  │  │ 215€    │                  ║
║  └─────────┘  └─────────┘  └─────────┘                  ║
╠═══════════════════════════════════════════════════════════╣
║  [Card Pago Confirmado 1] → Click para ver detalle       ║
║  [Card Pago Confirmado 2] → Click para ver detalle       ║
║  [Card Pago Confirmado 3] → Click para ver detalle       ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 🎨 Guía de Colores Detallada

### Paleta Principal

| Elemento | Color Hex | Nombre | Uso |
|----------|-----------|--------|-----|
| Header BG | `#FFF6EC` | Crema cálido | Fondo encabezado pendientes |
| Border Top | `#EFCB9D` | Terracota claro | Borde superior 4px |
| Icon Primary | `#C57A3E` | Terracota medio | Íconos principales |
| Button Primary | `#B46E4B` | Terracota oscuro | Botones primarios |
| Button Hover | `#C57A3E` | Terracota medio | Estado hover botones |

### Indicadores de Estado

| Estado | Color | Uso |
|--------|-------|-----|
| 0 sesiones | `#EF4444` 🔴 | Barra lateral + texto urgente |
| 1 sesión | `#FB923C` 🟠 | Barra lateral + alerta |
| 2 sesiones | `#F59E0B` 🟡 | Barra lateral + precaución |
| 3+ sesiones | `#C57A3E` 🟤 | Barra lateral normal |
| Confirmado | `#54BF83` 🟢 | Pagos completados |

### Tarjetas Resumen

| Tarjeta | Ícono BG | Color Número |
|---------|----------|--------------|
| Bonos Pendientes | `#F4A261/20` | `#262626` |
| Total Confirmar | `#B46E4B/20` | `#B46E4B` |
| Requieren Atención | `#E9C46A/20` | `#E9C46A` |
| Bonos Confirmados | `#54BF83/20` | `#262626` |
| Total Confirmado | `#54BF83/30` | `#54BF83` |
| Promedio Bono | `#3B82F6/20` | `#3B82F6` |

---

## 📱 Layout Responsive Detallado

### Desktop (≥1024px)
- **Cards resumen:** Grid 3 columnas
- **Padding:** `p-8` (32px)
- **Cards bonos:** Flex row con toda la info horizontal
- **Modal:** 600px max-width centrado

### Tablet (768px - 1023px)
- **Cards resumen:** Grid 2 columnas (tercera abajo)
- **Padding:** `p-6` (24px)
- **Cards bonos:** Flex row comprimido
- **Modal:** 90vw max-width

### Mobile (<768px)
- **Cards resumen:** Scroll horizontal (280px min-width)
- **Padding:** `p-6` (24px)
- **Cards bonos:** Flex column stack
- **Modal:** 95vw max-width
- **Botones:** Full width

---

## ⚡ Animaciones y Transiciones

### Duración Estándar
```css
transition-duration: 200ms
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1)
```

### Shimmer Loading
```css
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
duration: 2s infinite ease-in-out
```

### Barra de Progreso
```css
transition: width 700ms ease-out
```

### Toast Notification
```css
Enter: translateX(100%) → translateX(0) [200ms]
Exit: opacity 1 → 0, translateX(0) → translateX(100%) [300ms]
Lifetime: 3000ms
```

### Modal
```css
Backdrop: opacity 0 → 1 [200ms]
Content: opacity 0, scale(0.95) → opacity 1, scale(1) [200ms]
```

### Hover Effects
```css
Cards: scale(1) → scale(1.05) [200ms]
Shadow: shadow-sm → shadow-md [200ms]
Border: neutral-200 → terracota [200ms]
```

---

## 🎯 Elementos Clave por Prioridad

### 🔴 Prioridad Alta
1. **Header con ícono Clock** - Identifica sección de pendientes
2. **Contador grande** - Muestra bonos pendientes (número 5xl)
3. **Barra de progreso** - Visualiza % de completitud
4. **Botones "Confirmar Pago"** - Acción principal (terracota)

### 🟠 Prioridad Media
5. **Tarjetas resumen** - Métricas rápidas (3 cards)
6. **Indicadores laterales** - Semáforo de sesiones (colores)
7. **Filtro de mes** - Historial por periodo
8. **Toast notifications** - Feedback de acciones

### 🟡 Prioridad Baja
9. **Modal de detalle** - Info expandida
10. **Animaciones hover** - Microinteracciones
11. **Loading shimmer** - Estados de carga
12. **Gradientes de fondo** - Estética general

---

## 📊 Componentes Reutilizables

### Card Estadística
```vue
<div class="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md">
  <div class="flex items-center gap-4">
    <div class="w-14 h-14 rounded-xl bg-gradient flex-center">
      <!-- Ícono SVG -->
    </div>
    <div>
      <p class="text-xs uppercase">Label</p>
      <p class="text-3xl font-bold">Valor</p>
    </div>
  </div>
</div>
```

### Card Bono Pendiente
```vue
<div class="relative bg-white rounded-xl p-5 border hover:shadow-lg">
  <div class="absolute left-0 w-1 h-full bg-[color] rounded-l-xl"></div>
  <div class="flex items-center gap-5 ml-2">
    <div class="avatar"><!-- Avatar --></div>
    <div class="grid grid-cols-5 gap-4"><!-- Info --></div>
    <button class="btn-primary">Confirmar</button>
  </div>
</div>
```

### Toast Notification
```javascript
mostrarToast(mensaje, tipo) {
  const toast = createElement('div')
  toast.className = `toast toast-${tipo}`
  document.body.append(toast)
  setTimeout(() => remove(), 3000)
}
```

---

## ✅ Checklist de Implementación

### Visual
- [x] Gradiente de fondo suave
- [x] Header con tono cálido (#FFF6EC)
- [x] Íconos lucide-react (Clock, CheckCircle)
- [x] Barra de progreso animada
- [x] Tarjetas con sombra sutil
- [x] Scroll horizontal en móvil

### Funcional
- [x] Loading shimmer mientras carga
- [x] Toast notifications (success/error)
- [x] Modal con transiciones
- [x] Filtro por mes
- [x] Confirmación de pago rápida
- [x] Cálculo de progreso dinámico

### Responsive
- [x] Grid adaptativo (3→2→scroll)
- [x] Padding responsive (8→6)
- [x] Cards stack en móvil
- [x] Botones full-width móvil
- [x] Modal 95vw en móvil

### UX
- [x] Hover states bien definidos
- [x] Colores según prioridad
- [x] Estados disabled visibles
- [x] Feedback inmediato (toast)
- [x] Microanimaciones suaves

---

## 🎨 Resultado Visual

```
ANTES:                      DESPUÉS:
┌────────────┐             ┌─────────────┐
│ ⚠️ Orange │      →      │ 🕐 Suave    │
│ Header     │             │ #FFF6EC     │
├────────────┤             ├─────────────┤
│ Cards      │             │ Progreso ██ │
│ Básicas    │             ├─────────────┤
├────────────┤             │ Cards       │
│ Lista      │             │ Unificadas  │
│ Simple     │             ├─────────────┤
└────────────┘             │ Shimmer     │
                           │ Loading     │
                           └─────────────┘
```

---

## 🚀 Performance

- **FCP:** <1s (First Contentful Paint)
- **LCP:** <2s (Largest Contentful Paint)
- **Animaciones:** 60fps constantes
- **Carga inicial:** Shimmer inmediato
- **Transiciones:** Hardware-accelerated (GPU)

---

## 📝 Notas Técnicas

### CSS Optimizaciones
```css
/* Hardware acceleration */
transform: translateZ(0);
will-change: transform, opacity;

/* Smooth scroll */
scroll-behavior: smooth;

/* Hide scrollbars mobile */
scrollbar-width: none;
-ms-overflow-style: none;
```

### Vue Optimizaciones
```javascript
// Computed para progreso
const progresoConfirmados = computed(() => {
  const total = pendientes + confirmados
  return total ? (confirmados / total) * 100 : 100
})

// Debounce en filtros
const filtrarDebounced = debounce(filtrar, 300)
```

---

**Desarrollado con 💚 para Psicóloga Karem**  
**Fecha:** 31 de octubre de 2025
