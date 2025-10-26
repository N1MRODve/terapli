# 📝 Funcionalidad de Edición y Eliminación de Pacientes

## 📋 Resumen

Se ha implementado exitosamente la funcionalidad completa para que los terapeutas puedan **editar** y **eliminar** pacientes desde la vista de gestión de pacientes.

## ✨ Componentes Creados

### 1. **ModalEditarPaciente.vue**
Modal para editar la información de un paciente existente.

**Características:**
- ✅ Formulario pre-poblado con datos del paciente
- ✅ Validación de campos requeridos
- ✅ Actualización de datos personales (nombre, apellidos, email, teléfono)
- ✅ Actualización de información terapéutica (área, frecuencia)
- ✅ Control de estado activo/inactivo
- ✅ Opción de pausar el proceso terapéutico
- ✅ Preservación de metadata existente
- ✅ Feedback visual de guardado
- ✅ Manejo de errores

**Campos editables:**
- Nombre
- Apellido Paterno
- Apellido Materno
- Email
- Teléfono
- Fecha de Nacimiento
- Área de Acompañamiento
- Frecuencia de Sesiones
- Estado (Activo/Inactivo)
- En Pausa (checkbox)

### 2. **ModalEliminarPaciente.vue**
Modal de confirmación para eliminar un paciente con medidas de seguridad.

**Características:**
- ⚠️ Advertencia clara de acción irreversible
- 📋 Lista de datos que se eliminarán
- 💡 Recomendación de desactivar en lugar de eliminar
- ✅ Opción de desactivar como alternativa segura
- 🗑️ Eliminación en cascada de todos los datos relacionados
- ✅ Feedback visual del proceso
- ✅ Manejo de errores

**Datos que se eliminan:**
1. Métricas de bienestar
2. Notas terapéuticas
3. Recursos compartidos
4. Mensajes
5. Bonos
6. Sesiones
7. Registro del paciente

**Opción alternativa:**
- Botón para **desactivar** en lugar de eliminar
- Preserva el historial completo
- Permite consultas futuras

### 3. **PacienteCard.vue (Actualizado)**
Se agregaron botones de acción al componente de tarjeta de paciente.

**Nuevas características:**
- 🎨 Botones de acción que aparecen al hover
- ✏️ Botón de editar (azul)
- 🗑️ Botón de eliminar (rojo)
- 🖱️ Click en la tarjeta sigue navegando al perfil
- 🎯 Click en botones ejecuta acción específica (stop propagation)

## 🔧 Funcionalidad Implementada

### Vista de Pacientes (`/terapeuta/pacientes`)

#### Nuevos Estados:
```javascript
const mostrarModalEditar = ref(false)
const mostrarModalEliminar = ref(false)
const pacienteSeleccionado = ref(null)
```

#### Nuevas Funciones:

1. **`abrirModalEditar(paciente)`**
   - Almacena el paciente seleccionado
   - Abre el modal de edición

2. **`cerrarModalEditar()`**
   - Cierra el modal
   - Limpia el paciente seleccionado

3. **`abrirModalEliminar(paciente)`**
   - Almacena el paciente seleccionado
   - Abre el modal de confirmación

4. **`cerrarModalEliminar()`**
   - Cierra el modal
   - Limpia el paciente seleccionado

5. **`manejarPacienteActualizado(pacienteActualizado)`**
   - Se ejecuta al actualizar exitosamente
   - Recarga la lista de pacientes

6. **`manejarPacienteEliminado(pacienteId)`**
   - Se ejecuta al eliminar exitosamente
   - Elimina el paciente de la lista local

7. **`manejarPacienteDesactivado(pacienteId)`**
   - Se ejecuta al desactivar el paciente
   - Recarga la lista de pacientes

## 🎯 Flujo de Usuario

### Editar Paciente:
1. Usuario pasa el mouse sobre una tarjeta de paciente
2. Aparecen los botones de editar y eliminar
3. Usuario hace click en el botón de editar (✏️)
4. Se abre el modal con el formulario pre-poblado
5. Usuario modifica los campos necesarios
6. Usuario hace click en "Guardar Cambios"
7. Se actualiza la base de datos
8. Se cierra el modal
9. Se recarga la lista actualizada

### Eliminar Paciente:
1. Usuario pasa el mouse sobre una tarjeta de paciente
2. Aparecen los botones de editar y eliminar
3. Usuario hace click en el botón de eliminar (🗑️)
4. Se abre el modal de confirmación
5. Usuario ve:
   - Advertencia de acción irreversible
   - Lista de datos que se eliminarán
   - Opción de desactivar como alternativa
6. Usuario puede:
   - **Opción A:** Click en "Desactivar en lugar de eliminar" → Paciente se marca como inactivo
   - **Opción B:** Click en "Eliminar Definitivamente" → Se eliminan todos los datos
   - **Opción C:** Click en "Cancelar" → No se hace nada
7. Se ejecuta la acción elegida
8. Se cierra el modal
9. Se actualiza la lista

## 🎨 Diseño UX

### Botones de Acción:
- **Posición:** Esquina superior derecha de cada tarjeta
- **Visibilidad:** Aparecen solo al hover (opacity: 0 → 1)
- **Estilo:** Botones flotantes con sombra
- **Colores:**
  - Editar: Azul (`bg-blue-500`)
  - Eliminar: Rojo (`bg-red-500`)

### Interacción:
- Click en tarjeta → Navega al perfil del paciente
- Click en botón de editar → Abre modal de edición (stop propagation)
- Click en botón de eliminar → Abre modal de eliminación (stop propagation)

## 🔐 Seguridad

### Validaciones:
- ✅ Verificación de autenticación antes de operaciones
- ✅ Validación de campos requeridos
- ✅ Confirmación doble para eliminación
- ✅ Manejo de errores con feedback al usuario

### Protección de Datos:
- ⚠️ Advertencia clara al eliminar
- 💡 Sugerencia de desactivar en lugar de eliminar
- 📋 Lista explícita de datos que se perderán
- 🔄 Opción de cancelar en cualquier momento

## 📝 Base de Datos

### Operación de Actualización (Editar):
```javascript
UPDATE pacientes SET
  email = ?,
  nombre_completo = ?,
  telefono = ?,
  area_de_acompanamiento = ?,
  frecuencia = ?,
  activo = ?,
  metadata = ?
WHERE id = ?
```

### Operación de Desactivación:
```javascript
UPDATE pacientes SET
  activo = false,
  metadata = { ...metadata, fecha_desactivacion: now() }
WHERE id = ?
```

### Operación de Eliminación (Cascada):
```javascript
// 1. metricas_bienestar (DELETE WHERE paciente_id = ?)
// 2. notas_terapeuticas (DELETE WHERE paciente_id = ?)
// 3. recursos_compartidos (DELETE WHERE paciente_id = ?)
// 4. mensajes (DELETE WHERE remitente_id = ? OR destinatario_id = ?)
// 5. bonos (DELETE WHERE paciente_id = ?)
// 6. sesiones (DELETE WHERE paciente_id = ?)
// 7. pacientes (DELETE WHERE id = ?)
```

## 🚀 Próximos Pasos (Opcionales)

### Mejoras Sugeridas:
1. **Sistema de Notificaciones Toast**
   - Feedback visual más elegante al completar acciones
   - Biblioteca sugerida: `vue-toastification`

2. **Confirmación de Cambios No Guardados**
   - Alert si el usuario intenta cerrar el modal con cambios sin guardar

3. **Historial de Cambios**
   - Log de modificaciones en metadata
   - Quién hizo el cambio y cuándo

4. **Búsqueda en Tiempo Real**
   - Debounce en el campo de búsqueda
   - Mejora de rendimiento

5. **Filtros Avanzados**
   - Por área de acompañamiento
   - Por rango de fechas
   - Por estado emocional

6. **Exportación de Datos**
   - Opción de exportar lista de pacientes a CSV/Excel

## 📚 Archivos Modificados/Creados

### Creados:
- ✅ `components/ModalEditarPaciente.vue`
- ✅ `components/ModalEliminarPaciente.vue`

### Modificados:
- ✅ `components/PacienteCard.vue`
- ✅ `pages/terapeuta/pacientes.vue`

## ✅ Checklist de Funcionalidad

- [x] Modal de editar paciente creado
- [x] Modal de eliminar paciente creado
- [x] Botones de acción en tarjeta de paciente
- [x] Integración con vista de pacientes
- [x] Funciones de manejo de eventos
- [x] Actualización de base de datos (editar)
- [x] Eliminación en cascada (eliminar)
- [x] Opción de desactivar como alternativa
- [x] Validación de formularios
- [x] Manejo de errores
- [x] Feedback visual (loading states)
- [x] Preservación de metadata
- [x] Actualización de lista después de acciones

## 🎉 Resultado

Los terapeutas ahora pueden:
- ✅ **Editar** información de pacientes existentes de forma rápida y segura
- ✅ **Eliminar** pacientes con confirmación y advertencias apropiadas
- ✅ **Desactivar** pacientes como alternativa segura a la eliminación
- ✅ Ver botones de acción intuitivos al pasar el mouse sobre las tarjetas
- ✅ Mantener el flujo de trabajo existente (click en tarjeta para ver perfil)

---

**Fecha de implementación:** 26 de octubre de 2025
**Desarrollado para:** Sistema PsicoKarem
**Estado:** ✅ Completado y funcional
