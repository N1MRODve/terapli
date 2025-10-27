# 🚀 Sistema de Citas - Guía Rápida de Inicio

> **Tiempo estimado:** 15 minutos  
> **Nivel:** Principiante

## ⚡ Inicio Rápido en 5 Pasos

### 1️⃣ Ejecutar la Migration SQL

```bash
# Opción A: Desde terminal (si tienes acceso directo)
psql "tu-connection-string" < supabase/migrations/20251026_sistema_citas_completo.sql

# Opción B: Desde Supabase Dashboard
# 1. Ir a SQL Editor
# 2. Copiar el contenido del archivo 20251026_sistema_citas_completo.sql
# 3. Ejecutar
```

### 2️⃣ Crear tu Primer Terapeuta

```sql
INSERT INTO terapeutas (
    nombre_completo, 
    email, 
    telefono,
    especialidad,
    activo
) VALUES (
    'Dra. Karen González',
    'karen@psicologakarem.com',
    '+34 612 345 678',
    'Psicología Clínica',
    true
) RETURNING id;
```

**Guarda el ID que te devuelve** - lo necesitarás.

### 3️⃣ Verificar que Todo Funciona

```sql
-- ✅ Verificar tablas creadas
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('terapeutas', 'citas', 'bonos');

-- ✅ Verificar triggers
SELECT tgname FROM pg_trigger 
WHERE tgname LIKE '%cita%' OR tgname LIKE '%bono%';

-- ✅ Verificar RLS
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public';
```

### 4️⃣ Usar el Composable en tu Componente

```vue
<script setup>
import { useCitasNuevo } from '~/composables/useCitasNuevo'

const { 
  getCitas, 
  crearCita, 
  verificarBonoActivo 
} = useCitasNuevo()

// Cargar citas al montar
const citas = ref([])
const cargando = ref(false)

onMounted(async () => {
  cargando.value = true
  citas.value = await getCitas()
  cargando.value = false
})

// Crear una cita
const nuevaCita = async () => {
  const resultado = await crearCita({
    paciente_id: 'uuid-del-paciente',
    fecha: '2025-10-27',
    hora_inicio: '10:00',
    hora_fin: '11:00',
    modalidad: 'presencial',
    estado: 'confirmada'
  })
  
  if (resultado.success) {
    // ✅ Cita creada
    citas.value = await getCitas() // Recargar
  } else {
    // ❌ Error
    alert(resultado.error)
  }
}
</script>

<template>
  <div>
    <button @click="nuevaCita">Crear Cita</button>
    
    <div v-if="cargando">Cargando...</div>
    
    <div v-for="cita in citas" :key="cita.id">
      {{ cita.fecha_cita }} - {{ cita.hora_inicio }}
    </div>
  </div>
</template>
```

### 5️⃣ Probar el Descuento Automático

```typescript
// Marcar cita como realizada
const completar = async (citaId: string) => {
  const resultado = await actualizarEstadoCita(citaId, 'realizada')
  
  if (resultado.success) {
    console.log('✅ Sesión descontada automáticamente!')
    console.log(resultado.message)
  }
}
```

---

## 🎯 Casos de Uso Comunes

### Caso 1: Crear Cita con Bono

```typescript
const agendarConBono = async (pacienteId: string) => {
  // 1. Verificar bono
  const bono = await verificarBonoActivo(pacienteId)
  
  if (!bono.tiene_bono) {
    return alert('⚠️ Este paciente no tiene bono activo')
  }
  
  if (bono.sesiones_restantes === 0) {
    return alert('⚠️ El bono no tiene sesiones disponibles')
  }
  
  // 2. Crear cita
  const resultado = await crearCita({
    paciente_id: pacienteId,
    fecha: '2025-10-27',
    hora_inicio: '10:00',
    hora_fin: '11:00',
    modalidad: 'online',
    estado: 'confirmada',
    descontar_de_bono: true,  // ✅ Esto activa el descuento
    bono_id: bono.bono_id
  })
  
  if (resultado.success) {
    console.log(`✅ Cita creada! Sesiones restantes: ${bono.sesiones_restantes - 1}`)
  }
}
```

### Caso 2: Verificar Disponibilidad Antes de Agendar

```typescript
const verificarYAgendar = async () => {
  // 1. Verificar si el horario está libre
  const disponible = await verificarDisponibilidadTerapeuta(
    terapeutaId,
    '2025-10-27',
    '10:00',
    '11:00'
  )
  
  if (!disponible) {
    return alert('❌ Este horario ya está ocupado')
  }
  
  // 2. Si está disponible, agendar
  const resultado = await crearCita({...})
}
```

### Caso 3: Mostrar Alerta cuando Quedan Pocas Sesiones

```typescript
const mostrarAlertaBono = async (pacienteId: string) => {
  const bono = await verificarBonoActivo(pacienteId)
  
  if (bono.tiene_bono) {
    if (bono.sesiones_restantes <= 1) {
      return {
        tipo: 'error',
        mensaje: '🔴 ¡Última sesión! Renovar bono urgentemente'
      }
    } else if (bono.sesiones_restantes <= 3) {
      return {
        tipo: 'warning',
        mensaje: `⚠️ Quedan ${bono.sesiones_restantes} sesiones. Considerar renovación`
      }
    }
  }
  
  return null
}
```

### Caso 4: Obtener Citas de Hoy

```typescript
const citasDeHoy = async () => {
  const hoy = new Date().toISOString().split('T')[0]
  const citas = await getCitasPorDia(hoy)
  
  return citas.sort((a, b) => 
    a.hora_inicio.localeCompare(b.hora_inicio)
  )
}
```

---

## 🔍 Consultas SQL Útiles

### Ver todas las citas de hoy

```sql
SELECT 
    c.hora_inicio,
    c.hora_fin,
    c.estado,
    p.metadata->>'nombre_completo' as paciente,
    t.nombre_completo as terapeuta
FROM citas c
JOIN pacientes p ON p.id = c.paciente_id
JOIN terapeutas t ON t.id = c.terapeuta_id
WHERE c.fecha_cita = CURRENT_DATE
ORDER BY c.hora_inicio;
```

### Ver bonos con pocas sesiones

```sql
SELECT 
    p.metadata->>'nombre_completo' as paciente,
    b.sesiones_restantes,
    b.total_sesiones,
    b.estado
FROM bonos b
JOIN pacientes p ON p.id = b.paciente_id
WHERE b.estado = 'activo'
  AND b.sesiones_restantes <= 3
ORDER BY b.sesiones_restantes ASC;
```

### Ver citas pendientes de la semana

```sql
SELECT 
    fecha_cita,
    hora_inicio,
    estado,
    metadata->>'nombre_completo' as paciente
FROM vista_citas_completas
WHERE fecha_cita BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  AND estado IN ('pendiente', 'confirmada')
ORDER BY fecha_cita, hora_inicio;
```

---

## ⚠️ Errores Comunes y Soluciones

### Error: "Cannot find name 'useCitasNuevo'"

**Solución:** Renombra el composable o importa correctamente
```typescript
// Opción 1: Usar el nombre correcto
import { useCitasNuevo } from '~/composables/useCitasNuevo'

// Opción 2: Si ya existe useCitas.ts, renombrar las funciones
// y copiar las nuevas funciones a ese archivo
```

### Error: Tipos de TypeScript no actualizados

**Solución:** Regenerar tipos
```bash
# Desde el proyecto
npx supabase gen types typescript --project-id TU_PROJECT_ID > types/database.types.ts

# O si usas el CLI local
supabase gen types typescript --local > types/database.types.ts
```

### Error: "Table 'citas' does not exist"

**Solución:** Ejecutar la migration
```bash
# Verificar que se ejecutó correctamente
psql "connection-string" -c "\dt citas"

# Si no existe, ejecutar de nuevo el archivo SQL
```

---

## 📊 Dashboard Rápido con Vue

```vue
<script setup>
const { getCitas, verificarBonoActivo } = useCitasNuevo()

const stats = ref({
  hoy: 0,
  semana: 0,
  bonosActivos: 0,
  bonosBajos: 0
})

const calcularStats = async () => {
  const todasCitas = await getCitas()
  const hoy = new Date().toISOString().split('T')[0]
  const finSemana = new Date()
  finSemana.setDate(finSemana.getDate() + 7)
  const finSemanaStr = finSemana.toISOString().split('T')[0]
  
  stats.value.hoy = todasCitas.filter(c => 
    c.fecha_cita === hoy && c.estado !== 'cancelada'
  ).length
  
  stats.value.semana = todasCitas.filter(c => 
    c.fecha_cita >= hoy && 
    c.fecha_cita <= finSemanaStr &&
    c.estado !== 'cancelada'
  ).length
}

onMounted(() => {
  calcularStats()
})
</script>

<template>
  <div class="grid grid-cols-4 gap-4">
    <div class="stat-card">
      <h3>Citas Hoy</h3>
      <p class="text-3xl">{{ stats.hoy }}</p>
    </div>
    
    <div class="stat-card">
      <h3>Esta Semana</h3>
      <p class="text-3xl">{{ stats.semana }}</p>
    </div>
    
    <div class="stat-card">
      <h3>Bonos Activos</h3>
      <p class="text-3xl">{{ stats.bonosActivos }}</p>
    </div>
    
    <div class="stat-card">
      <h3>Bonos por Renovar</h3>
      <p class="text-3xl text-red-500">{{ stats.bonosBajos }}</p>
    </div>
  </div>
</template>
```

---

## ✅ Checklist de Implementación

- [ ] ✅ Migration SQL ejecutada
- [ ] ✅ Terapeuta(s) creados
- [ ] ✅ Tipos TypeScript regenerados
- [ ] ✅ Composable importado en componente
- [ ] ✅ Primera cita de prueba creada
- [ ] ✅ Descuento automático probado
- [ ] ✅ Validaciones funcionando
- [ ] ✅ RLS configurado correctamente

---

## 🆘 ¿Necesitas Ayuda?

1. **Revisa la documentación completa:** `SISTEMA_CITAS_DOCUMENTACION.md`
2. **Verifica los logs de Supabase:** SQL Editor → Logs
3. **Prueba las consultas SQL directamente** antes de usar el composable
4. **Revisa los triggers:** Asegúrate que están habilitados

---

## 🎉 ¡Listo!

Ahora tienes un sistema completo de gestión de citas. Los triggers se encargan automáticamente de:

- ✅ Validar disponibilidad
- ✅ Verificar saldo de bonos
- ✅ Descontar sesiones
- ✅ Actualizar estados
- ✅ Registrar auditoría

**¡A programar! 🚀**
