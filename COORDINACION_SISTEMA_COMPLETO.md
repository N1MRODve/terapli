# 🌸 Sistema de Coordinación Clínica - Documentación Completa

**Psicóloga Karem · Panel de Belmaris**  
Versión 1.0 · Octubre 2025

---

## 📋 Índice

1. [Introducción](#introducción)
2. [Instalación y Configuración](#instalación-y-configuración)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Guía de Uso](#guía-de-uso)
5. [Funcionalidades Principales](#funcionalidades-principales)
6. [Integración con WhatsApp](#integración-con-whatsapp)
7. [Recordatorios Automáticos](#recordatorios-automáticos)
8. [Seguridad y Permisos](#seguridad-y-permisos)
9. [Troubleshooting](#troubleshooting)
10. [Próximas Mejoras](#próximas-mejoras)

---

## 🎯 Introducción

El **Panel de Coordinación** es un módulo especializado para gestionar la operación clínica diaria:

### Rol de Coordinación
- **Propósito**: Facilitar la gestión de citas, pagos y comunicación con pacientes.
- **Usuario principal**: Belmaris (coordinación clínica).
- **Acceso**: Exclusivo mediante rol `coordinacion` en la base de datos.

### Funcionalidades Clave
✅ Visualización de sesiones del día  
✅ Gestión de pagos (confirmación y seguimiento)  
✅ Mensajería interna y WhatsApp  
✅ Recordatorios automáticos (24h y 4h antes)  
✅ Dashboard con métricas en tiempo real  

---

## 🛠️ Instalación y Configuración

### 1. Configuración de Base de Datos

Ejecutar el script SQL de configuración:

```bash
# Conectarse a Supabase
cd psicokarem
supabase db push

# O ejecutar manualmente desde el Dashboard de Supabase
# Archivo: supabase_coordinacion_setup.sql
```

**Contenido del script:**
- ✅ Agrega rol `coordinacion` a la tabla `profiles`
- ✅ Crea tabla `recordatorios` para notificaciones programadas
- ✅ Configura políticas RLS para acceso seguro
- ✅ Crea funciones auxiliares para consultas optimizadas
- ✅ Habilita triggers automáticos para recordatorios

### 2. Crear Usuario de Coordinación

Desde el panel de Supabase Auth:

1. Ir a **Authentication > Users**
2. Crear nuevo usuario:
   - Email: `belmaris@psicologakarem.com`
   - Password: (establecer contraseña segura)
   - User Metadata: `{ "rol": "coordinacion", "nombre": "Belmaris" }`

O mediante SQL:

```sql
-- Después de crear el usuario en Auth UI
UPDATE profiles 
SET rol = 'coordinacion', nombre = 'Belmaris'
WHERE email = 'belmaris@psicologakarem.com';
```

### 3. Configurar Edge Function

Desplegar la función de recordatorios:

```bash
cd psicokarem
supabase functions deploy recordatorios
```

Configurar cron job en Supabase Dashboard:

```
Cron Expression: 0 * * * *  (cada hora)
Endpoint: /recordatorios
Method: POST
```

### 4. Variables de Entorno (opcional para WhatsApp)

Si deseas integrar WhatsApp con Twilio:

```env
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886
```

---

## 🏗️ Arquitectura del Sistema

### Estructura de Archivos

```
psicokarem/
├── middleware/
│   └── auth-coordinacion.global.ts       # Middleware de autenticación
├── layouts/
│   └── coordinacion.vue                  # Layout con navegación
├── pages/
│   └── coordinacion/
│       ├── login.vue                     # Página de login
│       ├── dashboard.vue                 # Dashboard principal
│       ├── agenda.vue                    # Calendario de sesiones
│       ├── pagos.vue                     # Gestión de pagos
│       └── mensajes.vue                  # Mensajería
├── components/
│   └── coordinacion/
│       └── DashboardCard.vue             # Tarjeta de resumen
├── supabase/
│   └── functions/
│       └── recordatorios/
│           └── index.ts                  # Edge Function para notificaciones
└── supabase_coordinacion_setup.sql       # Script de configuración DB
```

### Flujo de Datos

```
Usuario (Belmaris)
    ↓
Login (/coordinacion/login)
    ↓
Middleware verifica rol "coordinacion"
    ↓
Dashboard con datos en tiempo real
    ↓
Supabase RLS permite acceso a:
    - Todas las sesiones
    - Todos los pagos
    - Todos los mensajes
    - Recordatorios programados
```

---

## 📖 Guía de Uso

### Inicio de Sesión

1. Navegar a `/coordinacion/login`
2. Ingresar email: `belmaris@psicologakarem.com`
3. Ingresar contraseña
4. El sistema verifica automáticamente el rol de coordinación

**Seguridad:**
- Si el usuario no tiene rol `coordinacion`, el acceso es denegado automáticamente.
- La sesión se cierra si se detecta acceso no autorizado.

### Dashboard Principal

El dashboard muestra:

#### Tarjetas de Resumen
- **Sesiones de hoy**: Cantidad y estado de sesiones programadas
- **Pagos pendientes**: Total de pagos por confirmar
- **Mensajes nuevos**: Cantidad de mensajes sin leer
- **Recordatorios**: Notificaciones programadas para el día

#### Lista de Sesiones
- Hora y modalidad de cada sesión
- Información de paciente y terapeuta
- Estado de la sesión (confirmada, pendiente, etc.)
- Botón rápido para WhatsApp

#### Acciones Rápidas
- Programar nueva sesión
- Enviar mensaje
- Registrar pago

### Gestión de Pagos

**Funcionalidades:**

1. **Tabla de pagos**
   - Filtros por estado, fecha y paciente
   - Visualización de monto, método de pago y referencia

2. **Confirmar pago de paciente**
   - Botón "Confirmar" para cambiar estado a `confirmado_paciente`
   - Registro automático del usuario que confirmó

3. **Enviar a administración**
   - Notifica al equipo financiero para verificación final
   - Crea notificación en tabla `notificaciones`

4. **Métricas**
   - Total pendiente
   - Confirmados del día
   - Total del mes

**Flujo de confirmación:**

```
Pago creado (pendiente)
    ↓
Coordinación confirma → confirmado_paciente
    ↓
Notifica a administración
    ↓
Administración verifica → confirmado_admin
```

### Mensajería

**Enviar mensajes:**

1. Seleccionar paciente de la lista
2. Escribir mensaje
3. Elegir canal:
   - **Mensaje interno**: Guarda en base de datos, aparece en app del paciente
   - **WhatsApp**: Abre WhatsApp Web con el mensaje pre-cargado

**Integración WhatsApp:**
- Usa formato `https://wa.me/{telefono}?text={mensaje}`
- Compatible con WhatsApp Web y aplicación móvil
- El mensaje se pre-carga pero el usuario debe enviarlo manualmente

### Agenda (Próximamente)

Actualmente es un placeholder. La implementación completa incluirá:
- Vista de calendario semanal/mensual
- Crear, editar y cancelar sesiones
- Filtros por terapeuta y paciente
- Arrastrar y soltar para reprogramar

---

## 🔔 Recordatorios Automáticos

### Funcionamiento

El sistema programa automáticamente dos recordatorios para cada sesión **confirmada**:

1. **24 horas antes**
   - Mensaje: "Hola [Paciente], te recordamos que mañana tienes sesión con [Terapeuta] a las [Hora]. 🌟"

2. **4 horas antes**
   - Mensaje: "Hola [Paciente], tu sesión con [Terapeuta] es en 4 horas ([Hora]). Te esperamos 🌸"

### Trigger Automático

Cuando una sesión se marca como `confirmada`, se ejecuta automáticamente:

```sql
CREATE TRIGGER trg_programar_recordatorios
AFTER INSERT OR UPDATE ON sesiones
FOR EACH ROW EXECUTE FUNCTION trigger_programar_recordatorios();
```

Esto crea dos registros en la tabla `recordatorios` con las fechas calculadas.

### Edge Function (Cron Job)

La función `recordatorios` se ejecuta **cada hora** y:

1. Busca recordatorios pendientes (`enviado = false`)
2. Filtra los que tienen `fecha_envio <= ahora`
3. Crea notificación en tabla `notificaciones`
4. Marca el recordatorio como `enviado = true`

**Ventana de tolerancia:**
- ±5 minutos para compensar delays en ejecución del cron

### Canales de Notificación

Actualmente:
- ✅ **Notificación interna**: Aparece en la app del paciente
- 🔧 **WhatsApp**: Requiere integración con API (Twilio, Wati, etc.)
- 🔧 **Email**: Pendiente de implementación

---

## 🔒 Seguridad y Permisos

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas específicas:

```sql
-- Coordinación puede ver todas las sesiones
CREATE POLICY "coordinacion_read_sesiones"
ON sesiones FOR SELECT
USING (
  EXISTS(
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() AND p.rol = 'coordinacion'
  )
);
```

**Políticas aplicadas:**
- ✅ Sesiones: Leer, actualizar, crear, eliminar
- ✅ Pagos: Leer, actualizar, crear
- ✅ Mensajes: Leer, crear (como remitente)
- ✅ Notificaciones: Leer, crear
- ✅ Recordatorios: Full access

### Middleware de Protección

```typescript
// middleware/auth-coordinacion.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  // Verifica que el usuario tenga rol 'coordinacion'
  // Redirige a /coordinacion/login si no está autenticado
  // Redirige a / si no tiene permisos
})
```

### Mejores Prácticas

- ⚠️ **No compartir credenciales** de coordinación
- ⚠️ **Cerrar sesión** al terminar el turno
- ⚠️ **Verificar datos** antes de confirmar pagos
- ⚠️ **Respetar privacidad** de información de pacientes

---

## 🔧 Troubleshooting

### Problema: No puedo iniciar sesión

**Soluciones:**
1. Verificar que el email es correcto
2. Confirmar que el usuario tiene `rol = 'coordinacion'` en la tabla `profiles`
3. Revisar en Supabase Dashboard > Authentication que el usuario existe

```sql
-- Verificar rol
SELECT id, email, rol FROM profiles WHERE email = 'belmaris@psicologakarem.com';

-- Actualizar rol si es necesario
UPDATE profiles SET rol = 'coordinacion' WHERE email = 'belmaris@psicologakarem.com';
```

### Problema: No veo sesiones en el dashboard

**Soluciones:**
1. Verificar que existen sesiones para hoy:
```sql
SELECT * FROM sesiones WHERE DATE(fecha) = CURRENT_DATE;
```

2. Revisar políticas RLS:
```sql
SELECT * FROM pg_policies WHERE tablename = 'sesiones';
```

3. Confirmar que la conexión a Supabase es correcta

### Problema: Recordatorios no se envían

**Soluciones:**
1. Verificar que la Edge Function está desplegada:
```bash
supabase functions list
```

2. Revisar logs de la función:
```bash
supabase functions logs recordatorios
```

3. Confirmar que el cron job está configurado en Supabase Dashboard

4. Verificar que existen recordatorios pendientes:
```sql
SELECT * FROM recordatorios WHERE enviado = false;
```

### Problema: Error de permisos al confirmar pago

**Soluciones:**
1. Verificar política RLS de actualización:
```sql
SELECT * FROM pg_policies WHERE tablename = 'pagos' AND cmd = 'UPDATE';
```

2. Confirmar que el usuario tiene sesión activa:
```javascript
const { data: { user } } = await supabase.auth.getUser()
console.log(user)
```

---

## 🚀 Próximas Mejoras

### Corto Plazo
- [ ] Calendario completo con vue-cal o FullCalendar
- [ ] Modal para crear/editar sesiones desde el panel
- [ ] Historial completo de mensajes (conversaciones)
- [ ] Exportar reportes de pagos a Excel/PDF

### Mediano Plazo
- [ ] Integración con WhatsApp Business API (Twilio/Wati)
- [ ] Notificaciones push para la app móvil
- [ ] Sistema de recordatorios personalizables
- [ ] Dashboard con gráficas de ocupación

### Largo Plazo
- [ ] IA para sugerencias de horarios óptimos
- [ ] Integración con sistemas de pago (Stripe, PayPal)
- [ ] App móvil nativa para coordinación
- [ ] Sincronización con Google Calendar

---

## 📞 Soporte

Para preguntas o problemas:

1. **Documentación técnica**: Revisar archivos `.md` en el proyecto
2. **Base de datos**: Consultar `supabase_coordinacion_setup.sql`
3. **Código fuente**: Explorar carpeta `/pages/coordinacion/`

---

## 📝 Changelog

### v1.0.0 - Octubre 2025
- ✅ Sistema base de coordinación
- ✅ Login y autenticación con rol
- ✅ Dashboard con métricas
- ✅ Gestión de pagos
- ✅ Mensajería básica con WhatsApp
- ✅ Recordatorios automáticos (24h y 4h)
- ✅ Edge Function para notificaciones
- ✅ Documentación completa

---

## 🎨 Diseño y UX

### Paleta de Colores
- **Fondo**: `#F9F7F3` (beige cálido)
- **Acento principal**: `#D8AFA0` (rosa suave)
- **Acento secundario**: `#C49484` (rosa oscuro)
- **Texto primario**: `#5D4A44` (marrón oscuro)
- **Texto secundario**: `#8B7470` (marrón claro)
- **Bordes**: `#E8DFD8` (beige intermedio)

### Tipografía
- **Títulos**: Lora (serif, elegante)
- **Cuerpo**: Lato (sans-serif, legible)

### Principios de Diseño
- ✨ **Minimalista**: Sin elementos innecesarios
- 🌸 **Cálido**: Colores suaves y acogedores
- 📱 **Responsivo**: Funciona en mobile, tablet y desktop
- ♿ **Accesible**: Alto contraste y navegación clara

---

## ✅ Checklist de Implementación

### Para Desarrolladores

- [x] Ejecutar `supabase_coordinacion_setup.sql`
- [x] Crear usuario de coordinación en Supabase Auth
- [x] Desplegar Edge Function `recordatorios`
- [x] Configurar cron job en Supabase
- [ ] (Opcional) Configurar WhatsApp API con Twilio
- [ ] Instalar librería de calendario para agenda completa

### Para Belmaris (Usuario Final)

- [ ] Recibir credenciales de acceso
- [ ] Iniciar sesión en `/coordinacion/login`
- [ ] Familiarizarse con el dashboard
- [ ] Probar confirmación de pagos
- [ ] Enviar mensaje de prueba a un paciente
- [ ] Verificar que los recordatorios se programan correctamente

---

**¡Sistema de Coordinación Clínica listo para uso! 🌸**

Para cualquier duda o mejora, contactar al equipo de desarrollo.
