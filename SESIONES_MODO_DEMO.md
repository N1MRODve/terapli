# 🎭 Modo Demo - Módulo de Sesiones

## 📋 Descripción

El **Modo Demo** permite explorar el módulo de sesiones con datos de ejemplo realistas sin necesidad de tener sesiones reales en la base de datos.

---

## ✨ Características

### Datos Generados Automáticamente
- ✅ **25 sesiones** de ejemplo
- ✅ Fechas distribuidas entre **-30 y +30 días** (pasado y futuro)
- ✅ Estados realistas: pendiente, confirmada, anulada, completada
- ✅ Nombres de pacientes ficticios con iniciales
- ✅ Precios variados: 45€ - 65€
- ✅ Modalidades mixtas: online y presencial
- ✅ Observaciones contextuales

### Distribución Realista
```
Sesiones futuras (futuro):
  - 80% Pendientes
  - 20% Confirmadas (pagadas por adelantado)

Sesiones pasadas:
  - 15% Anuladas
  - 55% Confirmadas
  - 30% Completadas
```

---

## 🚀 Cómo Activar el Modo Demo

### Método 1: Botón en la Interfaz

**Desktop:**
1. Ve a `/terapeuta/sesiones`
2. Busca el botón **"Ver Demo"** en la esquina superior derecha
3. Click para activar
4. El botón cambiará a **"🎭 Modo Demo"**

**Mobile:**
1. Mismo proceso
2. Botón más pequeño en el breadcrumb

### Método 2: Console del Navegador

```javascript
// Activar modo demo
localStorage.setItem('sesiones_modo_demo', 'true')
location.reload()

// Desactivar modo demo
localStorage.removeItem('sesiones_modo_demo')
location.reload()
```

### Método 3: URL Parameter (futura mejora)
```
/terapeuta/sesiones?demo=true
```

---

## 🎨 Indicadores Visuales

### Banner Superior
Cuando el modo demo está activo, aparece un banner destacado:

```
╔═══════════════════════════════════════════════════╗
║  🎭  Modo Demo Activo                            ║
║                                                   ║
║  Estás viendo datos de ejemplo para explorar     ║
║  el panel sin datos reales. Los montos y         ║
║  sesiones mostrados son ficticios.               ║
║                                                   ║
║  [Volver a Datos Reales]                         ║
╚═══════════════════════════════════════════════════╝
```

### Botón Resaltado
- **Modo normal**: 👁️ Ver Demo
- **Modo demo**: 🎭 Modo Demo (con ring animado)

---

## 📊 Datos de Ejemplo Generados

### Pacientes Ficticios
```
María P.
Luis G.
Ana R.
Carlos M.
Laura L.
Jorge S.
Elena F.
Pablo G.
Carmen D.
Miguel T.
```

### Observaciones Incluidas
```
"Primera sesión de evaluación"
"Seguimiento de evolución positiva"
"Trabajo en técnicas de relajación"
"Sesión de cierre de ciclo terapéutico"
"Evaluación de progreso mensual"
"Sesión centrada en mindfulness"
"Trabajo en gestión emocional"
"Revisión de objetivos terapéuticos"
"Sesión de mantenimiento"
```

### Ejemplo de Sesión Demo
```json
{
  "id": "demo-1-1729367890123",
  "paciente_nombre": "María",
  "paciente_apellido": "Pérez",
  "fecha": "2025-10-22T10:00:00Z",
  "estado": "pendiente",
  "modalidad": "online",
  "precio_total": 50.00,
  "pago_confirmado": false,
  "observaciones": "Primera sesión de evaluación"
}
```

---

## 💰 Cálculos en Modo Demo

Los cálculos se realizan **igual que con datos reales**:

```typescript
// Ejemplo con 25 sesiones demo:
Pendientes:    8 sesiones  → 280,00€ (70%)
Confirmadas:  12 sesiones  → 420,00€ (70%)
Anuladas:      3 sesiones  → 0,00€
Completadas:   2 sesiones  → 70,00€ (70%)

Saldo Total: 490,00€
```

---

## 🔄 Comportamiento del Sistema

### Al Activar Modo Demo
1. Se guarda en `localStorage`
2. Se genera array de 25 sesiones
3. Se calculan métricas financieras
4. Se muestra banner informativo
5. Botón cambia a "Modo Demo"

### Al Desactivar Modo Demo
1. Se limpia `localStorage`
2. Se cargan datos reales de Supabase
3. Banner desaparece
4. Botón vuelve a "Ver Demo"

### Persistencia
- ✅ Se mantiene entre recargas de página
- ✅ Se mantiene en navegación interna
- ❌ No persiste entre dispositivos
- ❌ No persiste en modo incógnito

---

## 🎯 Casos de Uso

### 1. Demo para Nuevos Usuarios
**Objetivo**: Mostrar el sistema antes de tener datos reales

**Pasos**:
1. Usuario nuevo accede a `/terapeuta/sesiones`
2. Ve mensaje "No hay sesiones"
3. Click en "Ver Demo"
4. Explora funcionalidades con datos de ejemplo

### 2. Testing de UI
**Objetivo**: Verificar diseño y responsividad

**Pasos**:
1. Activar modo demo
2. Probar filtros
3. Verificar cálculos
4. Testear responsive
5. Desactivar modo demo

### 3. Capacitación
**Objetivo**: Formar a terapeutas en el uso del panel

**Pasos**:
1. Activar demo en sesión de capacitación
2. Mostrar cada sección
3. Explicar métricas
4. Responder preguntas
5. Mostrar datos reales

### 4. Desarrollo
**Objetivo**: Trabajar en UI sin conectar BD

**Pasos**:
1. Activar demo desde consola
2. Desarrollar componentes
3. Testear con datos consistentes
4. Verificar edge cases

---

## 🛠️ Implementación Técnica

### Composable: `useSesionesDemo()`

```typescript
const {
  generarSesionesDemo,    // Genera array de sesiones
  esModoDemo,             // Verifica si está activo
  activarModoDemo,        // Activa el modo
  desactivarModoDemo,     // Desactiva el modo
  toggleModoDemo          // Alterna estado
} = useSesionesDemo()
```

### Integración en Página

```vue
<script setup>
const modoDemo = ref(false)

const cargarDatos = async () => {
  if (modoDemo.value) {
    sesiones.value = generarSesionesDemo()
  } else {
    sesiones.value = await obtenerSesiones()
  }
}

onMounted(() => {
  modoDemo.value = esModoDemo()
  cargarDatos()
})
</script>
```

---

## 🧪 Testing del Modo Demo

### Checklist de Verificación

**Activación**:
- [ ] Botón cambia de estado visual
- [ ] Banner aparece correctamente
- [ ] Se generan 25 sesiones
- [ ] Métricas se calculan bien

**Datos Generados**:
- [ ] Fechas distribuidas correctamente
- [ ] Estados realistas
- [ ] Nombres formateados (inicial)
- [ ] Precios variados

**Cálculos**:
- [ ] Resumen financiero correcto
- [ ] Porcentaje 70% aplicado
- [ ] Filtros funcionan
- [ ] Totales suman bien

**Persistencia**:
- [ ] Se mantiene al recargar
- [ ] Se mantiene al navegar
- [ ] Se limpia al desactivar

**UX**:
- [ ] Banner es claro
- [ ] Botón es visible
- [ ] Transiciones suaves
- [ ] Mensajes informativos

---

## 🎨 Personalización

### Cambiar Cantidad de Sesiones

En `composables/useSesionesDemo.ts`:
```typescript
// Cambiar de 25 a 50 sesiones
for (let i = 0; i < 50; i++) {
  // ...
}
```

### Cambiar Rango de Fechas

```typescript
// Cambiar a ±60 días
const diasOffset = Math.floor(Math.random() * 120) - 60
```

### Agregar Más Pacientes

```typescript
const pacientes = [
  { nombre: 'María', apellido: 'Pérez' },
  { nombre: 'Luis', apellido: 'García' },
  // Agregar más aquí...
  { nombre: 'Nuevo', apellido: 'Paciente' }
]
```

### Cambiar Precios

```typescript
// Cambiar rango de precios
const precioBase = [40, 45, 50, 55, 60, 70, 80]
```

---

## 🐛 Troubleshooting

### El modo demo no se activa
**Solución**:
1. Abrir consola del navegador
2. Ejecutar: `localStorage.setItem('sesiones_modo_demo', 'true')`
3. Recargar página

### Los datos no cambian
**Solución**:
1. Verificar que `modoDemo.value` sea `true`
2. Verificar que se llama `generarSesionesDemo()`
3. Revisar consola por errores

### El banner no aparece
**Solución**:
1. Verificar condición `v-if="modoDemo && !cargando"`
2. Esperar a que termine la carga
3. Verificar clases CSS

### Los cálculos son incorrectos
**Solución**:
1. Verificar que se usa `calcularResumenFinanciero()`
2. Los datos demo usan los mismos cálculos que reales
3. Revisar que `precio_total` es numérico

---

## 📱 Responsive Design

### Desktop (>768px)
- Botón en esquina superior derecha
- Banner completo con todos los textos
- Cards en grid de 4 columnas

### Mobile (<768px)
- Botón compacto en breadcrumb
- Banner con padding reducido
- Cards apiladas verticalmente

---

## 🔐 Seguridad

### No hay riesgos de seguridad porque:
- ✅ Solo datos en memoria (no BD)
- ✅ Solo localStorage del navegador
- ✅ No se envían datos a servidor
- ✅ No afecta datos reales
- ✅ Se limpia al desactivar

---

## 💡 Buenas Prácticas

### Para Desarrollo
```typescript
// Siempre verificar modo antes de queries
if (modoDemo.value) {
  // Usar datos demo
} else {
  // Usar datos reales
}
```

### Para Producción
```typescript
// Limpiar localStorage en logout
const logout = () => {
  localStorage.removeItem('sesiones_modo_demo')
  // ... resto del logout
}
```

### Para Testing
```typescript
// Usar modo demo en tests E2E
beforeEach(() => {
  cy.window().then((win) => {
    win.localStorage.setItem('sesiones_modo_demo', 'true')
  })
})
```

---

## 🎯 Roadmap Futuro

### v1.1 (Próxima versión)
- [ ] Modo demo con URL param: `?demo=true`
- [ ] Opción de cantidad de sesiones
- [ ] Modo demo para otros módulos

### v1.2
- [ ] Guardar configuración de demo
- [ ] Presets de escenarios (mucho, poco, variado)
- [ ] Export de datos demo para testing

### v2.0
- [ ] Builder de datos demo personalizado
- [ ] Compartir configuraciones de demo
- [ ] Analytics de uso de demo

---

## 📞 Soporte

**Activar/Desactivar demo**: Botón en interfaz o localStorage  
**Problemas técnicos**: Equipo de desarrollo  
**Sugerencias**: Feedback interno  

---

<div align="center">

## 🎭 Modo Demo Implementado

**Explora el módulo sin límites**

*Datos de ejemplo • Cálculos reales • Experiencia completa*

---

**Activa desde:** `/terapeuta/sesiones` → Botón "Ver Demo"

</div>
