# 📝 Guía del Sistema Tipográfico
## Psicóloga Karem Peña - Jerarquía UX + WCAG 2.1

### 🎨 Paleta Tipográfica

**Fuentes principales:**
- **Titulares:** Lora (serif) - Transmite calidez y profesionalidad
- **Textos:** Lato (sans-serif) - Legibilidad óptima

**Color principal:** `#5D4A44` (café cálido)

---

## 📐 Jerarquía de Clases Tipográficas

### 1️⃣ Títulos Principales

#### `.hero-title`
```css
/* H1 - Hero/Landing principal */
@apply font-lora text-4xl md:text-5xl lg:text-6xl font-semibold text-[#5D4A44] leading-tight tracking-tight;
```
**Uso:** Título principal de página de inicio, heros principales  
**Tamaño:** 36-60px (responsive)

#### `.section-title`
```css
/* H2 - Títulos de sección */
@apply font-lora text-3xl md:text-4xl font-semibold text-[#5D4A44] leading-snug;
```
**Uso:** Títulos de secciones principales  
**Tamaño:** 28-40px (responsive)

#### `.card-title`
```css
/* H3 - Títulos de tarjetas/bloques */
@apply font-lora text-2xl md:text-3xl font-medium text-[#5D4A44];
```
**Uso:** Títulos de cards, bloques intermedios  
**Tamaño:** 24-32px (responsive)

---

### 2️⃣ Textos de Cuerpo

#### `.lead-text`
```css
/* Párrafos destacados/introducción */
@apply font-lato text-lg md:text-xl text-[#5D4A44]/80 leading-relaxed;
```
**Uso:** Introducción de secciones, textos destacados  
**Tamaño:** 18-20px

#### `.body-text`
```css
/* Texto de cuerpo general */
@apply font-lato text-base md:text-lg text-[#5D4A44]/80 leading-relaxed;
```
**Uso:** Párrafos generales, descripciones  
**Tamaño:** 16-18px

#### `.quote-text`
```css
/* Citas y frases destacadas */
@apply font-lora text-xl md:text-2xl text-[#5D4A44]/90 font-medium italic leading-relaxed;
```
**Uso:** Testimonios, frases inspiradoras  
**Tamaño:** 20-24px

#### `.microcopy`
```css
/* Notas legales, disclaimers */
@apply font-lato text-sm text-[#5D4A44]/60;
```
**Uso:** Notas al pie, textos legales, etiquetas  
**Tamaño:** 14px

---

### 3️⃣ Utilidades de Ancho

#### `.prose-optimal`
```css
/* Ancho óptimo para lectura (65-70 caracteres) */
@apply max-w-prose mx-auto;
```

#### `.content-width`
```css
/* Ancho amplio para contenido */
@apply max-w-3xl mx-auto;
```

#### `.hero-width`
```css
/* Ancho completo para heros */
@apply max-w-7xl mx-auto;
```

---

## ✅ Checklist de Aplicación

### Componentes Actualizados:
- [x] PersonalizedHero.vue
- [x] ConocemeSection.vue
- [x] pages/index.vue
- [x] pages/reservar.vue

### Componentes Pendientes:
- [ ] Footer.vue
- [ ] Header.vue
- [ ] TestimoniosSection.vue
- [ ] pages/conoceme.vue
- [ ] pages/como-empezar.vue
- [ ] pages/contacto.vue
- [ ] pages/legal/*.vue

---

## 🎯 Reglas de Consistencia UX

1. **Jerarquía visual clara:**
   - H1 > H2 > H3 > H4 > P > Small
   - Nunca un H3 más grande que un H2

2. **Espaciado vertical:**
   - Entre H1 y texto: `mb-6 md:mb-8`
   - Entre H2 y párrafo: `mb-4`
   - Entre secciones: `mt-12 md:mt-16`

3. **Contraste WCAG 2.1:**
   - Mínimo 4.5:1 para texto normal
   - Mínimo 3:1 para texto grande
   - Color `#5D4A44` sobre `#F9F7F3` = ✅ Cumple

4. **Responsividad:**
   - Mobile: reducir una escala
   - Tablet/Desktop: escala completa
   - Mantener legibilidad en 360px+

5. **Énfasis emocional:**
   - Evitar mayúsculas completas
   - Usar italic en `.quote-text` para tono terapéutico
   - Máximo ancho de línea: 65-70 caracteres

---

## 🔧 Cómo Usar

### Ejemplo 1: Hero Section
```vue
<section>
  <div class="hero-width">
    <h1 class="hero-title mb-6">
      Título principal
    </h1>
    <p class="lead-text prose-optimal mb-8">
      Introducción destacada
    </p>
  </div>
</section>
```

### Ejemplo 2: Sección de Contenido
```vue
<section>
  <div class="content-width">
    <h2 class="section-title mb-6 text-center">
      Título de sección
    </h2>
    <p class="body-text mb-4">
      Párrafo general
    </p>
    <p class="quote-text text-center mb-8">
      "Cita inspiradora"
    </p>
  </div>
</section>
```

### Ejemplo 3: Card Component
```vue
<div class="bg-white rounded-2xl p-6">
  <h3 class="card-title mb-3">
    Título de tarjeta
  </h3>
  <p class="body-text mb-4">
    Descripción
  </p>
  <small class="microcopy">
    Nota adicional
  </small>
</div>
```

---

## 📊 Ratio Tipográfico

Escala armónica basada en ratio 1.25:
- 14px (microcopy)
- 16-18px (body)
- 20-24px (destacado)
- 24-32px (cards)
- 28-40px (sección)
- 36-60px (hero)

**Resultado:** Jerarquía visual clara y equilibrada ✅

---

## 🔍 Testing

### Accesibilidad:
- [ ] Contraste mínimo 4.5:1 ✅
- [ ] Texto escalable (no px fijos en HTML)
- [ ] Estructura semántica H1→H2→H3

### UX:
- [ ] Máximo 3 tamaños por vista
- [ ] Consistencia entre páginas
- [ ] Legibilidad en móvil (360px+)

### Performance:
- [ ] Fuentes cargadas de forma optimizada
- [ ] Clases reutilizables en Tailwind

---

**Última actualización:** 13 de octubre de 2025  
**Autor:** Sistema Tipográfico UX/WCAG 2.1
