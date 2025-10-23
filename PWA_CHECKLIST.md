# ✅ PWA Checklist - Pasos para Producción

## Pre-Deployment Checklist

Usa esta lista para asegurarte de que tu PWA está lista para producción.

---

### 🎨 1. Íconos

- [ ] **Reemplazar íconos placeholder** con logo profesional
  - [ ] `icon-192x192.png` - Logo de alta calidad
  - [ ] `icon-512x512.png` - Logo de alta calidad
  - [ ] `maskable_icon.png` - Con safe zone del 10%
- [ ] **Verificar formato**: PNG con fondo sólido o transparente
- [ ] **Probar en** https://maskable.app/ (para maskable icon)

**Herramientas recomendadas:**
- https://realfavicongenerator.net/
- Figma / Adobe Illustrator
- `public/icons/generate-icons.html`

---

### ⚙️ 2. Configuración

- [x] ✅ Módulo `@vite-pwa/nuxt` instalado
- [x] ✅ Configuración en `nuxt.config.ts`
- [x] ✅ Meta tags iOS en `app.vue`
- [ ] **Personalizar** colores si es necesario
  - Actual: Theme `#D8AFA0`, Background `#F9F7F3`
- [ ] **Verificar** URL de inicio
  - Actual: `/paciente/dashboard`
- [ ] **Ajustar** descripción del manifest
  - Actual: "Tu espacio terapéutico digital 🌿"

---

### 🧩 3. Integración en Páginas

- [ ] **Dashboard del Paciente** (`/paciente/dashboard`)
  - [ ] Agregar `<PWAInstallWrapper>` o
  - [ ] Agregar `<InstallPWAButton>` flotante
- [ ] **Página de Reservas** (`/reservar`)
  - [ ] Considerar mostrar modal PWA
- [ ] **Página Principal** (`/`)
  - [ ] Opcional: Botón flotante para visitantes

**Ejemplo de integración:**
```vue
<template>
  <PWAInstallWrapper>
    <div>
      <!-- Tu contenido -->
    </div>
  </PWAInstallWrapper>
</template>
```

---

### 🧪 4. Testing Local

- [x] ✅ Ejecutar `npm run pwa:verify`
- [ ] **Iniciar servidor** `npm run dev`
- [ ] **Abrir DevTools** → Application tab
  - [ ] Verificar Manifest:
    - [ ] Name: "Psicóloga Karem"
    - [ ] Theme color: #D8AFA0
    - [ ] Íconos cargados correctamente
  - [ ] Verificar Service Worker:
    - [ ] Status: Activated
    - [ ] Scope: /
- [ ] **Probar modal de instalación**
  - [ ] Se muestra después de scroll/tiempo
  - [ ] Instrucciones iOS visibles en Safari
  - [ ] Botón "Instalar" funciona en Chrome
- [ ] **Probar botón flotante** (si implementado)

---

### 📱 5. Testing en Móvil

#### Android (Chrome/Edge)

- [ ] **Abrir** en Chrome móvil
- [ ] **Verificar** banner de instalación
- [ ] **Instalar** app
  - [ ] Ícono aparece en home screen
  - [ ] Nombre correcto
  - [ ] Abre en modo standalone
  - [ ] Sin barra de navegación
- [ ] **Splash screen**
  - [ ] Muestra logo
  - [ ] Colores correctos
- [ ] **Funcionalidad offline**
  - [ ] Desactivar WiFi/datos
  - [ ] Navegar páginas cacheadas
  - [ ] Fuentes e imágenes cargadas

#### iOS (Safari)

- [ ] **Abrir** en Safari móvil
- [ ] **Ver** instrucciones del modal
- [ ] **Instalar** manualmente
  - Compartir → "Agregar a pantalla de inicio"
- [ ] **Verificar instalación**
  - [ ] Ícono en home screen
  - [ ] Nombre correcto
  - [ ] Abre en fullscreen
  - [ ] Barra de estado con color correcto
- [ ] **Funcionalidad**
  - [ ] Sin barra Safari
  - [ ] Navegación funciona
  - [ ] Logout/login funciona

#### Desktop (Chrome/Edge)

- [ ] **Verificar** opción de instalación en barra de direcciones
- [ ] **Instalar** en escritorio
- [ ] **Abrir** como ventana independiente
- [ ] **Verificar** ícono en dock/taskbar

---

### 🚀 6. Build de Producción

- [ ] **Construir** proyecto
  ```bash
  npm run build
  ```
- [ ] **Verificar** que no hay errores
- [ ] **Probar** preview local
  ```bash
  npm run preview
  ```
- [ ] **Verificar** Service Worker en build
  - DevTools → Application → Service Workers

---

### 🌐 7. Deploy

- [ ] **Subir** a servidor (Vercel/Netlify/etc)
- [ ] **Verificar** HTTPS activo
  - ⚠️ PWA requiere HTTPS en producción
- [ ] **Probar** URL de producción en móvil
- [ ] **Verificar** que Service Worker se registra
- [ ] **Probar** instalación en producción

---

### 📊 8. Analytics (Opcional)

- [ ] **Configurar** tracking de instalación
  ```javascript
  window.addEventListener('appinstalled', () => {
    // Enviar a Google Analytics
  })
  ```
- [ ] **Monitorear** métricas:
  - Instalaciones
  - Uso en modo standalone
  - Retención de usuarios

---

### 🔄 9. Actualizaciones Futuras

- [ ] **Documentar** proceso de actualización
- [ ] **Probar** auto-actualización
  - Service Worker se actualiza automáticamente
  - Usuario recarga y ve nueva versión
- [ ] **Comunicar** nuevas versiones a usuarios
  - Opcional: Notificación de "Nueva versión disponible"

---

### 📚 10. Documentación Interna

- [ ] **Compartir** con equipo:
  - `PWA_QUICKSTART.md`
  - `PWA_IMPLEMENTATION.md`
  - `PWA_SUMMARY.md`
- [ ] **Capacitar** a stakeholders sobre:
  - Cómo instalar
  - Beneficios para usuarios
  - Proceso de actualización

---

## 🎯 Resultado Esperado

Al completar este checklist, tendrás:

✅ Una PWA completamente funcional  
✅ Instalable en iOS, Android y Desktop  
✅ Con íconos profesionales de tu marca  
✅ Probada en múltiples dispositivos  
✅ Desplegada en producción con HTTPS  
✅ Lista para ofrecer mejor UX a tus pacientes  

---

## 📝 Notas

- Los íconos placeholder actuales SON funcionales para desarrollo
- Para producción DEBES reemplazarlos con tu logo oficial
- La PWA funciona en localhost sin HTTPS
- En producción REQUIERE HTTPS (Vercel/Netlify lo incluyen)
- El modal respeta las preferencias del usuario
- La instalación es completamente opcional para el usuario

---

## 🆘 Si algo falla

1. Ejecuta `npm run pwa:verify`
2. Revisa consola del navegador (errores en rojo)
3. Verifica DevTools → Application → Service Workers
4. Lee `PWA_IMPLEMENTATION.md` → Troubleshooting
5. Limpia caché y recarga con Ctrl+Shift+R

---

💛 **¡Éxito con tu PWA!**

*Psicóloga Karem - Tu espacio terapéutico siempre contigo*
