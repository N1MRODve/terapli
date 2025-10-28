# ⚡ Sistema Citas y Bonos - Guía de Implementación Rápida

> **5 minutos para tener el sistema funcionando**

---

## 🚀 Paso 1: Ejecutar Migración (2 min)

### Opción A: Desde Supabase Dashboard

1. Abre el Dashboard de Supabase
2. Ve a **SQL Editor**
3. Copia y pega el contenido de `supabase/migrations/20251028_sistema_citas_bonos_consolidado.sql`
4. Ejecuta (Run)
5. Verifica que veas el mensaje: `✅ SISTEMA DE CITAS Y BONOS CONSOLIDADO INSTALADO`

### Opción B: Desde CLI

```bash
cd psicokarem
supabase db push
```

### Verificar Instalación

```sql
SELECT * FROM public.verificar_sistema_citas_bonos();
```

Deberías ver 6 filas con estado `✅`:

```
✅ Tabla movimientos_bonos
✅ Función actualizar_bono_por_cita()
✅ Trigger trg_actualizar_bono_por_cita
✅ Función completar_cita()
✅ Columna citas.consumo_registrado
✅ RLS movimientos_bonos
```

---

## 💻 Paso 2: Crear Composable (1 min)

Crea `composables/useCitas.ts`:

```typescript
import { useSupabaseClient } from '#imports'

export const useCitas = () => {
  const supabase = useSupabaseClient()

  const completarCita = async (citaId: string) => {
    const { data, error } = await supabase.rpc('completar_cita', {
      p_cita_id: citaId
    })
    
    if (error) throw error
    if (!data?.success) throw new Error(data?.message)
    
    return data
  }

  const obtenerHistorialBono = async (bonoId: string) => {
    const { data, error } = await supabase.rpc('obtener_historial_bono', {
      p_bono_id: bonoId
    })
    
    if (error) throw error
    return data
  }

  return { completarCita, obtenerHistorialBono }
}
```

---

## 🎯 Paso 3: Usar en tu Componente (2 min)

### Ejemplo Mínimo

```vue
<script setup>
import { useCitas } from '~/composables/useCitas'

const { completarCita } = useCitas()

const handleCompletar = async (citaId) => {
  try {
    const resultado = await completarCita(citaId)
    
    if (resultado.alerta) {
      alert(resultado.mensaje_alerta) // ⚠️ Pocas sesiones
    } else {
      alert('✅ Cita completada')
    }
  } catch (error) {
    alert('❌ Error: ' + error.message)
  }
}
</script>

<template>
  <button @click="handleCompletar('uuid-de-cita')">
    Completar Cita
  </button>
</template>
```

---

## ✅ ¡Listo!

Ahora cuando un terapeuta marque una cita como completada:

1. ✅ Se descuenta automáticamente 1 sesión del bono
2. ✅ Se registra el movimiento en `movimientos_bonos`
3. ✅ Si es la última sesión, el bono se marca como `completado`
4. ✅ Si quedan ≤2 sesiones, se genera una alerta
5. ✅ No puede descontarse dos veces (idempotencia)

---

## 📊 Verificación Rápida

### Ver citas con sus bonos:

```sql
SELECT 
  c.id,
  c.fecha_cita,
  c.estado,
  c.sesion_descontada,
  b.sesiones_restantes
FROM citas c
LEFT JOIN bonos b ON b.id = c.bono_id
WHERE c.terapeuta_id = 'tu-uuid'
ORDER BY c.fecha_cita DESC
LIMIT 10;
```

### Ver historial de un bono:

```sql
SELECT * FROM movimientos_bonos 
WHERE bono_id = 'uuid-del-bono' 
ORDER BY created_at DESC;
```

### Probar manualmente:

```sql
-- Marcar cita como completada (descuenta automáticamente)
UPDATE citas 
SET estado = 'completada'::estado_cita 
WHERE id = 'uuid-de-cita';

-- Ver resultado en el bono
SELECT sesiones_restantes, estado FROM bonos WHERE id = 'uuid-del-bono';

-- Ver movimiento registrado
SELECT * FROM movimientos_bonos WHERE cita_id = 'uuid-de-cita';
```

---

## 🔥 Funcionalidades Extra (Opcional)

### Ver historial desde el frontend:

```typescript
const { obtenerHistorialBono } = useCitas()

const historial = await obtenerHistorialBono(bonoId)

historial.forEach(mov => {
  console.log(`${mov.tipo_movimiento}: ${mov.sesiones_antes} → ${mov.sesiones_despues}`)
})
```

### Verificar estado de un bono:

```typescript
const { data } = await supabase.rpc('verificar_bono_citas', {
  p_bono_id: bonoId
})

console.log('Sesiones restantes:', data.bono.sesiones_restantes)
console.log('Citas completadas:', data.citas.completadas)
console.log('Citas pendientes:', data.citas.pendientes)

if (data.alerta) {
  console.warn('⚠️ Inconsistencia detectada')
}
```

---

## 🚨 Troubleshooting Rápido

### No descuenta la sesión:

```sql
-- Ver si el trigger está activo
SELECT tgname, tgenabled FROM pg_trigger 
WHERE tgrelid = 'citas'::regclass;

-- Debe aparecer: trg_actualizar_bono_por_cita | O (enabled)
```

### Error de permisos:

```sql
-- Re-otorgar permisos
GRANT EXECUTE ON FUNCTION public.completar_cita(uuid) TO authenticated;
```

### Ver logs del trigger:

```sql
-- En Supabase Dashboard > Logs, filtra por:
-- "actualizar_bono_por_cita"
```

---

## 📚 Documentación Completa

Para más detalles, casos de uso avanzados, y arquitectura completa:

👉 [SISTEMA_CITAS_BONOS_GUIA_COMPLETA.md](./SISTEMA_CITAS_BONOS_GUIA_COMPLETA.md)

---

**¡Eso es todo!** 🎉 En 5 minutos tienes un sistema completo de gestión de citas y bonos funcionando.
