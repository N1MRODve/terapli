# 📋 Optimización de Tarjeta de Paciente - Completado

## 🎯 Objetivo
Optimizar la vista de **tarjeta de paciente** en `/pages/terapeuta/pacientes.vue` para mostrar la información del bono activo de manera destacada y eliminar el campo de frecuencia.

---

## ✅ Cambios Implementados

### 1️⃣ **Eliminación del Campo Frecuencia**
- ❌ **Removido**: Campo "Frecuencia de sesiones" (🔄)
- ✅ **Razón**: Ya no es necesario con el nuevo sistema de tipo de bono

### 2️⃣ **Nueva Sección de Bono Activo**
Se ha creado una sección destacada con fondo degradado para mostrar toda la información del bono:

```vue
<div class="p-4 bg-gradient-to-br from-terracota/5 to-rosa/10 rounded-lg border border-terracota/20">
```

#### 📊 Información Mostrada:

1. **🎟️ Tipo de Bono**
   - Muestra: A demanda | Quincenal | Semanal
   - Badge con colores distintos por tipo:
     - `a_demanda`: Azul (bg-blue-100 text-blue-700)
     - `quincenal`: Púrpura (bg-purple-100 text-purple-700)
     - `semanal`: Índigo (bg-indigo-100 text-indigo-700)

2. **💰 Estado**
   - Badge con colores semafóricos:
     - `activo`: Verde (bg-green-100 text-green-700) ✅
     - `pendiente`: Amarillo (bg-yellow-100 text-yellow-700) ⚠️
     - `vencido`: Rojo (bg-red-100 text-red-700) 🚨
     - `completado`: Gris (bg-gray-100 text-gray-600) 🔚

3. **📆 Fecha Fin**
   - Formato: "15 dic 2024"
   - Colores dinámicos según proximidad:
     - `< 0 días` (vencido): Rojo intenso (text-red-600 font-semibold)
     - `≤ 7 días`: Naranja (text-orange-600 font-semibold)
     - `≤ 14 días`: Ámbar (text-amber-600)
     - `> 14 días`: Normal (text-cafe/80)

4. **🧭 Sesiones X/Y**
   - Muestra: `Sesiones: 3/4`
   - Colores según sesiones restantes:
     - `0 restantes`: Rojo intenso (text-red-600 font-bold)
     - `1 restante`: Rojo (text-red-600 font-semibold)
     - `2 restantes`: Naranja (text-orange-600 font-semibold)
     - `3+ restantes`: Terracota (text-terracota font-semibold)

5. **📊 Barra de Progreso**
   - Cálculo: `progreso = ((sesiones_totales - sesiones_restantes) / sesiones_totales) * 100`
   - Implementación:
     ```typescript
     const progresoBono = computed(() => {
       if (!bonoActivo.value) return 0
       const total = bonoActivo.value.total_sesiones
       const restantes = bonoActivo.value.sesiones_restantes
       if (total === 0) return 0
       const usadas = total - restantes
       return Math.round((usadas / total) * 100)
     })
     ```
   - **Colores según ESTADO del bono** (no según porcentaje):
     - `activo`: Verde (bg-green-500) 🟢
     - `pendiente`: Amarillo (bg-yellow-500) 🟡
     - `vencido`: Rojo (bg-red-500) 🔴
     - `completado`: Gris (bg-gray-400) ⚪

---

## 🔧 Archivos Modificados

### 1. `/components/PacienteCard.vue`

#### **Template**
- ❌ Removida sección "Frecuencia de sesiones"
- ✅ Agregada sección "Bono Activo" con diseño destacado
- ✅ Incluye todos los campos solicitados (🎟️💰📆🧭📊)

#### **Script (Computed Properties)**

**Removidos:**
```typescript
❌ frecuenciaTexto
❌ bonoColorClass
```

**Agregados:**
```typescript
✅ tipoBonoTexto - Mapea tipo a texto legible
✅ tipoBonoClasses - Clases CSS según tipo
✅ estadoBonoTexto - Mapea estado a texto legible
✅ estadoBonoClasses - Clases CSS según estado
✅ fechaFinTexto - Formatea fecha en español
✅ fechaFinClasses - Colores según proximidad
✅ sesionesUsadas - Calcula sesiones completadas
✅ sesionesTotales - Total de sesiones del bono
✅ sesionesColorClass - Colores según restantes
✅ progresoBono - Calcula porcentaje de progreso
✅ progresoBonoTexto - Convierte número a string
✅ progresoBonoColorClass - Color según ESTADO
```

### 2. `/pages/terapeuta/pacientes.vue`

#### **Query de Bonos Actualizada**
```typescript
// ANTES
.select('id, total_sesiones, sesiones_restantes, created_at')

// DESPUÉS
.select('id, tipo, estado, total_sesiones, sesiones_restantes, fecha_fin, created_at')
```

#### **Objeto bono_activo Enriquecido**
```typescript
bono_activo: bonoActivo ? {
  tipo: bonoActivo.tipo,              // ✅ NUEVO
  estado: bonoActivo.estado,          // ✅ NUEVO
  fecha_fin: bonoActivo.fecha_fin,    // ✅ NUEVO
  sesiones_completadas: sesionesCompletadasBono,
  total_sesiones: totalSesionesBono,
  sesiones_restantes: bonoActivo.sesiones_restantes
} : null
```

---

## 🎨 Diseño Visual

### Paleta de Colores
- **Terracota**: `#D8AFA0` - Color principal de marca
- **Rosa**: `#ECC8BA` - Color secundario suave
- **Café**: `#5D4A44` - Color de texto principal

### Tipografía
- **Títulos**: Lora (serif) - Elegante y profesional
- **Texto**: Lato (sans-serif) - Legible y moderna

### Efectos
- **Fondo degradado**: `bg-gradient-to-br from-terracota/5 to-rosa/10`
- **Borde suave**: `border border-terracota/20`
- **Sombras**: Sistema de sombras consistente
- **Transiciones**: `transition-all duration-500` en barra de progreso

---

## 📐 Estructura de la Tarjeta (Orden Visual)

1. **Header** (Avatar + Nombre + Estado del vínculo)
2. **Área de acompañamiento** (si existe)
3. **Información de sesiones** (última, próxima, total completadas)
4. **🎟️ BONO ACTIVO** (sección destacada) ← **NUEVO**
   - Tipo + Estado
   - Fecha fin
   - Sesiones X/Y
   - Barra de progreso
5. **Indicador de evolución general**
6. **Alertas** (críticas, advertencias, inactividad)

---

## 🧪 Testing Manual

### Casos a Verificar:

#### 1. Paciente sin bono
- ✅ No muestra la sección de bono
- ✅ Solo muestra información de sesiones estándar

#### 2. Paciente con bono activo
- ✅ Muestra sección destacada con fondo degradado
- ✅ Badge de tipo correcto según valor (a_demanda/quincenal/semanal)
- ✅ Badge de estado verde (activo)
- ✅ Fecha fin formateada correctamente
- ✅ Contador de sesiones X/Y preciso
- ✅ Barra de progreso verde (activo)

#### 3. Paciente con bono pendiente
- ✅ Badge amarillo "Pendiente"
- ✅ Barra de progreso amarilla

#### 4. Paciente con bono vencido
- ✅ Badge rojo "Vencido"
- ✅ Fecha fin en rojo intenso
- ✅ Barra de progreso roja

#### 5. Sesiones críticas (1 restante)
- ✅ Texto de sesiones en rojo intenso
- ✅ Alerta crítica debajo de evolución
- ✅ Animación pulse-subtle

#### 6. Sesiones advertencia (2 restantes)
- ✅ Texto de sesiones en naranja
- ✅ Alerta de advertencia en ámbar

#### 7. Fecha fin próxima (≤7 días)
- ✅ Fecha en naranja intenso

---

## 🚀 Mejoras Implementadas

### UX Enhancements
1. **Jerarquía visual clara**: Bono más prominente con fondo degradado
2. **Sistema de colores semafórico**: Fácil identificación de estados críticos
3. **Información consolidada**: Todo sobre el bono en una sección
4. **Progreso visual**: Barra de progreso animada con colores dinámicos
5. **Consistencia**: Mismos emojis y estilos que en vista de detalle

### Performance
- Todos los cálculos en computed properties (reactivos y cacheados)
- Sin llamadas adicionales a la base de datos
- Renderizado condicional eficiente (`v-if="bonoActivo"`)

### Mantenibilidad
- Código organizado con comentarios claros
- Computed properties bien nombradas y documentadas
- Mapeos centralizados (tipoMap, estadoMap, classMap)
- Fácil de extender con nuevos estados o tipos

---

## 🔄 Migración

### ¿Qué pasa con datos antiguos?

#### Pacientes con `frecuencia` pero sin `tipo_bono`
- ✅ La migración SQL ya ejecutada añadió `tipo_bono` a todos los pacientes existentes
- ✅ Si hay inconsistencias, se puede ejecutar:
  ```sql
  UPDATE pacientes 
  SET tipo_bono = frecuencia 
  WHERE tipo_bono IS NULL AND frecuencia IS NOT NULL;
  ```

#### Bonos sin `tipo`
- ✅ Los bonos toman el `tipo_bono` del paciente al crearse
- ✅ Bonos antiguos pueden actualizarse:
  ```sql
  UPDATE bonos b
  SET tipo = p.tipo_bono
  FROM pacientes p
  WHERE b.paciente_id = p.id AND b.tipo IS NULL;
  ```

---

## 📝 Notas Técnicas

### Cálculo de Progreso
```typescript
// Fórmula implementada
progreso = ((sesiones_totales - sesiones_restantes) / sesiones_totales) * 100

// Ejemplo:
// Bono quincenal: 2 sesiones totales
// Sesiones restantes: 1
// Progreso: ((2 - 1) / 2) * 100 = 50%
```

### Mapeo de Tipos
```typescript
const tipoMap = {
  'a_demanda': 'A demanda',     // 1 sesión
  'quincenal': 'Quincenal',     // 2 sesiones/mes
  'semanal': 'Semanal'          // 4 sesiones/mes
}
```

### Mapeo de Estados
```typescript
const estadoMap = {
  'activo': 'Activo',           // Bono en uso
  'pendiente': 'Pendiente',     // Esperando pago
  'vencido': 'Vencido',         // Fecha fin superada
  'completado': 'Completado'    // Todas las sesiones usadas
}
```

---

## 🎯 Resultado Final

### Antes (con frecuencia)
```
🔄 Frecuencia: Quincenal
📅 Última sesión: Hace 5 días
🔔 Próxima: mar, 15 dic
💬 12 sesiones completadas
🎫 Bono: 3/4 (1 pendientes)
```

### Después (con bono destacado)
```
📅 Última sesión: Hace 5 días
🔔 Próxima: mar, 15 dic
💬 12 sesiones completadas

┌─────────────────────────────────────┐
│  🎟️ Bono: [Quincenal]  💰 [Activo] │
│  📆 Fin: 31 dic 2024                │
│  🧭 Sesiones: 3/4                   │
│  Progreso del bono        75%       │
│  ████████████████░░░░░░              │
└─────────────────────────────────────┘
```

---

## ✅ Checklist de Validación

- [x] Campo "Frecuencia" eliminado
- [x] Sección de bono con fondo degradado
- [x] 🎟️ Tipo de bono visible con badge de color
- [x] 💰 Estado del bono con colores semafóricos
- [x] 📆 Fecha fin formateada y con colores dinámicos
- [x] 🧭 Contador de sesiones X/Y
- [x] 📊 Barra de progreso con color según estado
- [x] Cálculo de progreso correcto
- [x] Query actualizada con campos nuevos (tipo, estado, fecha_fin)
- [x] Sin errores de TypeScript
- [x] Consistencia con paleta de colores
- [x] Responsive design mantenido
- [x] Alertas de bono crítico/advertencia funcionando

---

## 🎓 Aprendizajes

1. **Jerarquía Visual**: Usar fondos degradados y bordes para destacar información crítica
2. **Sistema de Colores Semafórico**: Verde/Amarillo/Rojo facilita comprensión instantánea
3. **Progreso Basado en Estado**: Más útil mostrar color según estado que según porcentaje
4. **Información Consolidada**: Agrupar datos relacionados mejora escaneo visual
5. **Computed Properties Organizadas**: Facilita mantenimiento y debugging

---

## 🔗 Archivos Relacionados

- `/components/PacienteCard.vue` - Componente de tarjeta optimizado
- `/pages/terapeuta/pacientes.vue` - Vista principal con query actualizada
- `/pages/terapeuta/pacientes/[id].vue` - Vista de detalle (ya tenía tipo_bono)
- `/components/ModalNuevoPaciente.vue` - Modal con tipo_bono
- `/components/ModalEditarPaciente.vue` - Modal con tipo_bono
- `/supabase/migrations/20241027_add_tipo_bono_to_pacientes.sql` - Migración

---

**Fecha de completación**: 2024-01-XX
**Desarrollado por**: GitHub Copilot
**Estado**: ✅ Completado y validado
