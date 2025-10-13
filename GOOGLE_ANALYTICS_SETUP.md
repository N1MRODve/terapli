# 📊 Google Analytics 4 - Guía de Verificación y Uso

## ✅ Integración Completada

Google Analytics 4 (ID: `G-423R3JT85S`) ha sido integrado en **psicologakarem.com** cumpliendo con el RGPD.

---

## 🔍 Cómo Verificar que Funciona

### 1️⃣ **Verificación en Tiempo Real**

1. Abre Google Analytics 4: [analytics.google.com](https://analytics.google.com)
2. Ve a **Informes → Tiempo real**
3. Abre tu sitio web en modo incógnito (para simular un nuevo usuario)
4. **Acepta las cookies de análisis** en el banner
5. Deberías ver tu visita aparecer en tiempo real

### 2️⃣ **DebugView (Modo Desarrollo)**

Para ver eventos en detalle durante desarrollo:

```bash
# En la consola del navegador, ejecuta:
localStorage.setItem('debug_mode', 'true')
```

Luego ve a: **Admin → DebugView** en Google Analytics

### 3️⃣ **Verificación de Consentimiento**

Abre la consola del navegador (F12) y verifica:

- ✅ Si **aceptas cookies**: verás el mensaje `✅ Google Analytics activado`
- ❌ Si **rechazas cookies**: verás `❌ Google Analytics desactivado`
- 🔄 Si cambias preferencias, GA4 se actualiza automáticamente

---

## 🎯 Características Implementadas

### ✅ Cumplimiento RGPD
- **Consentimiento por defecto**: DENEGADO hasta que el usuario acepta
- **Anonimización de IP**: Activada (`anonymize_ip: true`)
- **Respeta preferencias del usuario**: Se integra con tu sistema de cookies existente
- **Caducidad del consentimiento**: 12 meses

### ✅ Carga Asíncrona
- Script cargado de forma **asíncrona** (no bloquea la página)
- **Modo consent**: Espera 500ms para actualizar preferencias

### ✅ Eventos Automáticos
- **Page views**: Se registran automáticamente
- **Scrolls**: Tracking automático de GA4
- **Clics en enlaces externos**: Tracking automático

---

## 🚀 Cómo Usar Analytics en tu Código

### Ejemplo 1: Tracking de Clics en Botones

```vue
<template>
  <CalmButton @click="handleReservarClick" to="/reservar">
    Reservar sesión
  </CalmButton>
</template>

<script setup>
const { trackBookingIntent } = useAnalytics()

const handleReservarClick = () => {
  trackBookingIntent('terapia_individual')
}
</script>
```

### Ejemplo 2: Tracking de WhatsApp

```vue
<script setup>
const { trackWhatsAppClick } = useAnalytics()

const handleWhatsApp = () => {
  trackWhatsAppClick()
  // Abrir WhatsApp
}
</script>
```

### Ejemplo 3: Tracking de Formularios

```vue
<script setup>
const { trackFormSubmit } = useAnalytics()

const submitForm = async () => {
  // ... lógica del formulario
  trackFormSubmit('contacto')
}
</script>
```

### Ejemplo 4: Evento Personalizado

```vue
<script setup>
const { trackEvent } = useAnalytics()

const handleDownload = () => {
  trackEvent('descargar_guia', {
    guia_nombre: 'Primeros Pasos en Terapia',
    formato: 'pdf'
  })
}
</script>
```

---

## 📱 Funciones Disponibles

El composable `useAnalytics()` proporciona:

| Función | Descripción | Uso |
|---------|-------------|-----|
| `trackEvent(name, params)` | Evento personalizado | Cualquier evento |
| `trackButtonClick(name, location)` | Clic en botón | CTAs importantes |
| `trackFormSubmit(formName)` | Envío de formulario | Contacto, reservas |
| `trackPageView(pageName)` | Vista de página manual | SPAs |
| `trackWhatsAppClick()` | Clic en WhatsApp | Botones de contacto |
| `trackBookingIntent(service)` | Intención de reserva | Proceso de conversión |

---

## 🔒 Privacidad y Seguridad

### Datos Anonimizados
- ✅ IPs anonimizadas automáticamente
- ✅ Cookies con flags `SameSite=None;Secure`
- ✅ No se envían datos personales identificables

### Control del Usuario
- ✅ El usuario puede **rechazar cookies de análisis**
- ✅ Puede cambiar preferencias en cualquier momento
- ✅ El consentimiento expira cada 12 meses

---

## 📊 Métricas Recomendadas a Monitorear

### Conversiones Importantes
1. **Clics en "Reservar sesión"** → `booking_intent`
2. **Envíos de formulario de contacto** → `form_submit`
3. **Clics en WhatsApp** → `contact_whatsapp`
4. **Páginas más visitadas** → Automático
5. **Tiempo en página** → Automático

### Embudo de Conversión
```
Inicio → Conoceme → Como Empezar → Reservar → Gracias
```

---

## 🐛 Solución de Problemas

### No veo datos en tiempo real

1. ✅ Verifica que aceptaste las cookies de análisis
2. ✅ Abre la consola del navegador y busca errores
3. ✅ Verifica que el ID `G-423R3JT85S` es correcto
4. ✅ Espera 5-10 segundos (hay un pequeño delay)

### Los eventos personalizados no aparecen

1. ✅ Verifica que el usuario aceptó cookies de análisis
2. ✅ Abre la consola y busca logs de tracking
3. ✅ Usa DebugView en modo desarrollo

---

## 📝 Notas Importantes

- **No rastrear en desarrollo**: GA4 está activo en todos los entornos. Si quieres desactivarlo en desarrollo, modifica el plugin.
- **Primer día**: Los datos pueden tardar 24-48h en aparecer en informes estándar (no en tiempo real)
- **Cambios de configuración**: Cualquier cambio en GA4 puede tardar hasta 24h en aplicarse

---

## 🎓 Recursos Adicionales

- [Google Analytics 4 Docs](https://support.google.com/analytics/answer/9304153)
- [Guía de Eventos GA4](https://support.google.com/analytics/answer/9322688)
- [RGPD y Google Analytics](https://support.google.com/analytics/answer/9019185)

---

✨ **Integración completada por GitHub Copilot** - Octubre 2025
