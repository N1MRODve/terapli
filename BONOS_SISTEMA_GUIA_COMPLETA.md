# 🎫 Sistema de Gestión de Bonos - psicologakarem.com

## 📋 Descripción General

Sistema completo para gestionar bonos de sesiones de terapia, incluyendo:
- Creación y gestión de bonos
- Registro y confirmación de pagos
- Renovaciones automáticas y manuales
- Métricas y alertas
- Control de sesiones por bono
- Vencimientos automáticos

---

## 🗂️ Estructura de Archivos

### **Composables**
- `/composables/useBonos.ts` - Lógica de negocio de bonos

### **Componentes**
- `/components/BonoCard.vue` - Tarjeta individual de bono
- `/components/ModalNuevoBono.vue` - Modal para crear bonos
- `/components/ModalPagosBono.vue` - Modal de gestión de pagos
- `/components/ModalRenovacionBono.vue` - Modal para renovar bonos

### **Páginas**
- `/pages/terapeuta/pacientes/[id]/bonos.vue` - Página principal de bonos
- `/pages/terapeuta/pacientes/[id].vue` - Ficha del paciente (integrada)

### **Base de Datos**
- `/supabase/migrations/20251027_bonos_logica_negocio.sql` - Lógica de negocio en Supabase

---

## 🎯 Funcionalidades

### **1. Gestión de Bonos**

#### Crear Bono
```typescript
const { crearBono } = useBonos()

await crearBono({
  paciente_id: 'uuid',
  psicologa_id: 'uuid',
  tipo: 'mensual', // quincenal, mensual, semestral
  frecuencia: 'semanal',
  sesiones_totales: 4,
  sesiones_restantes: 4,
  monto: 200,
  estado: 'pendiente', // pendiente, activo, completado, vencido
  renovacion_automatica: false
})
```

#### Obtener Bonos de un Paciente
```typescript
const { getBonosPorPaciente } = useBonos()
const bonos = await getBonosPorPaciente(pacienteId)
```

#### Actualizar Bono
```typescript
const { actualizarBono } = useBonos()
await actualizarBono(bonoId, { estado: 'activo' })
```

---

### **2. Gestión de Pagos**

#### Registrar Pago
```typescript
const { registrarPago } = useBonos()

await registrarPago(
  bonoId,
  100, // monto
  'transferencia', // metodo_pago
  true // confirmado
)
```

#### Confirmar Pago (RPC)
```typescript
const { confirmarPago } = useBonos()

const resultado = await confirmarPago(pagoId)
// Activa automáticamente el bono si se completa el pago
```

#### Obtener Pagos de un Bono
```typescript
const { getPagosPorBono } = useBonos()
const pagos = await getPagosPorBono(bonoId)
```

---

### **3. Renovaciones**

#### Renovación Manual
```typescript
const { renovarBono } = useBonos()

await renovarBono(
  bonoId,
  'Renovación solicitada por el paciente', // motivo
  4, // nuevas sesiones (opcional)
  200 // nuevo monto (opcional)
)
```

#### Renovación Automática
- Se activa al marcar `renovacion_automatica: true` en el bono
- Cuando el bono se completa o vence, se crea automáticamente uno nuevo
- El trigger `tr_crear_renovacion_automatica` se encarga del proceso

---

### **4. Métricas y Estadísticas**

```typescript
const { calcularMetricas } = useBonos()

const metricas = await calcularMetricas(pacienteId)
// {
//   total: 5,
//   activos: 1,
//   completados: 3,
//   vencidos: 0,
//   pendientes: 1,
//   proximosAVencer: 1,
//   pocasSesiones: 1
// }
```

---

### **5. Helpers**

#### Calcular Porcentaje de Uso
```typescript
const { calcularPorcentajeUso } = useBonos()
const porcentaje = calcularPorcentajeUso(bono) // 75
```

#### Obtener Color del Estado
```typescript
const { getEstadoColor } = useBonos()
const color = getEstadoColor('activo') // 'bg-green-100 text-green-700 border-green-300'
```

#### Obtener Texto del Estado
```typescript
const { getEstadoTexto } = useBonos()
const texto = getEstadoTexto('pendiente') // 'Pendiente de activación'
```

---

## 🔐 Permisos por Rol

### **Psicólogas**
- ✅ Ver bonos de sus pacientes
- ✅ Ver resumen de bonos
- ✅ Ver sesiones restantes
- ❌ No pueden crear bonos
- ❌ No pueden confirmar pagos
- ❌ No pueden gestionar renovaciones

### **Coordinadora**
- ✅ Crear y editar bonos
- ✅ Registrar pagos
- ✅ Confirmar pagos
- ✅ Renovar bonos manualmente
- ✅ Ver todas las métricas
- ✅ Gestionar todos los bonos

### **Administración**
- ✅ Acceso completo
- ✅ Cambiar estados
- ✅ Eliminar bonos
- ✅ Ver todos los pacientes

---

## 🗃️ Esquema de Base de Datos

### **Tabla: bonos**
```sql
CREATE TABLE bonos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES pacientes(id),
  psicologa_id UUID REFERENCES profiles(id),
  tipo TEXT, -- quincenal, mensual, semestral
  frecuencia TEXT,
  sesiones_totales INTEGER NOT NULL,
  sesiones_restantes INTEGER NOT NULL,
  fecha_inicio DATE,
  fecha_fin DATE,
  estado estado_bono NOT NULL, -- pendiente, activo, completado, vencido, cancelado
  monto NUMERIC(10,2),
  pagado BOOLEAN DEFAULT false,
  renovacion_automatica BOOLEAN DEFAULT false,
  notas TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### **Tabla: pagos_bonos**
```sql
CREATE TABLE pagos_bonos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bono_id UUID REFERENCES bonos(id),
  monto NUMERIC(10,2) NOT NULL,
  metodo_pago TEXT, -- efectivo, transferencia, tarjeta, bizum, paypal
  fecha_pago DATE NOT NULL,
  confirmado BOOLEAN DEFAULT false,
  confirmado_por UUID REFERENCES profiles(id),
  fecha_confirmacion TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### **Tabla: renovaciones_bonos**
```sql
CREATE TABLE renovaciones_bonos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bono_original_id UUID REFERENCES bonos(id),
  nuevo_bono_id UUID REFERENCES bonos(id),
  fecha_renovacion DATE NOT NULL,
  renovado_por UUID REFERENCES profiles(id),
  tipo_renovacion TEXT, -- manual, automatica
  motivo TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🔄 Flujo Automático

### **1. Creación de Bono**
```
Crear bono → Estado: pendiente
```

### **2. Confirmación de Pago**
```
Confirmar pago completo → 
  Bono: estado = 'activo' → 
  Sesiones disponibles
```

### **3. Consumo de Sesiones**
```
Registrar cita con bono_id →
  Trigger: decrementar_sesion_bono() →
  sesiones_restantes - 1 →
  Si sesiones_restantes = 0 → estado = 'completado'
```

### **4. Renovación Automática**
```
Bono completado + renovacion_automatica = true →
  Trigger: crear_renovacion_automatica() →
  Crear nuevo bono (estado: pendiente)
```

### **5. Vencimiento**
```
Ejecutar diariamente (pg_cron):
  verificar_vencimiento_bonos() →
  Si fecha_fin < hoy → estado = 'vencido'
```

---

## ⚙️ Configuración de pg_cron

Para verificación diaria de bonos vencidos:

```sql
SELECT cron.schedule(
  'verificar-bonos-vencidos',
  '0 2 * * *', -- 2 AM diario
  'SELECT verificar_vencimiento_bonos_simple()'
);
```

---

## 🎨 Diseño y UX

### **Paleta de Colores por Estado**
- **Pendiente**: 🟡 Amarillo (`bg-yellow-100 text-yellow-700`)
- **Activo**: 🟢 Verde (`bg-green-100 text-green-700`)
- **Completado**: ⚪ Gris (`bg-gray-100 text-gray-600`)
- **Vencido**: 🔴 Rojo (`bg-red-100 text-red-600`)
- **Cancelado**: ⚫ Gris oscuro (`bg-gray-200 text-gray-500`)

### **Alertas**
- ⚠️ Bonos próximos a vencer (< 7 días)
- 📊 Bonos con pocas sesiones (≤ 2 sesiones)
- 💰 Bonos pendientes de pago

---

## 🧪 Ejemplos de Uso

### **Crear un bono mensual**
```vue
<template>
  <button @click="crearBonoMensual">Crear Bono</button>
</template>

<script setup>
const { crearBono } = useBonos()

const crearBonoMensual = async () => {
  try {
    await crearBono({
      paciente_id: pacienteId,
      psicologa_id: psicologaId,
      tipo: 'mensual',
      frecuencia: 'semanal',
      sesiones_totales: 4,
      sesiones_restantes: 4,
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estado: 'pendiente',
      monto: 200,
      renovacion_automatica: true
    })
    
    alert('Bono creado exitosamente')
  } catch (error) {
    console.error('Error:', error)
  }
}
</script>
```

---

## 📱 Navegación

### **Acceder a Bonos**
```
/terapeuta/pacientes → 
  Seleccionar paciente →
  Ficha del paciente →
  Botón "Gestionar Bonos" →
  /terapeuta/pacientes/[id]/bonos
```

---

## 🚀 Próximas Mejoras

1. **Notificaciones automáticas**
   - WhatsApp cuando un bono está por vencer
   - Email de recordatorio de renovación

2. **Dashboard de pagos**
   - Reporte mensual de ingresos
   - Filtros por fecha y terapeuta

3. **Exportación de datos**
   - PDF de comprobante de pago
   - Excel de historial de bonos

4. **Bonos familiares**
   - Compartir sesiones entre varios pacientes
   - Bonos grupales

---

## 📞 Soporte

Para dudas o problemas con el sistema de bonos:
- Revisar logs en consola del navegador
- Verificar permisos RLS en Supabase
- Consultar documentación de triggers en SQL

---

**Última actualización:** 27 de octubre de 2025
**Versión:** 1.0
**Autor:** GitHub Copilot
