# 🎫 Integración de Bonos con Sistema de Citas

## Resumen Ejecutivo

Se ha completado la integración del sistema de bonos con la agenda de citas, permitiendo el descuento automático de sesiones cuando se completa una cita y generando alertas cuando un paciente tiene pocas sesiones restantes.

## ✅ Características Implementadas

### 1. **Descuento Automático de Sesiones**
- Cuando se marca una cita como "completada", el sistema verifica automáticamente si debe descontar del bono
- Solo descuenta si la cita tiene `descontar_de_bono = true`
- Actualiza el contador de sesiones restantes en tiempo real

### 2. **Sistema de Alertas Visuales**
- Componente `AlertaBono.vue` con diseño profesional
- Alertas diferenciadas por color:
  - **Ámbar**: 1-2 sesiones restantes (⚠️ advertencia)
  - **Verde**: Última sesión completada (🎉 celebración)
- Auto-cierre después de 10 segundos
- Botón para notificar al paciente (preparado para sistema futuro)

### 3. **Integración en Modal de Nueva Cita**
- Muestra información del bono activo al seleccionar paciente
- Indica sesiones disponibles con código de colores
- Checkbox para activar/desactivar descuento de bono
- Alertas cuando quedan ≤2 sesiones
- Pre-selecciona automáticamente el descuento si hay bono activo

### 4. **Vista en Agenda**
- Botón "✓ Completar" en citas confirmadas
- Alerta flotante se muestra automáticamente después de completar
- Información contextual del paciente en la alerta
- Opción para notificar al paciente sobre renovación

---

## 📁 Archivos Modificados/Creados

### Creados:
1. **`components/AlertaBono.vue`**
   - Componente de alerta visual para bonos
   - Props: mostrar, sesionesRestantes, pacienteNombre, pacienteId
   - Emits: cerrar, notificar
   - Transiciones suaves de entrada/salida

### Modificados:
1. **`composables/useCitas.ts`**
   - ✅ Interfaces extendidas (Cita + Bono)
   - ✅ `actualizarEstadoCita()` - Devuelve resultado con alerta
   - ✅ `procesarCompletacionCita()` - Lógica de descuento
   - ✅ `obtenerBonoActivo()` - Obtiene bono del paciente
   - ✅ `descontarSesionDeBono()` - Decrementa sesiones
   - ✅ `verificarBonoActivo()` - Verifica disponibilidad

2. **`components/ModalNuevaCita.vue`**
   - ✅ Estado `infoBono` para tracking
   - ✅ Checkbox `descontar_de_bono` en formulario
   - ✅ Panel informativo de bono activo
   - ✅ Alertas visuales cuando quedan pocas sesiones
   - ✅ Auto-selección de descuento si hay bono

3. **`pages/terapeuta/agenda.vue`**
   - ✅ Importación de `AlertaBono` component
   - ✅ Estado `alertaBono` para control de alertas
   - ✅ `marcarComoCompletada()` - Procesa y muestra alerta
   - ✅ `notificarPaciente()` - Placeholder para notificaciones
   - ✅ Integración con `actualizarEstadoCita()`

---

## 🎨 Experiencia de Usuario

### Flujo: Crear Nueva Cita con Bono

```
1. Click en "Nueva Cita" → Modal se abre
2. Buscar/seleccionar paciente
3. Sistema verifica bono automáticamente
   ↓
   SI TIENE BONO:
   - Muestra panel verde con información
   - "🎫 Bono activo: X sesiones disponibles"
   - Checkbox pre-seleccionado
   - Alerta ámbar si ≤2 sesiones
   ↓
   NO TIENE BONO:
   - Muestra "💳 Sin bono activo - Sesión por pago individual"
   - Checkbox deshabilitado
4. Completar detalles de la cita
5. Guardar
```

### Flujo: Completar Cita con Bono

```
1. Vista de día → Cita con estado "confirmada"
2. Click en "✓ Completar"
3. Sistema procesa:
   - Marca cita como completada
   - Busca bono activo
   - Descuenta 1 sesión
   - Verifica sesiones restantes
   ↓
   SI QUEDAN 0-1 SESIONES:
   - Muestra AlertaBono (esquina superior derecha)
   - Información del paciente
   - Mensaje contextual
   - Opción "📱 Notificar al paciente"
   ↓
   ACTUALIZACIÓN:
   - Bono actualizado en tiempo real
   - Vista de agenda recargada
   - Próxima cita ya mostrará nuevas sesiones restantes
```

---

## 🎯 Datos Demo

### Bonos de Prueba:
```typescript
paciente-1: 2 sesiones restantes → Genera alerta ⚠️
paciente-2: 1 sesión restante → Genera alerta ⚠️
paciente-3: 5 sesiones restantes → Sin alerta
```

### Citas con Bono:
- 7 citas demo creadas
- Variedad de estados y tipos
- Algunas con `descontar_de_bono: true`

---

## 🔧 Configuración Técnica

### Interface Cita (extendida):
```typescript
interface Cita {
  // ... campos existentes
  bono_id?: string              // ID del bono a descontar
  descontar_de_bono?: boolean   // Flag para activar descuento
}
```

### Interface Bono (nueva):
```typescript
interface Bono {
  id: string
  paciente_id: string
  total_sesiones: number
  sesiones_restantes: number
  precio_total: number
  estado: 'activo' | 'completado' | 'cancelado'
  created_at: string
}
```

### Resultado de actualizarEstadoCita:
```typescript
{
  success: boolean
  alerta?: boolean              // true si ≤1 sesiones
  mensaje?: string              // Mensaje descriptivo
  sesiones_restantes?: number   // Sesiones después de descuento
}
```

---

## 🚀 Próximos Pasos (Producción)

### 1. Base de Datos
```sql
-- Agregar campos a tabla citas
ALTER TABLE citas 
  ADD COLUMN bono_id UUID REFERENCES bonos(id),
  ADD COLUMN descontar_de_bono BOOLEAN DEFAULT false;

-- Verificar tabla bonos
CREATE TABLE IF NOT EXISTS bonos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id),
  total_sesiones INTEGER NOT NULL,
  sesiones_restantes INTEGER NOT NULL,
  precio_total DECIMAL(10,2) NOT NULL,
  estado VARCHAR(20) DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_bonos_paciente ON bonos(paciente_id);
CREATE INDEX idx_bonos_estado ON bonos(estado);
CREATE INDEX idx_citas_bono ON citas(bono_id);
```

### 2. Modo Producción
1. Cambiar `MODO_DEMO = false` en useCitas.ts
2. Descomentar queries reales de Supabase
3. Implementar transacciones para atomicidad
4. Agregar logs de auditoría

### 3. Sistema de Notificaciones
- Email automático cuando ≤1 sesión
- WhatsApp/SMS opcional
- Recordatorios programados
- Plantillas personalizables

### 4. Reportes y Analytics
- Dashboard de uso de bonos
- Predicción de renovaciones
- Análisis de conversión
- Métricas por terapeuta

---

## 📊 Beneficios del Sistema

### Para el Terapeuta:
- ✅ Gestión automática, sin cálculos manuales
- ✅ Alertas proactivas para contactar pacientes
- ✅ Vista clara del estado de cada paciente
- ✅ Prevención de conflictos por sesiones agotadas

### Para el Paciente:
- ✅ Transparencia total sobre sesiones restantes
- ✅ Notificaciones oportunas para renovar
- ✅ No hay sorpresas en la última sesión
- ✅ Continuidad en el proceso terapéutico

### Para el Negocio:
- ✅ Aumenta tasa de renovación de bonos
- ✅ Reduce sesiones perdidas por falta de seguimiento
- ✅ Mejora experiencia del cliente
- ✅ Datos para optimizar paquetes

---

## 🐛 Testing

### Casos de Prueba:
1. ✅ Crear cita con paciente sin bono
2. ✅ Crear cita con paciente con bono activo
3. ✅ Completar cita con descuento de bono
4. ✅ Completar cita sin descuento (checkbox desmarcado)
5. ✅ Alerta cuando queda 1 sesión
6. ✅ Alerta cuando se completa última sesión
7. ✅ Comportamiento cuando bono ya está agotado
8. ✅ Múltiples citas del mismo paciente en un día

### Validaciones:
- ✅ No se puede descontar de bono inexistente
- ✅ No se puede descontar si sesiones_restantes = 0
- ✅ Checkbox deshabilitado si no hay bono
- ✅ Contador no puede ser negativo
- ✅ Alerta se cierra automáticamente después de 10s

---

## 📝 Notas de Desarrollo

### Decisiones de Diseño:
1. **Checkbox manual vs automático**: Elegimos checkbox para dar control al terapeuta (por si es sesión de evaluación inicial, etc.)
2. **Pre-selección del checkbox**: Si hay bono activo, se pre-marca para optimizar el flujo común
3. **Umbral de alerta**: Se decidió ≤1 sesión para dar tiempo al paciente de renovar
4. **Auto-cierre de alerta**: 10 segundos para no interrumpir el flujo de trabajo

### Limitaciones Actuales:
- Sistema de notificaciones es placeholder (alert JS)
- Bonos no tienen fecha de expiración
- No hay historial de descuentos
- Un paciente solo puede tener 1 bono activo a la vez

### Mejoras Futuras Sugeridas:
- Permitir múltiples bonos simultáneos (ej: individual + pareja)
- Fecha de expiración por bono
- Historial detallado de uso
- Renovación automática opcional
- Bonos compartidos (familia)
- Descuentos por referidos

---

## 🎓 Guía Rápida para Terapeutas

### ¿Cómo sé si un paciente tiene bono?
Al crear una cita, el sistema muestra automáticamente un panel verde con "🎫 Bono activo" si el paciente tiene sesiones disponibles.

### ¿Qué pasa si completo una cita sin marcar el checkbox?
La sesión NO se descontará del bono. El paciente la pagará de forma individual.

### ¿Cuándo debo contactar al paciente?
El sistema te alertará automáticamente cuando quede 1 sesión o menos. También puedes ver el contador en cada cita.

### ¿Puedo cambiar mi decisión después?
Por ahora no, pero en producción se implementará un sistema de ajustes con auditoría.

### ¿Qué pasa si el bono se agota?
- El sistema marca el bono como "completado"
- Próximas citas se mostrarán sin bono
- El paciente puede adquirir uno nuevo

---

## 📞 Soporte

Para dudas sobre la implementación técnica:
- Revisar código en: `composables/useCitas.ts`
- Documentación completa: `CITAS_GUIA_RAPIDA.md`
- Componente visual: `components/AlertaBono.vue`

---

**Última actualización**: ${new Date().toLocaleDateString('es-ES')}
**Estado**: ✅ Completado en Modo Demo
**Próximo hito**: Migración a producción con Supabase
