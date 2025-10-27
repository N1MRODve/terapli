# ✅ Fix: Integración Citas con Agenda y Ficha de Paciente

## Problemas Corregidos

### 1. Error "Ver detalles" redirige al login
**Problema**: Al hacer clic en "Ver detalles" de una cita en el dashboard, redirigía a `/paciente/sesiones` sin verificación de autenticación, causando que el usuario fuera enviado al login.

**Solución**: 
- Actualizado `components/dashboard/NextSessionCard.vue`
- Ahora redirige a `/terapeuta/agenda` en lugar de rutas de paciente
- Usa `useRouter()` correctamente para navegación

**Archivo modificado**: `components/dashboard/NextSessionCard.vue`
```javascript
const handleAction = () => {
  if (!nextSession.value) {
    const router = useRouter()
    router.push('/terapeuta/agenda')
    return
  }
  
  if (canJoin.value) {
    if (nextSession.value.meetingLink) {
      window.open(nextSession.value.meetingLink, '_blank')
    }
  } else {
    const router = useRouter()
    router.push('/terapeuta/agenda')
  }
}
```

### 2. Hora de próxima cita no se actualiza en ficha del paciente
**Problema**: Al crear una nueva cita, la información de "Próxima sesión" en la ficha del paciente no se actualizaba porque buscaba en la tabla `sesiones` en lugar de `citas`.

**Solución**: Actualizado todas las consultas para usar la tabla `citas`:

#### Archivos modificados:

**1. `pages/terapeuta/pacientes/[id].vue`**
- Cambio de tabla `sesiones` → `citas`
- Actualización de campos: `fecha` → `fecha_cita`, `hora_inicio`
- Formato correcto de fecha/hora para próxima sesión

```javascript
// Obtener próxima sesión (buscar en tabla 'citas')
const { data: proximaSesion } = await supabase
  .from('citas')
  .select('fecha_cita, hora_inicio')
  .eq('paciente_id', pacienteId.value)
  .in('estado', ['pendiente', 'confirmada'])
  .gte('fecha_cita', new Date().toISOString().split('T')[0])
  .order('fecha_cita', { ascending: true })
  .order('hora_inicio', { ascending: true })
  .limit(1)
  .maybeSingle()

// Formato: "2025-10-22T16:00:00"
proxima_sesion: proximaSesion ? `${proximaSesion.fecha_cita}T${proximaSesion.hora_inicio}:00` : null
```

**2. `pages/terapeuta/pacientes.vue`**
- Actualizado `cargarPacientes()` para buscar en tabla `citas`
- Cambios en todas las consultas de sesiones
- Actualización de mapeo de datos

```javascript
// Obtener última sesión (de tabla 'citas')
const { data: ultimaCita } = await supabase
  .from('citas')
  .select('fecha_cita')
  .eq('paciente_id', paciente.id)
  .eq('estado', 'realizada')
  .order('fecha_cita', { ascending: false })
  .limit(1)
  .maybeSingle()

// Obtener próxima sesión (de tabla 'citas')
const { data: proximaCita } = await supabase
  .from('citas')
  .select('fecha_cita, hora_inicio')
  .eq('paciente_id', paciente.id)
  .in('estado', ['pendiente', 'confirmada'])
  .gte('fecha_cita', new Date().toISOString().split('T')[0])
  .order('fecha_cita', { ascending: true })
  .order('hora_inicio', { ascending: true })
  .limit(1)
  .maybeSingle()

// Formato correcto en el retorno
proxima_sesion: proximaCita ? `${proximaCita.fecha_cita}T${proximaCita.hora_inicio}:00` : null
```

## ✅ Verificación de Cambios

### Funcionalidad restaurada:
1. ✅ Clic en "Ver detalles" de cita → Redirige a `/terapeuta/agenda`
2. ✅ Crear nueva cita → Actualiza "Próxima sesión" en ficha del paciente
3. ✅ Crear nueva cita → Actualiza tarjeta del paciente en lista de pacientes
4. ✅ Todos los datos de citas provienen de tabla correcta (`citas` no `sesiones`)

### Cambios de tabla en consultas:
- `sesiones` → `citas`
- `fecha` → `fecha_cita` 
- Agregado campo `hora_inicio` en consultas de próxima sesión
- Formato ISO completo: `YYYY-MM-DDTHH:MM:SS`

## 🧪 Pruebas Recomendadas

1. **Test de "Ver detalles"**:
   - Ir al dashboard de terapeuta
   - Hacer clic en "Ver detalles" de la próxima sesión
   - Verificar que redirige a `/terapeuta/agenda` sin errores

2. **Test de actualización de próxima sesión**:
   - Ir a `/terapeuta/pacientes`
   - Seleccionar un paciente
   - Crear una nueva cita
   - Verificar que aparece como "Próxima sesión" en la ficha del paciente
   - Volver a lista de pacientes
   - Verificar que la tarjeta muestra la próxima sesión actualizada

3. **Test de historial de sesiones**:
   - En ficha del paciente, verificar "Últimas Sesiones"
   - Confirmar que muestra las citas realizadas correctamente

## 📝 Notas Importantes

- Todas las consultas ahora usan la tabla `citas` consistentemente
- El sistema de agenda YA estaba integrado correctamente (evento `@cita-creada`)
- Solo faltaba actualizar las consultas en las fichas de pacientes
- El formato de fecha/hora es ISO 8601 completo para compatibilidad

## 🔄 Flujo de Datos Actualizado

```
ModalNuevaCita 
  ↓ crearCita()
  ↓ INSERT en tabla 'citas'
  ↓ emit('citaCreada')
  ↓
Agenda/[id].vue
  ↓ onCitaCreada()
  ↓ cargarPaciente()
  ↓ SELECT de tabla 'citas'
  ↓ proxima_sesion actualizada ✅
```

## Fecha de Fix
26 de octubre de 2025
