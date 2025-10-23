# 🚀 Quick Start - PWA

## ✅ La PWA está lista para usar

Todos los archivos necesarios han sido creados y configurados.

---

## 📦 Verificar instalación

```bash
npm run pwa:verify
```

Esto verificará que todo esté correctamente configurado.

---

## 🎨 Generar íconos

### Opción 1: Generador HTML (Más rápido)

1. Inicia el servidor:
   ```bash
   npm run dev
   ```

2. Abre en tu navegador:
   ```
   http://localhost:3000/icons/generate-icons.html
   ```

3. Descarga los 3 íconos PNG y guárdalos en `public/icons/`

### Opción 2: Usar tu logo real

Visita https://realfavicongenerator.net/ y sube tu logo

---

## 🧪 Probar la PWA

### En desarrollo:

```bash
npm run dev
```

Luego abre Chrome DevTools:
1. Application → Manifest (verifica configuración)
2. Application → Service Workers (verifica que esté activo)

### En producción:

```bash
npm run build
npm run preview
```

O despliega en tu servidor y prueba desde un móvil real.

---

## 📱 Integrar en tus páginas

### Método 1: Wrapper completo (recomendado)

```vue
<template>
  <PWAInstallWrapper>
    <div>
      <!-- Tu contenido aquí -->
    </div>
  </PWAInstallWrapper>
</template>
```

### Método 2: Solo el botón flotante

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

### Método 3: Control manual

```vue
<template>
  <div>
    <button 
      v-if="canInstall" 
      @click="promptInstall()"
    >
      Instalar App
    </button>
  </div>
</template>

<script setup>
const { canInstall, promptInstall } = usePWAInstallPrompt()
</script>
```

---

## 📖 Ver ejemplo completo

Abre el archivo de ejemplo:
```
pages/ejemplo-pwa.vue
```

O visita en tu navegador:
```
http://localhost:3000/ejemplo-pwa
```

---

## 📚 Documentación completa

Lee el archivo completo: `PWA_IMPLEMENTATION.md`

---

## ✨ ¡Listo!

Tu aplicación ahora es una PWA completa. Los usuarios podrán:
- ✅ Instalarla en su pantalla de inicio
- ✅ Usarla sin conexión (con caché)
- ✅ Recibir actualizaciones automáticas
- ✅ Disfrutar de una experiencia similar a apps nativas

---

💛 **Psicóloga Karem** - Tu espacio terapéutico digital
