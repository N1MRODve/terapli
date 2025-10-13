# 📍 Implementación de SEO Local - Psicóloga Karem Peña

## ✅ Sistema Completo Implementado

Este documento describe el sistema de SEO local implementado para posicionar **psicologakarem.com** como la primera opción de psicóloga en **Ciempozuelos (Madrid Sur)**.

---

## 🌐 SEO Global del Sitio

### Configuración en `nuxt.config.ts`

**Meta Tags Globales:**
- ✓ Title: "Psicóloga en Ciempozuelos | Terapia Individual, Pareja y Ansiedad – Karem Peña"
- ✓ Description optimizada para búsqueda local
- ✓ Geo-tags: `geo.region`, `geo.placename`, coordenadas GPS
- ✓ Open Graph completo (og:title, og:description, og:image, og:url)
- ✓ Twitter Cards (summary_large_image)
- ✓ Keywords enfocadas en "Ciempozuelos", "Madrid Sur", "terapia", "ansiedad"

**Schema.org LocalBusiness/Psychologist:**
```json
{
  "@type": "Psychologist",
  "name": "Psicóloga Karem Peña",
  "address": {
    "streetAddress": "Calle del Dr. Rivas, 2, Número 8",
    "addressLocality": "Ciempozuelos",
    "postalCode": "28350",
    "addressRegion": "Madrid"
  },
  "geo": { "latitude": 40.1524167, "longitude": -3.6171837 },
  "telephone": "+34722377290",
  "openingHours": "Mo-Fr 11:00-14:00, 18:00-22:00",
  "sameAs": [Instagram, TikTok, COPC],
  "areaServed": ["Ciempozuelos", "Madrid Sur"]
}
```

---

## 📄 SEO por Página

### 🏠 **Página 1.0 — Inicio (`/`)**

**Title:** Psicóloga en Ciempozuelos | Terapia para Ansiedad y Bienestar Emocional  
**Description:** Recupera tu calma con un acompañamiento cálido y profesional. Terapia individual, de pareja y para autoestima en Ciempozuelos.  
**Keywords:** psicóloga Ciempozuelos, terapia ansiedad Madrid Sur, psicología emocional  
**Canonical:** https://psicologakarem.com

**Enfoque SEO:** Resaltar empatía, cercanía y localización principal.

---

### 💭 **Página 2.0 — ¿Te sientes así? (`/sentirse`)**

**Title:** Terapia Psicológica en Ciempozuelos | Ansiedad, Autoestima y Relaciones  
**Description:** Psicoterapia empática para ansiedad, autoestima, pareja y duelo. Encuentra en Ciempozuelos un espacio seguro para sanar y crecer.  
**Keywords:** psicóloga ansiedad Ciempozuelos, terapia de pareja, psicología autoestima, duelo  
**Canonical:** https://psicologakarem.com/sentirse

**H1:** ¿Cómo te sientes últimamente?  
**H2:** Bienestar emocional, Relaciones y vínculos, Pérdida y transición, Identidad y cambio

---

### 👩‍💼 **Página 3.0 — Conóceme (`/conoceme`)**

**Title:** Psicóloga en Ciempozuelos – Conóceme | Karem Peña  
**Description:** Soy Karem Peña, psicóloga integradora en Ciempozuelos. Creo un espacio seguro, humano y sin juicios para acompañarte hacia el bienestar.  
**Keywords:** psicóloga Ciempozuelos, psicóloga integradora, terapia humanista Madrid Sur  
**Canonical:** https://psicologakarem.com/conoceme

**Schema.org Person:**
```json
{
  "@type": "Person",
  "name": "Karem Peña",
  "jobTitle": "Psicóloga",
  "memberOf": {
    "@type": "Organization",
    "name": "Col·legi Oficial de Psicologia de Catalunya"
  }
}
```

**Enfoque SEO:** Humanidad, vocación, seguridad emocional y credenciales profesionales.

---

### 🧭 **Página 4.0 — Cómo empezar (`/como-empezar`)**

**Title:** Empezar Terapia en Ciempozuelos | Primera Orientación Gratuita  
**Description:** Descubre cómo iniciar tu proceso terapéutico con Karem Peña. Llamada gratuita, opciones online y presencial.  
**Keywords:** primera sesión psicóloga Ciempozuelos, terapia online Madrid Sur, orientación gratuita  
**Canonical:** https://psicologakarem.com/como-empezar

**Schema.org FAQPage:**
- ¿Cuánto dura el proceso terapéutico?
- ¿Las sesiones son online o presenciales?
- ¿Qué pasa si tengo dudas o necesito pausar el proceso?

---

### 📝 **Página 6.0 — Blog (`/blog`)**

**Title:** Blog de Psicología y Bienestar | Consejos desde Ciempozuelos  
**Description:** Artículos sobre ansiedad, relaciones y autoestima. Recursos prácticos escritos por Karem Peña, psicóloga en Ciempozuelos.  
**Keywords:** blog psicología Ciempozuelos, bienestar emocional, consejos ansiedad  
**Canonical:** https://psicologakarem.com/blog

**Nota:** Los artículos individuales deberían incluir Schema.org BlogPosting con autor "Karem Peña".

---

### ☎️ **Página 7.0 — Contacto (`/contacto`)**

**Title:** Contacto Psicóloga en Ciempozuelos | Reserva tu Sesión  
**Description:** Habla con Karem Peña. Primera orientación gratuita por WhatsApp o llamada. Espacio seguro y confidencial.  
**Keywords:** contactar psicóloga Ciempozuelos, cita psicóloga Madrid Sur, terapia WhatsApp  
**Canonical:** https://psicologakarem.com/contacto

**SEO Local Extra:**
- ✓ Iframe Google Maps embebido
- ✓ Meta geo.region="ES-M" y geo.placename="Ciempozuelos"
- ✓ Schema.org ContactPage

**Schema.org ContactPage:**
```json
{
  "@type": "ContactPage",
  "mainEntity": {
    "@type": "Psychologist",
    "telephone": "+34722377290",
    "address": { ... }
  }
}
```

---

## 🤖 Archivos Técnicos

### `robots.txt`
```
User-agent: *
Allow: /

Sitemap: https://psicologakarem.com/sitemap.xml
Crawl-delay: 1

Allow: /conoceme
Allow: /contacto
Allow: /como-empezar
Allow: /sentirse
Allow: /blog

Disallow: /admin/
Disallow: /api/
```

---

## 🎯 Estrategia de Keywords

### Keywords Principales (Alta prioridad)
1. **psicóloga Ciempozuelos** ⭐⭐⭐⭐⭐
2. **terapia ansiedad Madrid Sur** ⭐⭐⭐⭐
3. **psicología emocional Ciempozuelos** ⭐⭐⭐⭐
4. **terapia de pareja Ciempozuelos** ⭐⭐⭐

### Keywords Secundarias
- psicóloga online Madrid Sur
- terapia autoestima
- psicoterapia humanista
- orientación gratuita psicóloga
- terapia migración Madrid

### Long-tail Keywords
- "primera sesión psicóloga Ciempozuelos gratis"
- "cómo empezar terapia online Madrid Sur"
- "psicóloga para ansiedad cerca de mí"

---

## 📊 Resultados Esperados

### SEO Local
- ✅ Aparición en Google Maps para "psicóloga Ciempozuelos"
- ✅ Rich snippets con horario, teléfono y ubicación
- ✅ Featured snippets para FAQs
- ✅ Posicionamiento orgánico top 3 en búsquedas locales

### Experiencia de Usuario
- ✅ Meta descriptions empáticas y sin jerga técnica
- ✅ Coherencia con la narrativa emocional de la web
- ✅ URLs canónicas para evitar contenido duplicado
- ✅ Open Graph optimizado para compartir en redes sociales

---

## 🔧 Próximos Pasos Recomendados

### Prioridad Alta
1. **Crear sitemap.xml dinámico** usando Nuxt Content
2. **Google My Business:** Verificar y optimizar ficha
3. **Backlinks locales:** Directorios de salud en Madrid
4. **Google Search Console:** Enviar sitemap y monitorear indexación

### Prioridad Media
5. **Artículos de blog** con keywords long-tail
6. **Schema.org Review/Rating** cuando haya testimonios
7. **Optimización de imágenes:** Alt text con keywords locales
8. **Velocidad de carga:** Lazy loading y optimización de fuentes

### Prioridad Baja
9. **Link building:** Colaboraciones con centros de salud
10. **Google Ads local** para complementar SEO orgánico

---

## 📞 Contacto Técnico

**Desarrollador:** Sistema implementado con Nuxt 3  
**Fecha:** Octubre 2025  
**Versión:** 1.0

---

**Nota Final:** Todo el SEO está implementado siguiendo las mejores prácticas de Google, con enfoque en búsqueda local y experiencia de usuario. El contenido mantiene el tono empático y profesional definido en el "Viaje Emocional del Paciente".
