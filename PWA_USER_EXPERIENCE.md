# 📱 PWA - Experiencia del Usuario

Esta guía explica cómo los usuarios verán e interactuarán con la PWA de Psicóloga Karem.

---

## 🌟 Primera Visita

### Desktop / Móvil

El usuario visita `psicologakarem.com` normalmente.

**No pasa nada especial** - navegación regular del sitio.

---

## 🎯 Segunda Visita

### Si puede instalar (Chrome/Edge/Safari)

**Después de 3 segundos navegando:**

Un modal elegante aparece con:

```
┌─────────────────────────────────────┐
│        [Ícono corazón/hoja]        │
│                                     │
│ 💛 Tu espacio terapéutico          │
│    siempre contigo                 │
│                                     │
│ Agrega Psicóloga Karem a tu       │
│ pantalla de inicio y accede a tu   │
│ bienestar emocional con un toque.  │
│                                     │
│ ✨ Acceso rápido sin buscar        │
│ 🔒 Modo privado y discreto         │
│ 💾 Funciona con conexión limitada  │
│                                     │
│ [iOS: Instrucciones Safari]        │
│                                     │
│ [Ahora no]  [Instalar App]        │
│                                     │
│ No volver a mostrar                │
└─────────────────────────────────────┘
```

**Opciones del usuario:**

1. **"Instalar App"** (Android/Desktop)
   - Se instala inmediatamente
   - Aparece ícono en home screen/escritorio

2. **"Ahora no"**
   - Modal se cierra
   - No se vuelve a mostrar hasta dentro de 7 días

3. **"No volver a mostrar"**
   - Modal se cierra permanentemente
   - No se vuelve a mostrar nunca

4. **[iOS] "Entendido"**
   - Cierra modal después de leer instrucciones
   - Usuario instala manualmente desde Safari

---

## 📲 Proceso de Instalación

### Android (Chrome/Edge)

#### Opción 1: Banner del Navegador

Chrome muestra automáticamente:

```
┌─────────────────────────────────────┐
│ Psicóloga Karem                    │
│ psicologakarem.com                 │
│                                     │
│ Agregar a pantalla de inicio       │
│                                     │
│ [Cancelar]  [Instalar]            │
└─────────────────────────────────────┘
```

#### Opción 2: Menú Manual

Usuario abre menú (⋮) → "Instalar app"

#### Resultado:
- ✅ Ícono aparece en home screen
- ✅ Nombre: "Psicóloga Karem"
- ✅ Al tocar, abre en pantalla completa
- ✅ Splash screen con logo al abrir

### iOS (Safari)

El usuario debe instalar manualmente:

1. Abrir en Safari (no Chrome)
2. Tocar botón **Compartir** (cuadro con flecha hacia arriba)
3. Scroll down → **"Agregar a pantalla de inicio"**
4. Confirmar nombre → **"Agregar"**

#### Resultado:
- ✅ Ícono en home screen
- ✅ Abre en fullscreen
- ✅ Sin barra de Safari

### Desktop (Chrome/Edge)

Ícono de instalación aparece en la barra de direcciones:

```
[🔒 psicologakarem.com   [⬇️] ]
```

Al hacer clic:
- Se instala como app de escritorio
- Aparece en dock/taskbar
- Ventana independiente

---

## 🎨 App Instalada - Primera Apertura

### Splash Screen (Android)

```
┌─────────────────┐
│                 │
│                 │
│     [Logo]      │
│   Psicóloga     │
│     Karem       │
│                 │
│                 │
└─────────────────┘
```

Colores:
- Fondo: #F9F7F3 (beige suave)
- Logo: #D8AFA0 (terracota)

### iOS

Splash screen minimalista:
- Logo centrado
- Fondo color de marca

---

## 🖥️ Navegación en la App Instalada

### Diferencias vs Navegador

**❌ No tiene:**
- Barra de direcciones
- Botones adelante/atrás del navegador
- Pestañas del navegador
- Menú del navegador

**✅ Tiene:**
- Pantalla completa (más espacio)
- Navegación interna del sitio
- Apariencia de app nativa
- Barra de estado del sistema

### Ejemplo Visual (Android)

```
┌─────────────────────────────┐
│ ⏰ 10:30  📶 🔋            │ ← Barra del sistema
├─────────────────────────────┤
│                             │
│  [Header del sitio]         │
│                             │
│  Dashboard del Paciente     │
│                             │
│  [Contenido]                │
│                             │
│                             │
│                             │
│  [Footer del sitio]         │
│                             │
└─────────────────────────────┘
```

---

## 🔄 Actualizaciones

### Cuando publicas una nueva versión

**El usuario NO ve nada especial.**

La próxima vez que abra la app:
1. Service Worker detecta nueva versión
2. Descarga en segundo plano
3. Al cerrar y reabrir: nueva versión activa

### Opcional: Notificación de Actualización

Puedes agregar un banner:

```
┌─────────────────────────────────────┐
│ ℹ️ Nueva versión disponible        │
│ [Recargar para actualizar]         │
└─────────────────────────────────────┘
```

(No implementado por defecto, pero puedes agregarlo)

---

## 🌐 Modo Offline

### Qué funciona sin internet:

✅ **Páginas ya visitadas** (cacheadas)  
✅ **Imágenes** (cacheadas)  
✅ **Fuentes** (Google Fonts cacheadas)  
✅ **CSS/JS** del sitio  

❌ **No funciona:**
- Contenido nuevo de Supabase
- Imágenes no vistas
- APIs externas

### Mensaje al Usuario (Opcional)

Si pierden conexión:

```
┌─────────────────────────────────────┐
│ ⚠️ Sin conexión                    │
│ Mostrando contenido guardado        │
└─────────────────────────────────────┘
```

---

## 🎯 Experiencia Completa - Día a Día

### Usuario Regular (Paciente)

**Lunes** (Primera vez):
- Visita sitio normal
- Navega dashboard

**Miércoles** (Segunda visita):
- Ve modal de instalación
- Instala la app
- Aparece ícono en su móvil

**Jueves**:
- Toca ícono "Psicóloga Karem"
- App abre instantáneamente
- Ve su dashboard
- Revisa próxima sesión

**Viernes** (Sin conexión en el metro):
- Abre app
- Ve contenido cacheado
- Revisa notas anteriores
- Se reconecta → sincroniza

**Siguiente semana**:
- Tú publicas mejoras
- Usuario abre app
- Ve nueva versión automáticamente

---

## 💡 Ventajas para el Usuario

### vs Navegador Normal

| Aspecto | Navegador | PWA Instalada |
|---------|-----------|---------------|
| **Acceso** | Buscar en browser | Tap en ícono |
| **Espacio** | Con barra URL | Pantalla completa |
| **Percepción** | "Es un sitio web" | "Es mi app" |
| **Offline** | Error de conexión | Contenido cacheado |
| **Privacidad** | Pestañas visibles | Ventana dedicada |
| **Velocidad** | Carga red | Carga instantánea |

---

## 📊 Métricas Esperadas

### Instalaciones

**Desktop:**
- 5-10% de usuarios recurrentes

**Android:**
- 15-25% de usuarios recurrentes

**iOS:**
- 5-10% (requiere pasos manuales)

### Engagement

Usuarios con app instalada:
- 📈 +40% de sesiones
- 📈 +60% de retención
- 📈 -50% de tiempo de carga

---

## 🎨 Personalización Visual

### Colores del Sistema

La app adopta los colores de tu marca:

**Barra de estado (Android):**
- Color: #D8AFA0 (terracota)

**Theme color (navegador):**
- Color: #D8AFA0

**Splash screen:**
- Fondo: #F9F7F3 (beige)
- Logo: Tu ícono

---

## 🔔 Notificaciones Push (Futuro)

**No implementado actualmente**, pero podrías agregar:

- Recordatorios de sesiones
- Mensajes de la psicóloga
- Ejercicios sugeridos

---

## ✨ Resumen para el Usuario

**"¿Qué es esto de instalar la app?"**

> Es como descargar la app de Psicóloga Karem, pero sin usar la App Store ni ocupar tanto espacio. Te aparece un ícono en tu móvil y la abres como cualquier app, pero es más rápida y no necesitas buscarla en el navegador cada vez.

**"¿Por qué debería instalarla?"**

> - Acceso instantáneo con un toque
> - Más privada (sin pestañas del navegador)
> - Funciona aunque no tengas buena conexión
> - Se ve más profesional y dedicada
> - Actualiza automáticamente, sin hacer nada

**"¿Ocupa mucho espacio?"**

> No. Mucho menos que una app normal. Unos 2-5 MB dependiendo del caché.

**"¿Puedo desinstalarla?"**

> Sí. Como cualquier app: mantén presionado el ícono → Desinstalar.

---

💛 **Psicóloga Karem** - *Una experiencia más cercana y accesible*
