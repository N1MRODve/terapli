# 🚀 Guía Rápida: Editar y Eliminar Pacientes

## 📍 Ubicación
**Ruta:** `/terapeuta/pacientes`

## ✏️ Cómo Editar un Paciente

### Paso 1: Acceder al botón de edición
1. Ve a la vista de pacientes
2. Pasa el mouse sobre la tarjeta del paciente que deseas editar
3. Aparecerán dos botones en la esquina superior derecha:
   - 🔵 **Botón Azul** = Editar
   - 🔴 **Botón Rojo** = Eliminar

### Paso 2: Abrir el modal de edición
1. Haz click en el **botón azul (✏️)**
2. Se abrirá un modal con el formulario de edición
3. Los campos estarán **pre-poblados** con los datos actuales

### Paso 3: Modificar la información
Puedes editar:
- **Información Personal:**
  - Nombre
  - Apellido Paterno
  - Apellido Materno
  - Email
  - Teléfono
  - Fecha de Nacimiento

- **Información Terapéutica:**
  - Área de Acompañamiento
  - Frecuencia de Sesiones
  - Estado (Activo/Inactivo)
  - En Pausa (checkbox)

### Paso 4: Guardar cambios
1. Revisa que todos los campos estén correctos
2. Haz click en **"Guardar Cambios"**
3. El sistema actualizará la información
4. El modal se cerrará automáticamente
5. La lista se actualizará con los nuevos datos

### Paso 5: Cancelar (opcional)
- Si no deseas guardar los cambios, haz click en **"Cancelar"**
- También puedes hacer click fuera del modal

---

## 🗑️ Cómo Eliminar un Paciente

### ⚠️ IMPORTANTE
**La eliminación es permanente y no se puede deshacer.**
Se recomienda **desactivar** en lugar de eliminar para preservar el historial.

### Paso 1: Acceder al botón de eliminación
1. Ve a la vista de pacientes
2. Pasa el mouse sobre la tarjeta del paciente
3. Haz click en el **botón rojo (🗑️)** en la esquina superior derecha

### Paso 2: Leer la advertencia
El modal mostrará:
- ⚠️ Nombre del paciente a eliminar
- 📋 Lista de datos que se eliminarán:
  - Datos personales
  - Historial de sesiones
  - Notas terapéuticas
  - Métricas de bienestar
  - Bonos asociados

### Paso 3: Elegir una opción

#### OPCIÓN A: Desactivar (Recomendado) 💡
1. Haz click en el botón azul: **"Desactivar en lugar de eliminar"**
2. El paciente se marcará como inactivo
3. Se preservará todo el historial
4. Podrás reactivarlo en el futuro si es necesario

#### OPCIÓN B: Eliminar Definitivamente ⚠️
1. Haz click en el botón rojo: **"Eliminar Definitivamente"**
2. Se eliminarán **todos los datos** relacionados
3. Esta acción **NO** se puede deshacer
4. El paciente desaparecerá de la lista

#### OPCIÓN C: Cancelar
1. Haz click en **"Cancelar"**
2. No se realizará ninguna acción
3. El modal se cerrará

---

## 🎯 Tips y Mejores Prácticas

### ✅ Cuándo Editar
- Corrección de información personal (teléfono, email)
- Actualización de área de acompañamiento
- Cambio de frecuencia de sesiones
- Marcar proceso como pausado temporalmente

### ✅ Cuándo Desactivar (vs Eliminar)
**Desactivar si:**
- El paciente terminó su proceso exitosamente
- El paciente está tomando un descanso temporal
- Quieres preservar el historial para futuras consultas
- Necesitas estadísticas históricas

**Eliminar solo si:**
- El paciente solicitó explícitamente la eliminación de sus datos (GDPR)
- Se creó un registro duplicado por error
- Es un registro de prueba que debe eliminarse

### ⚠️ Precauciones
1. **Antes de eliminar:** Verifica que tengas backup de datos importantes
2. **Exporta información crítica:** Si necesitas el historial antes de eliminar
3. **Considera desactivar primero:** Es reversible y más seguro
4. **Revisa sesiones pendientes:** Asegúrate de no tener citas programadas

---

## 🔍 Verificación de Cambios

### Después de Editar:
1. ✅ La tarjeta del paciente se actualizará automáticamente
2. ✅ Los cambios serán visibles inmediatamente
3. ✅ El perfil del paciente reflejará la nueva información

### Después de Desactivar:
1. ✅ El paciente aparecerá con badge "Inactivo"
2. ✅ Puedes filtrarlo usando el filtro de estado
3. ✅ El historial sigue disponible para consulta

### Después de Eliminar:
1. ✅ El paciente desaparecerá de la lista inmediatamente
2. ✅ No aparecerá en búsquedas ni filtros
3. ❌ Los datos no se pueden recuperar

---

## 🐛 Solución de Problemas

### El modal no se abre
- Refresca la página (F5)
- Verifica que tienes permisos de terapeuta
- Revisa la consola del navegador por errores

### Los cambios no se guardan
- Verifica que todos los campos requeridos (*) estén llenos
- Asegúrate de tener conexión a internet
- Revisa el mensaje de error que aparece en el modal

### Error al eliminar
- Verifica que no tengas sesiones activas pendientes
- Intenta desactivar en lugar de eliminar
- Contacta soporte técnico si el problema persiste

---

## 📱 Accesos Rápidos

| Acción | Atajo |
|--------|-------|
| Abrir edición | Hover + Click botón azul |
| Abrir eliminación | Hover + Click botón rojo |
| Ver perfil completo | Click en la tarjeta |
| Cancelar modal | Click fuera o botón Cancelar |
| Guardar cambios | Enter (dentro del formulario) |

---

**¿Necesitas ayuda?** Consulta la documentación completa en `PACIENTES_EDICION_ELIMINACION.md`
