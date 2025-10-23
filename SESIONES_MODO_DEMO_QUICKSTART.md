# 🎭 Modo Demo - Quick Start

## ⚡ Activación Rápida

### Desde la Interfaz (Recomendado)

1. Ve a `/terapeuta/sesiones`
2. Click en **"👁️ Ver Demo"** (esquina superior derecha)
3. ✅ ¡Listo! Ahora ves 25 sesiones de ejemplo

### Desde la Consola del Navegador

```javascript
localStorage.setItem('sesiones_modo_demo', 'true')
location.reload()
```

---

## 🎯 ¿Qué Verás?

```
📊 Panel con datos realistas:
├─ 25 sesiones de ejemplo
├─ Fechas entre -30 y +30 días
├─ Estados variados (pendiente, confirmada, anulada)
├─ Nombres ficticios: María P., Luis G., etc.
├─ Precios: 45€ - 65€
└─ Cálculos automáticos (70% terapeuta)

💰 Métricas Típicas:
├─ Pendientes:   8 sesiones → ~280€
├─ Confirmadas: 12 sesiones → ~420€
├─ Anuladas:     3 sesiones → 0€
└─ Saldo Total:  ~490€
```

---

## 🔄 Desactivar

**Desde la interfaz:**
- Click en **"🎭 Modo Demo"** → vuelve a datos reales

**Desde consola:**
```javascript
localStorage.removeItem('sesiones_modo_demo')
location.reload()
```

---

## 💡 Uso Recomendado

### ✅ Ideal para:
- Ver cómo se vería el panel con datos
- Probar filtros y funcionalidades
- Capacitación de nuevos usuarios
- Testing de UI/UX
- Desarrollo sin base de datos

### ❌ No usar para:
- Tomar decisiones financieras
- Reportar ingresos reales
- Auditoría de pagos
- Comunicar con administración

---

## 🎨 Indicadores Visuales

**Modo Demo Activo:**
- 🎭 Banner morado superior
- Botón con ring blanco animado
- Mensaje "Datos de ejemplo"
- Opción "Volver a Datos Reales"

---

## 📱 Shortcuts

| Acción | Desktop | Mobile |
|--------|---------|--------|
| Activar/Desactivar | Click botón superior | Click botón breadcrumb |
| Desde sin datos | Click "Ver Demo" | Click "Ver Demo" |
| Desde error | Click "Ver Demo" | Click "Ver Demo" |

---

## 🐛 Solución Rápida

**Si el demo no aparece:**
```javascript
// En consola del navegador:
localStorage.setItem('sesiones_modo_demo', 'true')
location.reload()
```

**Si quieres limpiar:**
```javascript
localStorage.clear()
location.reload()
```

---

## 📚 Más Información

Ver: [`SESIONES_MODO_DEMO.md`](./SESIONES_MODO_DEMO.md) para documentación completa

---

<div align="center">

**🎭 Explora sin límites**

*Datos ficticios • Funcionalidad real*

</div>
