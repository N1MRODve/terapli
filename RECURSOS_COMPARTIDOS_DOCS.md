# 📤 Sistema de Recursos Compartidos - Documentación Completa

**Fecha:** 19 de octubre de 2025  
**Versión:** 1.0  
**Estado:** ✅ Implementado y funcional

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Base de Datos](#base-de-datos)
4. [Funcionalidades Implementadas](#funcionalidades-implementadas)
5. [Guía de Uso para Terapeutas](#guía-de-uso-para-terapeutas)
6. [Guía de Uso para Pacientes](#guía-de-uso-para-pacientes)
7. [Aspectos Técnicos](#aspectos-técnicos)
8. [Seguridad y Permisos](#seguridad-y-permisos)

---

## 🎯 Resumen Ejecutivo

El **Sistema de Recursos Compartidos** permite a los terapeutas compartir materiales terapéuticos específicos del repositorio con pacientes individuales o grupos de pacientes. Este sistema mejora la experiencia terapéutica al proporcionar:

- **Repositorio centralizado** de recursos terapéuticos
- **Compartición selectiva** con pacientes específicos
- **Seguimiento de visualización** de recursos
- **Notas personalizadas** del terapeuta al compartir
- **Estadísticas de uso** para el terapeuta

---

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────────────────────────────────────────────┐
│                    TERAPEUTA                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Página Recursos (/terapeuta/recursos)              │
│     - Lista de recursos del repositorio                │
│     - Botón "Compartir" en cada recurso                │
│     - Estadísticas de recursos compartidos             │
│                                                         │
│  2. Modal Compartir Recurso                             │
│     - Selector de pacientes (checkboxes)               │
│     - Campo nota personal (opcional)                   │
│     - Confirmación de compartición                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
                            ↓
                    SUPABASE DATABASE
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    PACIENTE                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Página Recursos (/paciente/recursos)                  │
│     - Lista de recursos compartidos                    │
│     - Nota personal del terapeuta (si existe)          │
│     - Badge "Nuevo" para no vistos                     │
│     - Botón "Ver recurso"                              │
│     - Marca automática como visto al hacer clic        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Base de Datos

### Tabla: `recursos_repositorio`

Almacena todos los recursos disponibles en el repositorio del terapeuta.

```sql
CREATE TABLE recursos_repositorio (
    id uuid PRIMARY KEY,
    titulo text NOT NULL,
    descripcion text,
    tipo text NOT NULL,              -- 'Guía', 'Audio', 'Video', etc.
    icono text DEFAULT '📄',
    url text NOT NULL,
    categoria text,                   -- 'Ansiedad', 'Mindfulness', etc.
    tags text[],                      -- Array de etiquetas
    created_by uuid,                  -- Terapeuta que creó el recurso
    created_at timestamptz,
    updated_at timestamptz,
    activo boolean DEFAULT true
);
```

**Recursos precargados:**
1. Guía de Respiración Consciente (Ansiedad)
2. Meditación Guiada 10min (Mindfulness)
3. Relajación Muscular Progresiva (Relajación)
4. Diario de Gratitud (Autoestima)
5. Mindfulness y Autocuidado (Mindfulness)
6. Registro de Pensamientos TCC (TCC)

### Tabla: `recursos_compartidos`

Vincula recursos del repositorio con pacientes específicos.

```sql
CREATE TABLE recursos_compartidos (
    id uuid PRIMARY KEY,
    recurso_id uuid NOT NULL,         -- FK a recursos_repositorio
    paciente_id uuid NOT NULL,        -- FK a pacientes
    terapeuta_id uuid NOT NULL,       -- FK a profiles
    nota_personal text,               -- Nota opcional del terapeuta
    visto boolean DEFAULT false,      -- Si el paciente lo ha visto
    visto_at timestamptz,            -- Cuándo lo vio
    compartido_at timestamptz,        -- Cuándo se compartió
    archivado boolean DEFAULT false,
    UNIQUE(recurso_id, paciente_id)   -- Un recurso solo se comparte una vez
);
```

---

## ⚙️ Funcionalidades Implementadas

### Para Terapeutas

#### 1. **Vista de Repositorio de Recursos**
- Visualización en tarjetas de todos los recursos disponibles
- Buscador por título, descripción o categoría
- Filtros por tipo de recurso
- Estadísticas en tiempo real:
  - Total de recursos compartidos
  - Recursos vistos por pacientes
  - Recursos pendientes de ver

#### 2. **Compartir Recursos**
- Botón "📤 Compartir" en cada recurso
- Modal con lista de pacientes activos
- Búsqueda de pacientes en tiempo real
- Selección múltiple con checkboxes
- Campo opcional para nota personal
- Feedback visual de compartición exitosa

#### 3. **Gestión de Recursos Compartidos**
- Ver qué recursos ha compartido con cada paciente
- Estadísticas de visualización
- Posibilidad de archivar recursos compartidos

### Para Pacientes

#### 1. **Vista de Recursos Compartidos**
- Lista de todos los recursos compartidos con el paciente
- Visualización de:
  - Título y descripción del recurso
  - Icono según tipo de recurso
  - Categoría y tags
  - Nota personal del terapeuta (si existe)
  - Fecha de compartición
  - Badge "Nuevo" para recursos no vistos

#### 2. **Acceso a Recursos**
- Botón "Ver recurso" que abre el enlace en nueva pestaña
- Marcado automático como "visto" al hacer clic
- Acceso directo desde el dashboard

---

## 👨‍⚕️ Guía de Uso para Terapeutas

### Paso 1: Acceder al Repositorio de Recursos

1. Inicia sesión como terapeuta
2. Navega a **"Recursos"** en el menú lateral
3. Verás el repositorio completo de recursos disponibles

### Paso 2: Buscar un Recurso

- Usa el buscador para filtrar por título, descripción o categoría
- Los recursos se muestran en tarjetas con:
  - Icono del tipo de recurso
  - Título y descripción
  - Categoría
  - Botones "Ver" y "Compartir"

### Paso 3: Compartir un Recurso

1. Haz clic en el botón **"📤 Compartir"** del recurso deseado
2. En el modal que se abre:
   - **Busca pacientes** usando el campo de búsqueda
   - **Selecciona uno o más pacientes** marcando los checkboxes
   - (Opcional) **Añade una nota personal** para el/los paciente(s)
   - Haz clic en **"Compartir"**
3. Verás una notificación de éxito indicando con cuántos pacientes se compartió

### Paso 4: Ver Estadísticas

En la parte superior de la página verás 3 tarjetas con:
- **Total de recursos compartidos**
- **Recursos vistos por pacientes**
- **Recursos pendientes de ver**

---

## 👤 Guía de Uso para Pacientes

### Paso 1: Acceder a Recursos Compartidos

1. Inicia sesión como paciente
2. Navega a **"Mis Recursos"** en el menú
3. Verás todos los recursos que tu terapeuta ha compartido contigo

### Paso 2: Revisar Recursos

Cada recurso muestra:
- **Icono y tipo** (Guía, Video, Audio, etc.)
- **Título y descripción**
- **Nota personal** de tu terapeuta (si la añadió)
- **Categoría y tags** relacionados
- **Fecha de compartición**
- **Badge "Nuevo"** si aún no lo has visto

### Paso 3: Ver un Recurso

1. Haz clic en el botón **"Ver recurso"**
2. El recurso se abrirá en una nueva pestaña
3. Automáticamente se marcará como "visto"
4. El badge "Nuevo" desaparecerá

---

## 🔧 Aspectos Técnicos

### Archivos Modificados/Creados

#### Migración SQL
- `supabase/migrations/20251019_recursos_compartidos.sql`
  - Crea tablas `recursos_repositorio` y `recursos_compartidos`
  - Define índices para optimización
  - Configura Row Level Security (RLS)
  - Inserta recursos de ejemplo

#### Composables
- `composables/useTerapeuta.ts` (NUEVO)
  - `getPacientes()` - Lista de pacientes del terapeuta
  - `getRecursosRepositorio()` - Recursos del repositorio
  - `compartirRecurso()` - Compartir con pacientes
  - `getRecursosCompartidosPaciente()` - Recursos de un paciente
  - `getEstadisticasRecursos()` - Estadísticas de uso
  - `descompartirRecurso()` - Archivar recurso compartido
  - `crearRecurso()` - Añadir nuevo recurso al repositorio

- `composables/usePacientes.ts` (ACTUALIZADO)
  - `getRecursos()` - Obtiene recursos compartidos con el paciente
  - `marcarRecursoComoVisto()` - Marca recurso como visto

#### Componentes
- `components/ModalCompartirRecurso.vue` (ACTUALIZADO)
  - Modal para selección de pacientes
  - Búsqueda en tiempo real
  - Selección múltiple
  - Campo de nota personal
  - Validación y feedback

#### Páginas
- `pages/terapeuta/recursos.vue` (ACTUALIZADO)
  - Vista de repositorio de recursos
  - Integración con modal de compartir
  - Estadísticas en tiempo real
  - Toast de confirmación

- `pages/paciente/recursos.vue` (ACTUALIZADO)
  - Vista de recursos compartidos
  - Marcado automático como visto
  - Visualización de notas personales
  - Badges de estado

---

## 🔒 Seguridad y Permisos

### Row Level Security (RLS)

#### Tabla `recursos_repositorio`

**SELECT (Lectura):**
- ✅ Terapeutas pueden ver todos los recursos activos
- ❌ Pacientes NO tienen acceso directo

**INSERT (Creación):**
- ✅ Terapeutas, admins y coordinadoras pueden crear recursos
- ❌ Pacientes NO pueden crear

**UPDATE (Actualización):**
- ✅ Terapeutas pueden actualizar sus propios recursos
- ✅ Admins y coordinadoras pueden actualizar cualquier recurso
- ❌ Pacientes NO pueden actualizar

#### Tabla `recursos_compartidos`

**SELECT (Lectura):**
- ✅ Pacientes pueden ver recursos compartidos CON ELLOS
- ✅ Terapeutas pueden ver recursos que ELLOS compartieron
- ✅ Admins y coordinadoras pueden ver todos

**INSERT (Compartir):**
- ✅ Terapeutas pueden compartir recursos con sus pacientes
- ❌ Pacientes NO pueden compartir

**UPDATE (Marcar como visto):**
- ✅ Pacientes pueden actualizar el campo `visto` de sus recursos
- ✅ Terapeutas pueden actualizar recursos que compartieron
- ❌ No se puede modificar el recurso de otro paciente

**DELETE (Eliminar):**
- ✅ Terapeutas pueden eliminar recursos que compartieron
- ❌ Pacientes NO pueden eliminar

### Validaciones

1. **Un recurso no se puede compartir dos veces con el mismo paciente**
   - Constraint UNIQUE en `(recurso_id, paciente_id)`
   - Manejo de error de duplicado en la aplicación

2. **Solo pacientes activos aparecen en la lista**
   - Filtro `activo = true` en `getPacientes()`

3. **Solo recursos activos se muestran en el repositorio**
   - Filtro `activo = true` en `getRecursosRepositorio()`

4. **Recursos archivados no se muestran**
   - Filtro `archivado = false` en consultas

---

## 📊 Flujo de Datos

```
┌─────────────┐
│  Terapeuta  │
└─────┬───────┘
      │
      │ 1. Selecciona recurso del repositorio
      ↓
┌─────────────────────────┐
│ recursos_repositorio    │
│ (Repositorio completo)  │
└─────────┬───────────────┘
          │
          │ 2. Abre modal y selecciona pacientes
          ↓
┌─────────────────────────┐
│ Modal Compartir         │
│ - Lista de pacientes    │
│ - Nota personal         │
└─────────┬───────────────┘
          │
          │ 3. Crea registro de compartición
          ↓
┌─────────────────────────┐
│ recursos_compartidos    │
│ (Vinculación)           │
│ - recurso_id            │
│ - paciente_id           │
│ - terapeuta_id          │
│ - nota_personal         │
│ - visto: false          │
└─────────┬───────────────┘
          │
          │ 4. Paciente accede a "Mis Recursos"
          ↓
┌─────────────────────────┐
│      Paciente           │
│ Ve recursos compartidos │
│ con notas personales    │
└─────────┬───────────────┘
          │
          │ 5. Hace clic en "Ver recurso"
          ↓
┌─────────────────────────┐
│ Actualización automática│
│ visto: true             │
│ visto_at: timestamp     │
└─────────────────────────┘
```

---

## 🎨 Diseño y UX

### Paleta de Colores Utilizada

- **Principal:** `#D8AFA0` (Terracota suave)
- **Secundario:** `#EAD5D3` (Rosa pálido)
- **Texto:** `#5D4A44` (Café oscuro)
- **Fondo:** `#F9F7F3` (Beige claro)
- **Éxito:** Verde suave
- **Nuevo/Pendiente:** `#D8AFA0` (Badge)

### Iconografía

- 📚 Repositorio de recursos
- 📤 Compartir
- 👁️ Ver/Visto
- 💬 Nota personal
- 🆕 Badge "Nuevo"
- ✅ Éxito/Completado

---

## 🚀 Próximas Mejoras (Roadmap)

### Fase 2 (Futuro)
- [ ] Notificaciones push cuando se comparte un recurso
- [ ] Historial de recursos compartidos
- [ ] Analytics avanzados (tiempo de visualización, etc.)
- [ ] Categorías personalizadas por terapeuta
- [ ] Subida de recursos propios (PDF, videos, etc.)
- [ ] Comentarios/feedback del paciente sobre recursos
- [ ] Recursos favoritos
- [ ] Recomendaciones automáticas basadas en el área de acompañamiento

### Fase 3 (Largo plazo)
- [ ] Integración con biblioteca externa de recursos
- [ ] Versiones de recursos (actualización de contenido)
- [ ] Estadísticas de efectividad (correlación con mejora emocional)
- [ ] Recursos interactivos (formularios, ejercicios con seguimiento)

---

## 🐛 Solución de Problemas

### Problema: No aparecen recursos en el repositorio

**Solución:**
1. Verifica que la migración SQL se haya ejecutado correctamente
2. Asegúrate de que existen registros en `recursos_repositorio`
3. Comprueba que `activo = true` en los recursos
4. Revisa las políticas RLS del usuario

### Problema: No se puede compartir un recurso

**Solución:**
1. Verifica que el usuario tenga rol de terapeuta
2. Comprueba que el paciente exista y esté activo
3. Revisa si el recurso ya fue compartido con ese paciente (error de duplicado)
4. Mira los logs de la consola del navegador

### Problema: El paciente no ve recursos compartidos

**Solución:**
1. Verifica que el paciente tenga el `user_id` correcto vinculado
2. Comprueba que el recurso no esté archivado
3. Revisa las políticas RLS de `recursos_compartidos`
4. Confirma que el paciente_id coincide en ambas tablas

---

## 📝 Notas Técnicas

### TypeScript Considerations

Debido a que las nuevas tablas (`recursos_repositorio` y `recursos_compartidos`) no están en los tipos generados automáticamente de Supabase, se utilizan cast `as any` en las consultas:

```typescript
.from('recursos_compartidos' as any)
```

**Solución futura:** Regenerar los tipos de Supabase con:
```bash
npx supabase gen types typescript --project-id <PROJECT_ID> > types/supabase.ts
```

### Performance

Se han añadido los siguientes índices para optimizar las consultas:

```sql
CREATE INDEX idx_recursos_repositorio_tipo ON recursos_repositorio(tipo);
CREATE INDEX idx_recursos_repositorio_categoria ON recursos_repositorio(categoria);
CREATE INDEX idx_recursos_compartidos_paciente ON recursos_compartidos(paciente_id);
CREATE INDEX idx_recursos_compartidos_terapeuta ON recursos_compartidos(terapeuta_id);
CREATE INDEX idx_recursos_compartidos_visto ON recursos_compartidos(visto);
```

---

## ✅ Checklist de Implementación

- [x] Crear migración SQL con tablas y políticas RLS
- [x] Crear composable `useTerapeuta.ts`
- [x] Actualizar composable `usePacientes.ts`
- [x] Actualizar componente `ModalCompartirRecurso.vue`
- [x] Actualizar página `terapeuta/recursos.vue`
- [x] Actualizar página `paciente/recursos.vue`
- [x] Implementar estadísticas de recursos
- [x] Implementar marcado automático como visto
- [x] Añadir notas personales del terapeuta
- [x] Implementar feedback visual (toast)
- [x] Documentar funcionalidad completa
- [ ] Ejecutar migración en Supabase producción
- [ ] Probar en entorno de producción

---

## 📞 Contacto y Soporte

Para preguntas o problemas con esta funcionalidad, contacta al equipo de desarrollo.

**Documentación creada:** 19 de octubre de 2025  
**Última actualización:** 19 de octubre de 2025
