# 🚀 Mensajería Interna - Guía Rápida

## ⚡ Instalación en 3 Pasos

### 1️⃣ Ejecutar SQL en Supabase

```bash
# Archivo a ejecutar en SQL Editor de Supabase:
supabase_mensajeria_completa.sql
```

**Qué hace:**
- ✅ Crea tablas `mensajes` y `notificaciones`
- ✅ Configura seguridad (RLS)
- ✅ Crea trigger para notificaciones automáticas
- ✅ Agrega funciones auxiliares

### 2️⃣ Verificar Tablas Creadas

En Supabase > **Table Editor**:
- ✅ `mensajes` (remitente_id, destinatario_id, mensaje, visto)
- ✅ `notificaciones` (usuario_id, titulo, mensaje, tipo, visto)

### 3️⃣ Probar el Sistema

```bash
# Iniciar aplicación
npm run dev

# Acceder como paciente:
http://localhost:3000/paciente/mensajes

# Acceder como terapeuta:
http://localhost:3000/terapeuta/mensajes
```

---

## 📦 Archivos Incluidos

### Backend
```
📄 supabase_mensajeria_completa.sql
```

### Composables
```
🧰 composables/useMensajes.ts
🧰 composables/useNotificaciones.ts
```

### Componentes
```
🧩 components/MensajeCard.vue
🧩 components/MensajeInput.vue
🧩 components/NotificacionesBell.vue
```

### Páginas
```
📄 pages/paciente/mensajes.vue
📄 pages/terapeuta/mensajes.vue
```

### Layouts (actualizados)
```
🎨 layouts/paciente.vue
🎨 layouts/terapeuta.vue
```

---

## 🧪 Testing Rápido

### Como Paciente

1. Login con cuenta paciente
2. Ir a "Mensajes" en menú
3. Escribir mensaje
4. Click "Enviar"
5. ✅ Mensaje aparece a la derecha

### Como Terapeuta

1. Login con cuenta terapeuta
2. Ir a "Mensajes" en menú
3. Ver lista de pacientes con mensajes
4. Click en paciente para abrir conversación
5. Responder mensaje
6. ✅ Mensaje aparece a la derecha

### Notificaciones

1. Enviar mensaje desde un usuario
2. Login como el destinatario
3. ✅ Badge rojo en campana
4. Click en campana
5. ✅ Ver notificación "Nuevo mensaje"
6. Click en notificación
7. ✅ Navega a mensajes

---

## 🔥 Uso de Composables

### Enviar Mensaje

```typescript
const { enviar } = useMensajes()

await enviar(
  'uuid-destinatario',    // ID del destinatario
  'Hola, ¿cómo estás?'    // Contenido
)
```

### Listar Conversación

```typescript
const { mensajes, listarConversacion } = useMensajes()

await listarConversacion('uuid-otro-usuario')
// mensajes.value ahora contiene la conversación
```

### Marcar como Vistos

```typescript
const { marcarVistos } = useMensajes()

await marcarVistos('uuid-remitente')
// Marca todos los mensajes recibidos de ese remitente como vistos
```

### Listar Notificaciones

```typescript
const { notificaciones, totalNoVistas, listar } = useNotificaciones()

await listar(10)  // Últimas 10 notificaciones
console.log(`No vistas: ${totalNoVistas.value}`)
```

---

## 🎨 Componentes Clave

### MensajeCard

```vue
<MensajeCard
  texto="Contenido del mensaje"
  fecha="2025-10-21T10:30:00Z"
  :remitente="true"
  :visto="false"
/>
```

### MensajeInput

```vue
<MensajeInput
  destinatario-id="uuid-del-destinatario"
  placeholder="Escribe tu mensaje..."
  @mensaje-enviado="handleEnviado"
/>
```

### NotificacionesBell

```vue
<NotificacionesBell />
<!-- Auto-gestionado, solo incluir en layout -->
```

---

## 🔒 Seguridad (RLS)

✅ **Automático** - Las políticas RLS ya están configuradas:

- Solo ves mensajes donde eres remitente o destinatario
- Solo puedes enviar mensajes con tu propio ID
- Solo el destinatario puede marcar como visto
- Solo ves tus propias notificaciones

**No necesitas configurar nada adicional.**

---

## 🐛 Troubleshooting Rápido

### No aparecen mensajes

```sql
-- Verificar datos en Supabase SQL Editor
SELECT * FROM mensajes LIMIT 10;
SELECT * FROM notificaciones LIMIT 10;
```

### Notificaciones no se crean

```sql
-- Verificar trigger
SELECT * FROM pg_trigger WHERE tgname = 'trg_notify_new_message';

-- Re-ejecutar script si es necesario
```

### Realtime no funciona

1. Supabase Dashboard > Database > Replication
2. Habilitar para tabla `mensajes`
3. Guardar cambios

---

## ✅ Checklist de Verificación

Antes de dar por completado:

- [ ] SQL ejecutado sin errores
- [ ] Tablas `mensajes` y `notificaciones` visibles en Supabase
- [ ] Políticas RLS habilitadas (6 políticas en total)
- [ ] Trigger `trg_notify_new_message` creado
- [ ] Aplicación Nuxt corre sin errores (`npm run dev`)
- [ ] Campana de notificaciones visible en header
- [ ] Página `/paciente/mensajes` accesible
- [ ] Página `/terapeuta/mensajes` accesible
- [ ] Mensaje de prueba enviado exitosamente
- [ ] Notificación creada automáticamente

---

## 📚 Documentación Completa

Para más detalles, ver:
```
MENSAJERIA_SISTEMA_COMPLETO.md
```

Incluye:
- 📖 Arquitectura detallada
- 🔧 Funciones SQL auxiliares
- 🎨 Guía de diseño UX/UI
- 🧪 Casos de prueba completos
- 🚀 Ideas para mejoras futuras

---

## 💡 Tips Rápidos

### Suscribirse a Realtime (opcional)

```typescript
const { suscribirseAConversacion, desuscribirse } = useMensajes()

onMounted(() => {
  suscribirseAConversacion('uuid-otro-usuario')
})

onUnmounted(() => {
  desuscribirse()
})
```

### Formatear fechas en español

```typescript
const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}
```

### Badge personalizado

```vue
<span v-if="totalNoVistas > 0" class="badge">
  {{ totalNoVistas > 9 ? '9+' : totalNoVistas }}
</span>
```

---

**¡Sistema listo para usar! 🎉**

*Cualquier duda, consulta MENSAJERIA_SISTEMA_COMPLETO.md*
