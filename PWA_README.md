# 📱 Progressive Web App (PWA) - Psicóloga Karem

> Transforma tu experiencia web en una app nativa instalable

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-green)](https://web.dev/pwa-checklist/)
[![Platform Support](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Desktop-blue)](https://caniuse.com/web-app-manifest)

---

## 🎯 ¿Qué es esto?

Este proyecto ahora es una **Progressive Web App** completa. Los usuarios pueden instalarla en sus dispositivos y usarla como una aplicación nativa, con:

✅ Ícono en pantalla de inicio  
✅ Splash screen personalizado  
✅ Modo pantalla completa (sin navegador)  
✅ Funcionamiento offline  
✅ Actualizaciones automáticas  
✅ Experiencia similar a apps nativas  

---

## 🚀 Quick Start

### 1. Verificar Configuración

```bash
npm run pwa:verify
```

### 2. Iniciar Desarrollo

```bash
npm run dev
```

### 3. Ver en Acción

Abre: http://localhost:3001 y prueba instalar la app.

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| **[PWA_QUICKSTART.md](./PWA_QUICKSTART.md)** | Guía rápida de 5 minutos |
| **[PWA_SUMMARY.md](./PWA_SUMMARY.md)** | Resumen ejecutivo |
| **[PWA_IMPLEMENTATION.md](./PWA_IMPLEMENTATION.md)** | Documentación técnica completa |
| **[PWA_CHECKLIST.md](./PWA_CHECKLIST.md)** | Lista de verificación para producción |
| **[PWA_USER_EXPERIENCE.md](./PWA_USER_EXPERIENCE.md)** | Cómo lo verán los usuarios |
| **[public/icons/README.md](./public/icons/README.md)** | Guía de generación de íconos |

---

## 📁 Archivos Creados

### Core
```
nuxt.config.ts                          # Configuración PWA
app.vue                                 # Meta tags iOS
```

### Componentes
```
components/
├── InstallPWAModal.vue                 # Modal empático de instalación
├── PWAInstallWrapper.vue               # Wrapper automático
└── InstallPWAButton.vue                # Botón flotante (FAB)
```

### Composables
```
composables/
└── usePWAInstallPrompt.ts              # Lógica de detección
```

### Íconos
```
public/icons/
├── icon-192x192.png                    # Ícono 192px ⚠️ Reemplazar
├── icon-512x512.png                    # Ícono 512px ⚠️ Reemplazar
├── maskable_icon.png                   # Ícono adaptable ⚠️ Reemplazar
├── generate-icons.html                 # Generador web
└── README.md                           # Guía de íconos
```

### Scripts
```
scripts/
├── verify-pwa.cjs                      # Verificador de configuración
├── generate-icons.py                   # Generador Python
└── generate-icons.cjs                  # Info de generación
```

### Ejemplos
```
pages/
└── ejemplo-pwa.vue                     # Página de ejemplo completa
```

---

## 🎨 Configuración Actual

```typescript
{
  name: "Psicóloga Karem",
  short_name: "Karem",
  description: "Tu espacio terapéutico digital 🌿",
  theme_color: "#D8AFA0",           // Terracota suave
  background_color: "#F9F7F3",      // Beige claro
  display: "standalone",            // Pantalla completa
  start_url: "/paciente/dashboard", // Página inicial
  orientation: "portrait"           // Solo vertical
}
```

---

## 💻 Comandos NPM

```bash
# Verificar configuración PWA
npm run pwa:verify

# Info sobre generación de íconos
npm run pwa:icons

# Desarrollo
npm run dev

# Producción
npm run build
npm run preview
```

---

## 🧩 Cómo Integrar

### Opción 1: Wrapper Automático ⭐ Recomendado

Envuelve tu página completa:

```vue
<template>
  <PWAInstallWrapper>
    <div>
      <!-- Tu contenido aquí -->
    </div>
  </PWAInstallWrapper>
</template>
```

El modal se mostrará automáticamente cuando sea apropiado.

### Opción 2: Botón Flotante

Agrega un botón flotante en cualquier página:

```vue
<template>
  <div>
    <!-- Tu contenido -->
    
    <ClientOnly>
      <InstallPWAButton />
    </ClientOnly>
  </div>
</template>
```

### Opción 3: Control Manual

Control total sobre cuándo mostrar el prompt:

```vue
<template>
  <div>
    <button 
      v-if="canInstall && !isInstalled" 
      @click="promptInstall()"
      class="btn-install"
    >
      📱 Instalar App
    </button>
    
    <p v-if="isInstalled" class="success">
      ✅ App instalada
    </p>
  </div>
</template>

<script setup>
const { 
  canInstall, 
  isInstalled, 
  promptInstall 
} = usePWAInstallPrompt()
</script>
```

---

## 🧪 Testing

### Local

1. **Verificar configuración:**
   ```bash
   npm run pwa:verify
   ```

2. **Iniciar servidor:**
   ```bash
   npm run dev
   ```

3. **Chrome DevTools:**
   - Application → Manifest (verifica configuración)
   - Application → Service Workers (verifica que esté activo)

### Móvil

#### Android:
1. Abre en Chrome móvil
2. Menú (⋮) → "Instalar app"
3. O espera el banner automático

#### iOS:
1. Abre en Safari
2. Botón Compartir → "Agregar a pantalla de inicio"
3. Sigue las instrucciones del modal

---

## ⚠️ IMPORTANTE: Íconos

Los íconos actuales son **placeholders funcionales** generados automáticamente.

**Para producción:**

1. Visita https://realfavicongenerator.net/
2. Sube tu logo profesional
3. Descarga y reemplaza:
   - `public/icons/icon-192x192.png`
   - `public/icons/icon-512x512.png`
   - `public/icons/maskable_icon.png`

---

## 🎯 Roadmap

### ✅ Implementado

- [x] Configuración PWA base
- [x] Manifest con metadatos
- [x] Service Worker con caché
- [x] Detección de plataforma
- [x] Modal de instalación empático
- [x] Soporte iOS y Android
- [x] Botón flotante opcional
- [x] Actualización automática
- [x] Íconos placeholder
- [x] Documentación completa

### 🔮 Futuro (Opcional)

- [ ] Notificaciones Push
- [ ] Sincronización en segundo plano
- [ ] Modo oscuro
- [ ] Shortcuts en ícono (Android)
- [ ] Share Target API
- [ ] File Handling API

---

## 📊 Soporte de Navegadores

| Navegador | Instalación | Service Worker | Offline |
|-----------|-------------|----------------|---------|
| Chrome (Android) | ✅ | ✅ | ✅ |
| Edge (Android) | ✅ | ✅ | ✅ |
| Samsung Internet | ✅ | ✅ | ✅ |
| Safari (iOS 16.4+) | ✅* | ✅ | ✅ |
| Chrome (Desktop) | ✅ | ✅ | ✅ |
| Edge (Desktop) | ✅ | ✅ | ✅ |
| Firefox (Desktop) | ⚠️ | ✅ | ✅ |

*iOS requiere instalación manual desde Safari

---

## 🐛 Troubleshooting

### El modal no aparece

- Verifica que estés en un navegador compatible
- Debe ser HTTPS (localhost está permitido)
- Ejecuta `npm run pwa:verify`
- Revisa consola del navegador

### Los íconos no se ven

- Verifica que los PNG existan en `public/icons/`
- Nombres exactos: `icon-192x192.png`, etc.
- Limpia caché: Ctrl/Cmd + Shift + R

### Service Worker no actualiza

- DevTools → Application → Service Workers
- Marca "Update on reload"
- O desregistra y recarga

---

## 📦 Dependencias

```json
{
  "@vite-pwa/nuxt": "^1.0.7"
}
```

---

## 🔗 Enlaces Útiles

- [Vite PWA Docs](https://vite-pwa-org.netlify.app/)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Manifest Generator](https://realfavicongenerator.net/)
- [Maskable Icon](https://maskable.app/)
- [Can I Use PWA](https://caniuse.com/web-app-manifest)

---

## 👥 Contribuir

### Reportar Issues

Si encuentras problemas:
1. Ejecuta `npm run pwa:verify`
2. Captura consola del navegador
3. Describe pasos para reproducir

### Mejorar

Pull requests bienvenidos para:
- Mejorar documentación
- Optimizar caché
- Agregar features opcionales

---

## 📄 Licencia

Este código es parte del proyecto Psicóloga Karem.

---

## 🎉 ¡Listo!

Tu aplicación ahora es una PWA completa y profesional.

**Próximos pasos:**

1. ✅ Reemplaza los íconos placeholder
2. ✅ Integra en `/paciente/dashboard`
3. ✅ Prueba en dispositivos reales
4. ✅ Despliega a producción
5. ✅ ¡Disfruta de mejor engagement!

---

**Generado:** 19 de octubre de 2025  
**Versión:** 1.0.0  
**Stack:** Nuxt 3 + Vite PWA + Tailwind CSS

💛 **Psicóloga Karem** - *Tu espacio terapéutico siempre contigo*
