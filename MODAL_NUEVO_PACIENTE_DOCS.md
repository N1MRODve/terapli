# 📋 Modal de Nuevo Paciente - Documentación

## 🎯 Descripción General

El componente `ModalNuevoPaciente.vue` permite a las psicólogas crear nuevos registros de pacientes directamente desde la interfaz. El proceso crea automáticamente:

1. ✅ Usuario en Supabase Auth
2. ✅ Perfil en tabla `profiles`
3. ✅ Registro en tabla `pacientes`
4. ✅ Nota inicial (opcional) en `notas_terapeuticas`

---

## 📂 Ubicación

```
components/
  └── ModalNuevoPaciente.vue
```

---

## 🔧 Uso

### En la página de lista de pacientes:

```vue
<template>
  <div>
    <!-- Botón para abrir modal -->
    <button @click="mostrarModalNuevo = true">
      + Nuevo Paciente
    </button>

    <!-- Modal -->
    <ModalNuevoPaciente
      :mostrar="mostrarModalNuevo"
      @cerrar="mostrarModalNuevo = false"
      @paciente-creado="manejarPacienteCreado"
    />
  </div>
</template>

<script setup>
const mostrarModalNuevo = ref(false)

const manejarPacienteCreado = async (nuevoPaciente) => {
  console.log('Paciente creado:', nuevoPaciente)
  // Recargar lista de pacientes
  await cargarPacientes()
}
</script>
```

---

## 📝 Props y Eventos

### Props

| Prop      | Tipo    | Default | Descripción                        |
|-----------|---------|---------|-------------------------------------|
| `mostrar` | Boolean | `false` | Controla visibilidad del modal      |

### Eventos

| Evento             | Payload        | Descripción                          |
|--------------------|----------------|--------------------------------------|
| `cerrar`           | -              | Se emite cuando se cierra el modal   |
| `paciente-creado`  | `Object`       | Se emite tras crear exitosamente     |

---

## 📋 Campos del Formulario

### Información Personal (Requerida)

- **Nombre** * - `string` - Nombre del paciente
- **Apellido Paterno** * - `string` - Apellido paterno
- **Apellido Materno** - `string` - Apellido materno (opcional)
- **Email** * - `email` - Correo electrónico único
- **Teléfono** - `tel` - Número de contacto (opcional)
- **Fecha de Nacimiento** - `date` - Para cálculo de edad (opcional)

### Información Terapéutica (Requerida)

- **Área de Acompañamiento** * - `select`
  - Ansiedad
  - Depresión
  - Autoestima
  - Relaciones
  - Duelo
  - Estrés Laboral
  - Crecimiento Personal
  - Otro

- **Frecuencia de Sesiones** * - `select`
  - Semanal
  - Quincenal
  - Mensual

- **Estado** - `select` (default: Activo)
  - Activo
  - Inactivo

- **Notas Iniciales** - `textarea`
  - Motivo de consulta
  - Observaciones preliminares
  - Objetivos terapéuticos iniciales

---

## 🔐 Proceso de Creación en Supabase

### 1. Creación de Usuario Auth

El modal intenta crear un usuario usando dos métodos:

**Método Preferido (Admin API):**
```javascript
await supabase.auth.admin.createUser({
  email: formulario.email,
  email_confirm: true,
  user_metadata: {
    nombre: formulario.nombre,
    apellido_paterno: formulario.apellido_paterno,
    apellido_materno: formulario.apellido_materno
  }
})
```

**Método Alternativo (Sign Up):**
```javascript
await supabase.auth.signUp({
  email: formulario.email,
  password: generateTemporaryPassword(),
  options: {
    data: { ...userData }
  }
})
```

### 2. Creación del Perfil

```javascript
await supabase
  .from('profiles')
  .insert({
    id: userId,
    nombre: formulario.nombre,
    apellido_paterno: formulario.apellido_paterno,
    apellido_materno: formulario.apellido_materno,
    email: formulario.email,
    telefono: formulario.telefono,
    fecha_nacimiento: formulario.fecha_nacimiento,
    rol: 'paciente'
  })
```

### 3. Registro como Paciente

```javascript
await supabase
  .from('pacientes')
  .insert({
    id: userId,
    psicologa_id: user.value?.id,
    area_de_acompanamiento: formulario.area_acompanamiento,
    frecuencia: formulario.frecuencia,
    activo: formulario.activo,
    metadata: {
      notas_iniciales: formulario.notas_iniciales,
      fecha_registro: new Date().toISOString()
    }
  })
```

### 4. Nota Inicial (Opcional)

Si hay notas iniciales:
```javascript
await supabase
  .from('notas_terapeuticas')
  .insert({
    paciente_id: userId,
    contenido: formulario.notas_iniciales,
    tipo: 'inicial'
  })
```

---

## ⚠️ Manejo de Errores

El modal maneja automáticamente:

### Errores de Validación
- Campos requeridos vacíos
- Formato de email inválido
- Validación HTML5 nativa

### Errores de Supabase
- Email duplicado
- Errores de red
- Permisos insuficientes
- Violaciones de constraints

### Mensajes de Usuario
```vue
<div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
  <p class="text-sm text-red-600">{{ error }}</p>
</div>
```

---

## 🎨 Diseño y UX

### Características de Diseño

- **Modal centrado** con overlay oscuro semitransparente
- **Scroll interno** cuando el contenido excede la altura
- **Sticky header** con título y botón cerrar
- **Responsive**: Adaptado para móviles y tablets
- **Estados visuales**: Loading, error, éxito

### Paleta de Colores

```css
background: #F9F7F3 (base-bg)
primary: #D8AFA0 (terracota)
text: #5D4A44 (cafe)
border: #D8AFA0/30 (terracota con opacidad)
```

### Accesibilidad

- Labels asociados correctamente con inputs
- ARIA labels en botones
- Focus visible con ring
- Teclado navigation (Tab)
- Cerrar con click fuera del modal
- Campos requeridos marcados con *

---

## 🔒 Seguridad y Privacidad

### Validaciones

1. **Email único**: Supabase valida automáticamente
2. **Campos requeridos**: Validación HTML5 + JavaScript
3. **Contraseña temporal**: 16 caracteres aleatorios seguros
4. **Permisos RLS**: Solo la psicóloga asignada puede ver datos

### Datos Sensibles

- ⚠️ El modal NO solicita datos médicos sensibles
- ℹ️ Las notas iniciales se guardan con cifrado en Supabase
- 🔐 El email es el único identificador compartido

### RGPD/LOPD

- ✅ Consentimiento implícito al crear cuenta
- ✅ Usuario tiene derecho de acceso/modificación/eliminación
- ✅ Datos mínimos necesarios para el servicio

---

## 🧪 Testing

### Test Manual

1. **Abrir modal** → Verificar animación suave
2. **Llenar formulario completo** → Verificar validaciones
3. **Enviar con campos vacíos** → Debe mostrar errores HTML5
4. **Email duplicado** → Debe mostrar error de Supabase
5. **Crear exitosamente** → Verificar que recarga lista
6. **Cerrar modal** → Verificar que resetea formulario

### Casos de Prueba

```javascript
// ✅ Caso exitoso
{
  nombre: 'Ana',
  apellido_paterno: 'García',
  email: 'ana.garcia@test.com',
  area_acompanamiento: 'Ansiedad',
  frecuencia: 'semanal'
}

// ❌ Email duplicado
{
  email: 'existente@test.com' // Error esperado
}

// ❌ Campos vacíos
{
  nombre: '',
  apellido_paterno: '' // Error de validación
}
```

---

## 📊 Integración con Lista de Pacientes

### Flujo Completo

```
Usuario clickea "Nuevo Paciente"
  ↓
Modal se abre (mostrarModalNuevo = true)
  ↓
Usuario llena formulario
  ↓
Submit → Crea usuario + perfil + paciente
  ↓
Emite evento "paciente-creado"
  ↓
Página recarga lista de pacientes
  ↓
Modal se cierra automáticamente
  ↓
Usuario ve nuevo paciente en la lista
```

---

## 🚀 Mejoras Futuras

### Versión 2.0 (Sugerencias)

- [ ] **Validación de teléfono** con formato internacional
- [ ] **Upload de foto de perfil** durante creación
- [ ] **Envío de email de bienvenida** automático
- [ ] **Campos personalizados** según tipo de terapia
- [ ] **Asignación de bono inicial** opcional
- [ ] **Pre-llenado desde contactos** guardados
- [ ] **Vista previa** antes de confirmar
- [ ] **Notificación toast** de éxito/error
- [ ] **Multi-step wizard** para formularios largos
- [ ] **Autocompletar** desde base de contactos

---

## 🆘 Solución de Problemas

### Problema: "No se puede crear usuario"

**Causa**: Método `auth.admin` no disponible
**Solución**: El código ya incluye fallback a `auth.signUp`

### Problema: "Email already registered"

**Causa**: Email duplicado en Supabase Auth
**Solución**: Validar email antes de submit o mostrar mensaje claro al usuario

### Problema: "Permission denied on profiles"

**Causa**: RLS policies no configuradas correctamente
**Solución**: Verificar policies en Supabase Dashboard

```sql
-- Policy para permitir a psicólogas crear profiles
CREATE POLICY "Psicologas pueden crear pacientes"
ON public.profiles
FOR INSERT
TO authenticated
USING (auth.uid() IN (SELECT id FROM psicologas));
```

### Problema: "Modal no cierra"

**Causa**: Estado `guardando` bloqueando cierre
**Solución**: Verificar que `finally` actualiza `guardando.value = false`

---

## 📞 Soporte

Para preguntas o issues:
- Revisar logs del navegador (Console)
- Verificar Supabase Dashboard → Logs
- Comprobar permisos RLS
- Validar estructura de tablas

---

## ✅ Checklist de Implementación

- [x] Componente `ModalNuevoPaciente.vue` creado
- [x] Integrado en `pages/terapeuta/pacientes.vue`
- [x] Botón "Nuevo Paciente" funcional
- [x] Formulario con validaciones
- [x] Creación en Supabase Auth
- [x] Creación en tabla `profiles`
- [x] Creación en tabla `pacientes`
- [x] Notas iniciales opcionales
- [x] Manejo de errores
- [x] Estados de loading
- [x] Evento `paciente-creado` funcionando
- [x] Recarga de lista tras creación
- [x] Responsive design
- [x] Documentación completa

---

**Última actualización**: 19 de octubre de 2025
**Versión**: 1.0
**Autor**: GitHub Copilot para PsicologaKarem
