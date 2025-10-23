# 📬 Sistema de Mensajería Interna Segura
**Psicóloga Karem - Comunicación Asíncrona Paciente-Terapeuta**

---

## 🎯 Descripción General

Sistema completo de mensajería privada y asíncrona entre pacientes y terapeutas, implementado con **Nuxt 3 + Supabase + TailwindCSS**. Incluye notificaciones internas, seguridad mediante RLS (Row Level Security), y una interfaz cálida y profesional.

### ✨ Características Principales

- ✅ **Conversaciones 1:1** privadas entre paciente y terapeuta asignado
- ✅ **Mensajería asíncrona** (no chat en tiempo real)
- ✅ **Notificaciones internas** al recibir mensajes nuevos
- ✅ **Seguridad robusta** con políticas RLS en Supabase
- ✅ **UI empática y profesional** con paleta serena
- ✅ **Realtime opcional** para actualización automática de mensajes
- ✅ **Historial completo** de conversaciones
- ✅ **Indicadores de lectura** para mensajes enviados

---

## 📦 Archivos Creados

### 🗄️ Base de Datos SQL
```
supabase_mensajeria_completa.sql
```

### 🧰 Composables
```
composables/useMensajes.ts
composables/useNotificaciones.ts
```

### 🧩 Componentes
```
components/MensajeCard.vue
components/MensajeInput.vue
components/NotificacionesBell.vue
```

### 📄 Páginas
```
pages/paciente/mensajes.vue
pages/terapeuta/mensajes.vue
```

### 🎨 Layouts Actualizados
```
layouts/paciente.vue (integración de NotificacionesBell)
layouts/terapeuta.vue (integración de NotificacionesBell)
```

---

## 🚀 Instalación y Configuración

### 1️⃣ Ejecutar SQL en Supabase

1. Accede al **SQL Editor** de tu proyecto en Supabase
2. Abre el archivo `supabase_mensajeria_completa.sql`
3. Copia y pega todo el contenido
4. Ejecuta el script

**Nota:** El script creará automáticamente:
- Tablas `mensajes` y `notificaciones`
- Políticas RLS para seguridad
- Índices para optimización de consultas
- Trigger para notificaciones automáticas
- Funciones auxiliares para conversaciones

### 2️⃣ Verificar Tablas Creadas

En el **Table Editor** de Supabase deberías ver:

#### Tabla `mensajes`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid | ID único del mensaje |
| `remitente_id` | uuid | ID del usuario que envía |
| `destinatario_id` | uuid | ID del usuario que recibe |
| `sesion_id` | uuid (opcional) | Referencia a sesión relacionada |
| `mensaje` | text | Contenido del mensaje |
| `visto` | boolean | Si fue leído por destinatario |
| `created_at` | timestamp | Fecha de creación |

#### Tabla `notificaciones`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | uuid | ID único de la notificación |
| `usuario_id` | uuid | ID del usuario destinatario |
| `titulo` | text | Título de la notificación |
| `mensaje` | text | Descripción de la notificación |
| `tipo` | text | Tipo (mensaje, sesion, etc.) |
| `visto` | boolean | Si fue vista |
| `referencia_id` | uuid (opcional) | ID del mensaje relacionado |
| `created_at` | timestamp | Fecha de creación |

### 3️⃣ Verificar Políticas RLS

En **Authentication > Policies** verifica que existan:

**Tabla `mensajes`:**
- ✅ `mensajes_select_participantes` - Solo participantes pueden ver
- ✅ `mensajes_insert_remitente` - Solo remitente puede insertar
- ✅ `mensajes_update_visto_destinatario` - Solo destinatario puede marcar como visto

**Tabla `notificaciones`:**
- ✅ `notificaciones_select_owner` - Solo dueño puede ver
- ✅ `notificaciones_insert_any` - Inserción permitida (trigger)
- ✅ `notificaciones_update_owner` - Solo dueño puede actualizar

### 4️⃣ Verificar Integración en el Proyecto

El sistema ya está completamente integrado. Solo necesitas:

1. Asegurarte de que Supabase esté configurado en `nuxt.config.ts`
2. Verificar que las rutas estén accesibles:
   - `/paciente/mensajes` para pacientes
   - `/terapeuta/mensajes` para terapeutas

---

## 📖 Uso del Sistema

### 👤 Para Pacientes

1. **Acceder a mensajes:**
   - Navegar a "Mensajes" en el menú lateral
   - O hacer clic en la campana de notificaciones

2. **Enviar mensaje:**
   - Escribir en el campo de texto
   - Presionar "Enviar" o `Enter`

3. **Ver conversación:**
   - Mensajes propios aparecen a la derecha (fondo rosa claro)
   - Mensajes del terapeuta aparecen a la izquierda (fondo blanco)
   - Scroll automático a nuevos mensajes

4. **Notificaciones:**
   - Badge rojo en campana indica mensajes no leídos
   - Click en campana muestra lista de notificaciones
   - Click en notificación navega a mensajes

### 👨‍⚕️ Para Terapeutas

1. **Ver lista de conversaciones:**
   - Sidebar izquierdo muestra todos los pacientes con mensajes
   - Badge indica cantidad de mensajes no leídos por paciente
   - Última vista previa del mensaje

2. **Seleccionar paciente:**
   - Click en paciente abre conversación completa
   - Los mensajes se marcan automáticamente como leídos

3. **Responder:**
   - Escribir en campo de texto inferior
   - Enviar mensaje con botón o `Enter`

4. **Gestión multi-paciente:**
   - Cambiar entre conversaciones desde sidebar
   - Contador total de mensajes pendientes
   - Ordenación por último mensaje

---

## 🧩 Componentes

### `<MensajeCard>`

Tarjeta individual de mensaje con diseño diferenciado para remitente/destinatario.

**Props:**
```typescript
{
  texto: string           // Contenido del mensaje
  fecha: string           // ISO timestamp
  remitente: boolean      // true si es mensaje propio
  visto?: boolean         // Si fue leído (opcional)
}
```

**Ejemplo:**
```vue
<MensajeCard
  texto="Hola, ¿cómo estás?"
  fecha="2025-10-21T10:30:00Z"
  :remitente="true"
  :visto="true"
/>
```

### `<MensajeInput>`

Campo de entrada para enviar mensajes con validación.

**Props:**
```typescript
{
  destinatarioId: string      // UUID del destinatario
  placeholder?: string        // Texto placeholder
}
```

**Eventos:**
```typescript
@mensaje-enviado  // Emitido tras envío exitoso
```

**Ejemplo:**
```vue
<MensajeInput
  destinatario-id="uuid-del-terapeuta"
  placeholder="Escribe tu mensaje..."
  @mensaje-enviado="handleEnviado"
/>
```

### `<NotificacionesBell>`

Campana de notificaciones con dropdown y badge contador.

**Props:** Ninguno (auto-gestionado)

**Ejemplo:**
```vue
<NotificacionesBell />
```

---

## 🧰 Composables

### `useMensajes()`

Gestión completa de mensajes y conversaciones.

**API:**
```typescript
const {
  mensajes,                    // Ref<Mensaje[]>
  conversaciones,              // Ref<Conversacion[]>
  loading,                     // Ref<boolean>
  error,                       // Ref<string | null>
  
  listarConversacion,          // (participanteId: string) => Promise<Mensaje[]>
  enviar,                      // (destinatarioId, contenido, sesionId?) => Promise<Mensaje | null>
  marcarVistos,                // (participanteId: string) => Promise<void>
  listarConversaciones,        // () => Promise<Conversacion[]>
  contarNoVistos,              // () => Promise<number>
  suscribirseAConversacion,    // (participanteId: string) => void
  desuscribirse                // () => Promise<void>
} = useMensajes()
```

**Ejemplo de uso:**
```typescript
const { mensajes, listarConversacion, enviar } = useMensajes()

// Cargar conversación con terapeuta
await listarConversacion('uuid-terapeuta')

// Enviar mensaje
await enviar('uuid-destinatario', 'Hola, necesito ayuda')

// Suscribirse a actualizaciones en tiempo real
suscribirseAConversacion('uuid-terapeuta')
```

### `useNotificaciones()`

Gestión de notificaciones internas.

**API:**
```typescript
const {
  notificaciones,              // Ref<Notificacion[]>
  totalNoVistas,               // Ref<number>
  loading,                     // Ref<boolean>
  error,                       // Ref<string | null>
  
  listar,                      // (limite?: number) => Promise<Notificacion[]>
  crear,                       // (usuarioId, titulo, mensaje, tipo, referenciaId?) => Promise<Notificacion | null>
  marcarVista,                 // (notificacionId: string) => Promise<void>
  marcarTodasVistas,           // () => Promise<void>
  contarNoVistas,              // () => Promise<number>
  eliminar,                    // (notificacionId: string) => Promise<void>
  eliminarVistas,              // () => Promise<void>
  suscribirse,                 // () => void
  desuscribirse                // () => Promise<void>
} = useNotificaciones()
```

**Ejemplo de uso:**
```typescript
const { notificaciones, totalNoVistas, listar, marcarTodasVistas } = useNotificaciones()

// Cargar notificaciones
await listar(10)

// Contar no vistas
console.log('No vistas:', totalNoVistas.value)

// Marcar todas como vistas
await marcarTodasVistas()
```

---

## 🔒 Seguridad y Privacidad

### Políticas RLS Implementadas

1. **Solo participantes ven sus conversaciones**
   - Un usuario solo puede ver mensajes donde es remitente o destinatario
   - Imposible acceder a conversaciones de otros

2. **Remitente autentica envío**
   - Solo puedes enviar mensajes con tu propio ID como remitente
   - Previene suplantación de identidad

3. **Destinatario controla estado de lectura**
   - Solo el destinatario puede marcar mensajes como vistos
   - Remitente no puede modificar el estado

4. **Notificaciones privadas**
   - Cada usuario solo ve sus propias notificaciones
   - Inserción controlada por trigger o aplicación

### Buenas Prácticas Éticas

✅ **No hay indicadores "escribiendo..." ni "en línea"**
   - Respeta el ritmo terapéutico asíncrono
   - Reduce presión de respuesta inmediata

✅ **Sin marcas de "visto por"**
   - El paciente no ve cuándo el terapeuta leyó
   - Evita ansiedad por espera de respuesta

✅ **Mensajes no editables ni eliminables**
   - Mantiene registro completo e íntegro
   - Importante para documentación clínica

✅ **Solo notificaciones internas**
   - No envía emails ni SMS automáticos
   - Control total del usuario sobre comunicación

---

## 🎨 Estilo y Diseño

### Paleta de Colores

```css
--bg-base: #F9F7F3        /* Fondo general cálido */
--accent: #D8AFA0         /* Terracota suave (botones, badges) */
--accent-hover: #C89B8A   /* Hover terracota */
--text: #5D4A44           /* Café oscuro (texto principal) */
--border: #EAD5D3         /* Rosa pálido (bordes) */
```

### Tipografía

- **Títulos:** Lora (serif, cálida)
- **Cuerpo:** Lato (sans-serif, legible)

### Componentes de Mensaje

**Mensaje propio (remitente):**
```css
bg-[#EAD5D3]/50           /* Rosa pálido semi-transparente */
align: right
```

**Mensaje del otro (destinatario):**
```css
bg-white
border: #EAD5D3/40
align: left
```

### Animaciones

- Fade-in suave al cargar mensajes
- Transiciones de hover en botones (200ms)
- Scroll suave automático a nuevos mensajes

---

## 🧪 Testing y Validación

### Verificar Funcionalidad

1. **Crear usuarios de prueba:**
   ```sql
   -- En Supabase SQL Editor
   SELECT * FROM profiles WHERE rol IN ('paciente', 'terapeuta');
   ```

2. **Enviar mensaje de prueba:**
   - Login como paciente
   - Ir a `/paciente/mensajes`
   - Enviar mensaje
   - Verificar en tabla: `SELECT * FROM mensajes;`

3. **Verificar notificación:**
   - Login como terapeuta
   - Revisar campana de notificaciones
   - Verificar en tabla: `SELECT * FROM notificaciones;`

4. **Probar RLS:**
   - Intentar acceder a mensajes de otra conversación
   - Debería fallar silenciosamente (no devolver datos)

### Casos de Prueba

✅ Paciente envía mensaje a terapeuta
✅ Terapeuta responde a paciente
✅ Notificación se crea automáticamente (trigger)
✅ Mensajes se marcan como vistos al abrir conversación
✅ Badge de notificaciones muestra contador correcto
✅ Realtime actualiza mensajes sin refrescar página
✅ RLS impide acceso a conversaciones ajenas

---

## 📊 Funciones Auxiliares SQL

### `contar_mensajes_no_vistos(usuario_id)`

Cuenta mensajes no leídos de un usuario.

```sql
SELECT contar_mensajes_no_vistos('uuid-del-usuario');
-- Retorna: número de mensajes sin leer
```

### `obtener_ultimas_conversaciones(usuario_id)`

Lista conversaciones con metadatos.

```sql
SELECT * FROM obtener_ultimas_conversaciones('uuid-del-usuario');
```

**Retorna:**
- `otro_usuario_id` - UUID del otro participante
- `otro_usuario_nombre` - Nombre del otro usuario
- `otro_usuario_avatar` - URL del avatar
- `ultimo_mensaje` - Texto del último mensaje
- `ultimo_mensaje_fecha` - Timestamp del último mensaje
- `mensajes_no_vistos` - Contador de no leídos

---

## 🔧 Troubleshooting

### Problema: No aparecen mensajes

**Causa:** Posible problema con RLS o relación `profiles`.

**Solución:**
1. Verificar que tabla `profiles` exista:
   ```sql
   SELECT * FROM profiles LIMIT 1;
   ```
2. Verificar foreign keys en `mensajes`:
   ```sql
   \d mensajes  -- En psql
   ```
3. Revisar políticas RLS están habilitadas:
   ```sql
   SELECT tablename, policyname FROM pg_policies WHERE tablename = 'mensajes';
   ```

### Problema: Notificaciones no se crean

**Causa:** Trigger no está funcionando.

**Solución:**
1. Verificar que trigger existe:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trg_notify_new_message';
   ```
2. Verificar función existe:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'notify_new_message';
   ```
3. Re-crear trigger desde `supabase_mensajeria_completa.sql`

### Problema: Componentes no se muestran

**Causa:** Falta importación automática.

**Solución:**
Verificar en `nuxt.config.ts`:
```typescript
export default defineNuxtConfig({
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    }
  ]
})
```

### Problema: Realtime no funciona

**Causa:** Canal no suscrito o Realtime no habilitado.

**Solución:**
1. En Supabase Dashboard > Database > Replication
2. Habilitar Realtime para tabla `mensajes`
3. Verificar suscripción en código:
   ```typescript
   suscribirseAConversacion(participanteId)
   ```

---

## 🚀 Mejoras Futuras (Opcional)

### Funcionalidades Adicionales

- [ ] **Adjuntar archivos** (imágenes, PDFs de tareas)
- [ ] **Búsqueda de mensajes** (por contenido, fecha)
- [ ] **Archivar conversaciones** antiguas
- [ ] **Mensajes programados** (envío diferido)
- [ ] **Respuestas rápidas** (templates predefinidos)
- [ ] **Indicador de "nuevo mensaje"** en navegación
- [ ] **Exportar conversación** a PDF
- [ ] **Integración con calendario** (vincular a sesiones)

### Optimizaciones

- [ ] **Paginación** para conversaciones largas
- [ ] **Caché local** con IndexedDB
- [ ] **Compresión de mensajes** antiguos
- [ ] **Lazy loading** de imágenes/attachments
- [ ] **Service Worker** para notificaciones push
- [ ] **Scroll virtual** para rendimiento en chats largos

---

## 📚 Recursos Adicionales

### Documentación Relevante

- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Nuxt 3 Composables](https://nuxt.com/docs/guide/directory-structure/composables)
- [TailwindCSS](https://tailwindcss.com/docs)

### Archivos de Referencia en el Proyecto

- `SUPABASE_QUICKSTART.md` - Configuración general de Supabase
- `AUTENTICACION_TERAPEUTA_GUIA.md` - Sistema de autenticación
- `SESIONES_GUIA_RAPIDA.md` - Gestión de sesiones

---

## ✅ Checklist de Implementación

### Backend (Supabase)
- [x] Tabla `mensajes` creada
- [x] Tabla `notificaciones` creada
- [x] Políticas RLS configuradas
- [x] Índices optimizados
- [x] Trigger de notificaciones activo
- [x] Funciones auxiliares creadas

### Frontend (Nuxt)
- [x] Composable `useMensajes.ts`
- [x] Composable `useNotificaciones.ts`
- [x] Componente `MensajeCard.vue`
- [x] Componente `MensajeInput.vue`
- [x] Componente `NotificacionesBell.vue`
- [x] Página `/paciente/mensajes.vue`
- [x] Página `/terapeuta/mensajes.vue`
- [x] Integración en layouts

### Testing
- [ ] Envío de mensajes paciente → terapeuta
- [ ] Envío de mensajes terapeuta → paciente
- [ ] Notificaciones automáticas
- [ ] Marcado como visto
- [ ] RLS funciona correctamente
- [ ] Realtime actualiza en vivo
- [ ] UI responsive en móvil

---

## 🎉 Conclusión

El sistema de mensajería interna está **completamente implementado y listo para usar**. Solo necesitas:

1. ✅ Ejecutar el SQL en Supabase (`supabase_mensajeria_completa.sql`)
2. ✅ Verificar que las tablas y políticas se crearon correctamente
3. ✅ Iniciar tu aplicación Nuxt (`npm run dev`)
4. ✅ Navegar a `/paciente/mensajes` o `/terapeuta/mensajes`

**El sistema respeta los principios éticos de comunicación terapéutica:**
- Asíncrono y sin presión
- Privado y seguro
- Profesional y empático
- Completo registro de historial

---

**Desarrollado con 💙 para Psicóloga Karem**
*Sistema de Mensajería v1.0 - Octubre 2025*
