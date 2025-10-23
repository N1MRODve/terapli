# 📱 PWA Implementation - Psicóloga Karem

## ✅ Configuración Completada

Tu aplicación ahora es una **Progressive Web App (PWA)** completamente funcional. Los usuarios pueden instalarla en sus dispositivos móviles y usarla como una app nativa.

---

## 🎯 Características Implementadas

### 1. **Instalación en Dispositivos**
- ✅ Ícono personalizado en la pantalla de inicio
- ✅ Splash screen con colores de marca
- ✅ Modo standalone (sin barra de navegación)
- ✅ Orientación portrait por defecto
- ✅ Inicio automático en `/paciente/dashboard`

### 2. **Soporte Multiplataforma**
- ✅ **Android**: Instalación desde Chrome/Edge
- ✅ **iOS**: Instalación desde Safari
- ✅ **Desktop**: Chrome, Edge, y otros navegadores compatibles

### 3. **Caché y Offline**
- ✅ Service Worker con actualización automática
- ✅ Caché de fuentes de Google
- ✅ Caché de imágenes (30 días)
- ✅ Limpieza automática de cachés antiguos

### 4. **Experiencia de Usuario**
- ✅ Modal empático para promover instalación
- ✅ Detección automática de plataforma (iOS/Android)
- ✅ Instrucciones específicas por sistema operativo
- ✅ Respeto de preferencias del usuario (no mostrar más)

---

## 📁 Archivos Creados/Modificados

### Configuración Principal
- `nuxt.config.ts` - Configuración del módulo PWA
- `app.vue` - Meta tags para iOS

### Componentes
- `components/InstallPWAModal.vue` - Modal empático de instalación
- `components/PWAInstallWrapper.vue` - Wrapper para auto-mostrar modal

### Composables
- `composables/usePWAInstallPrompt.ts` - Lógica de detección y prompt

### Íconos
- `public/icons/icon-192x192.svg` - Ícono pequeño (placeholder)
- `public/icons/icon-512x512.svg` - Ícono grande (placeholder)
- `public/icons/maskable_icon.svg` - Ícono adaptable (placeholder)
- `public/icons/generate-icons.html` - Generador HTML de PNGs
- `public/icons/README.md` - Guía de generación de íconos

### Scripts
- `scripts/generate-icons.cjs` - Script de ayuda para íconos

---

## 🚀 Uso

### Método 1: Wrapper Automático (Recomendado)

Envuelve cualquier página con el componente wrapper:

```vue
<template>
  <PWAInstallWrapper>
    <div>
      <!-- Tu contenido aquí -->
      <h1>Bienvenida al Dashboard</h1>
    </div>
  </PWAInstallWrapper>
</template>
```

El modal se mostrará automáticamente después de 2 visitas, con un delay de 3 segundos.

### Método 2: Control Manual

Si prefieres controlar cuándo mostrar el modal:

```vue
<template>
  <div>
    <!-- Botón para instalar -->
    <button @click="showInstallPrompt()" v-if="canInstall && !isInstalled">
      📱 Instalar App
    </button>

    <!-- Modal -->
    <InstallPWAModal
      :show="showInstallModal"
      @install="handleInstall"
      @dismiss="dismissInstallPrompt"
    />
  </div>
</template>

<script setup>
const {
  canInstall,
  isInstalled,
  showInstallModal,
  showInstallPrompt,
  promptInstall,
  dismissInstallPrompt
} = usePWAInstallPrompt()

const handleInstall = async () => {
  await promptInstall()
}
</script>
```

### Método 3: Integración en Layout

Agrega el wrapper en el layout del paciente (`layouts/paciente.vue`):

```vue
<template>
  <PWAInstallWrapper>
    <div>
      <Header />
      <slot />
      <Footer />
    </div>
  </PWAInstallWrapper>
</template>
```

---

## 🎨 Personalización de Íconos

### ⚠️ IMPORTANTE: Reemplaza los íconos placeholder

Los íconos SVG actuales son **placeholders**. Para producción:

#### Opción 1: Generador HTML (Rápido)
1. Abre: `http://localhost:3000/icons/generate-icons.html`
2. Descarga los 3 íconos PNG
3. Colócalos en `public/icons/`

#### Opción 2: RealFaviconGenerator (Profesional)
1. Visita: https://realfavicongenerator.net/
2. Sube tu logo de Psicóloga Karem
3. Configura:
   - Theme color: `#D8AFA0`
   - Background: `#F9F7F3`
   - Display: Standalone
4. Genera y descarga
5. Extrae los archivos a `public/icons/`

#### Opción 3: Diseño Manual
Crea los íconos en Figma/Illustrator con estos specs:
- **Colores**: 
  - Fondo: `#F9F7F3`
  - Principal: `#D8AFA0`
  - Texto: `#5A4A42`
- **Tamaños**:
  - 192x192px → `icon-192x192.png`
  - 512x512px → `icon-512x512.png`
  - 512x512px (con safe zone) → `maskable_icon.png`

---

## 🧪 Testing

### Desarrollo Local

```bash
npm run dev
```

1. Abre DevTools → **Application** → **Manifest**
2. Verifica que aparezcan:
   - ✅ Name: "Psicóloga Karem"
   - ✅ Start URL: "/paciente/dashboard"
   - ✅ Theme color: "#D8AFA0"
   - ✅ 3 íconos cargados

3. Ve a **Service Workers**
4. Verifica que esté registrado y activo

### Testing en Móvil (Android)

1. Conecta tu dispositivo o usa Chrome DevTools → Device Mode
2. Abre `https://tu-dominio.com`
3. Chrome mostrará banner: **"Agregar Psicóloga Karem a pantalla de inicio"**
4. O menú (⋮) → "Instalar app" / "Agregar a inicio"
5. Verifica:
   - ✅ Ícono aparece en home screen
   - ✅ App abre en standalone (sin barra de URL)
   - ✅ Splash screen muestra logo

### Testing en iOS

1. Abre en Safari móvil: `https://tu-dominio.com`
2. El modal PWA mostrará instrucciones específicas
3. Toca botón **Compartir** (cuadro con flecha)
4. Selecciona **"Agregar a pantalla de inicio"**
5. Confirma
6. Verifica:
   - ✅ Ícono en home screen
   - ✅ App abre en fullscreen
   - ✅ No muestra barra de Safari

---

## ⚙️ Configuración Avanzada

### Modificar colores

Edita `nuxt.config.ts`:

```typescript
pwa: {
  manifest: {
    theme_color: '#TU_COLOR_PRINCIPAL',
    background_color: '#TU_COLOR_FONDO',
  }
}
```

### Cambiar URL de inicio

```typescript
manifest: {
  start_url: '/tu-ruta-preferida',
}
```

### Agregar más rutas al caché

```typescript
workbox: {
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/tu-api\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 // 1 día
        }
      }
    }
  ]
}
```

### Desactivar auto-actualización

```typescript
pwa: {
  registerType: 'prompt', // Usuario debe confirmar actualizaciones
}
```

---

## 📊 Métricas y Analytics

El modal PWA respeta las preferencias del usuario:

- **Primera visita**: No muestra nada
- **Segunda visita**: Muestra modal después de 3s
- **Rechazado**: No muestra durante 7 días
- **"Nunca mostrar"**: Guarda preferencia permanente

Puedes trackear instalaciones:

```typescript
window.addEventListener('appinstalled', () => {
  // Enviar evento a Google Analytics
  useAnalytics().trackEvent({
    category: 'PWA',
    action: 'installed',
    label: 'App instalada'
  })
})
```

---

## 🐛 Troubleshooting

### El modal no aparece
1. Verifica que estés en un **navegador compatible** (Chrome, Edge, Safari)
2. Debe ser **HTTPS** (localhost está permitido)
3. Revisa que `canInstall` sea `true` en consola
4. Verifica que no hayas marcado "Nunca mostrar"

### Los íconos no se ven
1. Verifica que los archivos PNG existan en `public/icons/`
2. Nombres exactos: `icon-192x192.png`, `icon-512x512.png`, `maskable_icon.png`
3. Limpia caché y recarga: Ctrl/Cmd + Shift + R

### Service Worker no se actualiza
1. DevTools → Application → Service Workers
2. Marca "Update on reload"
3. O desregistra el SW y recarga

### iOS no muestra el ícono correcto
1. Verifica que `app.vue` tenga los meta tags de Apple
2. El ícono debe ser PNG (no SVG)
3. Tamaño mínimo: 180x180px

---

## 📚 Recursos

- [PWA Manifest Generator](https://realfavicongenerator.net/)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Vite PWA Docs](https://vite-pwa-org.netlify.app/)
- [iOS PWA Support](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)

---

## ✨ Next Steps

1. **Reemplaza los íconos placeholder** con tu logo oficial
2. **Prueba en dispositivos reales** (Android + iOS)
3. **Integra el wrapper** en las páginas clave:
   - `/paciente/dashboard`
   - `/reservar`
   - `/conoceme`
4. **Monitorea instalaciones** con Analytics
5. **Optimiza el caché** según tus necesidades

---

🎉 **¡Tu PWA está lista!** Los usuarios ahora pueden disfrutar de una experiencia más nativa y accesible.

💛 *Psicóloga Karem - Tu espacio terapéutico digital*
