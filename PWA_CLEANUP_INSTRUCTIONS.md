# 🧹 PWA Cleanup Instructions - Limpieza Manual

Si después de los cambios sigues experimentando problemas con Service Workers o caches en desarrollo, sigue estos pasos para limpiar manualmente tu navegador.

---

## 📋 SÍNTOMAS DE SERVICE WORKER RESIDUAL

- Login no funciona en localhost
- Ves en consola: `workbox Router is responding to: /` o similar
- Errores 404 en `/_nuxt/Users/dieterlorenzo/.../entry.async.js`
- Assets no cargan correctamente
- La app parece "congelada" o carga versión vieja

---

## 🔧 LIMPIEZA MANUAL POR NAVEGADOR

### **Google Chrome / Edge**

1. **Abrir DevTools**:
   - Presiona `F12` o `Cmd/Ctrl + Shift + I`

2. **Ir a Application Tab**:
   - Click en la pestaña "Application" (o "Aplicación")

3. **Desregistrar Service Workers**:
   - En el panel izquierdo, expande "Service Workers"
   - Click en "Unregister" junto a cada Service Worker listado
   - Verifica que la lista quede vacía

4. **Limpiar Cache Storage**:
   - En el panel izquierdo, expande "Cache Storage"
   - Click derecho en cada cache (workbox-*, google-fonts-*, image-cache, etc.)
   - Selecciona "Delete"
   - Verifica que la lista quede vacía

5. **Limpiar Cookies y Storage** (opcional pero recomendado):
   - En el panel izquierdo, click en "Storage"
   - Click en "Clear site data"
   - Marca todas las opciones
   - Click en "Clear all"

6. **Hard Reload**:
   - Presiona `Cmd/Ctrl + Shift + R` para hacer un hard reload
   - O haz click derecho en el botón de reload → "Empty Cache and Hard Reload"

---

### **Firefox**

1. **Abrir DevTools**:
   - Presiona `F12` o `Cmd/Ctrl + Shift + I`

2. **Ir a Storage Tab**:
   - Click en la pestaña "Storage" (o "Almacenamiento")

3. **Desregistrar Service Workers**:
   - En el panel izquierdo, click en "Service Workers"
   - Click en "Unregister" junto a cada Service Worker listado

4. **Limpiar Cache Storage**:
   - En el panel izquierdo, click en "Cache Storage"
   - Click derecho en cada cache → "Delete All"

5. **Limpiar Cookies y Storage**:
   - En el panel izquierdo, click derecho en el dominio (localhost:3000)
   - Selecciona "Delete All"

6. **Hard Reload**:
   - Presiona `Cmd/Ctrl + Shift + R`

---

### **Safari**

1. **Habilitar Menú de Desarrollo** (si no está habilitado):
   - Safari → Preferences → Advanced
   - Marca "Show Develop menu in menu bar"

2. **Abrir Web Inspector**:
   - Develop → Show Web Inspector (o `Cmd + Option + I`)

3. **Ir a Storage Tab**:
   - Click en la pestaña "Storage"

4. **Limpiar Service Workers y Cache**:
   - En el panel izquierdo, busca "Service Workers" y "Cache Storage"
   - Elimina todos los entries

5. **Vaciar Caches**:
   - Develop → Empty Caches

6. **Hard Reload**:
   - Develop → Disable Caches (mientras DevTools abierto)
   - Presiona `Cmd + R` varias veces

---

## 🚀 LIMPIEZA AUTOMÁTICA CON EL SCRIPT

Hemos incluido un plugin automático que limpia Service Workers en desarrollo:

```bash
# El plugin se ejecuta automáticamente al iniciar dev
npm run dev
```

**Verás en consola**:
```
🧹 [PWA Cleanup] Limpiando Service Workers en desarrollo...
✅ [PWA Cleanup] No hay Service Workers registrados
✅ [PWA Cleanup] No hay caches para limpiar
✅ [PWA Cleanup] Limpieza completada
```

Si ves **advertencias** en rojo:
```
⚠️ [PWA Cleanup] Encontrados 2 Service Workers, desregistrando...
```

Significa que había SW residuales y el plugin los eliminó automáticamente.

---

## ⚠️ SI EL PLUGIN NO LIMPIA AUTOMÁTICAMENTE

Si después de iniciar `npm run dev` sigues viendo Service Workers activos:

1. **Cierra TODOS los tabs de localhost:3000**
2. **Cierra el navegador completamente**
3. **Reabre el navegador**
4. **Inicia de nuevo `npm run dev`**
5. **Abre una NUEVA pestaña en modo incógnito** (recomendado para testing)

---

## 🧪 VERIFICAR QUE ESTÁ LIMPIO

Después de la limpieza, verifica en DevTools:

### **Chrome/Edge - Application Tab**:
- Service Workers: **Empty list**
- Cache Storage: **Empty list**

### **Consola del navegador**:
Debes ver **SOLO** esto (sin errores de Workbox):
```
✅ [PWA Cleanup] Limpieza completada
```

**NO debes ver**:
```
❌ workbox Router is responding to: /
❌ Workbox está activo en desarrollo
❌ 404 en /_nuxt/Users/...
```

---

## 🔍 TROUBLESHOOTING

### **Problema: Service Workers no se desregistran**

**Solución**:
1. En DevTools → Application → Service Workers
2. Marca la opción **"Update on reload"**
3. Marca la opción **"Bypass for network"**
4. Recarga la página con `Cmd/Ctrl + Shift + R`
5. Después de limpiar, desmarca esas opciones

---

### **Problema: Caches reaparecen después de recargar**

**Solución**:
1. Verifica que `devOptions.enabled` esté en `false` en [nuxt.config.ts](nuxt.config.ts#L190)
2. Verifica que estés usando `npm run dev` (que incluye `DISABLE_PWA=true`)
3. No uses `npm run dev:full` o `npm run dev:with-pwa` (esos habilitan PWA)

---

### **Problema: Login sigue sin funcionar después de limpiar**

**Solución**:
1. Limpia **completamente** las cookies de Supabase:
   - DevTools → Application → Cookies → localhost:3000
   - Elimina todas las cookies que empiecen con `sb-`

2. Limpia localStorage:
   - DevTools → Application → Local Storage → localhost:3000
   - Click derecho → Clear

3. Cierra y reabre el navegador

4. **Modo Incógnito** (recomendado para testing):
   - Presiona `Cmd/Ctrl + Shift + N` (Chrome) o `Cmd/Ctrl + Shift + P` (Firefox)
   - Inicia en modo incógnito para evitar caches persistentes

---

## 📝 COMANDOS DISPONIBLES

```bash
# Desarrollo SIN PWA (RECOMENDADO)
npm run dev

# Desarrollo con todas las features (incluye PWA, solo para testing)
npm run dev:with-pwa

# Desarrollo completo sin ninguna optimización
npm run dev:full

# Desarrollo mínimo (sin content, pwa, ni analytics)
npm run dev:minimal
```

---

## ✅ CHECKLIST POST-LIMPIEZA

- [ ] No hay Service Workers en DevTools → Application → Service Workers
- [ ] No hay caches en DevTools → Application → Cache Storage
- [ ] Consola muestra: `✅ [PWA Cleanup] Limpieza completada`
- [ ] No aparece `workbox Router is responding to` en consola
- [ ] No hay errores 404 en `/_nuxt/Users/...`
- [ ] Login funciona correctamente
- [ ] La app carga sin retrasos

---

## 🚨 NOTA IMPORTANTE

**NUNCA uses `npm run dev:with-pwa` para desarrollo normal**. Solo úsalo si necesitas probar específicamente la funcionalidad PWA en desarrollo.

Para desarrollo diario, **siempre usa**:
```bash
npm run dev
```

---

## 🎯 EN PRODUCCIÓN

En producción (deployment a Vercel), el PWA funciona **normalmente**:

- Service Workers se registran correctamente
- Workbox cachea assets como debe
- La app funciona offline
- No hay interferencia con el login

El fix solo afecta a **desarrollo local** para evitar conflictos.

---

Si después de seguir todos estos pasos sigues teniendo problemas, por favor:

1. Cierra TODOS los navegadores
2. Reinicia tu servidor de desarrollo (`Ctrl+C` → `npm run dev`)
3. Abre el navegador en **modo incógnito**
4. Si el problema persiste, contacta al equipo de desarrollo
