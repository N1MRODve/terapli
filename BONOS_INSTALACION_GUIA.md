# 🚀 Guía de Instalación - Sistema de Bonos

## 📋 Pre-requisitos

- ✅ Acceso a Supabase Dashboard
- ✅ Base de datos con tablas `profiles`, `pacientes`, `psicologas`, `citas`
- ✅ Función `is_staff()` implementada (o se creará automáticamente)
- ✅ PostgreSQL 12+ con extensión `uuid-ossp`

---

## 📦 Paso 1: Ejecutar Schema de Base de Datos

### Archivo: `20251027_sistema_bonos_completo.sql` (1138 líneas)

**Estado**: ✅ **YA EJECUTADO** (según conversación)

Si necesitas re-ejecutar o verificar:

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Crea nueva query
3. Copia contenido de `20251027_sistema_bonos_completo.sql`
4. Click en **RUN**

**Resultado esperado**:
```
✅ Tablas: bonos (actualizada), pagos_bonos, renovaciones_bonos
✅ ENUMs: estado_bono (8 valores), tipo_bono (5 valores)
✅ Vistas: vista_dashboard_bonos_completo, vista_bonos_estadisticas
✅ Funciones dashboard: 6 funciones de métricas
✅ Políticas RLS base
```

---

## ⚙️ Paso 2: Ejecutar Lógica de Negocio

### Archivo: `20251027_bonos_logica_negocio.sql` (950+ líneas)

**Estado**: ⏳ **PENDIENTE** (siguiente paso crítico)

### Instrucciones de Ejecución

1. Abre **Supabase Dashboard** → **SQL Editor**
2. Crea nueva query con nombre descriptivo: `Sistema Bonos - Lógica Negocio v3.0`
3. Copia **TODO** el contenido del archivo
4. Click en **RUN**
5. Espera confirmación (puede tardar 5-10 segundos)

### Verificación de Éxito

Deberías ver en los logs:

```sql
✅ Constraint bonos_sesiones_restantes_no_negativo agregado
✅ Constraint bonos_sesiones_logicas agregado
✅ Constraint bonos_fechas_logicas agregado
✅ Columna consumo_registrado agregada a citas
✅ Índice idx_citas_consumo_bono creado

🎉 ========================================================================
   LÓGICA DE NEGOCIO DE BONOS IMPLEMENTADA CORRECTAMENTE
   ========================================================================

✅ CONSTRAINTS AGREGADOS:
   • sesiones_restantes >= 0 (no negativos)
   • sesiones_restantes <= sesiones_totales
   • fecha_fin >= fecha_inicio
   • columna consumo_registrado en citas

✅ FUNCIONES DE NEGOCIO:
   • decrementar_sesion_bono()
   • fn_confirmar_pago_bono(p_pago_id)
   • fn_activar_bono_al_pagar()
   • verificar_vencimiento_bonos()
   • crear_renovacion_automatica()
   • fn_renovar_bono_manual()

✅ TRIGGERS ACTIVOS:
   • tr_bono_sesion_usada (citas)
   • trg_activar_bono_al_pagar (pagos_bonos)
   • tr_crear_renovacion_automatica (bonos)
```

### ⚠️ Si Hay Errores

**Error común**: `function is_staff() does not exist`

**Solución**: Crear la función primero:
```sql
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND rol IN ('coordinacion', 'admin', 'administrador')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

Luego re-ejecutar el archivo de lógica de negocio.

---

## 🕐 Paso 3: Configurar pg_cron (Opcional pero Recomendado)

### Habilitar extensión pg_cron

1. Ve a **Supabase Dashboard** → **Database** → **Extensions**
2. Busca `pg_cron`
3. Click en **Enable**

### Programar verificación diaria de vencimientos

```sql
-- Ejecutar en SQL Editor
SELECT cron.schedule(
    'verificar-bonos-vencidos',
    '0 2 * * *',  -- Todos los días a las 2 AM
    'SELECT public.verificar_vencimiento_bonos_simple()'
);
```

**Verificar que se creó**:
```sql
SELECT * FROM cron.job;
```

**Resultado esperado**:
| jobid | schedule | command | active |
|-------|----------|---------|--------|
| 1 | 0 2 * * * | SELECT public.verificar_vencimiento_bonos_simple() | t |

### Ejecutar manualmente para testing
```sql
SELECT public.verificar_vencimiento_bonos();
-- Retorna: { bonos_actualizados: 0, bonos_ids: [] } si no hay vencidos
```

---

## 🧪 Paso 4: Testing Manual

### Test 1: Crear Bono Pendiente

```sql
INSERT INTO public.bonos (
    paciente_id,
    psicologa_id,
    tipo,
    frecuencia,
    sesiones_totales,
    sesiones_restantes,
    fecha_inicio,
    fecha_fin,
    estado,
    monto,
    pagado,
    renovacion_automatica,
    notas
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,  -- Reemplazar con UUID real de paciente
    '00000000-0000-0000-0000-000000000002'::uuid,  -- Reemplazar con UUID real de psicóloga
    'mensual',
    'Una sesión semanal',
    8,
    8,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    'pendiente',
    1500.00,
    false,
    true,  -- renovacion_automatica activa
    'Bono de prueba sistema'
) RETURNING *;
```

**Resultado esperado**: Nuevo bono con `id` generado, `estado = 'pendiente'`

---

### Test 2: Registrar y Confirmar Pago

```sql
-- 1. Registrar pago (reemplazar uuid-del-bono con el ID del paso anterior)
INSERT INTO public.pagos_bonos (
    bono_id,
    monto,
    metodo_pago,
    referencia,
    confirmado,
    fecha_pago
) VALUES (
    'uuid-del-bono',  -- Reemplazar
    1500.00,
    'transferencia',
    'REF-12345',
    false,  -- Aún no confirmado
    CURRENT_DATE
) RETURNING id;

-- 2. Confirmar pago vía RPC
SELECT public.fn_confirmar_pago_bono('uuid-del-pago'::uuid);  -- Reemplazar con ID del pago
```

**Resultado esperado**:
```json
{
  "success": true,
  "mensaje": "Pago confirmado y bono activado exitosamente",
  "bono": {
    "id": "uuid-del-bono",
    "estado": "activo",
    "sesiones_restantes": 8,
    "pagado": true
  }
}
```

**Verificación**:
```sql
SELECT estado, sesiones_restantes, pagado FROM bonos WHERE id = 'uuid-del-bono';
-- estado: 'activo', sesiones_restantes: 8, pagado: true
```

---

### Test 3: Registrar Cita con Bono (Consumo Automático)

```sql
INSERT INTO public.citas (
    paciente_id,
    psicologa_id,
    bono_id,  -- Asociar al bono activo
    fecha,
    hora_inicio,
    hora_fin,
    estado,
    tipo
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,  -- Mismo paciente
    '00000000-0000-0000-0000-000000000002'::uuid,  -- Misma psicóloga
    'uuid-del-bono',  -- Reemplazar
    CURRENT_DATE + INTERVAL '1 day',
    '10:00:00',
    '11:00:00',
    'confirmada',
    'individual'
) RETURNING *;
```

**Resultado esperado**: 
- ✅ Cita creada con `consumo_registrado = true`
- ✅ Trigger automático ejecutó `decrementar_sesion_bono()`

**Verificación**:
```sql
SELECT sesiones_restantes, estado FROM bonos WHERE id = 'uuid-del-bono';
-- sesiones_restantes: 7, estado: 'activo'

SELECT consumo_registrado FROM citas WHERE bono_id = 'uuid-del-bono';
-- consumo_registrado: true
```

---

### Test 4: Completar Bono (Renovación Automática)

```sql
-- Simular consumo de las 7 sesiones restantes
-- (Insertar 7 citas más, o actualizar manualmente para testing rápido)

UPDATE public.bonos 
SET sesiones_restantes = 0, estado = 'completado'
WHERE id = 'uuid-del-bono';

-- El trigger tr_crear_renovacion_automatica debería ejecutarse automáticamente
```

**Resultado esperado**:
- ✅ Bono original: `estado = 'completado'`
- ✅ Nuevo bono creado: `estado = 'pendiente'`, `sesiones_restantes = 8`
- ✅ Registro en `renovaciones_bonos` con `tipo_renovacion = 'automatica'`

**Verificación**:
```sql
-- Ver renovaciones
SELECT 
    r.bono_original_id,
    r.nuevo_bono_id,
    r.tipo_renovacion,
    bo.estado as estado_original,
    bn.estado as estado_nuevo,
    bn.sesiones_restantes
FROM renovaciones_bonos r
JOIN bonos bo ON bo.id = r.bono_original_id
JOIN bonos bn ON bn.id = r.nuevo_bono_id
WHERE r.bono_original_id = 'uuid-del-bono';
```

**Resultado esperado**:
| bono_original_id | nuevo_bono_id | tipo_renovacion | estado_original | estado_nuevo | sesiones_restantes |
|------------------|---------------|-----------------|-----------------|--------------|-------------------|
| uuid-del-bono | uuid-nuevo | automatica | completado | pendiente | 8 |

---

### Test 5: Verificar Vencimiento

```sql
-- Crear bono con fecha_fin en el pasado
INSERT INTO public.bonos (
    paciente_id,
    psicologa_id,
    tipo,
    sesiones_totales,
    sesiones_restantes,
    fecha_inicio,
    fecha_fin,  -- En el pasado
    estado,
    monto,
    pagado
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000002'::uuid,
    'mensual',
    8,
    5,
    CURRENT_DATE - INTERVAL '40 days',
    CURRENT_DATE - INTERVAL '10 days',  -- Venció hace 10 días
    'activo',  -- Aún marcado como activo
    1500.00,
    true
) RETURNING id;

-- Ejecutar verificación de vencimientos
SELECT public.verificar_vencimiento_bonos();
```

**Resultado esperado**:
```json
{
  "bonos_actualizados": 1,
  "bonos_ids": ["uuid-del-bono-vencido"]
}
```

**Verificación**:
```sql
SELECT estado FROM bonos WHERE id = 'uuid-del-bono-vencido';
-- estado: 'vencido'
```

---

## 🔐 Paso 5: Verificar Políticas RLS

### Test de Permisos por Rol

#### Como Paciente

```sql
-- Simular sesión de paciente
SET LOCAL role postgres;
SET LOCAL jwt.claims.sub = 'uuid-paciente';

-- Query
SELECT * FROM bonos;
-- Debería ver: SOLO bonos donde paciente_id = 'uuid-paciente'
```

#### Como Psicóloga

```sql
-- Simular sesión de psicóloga
SET LOCAL jwt.claims.sub = 'uuid-psicologa';

-- Query
SELECT * FROM bonos;
-- Debería ver: SOLO bonos donde psicologa_id = 'uuid-psicologa'
```

#### Como Staff

```sql
-- Simular sesión de coordinadora/admin
-- (Asegúrate que el usuario tenga rol='coordinacion' en profiles)
SET LOCAL jwt.claims.sub = 'uuid-coordinadora';

-- Query
SELECT * FROM bonos;
-- Debería ver: TODOS los bonos
```

---

## 📊 Paso 6: Configurar Dashboard Frontend

### Generar Tipos TypeScript

```bash
cd /Users/dieterlorenzo/psicologakarem/psicokarem
npx supabase gen types typescript --local > types/database.types.ts
```

**Si falla con Exit Code 1**:

Alternativa manual:
```bash
npx supabase login
npx supabase link --project-ref tu-project-ref
npx supabase gen types typescript > types/database.types.ts
```

---

### Crear Composable `useBonos.ts`

Crear archivo: `/composables/useBonos.ts`

```typescript
export const useBonos = () => {
  const supabase = useSupabaseClient()

  // Función RPC: Confirmar pago
  const confirmarPago = async (pagoId: string) => {
    try {
      const { data, error } = await supabase.rpc('fn_confirmar_pago_bono', {
        p_pago_id: pagoId
      })

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error al confirmar pago:', err)
      throw err
    }
  }

  // Obtener bonos del paciente/psicóloga actual
  const obtenerBonosUsuario = async () => {
    const { data, error } = await supabase
      .from('bonos')
      .select(`
        *,
        paciente:pacientes!inner(
          id,
          perfil:profiles(nombre, email)
        ),
        psicologa:psicologas!inner(
          id,
          perfil:profiles(nombre, email)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  // Ver pagos de un bono
  const obtenerPagosBono = async (bonoId: string) => {
    const { data, error } = await supabase
      .from('pagos_bonos')
      .select('*')
      .eq('bono_id', bonoId)
      .order('fecha_pago', { ascending: false })

    if (error) throw error
    return data
  }

  // Ver renovaciones de un bono
  const obtenerRenovaciones = async (bonoId: string) => {
    const { data, error } = await supabase
      .from('renovaciones_bonos')
      .select(`
        *,
        bono_original:bonos!bono_original_id(*),
        bono_nuevo:bonos!nuevo_bono_id(*)
      `)
      .eq('bono_original_id', bonoId)

    if (error) throw error
    return data
  }

  return {
    confirmarPago,
    obtenerBonosUsuario,
    obtenerPagosBono,
    obtenerRenovaciones
  }
}
```

---

### Componente de Ejemplo: Confirmar Pago

```vue
<script setup lang="ts">
const { confirmarPago } = useBonos()
const loading = ref(false)

const props = defineProps<{
  pagoId: string
  bonoId: string
}>()

const handleConfirmar = async () => {
  loading.value = true
  
  try {
    const resultado = await confirmarPago(props.pagoId)
    
    if (resultado.success) {
      if (resultado.bono.estado === 'activo') {
        useToast().success('Pago confirmado. Bono activado exitosamente')
      } else {
        useToast().warning(
          `Pago parcial confirmado. Pendiente: $${resultado.bono.monto_pendiente}`
        )
      }
      
      // Recargar datos
      await refreshNuxtData()
    } else {
      useToast().error(resultado.mensaje)
    }
  } catch (error) {
    useToast().error('Error al confirmar el pago')
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UButton 
    @click="handleConfirmar"
    :loading="loading"
    color="green"
    icon="i-heroicons-check-circle"
  >
    Confirmar Pago
  </UButton>
</template>
```

---

## ✅ Checklist Final de Instalación

### Backend (Supabase)

- [x] ✅ Schema de tablas ejecutado (`20251027_sistema_bonos_completo.sql`)
- [ ] ⏳ Lógica de negocio ejecutada (`20251027_bonos_logica_negocio.sql`) **← TÚ ESTÁS AQUÍ**
- [ ] ⏳ pg_cron configurado
- [ ] ⏳ Tests manuales completados
- [ ] ⏳ Políticas RLS verificadas

### Frontend (Nuxt 3)

- [ ] ⏳ Tipos TypeScript generados
- [ ] ⏳ Composable `useBonos.ts` creado
- [ ] ⏳ Componentes de UI implementados
- [ ] ⏳ Testing de integración

### Documentación

- [x] ✅ `BONOS_SISTEMA_COMPLETADO.md`
- [x] ✅ `BONOS_RPC_CONFIRMAR_PAGO.md`
- [x] ✅ `BONOS_RLS_POLITICAS.md`
- [x] ✅ `BONOS_RESUMEN_EJECUTIVO.md`
- [x] ✅ `BONOS_INSTALACION_GUIA.md` (este archivo)

---

## 🆘 Troubleshooting

### Error: "relation bonos does not exist"
**Causa**: Schema no ejecutado  
**Solución**: Ejecutar primero `20251027_sistema_bonos_completo.sql`

### Error: "function is_staff() does not exist"
**Causa**: Función helper faltante  
**Solución**: Ver sección "Paso 2 - Si Hay Errores"

### Triggers no se ejecutan
**Causa**: Función no tiene `SECURITY DEFINER`  
**Solución**: Re-ejecutar migración de lógica de negocio

### RLS bloquea actualizaciones
**Causa**: Usuario sin permisos staff  
**Solución**: Verificar campo `rol` en tabla `profiles`

---

## 📞 Siguientes Pasos Recomendados

1. **Ahora mismo**: Ejecutar `20251027_bonos_logica_negocio.sql`
2. **Después**: Configurar pg_cron para vencimientos
3. **Testing**: Ejecutar los 5 tests manuales
4. **Frontend**: Generar tipos y crear composable
5. **Deploy**: Staging → Producción

---

**¡Sistema listo para activación! 🚀**

---

**Fecha**: 27 de octubre de 2025  
**Versión**: 3.0  
**Estado**: Documentación completa
