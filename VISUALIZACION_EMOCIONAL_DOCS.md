# 📊 Visualización Emocional Avanzada

Componente de análisis visual inspirado en la app Salud de Apple, que muestra la evolución del estado emocional del paciente a lo largo del tiempo.

## 📍 Ubicación
`/components/VisualizacionEmocional.vue`

## 🎯 Propósito
Permitir a los pacientes:
- Visualizar su evolución emocional en gráfico de línea suave
- Analizar patrones a 7 o 30 días
- Identificar emociones más frecuentes
- Reconocer factores influyentes principales
- Recibir insights personalizados basados en sus datos

## 🛠 Uso

### Integración en Dashboard (después de PanelEmocionalAvanzado)

```vue
<template>
  <div class="max-w-6xl mx-auto px-4 py-6 space-y-6">
    <!-- Header del dashboard -->
    <!-- ... -->

    <!-- Panel Emocional (registro) -->
    <PanelEmocionalAvanzado />

    <!-- NUEVO: Visualización de evolución -->
    <VisualizacionEmocional />

    <!-- Resto del dashboard -->
    <!-- ... -->
  </div>
</template>
```

### Como página independiente

```vue
<template>
  <div class="max-w-5xl mx-auto px-4 py-6">
    <h1 class="text-3xl font-['Lora'] font-medium text-[#5D4A44] mb-6">
      Mi Evolución Emocional 📈
    </h1>
    
    <VisualizacionEmocional />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'paciente',
  middleware: 'auth'
})
</script>
```

## 📊 Características

### 1. Gráfico de Evolución (Chart.js)
- **Tipo**: Línea con área de relleno (gradient)
- **Ejes**:
  - X: Fechas (formato "02 oct", "03 oct")
  - Y: Niveles emocionales (muy mal → muy bien)
- **Interactividad**:
  - Hover muestra fecha completa + emoji + nivel
  - Puntos destacados con bordes blancos
  - Transición suave (tension: 0.4)
- **Colores**:
  - Línea: `#D8AFA0` (Terracota)
  - Relleno: `rgba(216, 175, 160, 0.15)` (15% opacidad)

### 2. Selector de Rango Temporal
- **7 días**: Vista detallada de la última semana
- **30 días**: Panorama mensual completo
- Cambio instantáneo con recarga de datos desde Supabase
- Diseño tab-style con fondo terracota para selección activa

### 3. Estadísticas Rápidas (4 tarjetas)
- **Total de registros**: Muestra cantidad de días registrados
- **Promedio emocional**: Emoji representativo del estado promedio
- **Mejor día**: Emoji del día con mejor estado emocional
- **Racha**: Días consecutivos con registro (desde hoy hacia atrás)

### 4. Emociones Más Frecuentes (Top 5)
- **Layout**: Pills coloreadas con gradiente de opacidad
- **Colores rotativos**:
  - Terracota (#D8AFA0)
  - Rosa Empolvado (#EAD5D3)
  - Verde Suave (#B7C7A8)
  - Azul Sereno (#B4D4D3)
  - Beige Cálido (#E8C4A8)
- **Info**: Nombre de emoción + contador de frecuencia

### 5. Factores Influyentes (Top 6)
- **Grid responsive**: 2 columnas (móvil) → 4 columnas (desktop)
- **Iconos personalizados**:
  - Familia: 👨‍👩‍👧‍👦
  - Trabajo: 💼
  - Sueño: 😴
  - Relaciones: 💕
  - Salud: 🏥
  - Ejercicio: 🏃‍♀️
  - Tiempo libre: 🎨
  - Alimentación: 🥗
  - Terapia: 🌿
  - Clima: 🌤️
- **Display**: Nombre + frecuencia en tarjeta suave

### 6. Insight Personalizado
- **Análisis inteligente** basado en:
  - Tendencia (mejora/empeora/estable)
  - Emoción más frecuente
  - Factor más influyente
- **Mensajes contextuales** (ejemplos):
  - 📈 Tendencia positiva: "Tu bienestar ha mejorado... 'Sueño' parece estar influyendo positivamente 💚"
  - 📉 Tendencia negativa: "Has atravesado días más difíciles... Recuerda pedir apoyo 🌸"
  - ➡️ Estable tranquilo: "Tu equilibrio ha sido constante... Sigue cultivando calma 🌿"
  - ➡️ Estable ansioso: "Has experimentado 'ansioso' frecuentemente... Escucha estas señales 💙"

## 🗄️ Dependencias de Base de Datos

Utiliza la tabla `emociones_avanzadas` creada previamente:

```sql
-- La migración ya existe en:
-- /supabase/migrations/20250119000000_create_emociones_avanzadas.sql

-- Campos utilizados:
{
  id: bigint,
  paciente_id: uuid,
  fecha: timestamptz,
  estado_general: 'muy bien' | 'bien' | 'neutral' | 'mal' | 'muy mal',
  emociones: text[],
  influencias: text[]
}
```

### Query principal

```javascript
const { data } = await supabase
  .from('emociones_avanzadas')
  .select('*')
  .eq('paciente_id', user.value.id)
  .gte('fecha', fechaInicio.toISOString())
  .order('fecha', { ascending: true })
```

## 📦 Dependencias npm

```json
{
  "chart.js": "^4.x",
  "vue-chartjs": "^5.x"
}
```

Instaladas con:
```bash
npm install chart.js vue-chartjs
```

## 🎨 Diseño Visual

### Paleta de colores
- **Terracota**: `#D8AFA0` - Línea principal del gráfico
- **Rosa Empolvado**: `#EAD5D3` - Bordes y acentos
- **Verde Suave**: `#B7C7A8` - Emociones positivas
- **Azul Sereno**: `#B4D4D3` - Calma
- **Blanco Roto**: `#F9F7F3` - Fondos de estadísticas
- **Marrón Café**: `#5D4A44` - Textos principales

### Tipografía
- **Lora**: Títulos, números grandes (serif)
- **Lato**: Labels, tooltips, estadísticas (sans-serif)

### Espaciado y geometría
- Contenedor principal: `rounded-2xl`, `border-[#EAD5D3]/40`
- Tarjetas internas: `rounded-xl`, `bg-[#F9F7F3]`
- Gráfico: altura fija 280px, fondo `#F9F7F3/30`
- Grid responsivo con `gap-4` y `gap-6`

## 🧩 Estados del Componente

### Estado de carga (cargando = true)
- Spinner animado con mensaje "Cargando tu evolución emocional..."

### Sin datos (registros.length === 0)
- Icono de gráfico vacío
- Mensaje amable: "Aún no hay registros suficientes"
- Invitación a comenzar a registrar 🌿

### Con datos (registros.length > 0)
- Gráfico completo
- 4 estadísticas
- Emociones frecuentes (si existen)
- Factores influyentes (si existen)
- Insight personalizado (si hay ≥3 registros)

## 🔢 Cálculos Computados

### `promedioEmocional`
```javascript
suma_niveles / cantidad_registros
→ emoji representativo
```

### `mejorDia`
```javascript
registro con nivel más alto
→ emoji + fecha
```

### `racha`
```javascript
Conteo de días consecutivos con registro
desde hoy hacia atrás
→ número (0 si no hay registro hoy)
```

### `emocionesFrecuentes`
```javascript
flatMap todas las emociones
→ conteo por emoción
→ ordenar descendente
→ top 5
```

### `factoresFrecuentes`
```javascript
flatMap todas las influencias
→ conteo por factor
→ ordenar descendente
→ top 6
```

### `insight`
```javascript
if (registros < 3) return ''

calcular tendencia = promedio_últimos - promedio_primeros
analizar emoción_top
analizar factor_top

generar mensaje personalizado según contexto
```

## 🚀 Flujo de Usuario

1. **Paciente entra al dashboard**
   - Se carga automáticamente con rango "7 días"

2. **Observa el gráfico**
   - Ve su evolución de la última semana
   - Pasa el mouse sobre puntos para ver detalles

3. **Cambia a "30 días"**
   - Click en botón → recarga datos
   - Gráfico se actualiza con más puntos

4. **Lee estadísticas**
   - Promedio: "Estuve mayormente bien 🙂"
   - Mejor día: "Mi mejor día fue 😁"
   - Racha: "Llevo 5 días seguidos registrando"

5. **Revisa emociones frecuentes**
   - "Mis emociones principales fueron: Tranquilo × 8, Agradecido × 5..."

6. **Lee insight personalizado**
   - "Tu bienestar ha mejorado... 'Sueño' parece estar influyendo positivamente 💚"

7. **Reflexiona sobre su proceso**
   - Identifica patrones
   - Toma conciencia de factores influyentes
   - Comparte insights con terapeuta si lo desea

## 🔐 Seguridad

- ✅ RLS en tabla `emociones_avanzadas`
- ✅ Solo usuarios autenticados ven sus datos
- ✅ Queries filtradas por `paciente_id`
- ✅ Sin exposición de datos de otros pacientes

## 📱 Responsive Design

- **Móvil** (< 640px):
  - Selector de rango apilado verticalmente
  - Estadísticas grid 2×2
  - Factores grid 2 columnas

- **Tablet** (640px - 1024px):
  - Selector de rango horizontal
  - Estadísticas grid 2×2 o 4×1
  - Factores grid 3 columnas

- **Desktop** (> 1024px):
  - Todo horizontal optimizado
  - Estadísticas grid 4×1
  - Factores grid 4 columnas

## 🎯 Mejoras Futuras

- [ ] Exportar gráfico como PNG
- [ ] Comparación mes a mes
- [ ] Análisis de correlaciones (ej: "Cuando duermes bien, te sientes mejor")
- [ ] Vista de calendario con colores emocionales
- [ ] Anotaciones en días específicos
- [ ] Compartir evolución con terapeuta
- [ ] Gráfico de emociones específicas (líneas múltiples)
- [ ] Predicción de estado futuro (ML básico)

## 🤝 Integración con Otros Módulos

### Con PanelEmocionalAvanzado
- Usuario registra → se actualiza automáticamente visualización
- Relación visual inmediata entre registro y evolución

### Con Sesiones
- Correlacionar estado emocional con fechas de sesiones
- "Tu estado mejoró después de tu última sesión"

### Con Mensajes
- Compartir insight con terapeuta: "Quiero hablar sobre esto en la sesión"

### Con Recursos
- Sugerir recursos según estado: "Has sentido ansiedad, estos recursos pueden ayudarte"

## 🧪 Ejemplo de Datos Mock (para testing)

```javascript
const registrosMock = [
  {
    fecha: '2025-10-10T10:00:00Z',
    estado_general: 'bien',
    emociones: ['Tranquilo', 'Motivado'],
    influencias: ['Sueño', 'Ejercicio']
  },
  {
    fecha: '2025-10-11T10:00:00Z',
    estado_general: 'muy bien',
    emociones: ['Agradecido', 'En paz', 'Esperanzado'],
    influencias: ['Familia', 'Tiempo libre']
  },
  {
    fecha: '2025-10-12T10:00:00Z',
    estado_general: 'neutral',
    emociones: ['Cansado', 'Reflexivo'],
    influencias: ['Trabajo', 'Sueño']
  }
  // ... más registros
]
```

---

**Diseñado con 💚 para acompañar el autoconocimiento emocional de forma visual, clara y empática.**
