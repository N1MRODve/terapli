# ✏️ Gestión de Recursos - Crear, Editar y Eliminar

**Fecha:** 19 de octubre de 2025  
**Estado:** ✅ Implementado

---

## 🎯 Resumen

Se ha agregado funcionalidad completa de **CRUD (Crear, Leer, Actualizar, Eliminar)** para los recursos del repositorio, permitiendo a los terapeutas:

- ✅ **Crear** nuevos recursos personalizados
- ✅ **Editar** recursos existentes
- ✅ **Eliminar** (desactivar) recursos
- ✅ **Visualizar** recursos con botones de acción

---

## 🆕 Funcionalidades Añadidas

### 1. Crear Nuevo Recurso

**Ubicación:** Botón "➕ Nuevo Recurso" en la esquina superior derecha

**Campos del formulario:**
- **Título*** (requerido): Nombre del recurso
- **Descripción*** (requerido): Descripción del contenido
- **Tipo*** (requerido): Guía, Audio, Video, Ejercicio, Lectura, PDF
- **Categoría** (opcional): Ansiedad, Mindfulness, Relajación, Autoestima, TCC, etc.
- **URL*** (requerido): Enlace al recurso
- **Icono** (opcional): Emoji representativo
- **Etiquetas** (opcional): Tags separados por comas

**Validaciones:**
- Título no vacío
- Descripción no vacía
- Tipo seleccionado
- URL válida

### 2. Editar Recurso Existente

**Ubicación:** Botón "✏️ Editar" en cada tarjeta de recurso

**Funcionalidad:**
- Carga todos los datos del recurso en el formulario
- Permite modificar cualquier campo
- Guarda los cambios en la base de datos
- Actualiza la vista automáticamente

**Nota:** Los recursos de demostración (modo demo) no se pueden editar

### 3. Eliminar Recurso

**Ubicación:** Botón "🗑️ Eliminar" en cada tarjeta de recurso

**Funcionalidad:**
- Muestra modal de confirmación
- **Eliminación lógica**: Marca el recurso como `activo: false`
- No elimina físicamente el registro
- Los recursos compartidos previamente permanecen visibles para pacientes

**Nota:** Los recursos de demostración no se pueden eliminar

---

## 🎨 Componentes Nuevos

### `ModalRecurso.vue`

Modal reutilizable para crear y editar recursos.

**Props:**
- `modelValue` (Boolean): Controla visibilidad del modal
- `recurso` (Object, opcional): Recurso a editar (null = modo creación)

**Eventos:**
- `update:modelValue`: Cierra el modal
- `guardado`: Emite el recurso guardado

**Características:**
- Formulario completo con validación
- Selector de iconos con sugerencias
- Sistema de tags con agregar/eliminar
- Manejo de errores
- Estado de carga
- Auto-reseteo al cerrar

---

## 🔧 Funciones del Composable

### `useTerapeuta.ts` - Nuevas funciones

#### `crearRecurso(recursoData)`
Crea un nuevo recurso en el repositorio.

```typescript
const resultado = await crearRecurso({
  titulo: 'Mi Recurso',
  descripcion: 'Descripción del recurso',
  tipo: 'Guía',
  url: 'https://ejemplo.com',
  categoria: 'Ansiedad',
  icono: '📋',
  tags: ['etiqueta1', 'etiqueta2']
})

// resultado.success: boolean
// resultado.data: recurso creado
// resultado.error: mensaje de error (si aplica)
```

#### `actualizarRecurso(recursoId, recursoData)`
Actualiza un recurso existente.

```typescript
const resultado = await actualizarRecurso('uuid-del-recurso', {
  titulo: 'Título actualizado',
  descripcion: 'Nueva descripción',
  // ... otros campos
})
```

#### `eliminarRecurso(recursoId)`
Desactiva un recurso (eliminación lógica).

```typescript
const resultado = await eliminarRecurso('uuid-del-recurso')
```

---

## 📱 Interfaz de Usuario

### Página de Recursos del Terapeuta

**Botones añadidos en cada tarjeta:**

```
┌─────────────────────────────┐
│  📋 Título del Recurso      │
│  Descripción...             │
│  [Categoría]                │
│                             │
│  [👁️ Ver] [📤 Compartir]   │
│  [✏️ Editar] [🗑️ Eliminar]  │
└─────────────────────────────┘
```

**Botón principal:**
- "➕ Nuevo Recurso" en la esquina superior derecha
- Abre modal de creación

**Modales:**
1. **ModalRecurso**: Crear/Editar recurso
2. **Confirmación de eliminación**: Confirma antes de eliminar

**Toasts informativos:**
- "¡Recurso creado!" - Nuevo recurso añadido
- "¡Recurso actualizado!" - Cambios guardados
- "¡Recurso eliminado!" - Recurso eliminado
- Info sobre recursos demo

---

## 🔐 Seguridad

### Políticas RLS (Ya implementadas)

**Crear recursos:**
- ✅ Solo terapeutas, admins y coordinadoras
- ✅ Se guarda el ID del creador en `created_by`

**Actualizar recursos:**
- ✅ Solo el creador original
- ✅ O admins/coordinadoras pueden actualizar cualquiera

**Eliminar recursos:**
- ✅ Solo el creador original
- ✅ O admins/coordinadoras
- ✅ Eliminación lógica (`activo: false`)

---

## 📊 Flujo de Trabajo

### Crear Recurso

```
Terapeuta hace clic en "➕ Nuevo Recurso"
    ↓
Se abre ModalRecurso (modo creación)
    ↓
Terapeuta llena el formulario
    ↓
Valida campos requeridos
    ↓
Llama a crearRecurso()
    ↓
INSERT en recursos_repositorio
    ↓
Recurso añadido al array local
    ↓
Toast de confirmación
    ↓
Modal se cierra
```

### Editar Recurso

```
Terapeuta hace clic en "✏️ Editar"
    ↓
Verifica que no sea recurso demo
    ↓
Carga datos en ModalRecurso
    ↓
Terapeuta modifica campos
    ↓
Llama a actualizarRecurso()
    ↓
UPDATE en recursos_repositorio
    ↓
Actualiza recurso en array local
    ↓
Toast de confirmación
```

### Eliminar Recurso

```
Terapeuta hace clic en "🗑️ Eliminar"
    ↓
Verifica que no sea recurso demo
    ↓
Muestra modal de confirmación
    ↓
Terapeuta confirma
    ↓
Llama a eliminarRecurso()
    ↓
UPDATE activo = false
    ↓
Remueve del array local
    ↓
Toast de confirmación
```

---

## 🎨 Diseño del Modal

### Layout

```
┌─────────────────────────────────────────┐
│ [Header con gradiente]                  │
│ ✏️ Editar Recurso / ➕ Nuevo Recurso    │
│                                    [X]  │
├─────────────────────────────────────────┤
│ [Body scrolleable]                      │
│                                         │
│ Título del recurso *                    │
│ [________________input_____________]    │
│                                         │
│ Descripción *                           │
│ [________________textarea__________]    │
│                                         │
│ Tipo *          │  Categoría            │
│ [_____select___]│ [_____select_____]   │
│                                         │
│ URL del recurso *                       │
│ [________________input_____________]    │
│                                         │
│ Icono (emoji)                           │
│ [📋] [📋][🎵][🎥][🧘][📖][📄]...      │
│                                         │
│ Etiquetas                               │
│ [________________input_____________]    │
│ #tag1  #tag2  #tag3                    │
│                                         │
├─────────────────────────────────────────┤
│ [Footer]                                │
│          [Cancelar] [Guardar Cambios]  │
└─────────────────────────────────────────┘
```

---

## 🧪 Modo Demo

### Comportamiento con Recursos Demo

**Restricciones:**
- ❌ No se pueden editar
- ❌ No se pueden eliminar
- ✅ Se pueden compartir
- ✅ Se pueden visualizar

**Feedback al usuario:**
- Toast informativo: "Los recursos demo no se pueden editar/eliminar"
- Sugiere crear recursos propios o ejecutar migración SQL

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Crear un Nuevo Recurso

```javascript
// Usuario hace clic en "➕ Nuevo Recurso"
// Llena el formulario:
{
  titulo: "Técnica 5-4-3-2-1 para Ansiedad",
  descripcion: "Ejercicio de grounding para momentos de crisis de ansiedad",
  tipo: "Guía",
  categoria: "Ansiedad",
  url: "https://ejemplo.com/tecnica-54321",
  icono: "🧘",
  tags: ["ansiedad", "grounding", "crisis"]
}

// Resultado: Recurso creado y disponible para compartir
```

### Ejemplo 2: Editar un Recurso

```javascript
// Usuario hace clic en "✏️ Editar" en un recurso
// Modifica campos:
{
  titulo: "Técnica 5-4-3-2-1 para Ansiedad (Actualizada)",
  descripcion: "Nueva descripción más detallada...",
  // ... otros cambios
}

// Resultado: Recurso actualizado con nuevos datos
```

### Ejemplo 3: Eliminar un Recurso

```javascript
// Usuario hace clic en "🗑️ Eliminar"
// Confirma en el modal
// Resultado: 
// - Recurso marcado como activo: false
// - Ya no aparece en el repositorio
// - Recursos previamente compartidos siguen visibles para pacientes
```

---

## ✅ Checklist de Implementación

- [x] Crear componente `ModalRecurso.vue`
- [x] Añadir función `crearRecurso()` en composable
- [x] Añadir función `actualizarRecurso()` en composable
- [x] Añadir función `eliminarRecurso()` en composable
- [x] Integrar botón "Nuevo Recurso" en página
- [x] Añadir botones "Editar" en tarjetas
- [x] Añadir botones "Eliminar" en tarjetas
- [x] Implementar modal de confirmación
- [x] Implementar toasts informativos
- [x] Manejar recursos demo (no editar/eliminar)
- [x] Validación de formulario
- [x] Sistema de tags
- [x] Selector de iconos
- [x] Documentar funcionalidad

---

## 🚀 Próximas Mejoras

### Corto Plazo
- [ ] Subida de archivos propios (PDF, imágenes)
- [ ] Preview del recurso antes de guardar
- [ ] Duplicar recurso existente
- [ ] Categorías personalizables

### Medio Plazo
- [ ] Búsqueda avanzada con filtros
- [ ] Ordenar por popularidad/uso
- [ ] Estadísticas por recurso individual
- [ ] Favoritos/destacados

### Largo Plazo
- [ ] Biblioteca compartida entre terapeutas
- [ ] Sistema de versiones de recursos
- [ ] Recursos con contenido embebido
- [ ] Editor de contenido integrado

---

## 📞 Uso Rápido

**Para crear un recurso:**
1. Haz clic en "➕ Nuevo Recurso"
2. Llena los campos obligatorios (*)
3. Haz clic en "Crear Recurso"

**Para editar un recurso:**
1. Haz clic en "✏️ Editar" en la tarjeta
2. Modifica los campos deseados
3. Haz clic en "Guardar Cambios"

**Para eliminar un recurso:**
1. Haz clic en "🗑️ Eliminar" en la tarjeta
2. Confirma la eliminación
3. El recurso se ocultará del repositorio

---

**Documentación creada:** 19 de octubre de 2025  
**Versión:** 1.0
