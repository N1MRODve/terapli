# 📱 Íconos PWA - Psicóloga Karem

## 🎯 Archivos necesarios

Para que la PWA funcione correctamente, necesitas estos archivos en formato PNG:

- `icon-192x192.png` - Ícono estándar pequeño
- `icon-512x512.png` - Ícono estándar grande  
- `maskable_icon.png` - Ícono adaptable para diferentes formas de dispositivos

## 🎨 Generación de íconos

### Opción 1: Generador HTML Local (Rápida)

1. Abre en tu navegador: `public/icons/generate-icons.html`
2. Haz clic en "Descargar" para cada ícono
3. Guarda los archivos PNG en esta carpeta

### Opción 2: RealFaviconGenerator (Recomendada para producción)

1. Visita https://realfavicongenerator.net/
2. Sube tu logo de Psicóloga Karem (preferiblemente SVG o PNG de alta calidad)
3. Configura:
   - **iOS Web Clip**: Activa y personaliza
   - **Android Chrome**: Selecciona "Standalone" y color #D8AFA0
   - **Background color**: #F9F7F3
4. Genera y descarga el paquete
5. Copia los archivos necesarios a esta carpeta

### Opción 3: Figma/Illustrator (Para diseñadores)

1. Diseña el ícono con las especificaciones:
   - **Colores de marca**:
     - Fondo: `#F9F7F3` (beige claro)
     - Principal: `#D8AFA0` (terracota suave)  
     - Texto/Detalles: `#5A4A42` (marrón cálido)
   
2. Exporta en los siguientes tamaños:
   - 192x192px → `icon-192x192.png`
   - 512x512px → `icon-512x512.png`
   - 512x512px con safe zone del 10% → `maskable_icon.png`

## 📐 Especificaciones técnicas

### icon-192x192.png
- Tamaño: 192x192 píxeles
- Formato: PNG con transparencia o fondo sólido
- Uso: Ícono en splash screen y homescreen de Android

### icon-512x512.png
- Tamaño: 512x512 píxeles
- Formato: PNG con transparencia o fondo sólido
- Uso: Ícono de alta resolución para Android

### maskable_icon.png
- Tamaño: 512x512 píxeles
- Formato: PNG
- **Importante**: Mantén el contenido importante dentro del círculo central (safe zone del 10%)
- El sistema operativo puede recortar los bordes para adaptarse a diferentes formas

## ✅ Verificación

Una vez tengas los PNG:

1. Asegúrate de que los 3 archivos estén en `public/icons/`
2. Ejecuta: `npm run dev`
3. Abre DevTools → Application → Manifest
4. Verifica que los íconos se muestren correctamente

## 🧪 Testing en móvil

### Android:
1. Abre la app en Chrome móvil
2. Menú (⋮) → "Agregar a pantalla de inicio"
3. Verifica que aparezca el ícono y el nombre correcto

### iOS:
1. Abre la app en Safari
2. Botón Compartir → "Agregar a inicio"
3. Verifica ícono y nombre

## 📝 Archivos actuales

Los archivos SVG incluidos son **placeholders** para desarrollo.  
**Reemplázalos con tu logo profesional antes de producción.**

---

💡 **Tip**: Para mejores resultados, usa tu logo real de Psicóloga Karem con fondo coherente a la identidad visual de la marca.
