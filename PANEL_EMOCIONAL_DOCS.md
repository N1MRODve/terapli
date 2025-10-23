# 🌿 Panel Emocional Avanzado

Componente de registro emocional inspirado en la app Salud de Apple, diseñado para acompañar a los pacientes en su proceso de autoconocimiento emocional.

## 📍 Ubicación
`/components/PanelEmocionalAvanzado.vue`

## 🎯 Propósito
Permitir a los pacientes:
- Registrar su estado emocional general (5 niveles)
- Identificar hasta 3 emociones específicas
- Seleccionar factores que influyen en su estado de ánimo
- Añadir reflexiones personales opcionales
- Visualizar su evolución emocional reciente

## 🛠 Uso

### En cualquier página del área de paciente:

```vue
<template>
  <div class="max-w-4xl mx-auto px-4 py-6">
    <PanelEmocionalAvanzado />
  </div>
</template>
```

### En el Dashboard del paciente:

```vue
<template>
  <div class="max-w-6xl mx-auto px-4 py-6 space-y-6">
    <!-- Header -->
    <div class="bg-gradient-to-br from-[#D8AFA0] via-[#EAD5D3] to-[#F9F7F3] rounded-2xl p-8">
      <!-- ... contenido del header ... -->
    </div>

    <!-- Panel Emocional -->
    <PanelEmocionalAvanzado />

    <!-- Resto del dashboard -->
    <!-- ... -->
  </div>
</template>
```

## 🗄️ Base de Datos

### Migración de Supabase
Ejecuta la migración en Supabase:

```bash
# Si usas Supabase CLI local
supabase db reset

# O copia el contenido de:
# /supabase/migrations/20250119000000_create_emociones_avanzadas.sql
# Y ejecútalo manualmente en el SQL Editor de Supabase
```

### Estructura de la tabla `emociones_avanzadas`

```sql
{
  id: bigint,
  paciente_id: uuid,
  fecha: timestamptz,
  estado_general: 'muy bien' | 'bien' | 'neutral' | 'mal' | 'muy mal',
  emociones: text[], // Máximo 3 elementos
  influencias: text[],
  reflexion: text | null,
  created_at: timestamptz,
  updated_at: timestamptz
}
```

### Políticas RLS (Row Level Security)
✅ Los pacientes solo pueden ver, crear, actualizar y eliminar sus propios registros  
✅ Índices optimizados para consultas por paciente y fecha  
✅ Trigger automático para actualizar `updated_at`

## 🎨 Características del Diseño

### Paleta de colores
- **Terracota**: `#D8AFA0` - Botones principales y selección
- **Rosa Empolvado**: `#EAD5D3` - Factores influyentes
- **Blanco Roto**: `#F9F7F3` - Fondos suaves
- **Marrón Café**: `#5D4A44` - Textos

### Tipografía
- **Lora**: Títulos y texto emocional (serif)
- **Lato**: Texto general (sans-serif)

### Interacciones
- ✨ Transiciones suaves en todos los estados
- 🎯 Feedback visual inmediato al seleccionar opciones
- 📊 Visualización de últimos 7 registros
- 💬 Modal de detalle al hacer clic en días anteriores
- 🎉 Mensajes de éxito/error contextuales

## 🧩 Funcionalidades

### 1. Registro del estado general
5 niveles con emojis: 😁 🙂 😐 😔 😢

### 2. Selección de emociones (máximo 3)
- Agradecido, Tranquilo, Motivado, Ansioso, Triste, Cansado, Esperanzado, En paz, Irritado, Reflexivo, Conectado, Abrumado

### 3. Factores influyentes (sin límite)
- Familia, Trabajo, Sueño, Relaciones, Salud, Ejercicio, Tiempo libre, Alimentación, Terapia, Clima

### 4. Reflexión opcional
- Textarea con contador de caracteres (máximo 500)
- Placeholder amable y sugerente

### 5. Evolución reciente
- Timeline horizontal con últimos 7 días
- Círculos coloreados según el estado (verde/amarillo/rojo)
- Click en cada día para ver detalle completo
- Mensaje de ánimo contextual según evolución

### 6. Modal de detalle
- Muestra fecha completa
- Emoji del estado general
- Lista de emociones seleccionadas
- Factores influyentes
- Reflexión completa si existe

## 📊 Mensajes de Evolución

El componente analiza los últimos 3 registros y muestra:

- **Evolución positiva**: "¡Qué bien! Veo que has tenido días positivos recientemente. Celebra tu progreso 💚"
- **Evolución difícil**: "Han sido días difíciles. Recuerda que está bien no estar bien. Sé amable contigo misma 🌸"
- **Evolución mixta**: "Tu estado emocional fluctúa, y eso es completamente normal. Sigue registrando tu evolución 🌿"

## 🔐 Seguridad

- ✅ Solo usuarios autenticados pueden registrar
- ✅ RLS garantiza privacidad total
- ✅ Validación de datos en frontend y backend
- ✅ Sin exposición de datos de otros pacientes

## 🚀 Mejoras Futuras

- [ ] Exportar registros a PDF
- [ ] Gráficos de evolución (Chart.js / Recharts)
- [ ] Compartir registro específico con terapeuta
- [ ] Recordatorios diarios para registrar
- [ ] Análisis de patrones emocionales
- [ ] Integración con sesiones (cómo te sentías antes/después)

## 📝 Notas Técnicas

- Auto-importado por Nuxt (no requiere import explícito)
- Usa `useSupabaseClient()` y `useSupabaseUser()`
- Reactive con Composition API (`ref`, `computed`)
- Loading state con spinner SVG
- Mensajes de feedback con auto-desaparición (3-4s)
- Scroll horizontal personalizado (scrollbar-hide)
- Modal con backdrop blur

## 🤝 Integración con otros módulos

El componente puede integrarse con:
- **Dashboard**: Como tarjeta principal
- **Sesiones**: Para ver estado emocional antes de sesiones
- **Mensajes**: Compartir reflexión con terapeuta
- **Recursos**: Sugerir recursos según estado emocional

---

**Diseñado con 💚 para acompañar el proceso terapéutico de forma humana y empática.**
