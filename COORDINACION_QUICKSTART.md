# 🚀 Quick Start - Panel de Coordinación

**Tiempo estimado de setup: 15 minutos**

---

## ⚡ Instalación Rápida

### 1. Configurar Base de Datos (5 min)

```bash
# En tu proyecto
cd psicokarem

# Ejecutar script SQL en Supabase Dashboard
# Copiar y pegar contenido de: supabase_coordinacion_setup.sql
```

O desde CLI:
```bash
supabase db push
```

### 2. Crear Usuario de Coordinación (2 min)

En **Supabase Dashboard > Authentication > Users**:

```json
{
  "email": "belmaris@psicologakarem.com",
  "password": "tu_password_seguro",
  "user_metadata": {
    "rol": "coordinacion",
    "nombre": "Belmaris"
  }
}
```

### 3. Desplegar Edge Function (3 min)

```bash
supabase functions deploy recordatorios
```

Configurar cron en **Supabase Dashboard > Edge Functions**:
- **Cron**: `0 * * * *` (cada hora)
- **Function**: recordatorios

### 4. Probar el Sistema (5 min)

1. Navegar a: `http://localhost:3000/coordinacion/login`
2. Login con credenciales de Belmaris
3. Explorar dashboard
4. ✅ ¡Listo!

---

## 📁 Archivos Creados

```
✅ supabase_coordinacion_setup.sql          # Configuración DB
✅ middleware/auth-coordinacion.global.ts    # Seguridad
✅ layouts/coordinacion.vue                  # Layout principal
✅ pages/coordinacion/login.vue              # Login
✅ pages/coordinacion/dashboard.vue          # Dashboard
✅ pages/coordinacion/agenda.vue             # Agenda (placeholder)
✅ pages/coordinacion/pagos.vue              # Gestión de pagos
✅ pages/coordinacion/mensajes.vue           # Mensajería
✅ components/coordinacion/DashboardCard.vue # Componente UI
✅ supabase/functions/recordatorios/index.ts # Notificaciones automáticas
✅ COORDINACION_SISTEMA_COMPLETO.md          # Documentación completa
✅ COORDINACION_QUICKSTART.md                # Este archivo
```

---

## 🎯 Funcionalidades Implementadas

### ✅ Dashboard
- Resumen de sesiones del día
- Pagos pendientes
- Mensajes no leídos
- Acciones rápidas

### ✅ Gestión de Pagos
- Tabla completa con filtros
- Confirmación de pagos
- Notificación a administración
- Métricas en tiempo real

### ✅ Mensajería
- Mensajes internos
- Integración con WhatsApp Web
- Selección de pacientes

### ✅ Recordatorios Automáticos
- Notificación 24h antes
- Notificación 4h antes
- Trigger automático al confirmar sesión

### 🔧 Pendientes
- Calendario completo (agenda)
- Modal de edición de sesiones
- Integración WhatsApp API
- Historial de conversaciones

---

## 🔑 Rutas del Sistema

```
/coordinacion/login       → Login exclusivo
/coordinacion/dashboard   → Panel principal
/coordinacion/agenda      → Calendario (en desarrollo)
/coordinacion/pagos       → Gestión de pagos
/coordinacion/mensajes    → Mensajería
```

---

## 🛡️ Seguridad

- ✅ RLS habilitado en todas las tablas
- ✅ Middleware verifica rol en cada request
- ✅ Políticas específicas para coordinación
- ✅ Auto-logout si no tiene permisos

---

## 🎨 Diseño

**Paleta de colores:**
- Fondo: `#F9F7F3`
- Acento: `#D8AFA0`
- Texto: `#5D4A44`

**Tipografía:**
- Títulos: Lora
- Cuerpo: Lato

---

## 📞 Comandos Útiles

```bash
# Ver logs de Edge Function
supabase functions logs recordatorios

# Verificar funciones desplegadas
supabase functions list

# Verificar rol del usuario
supabase db query "SELECT email, rol FROM profiles WHERE rol = 'coordinacion'"

# Resetear base de datos (¡CUIDADO!)
supabase db reset
```

---

## 🐛 Troubleshooting Rápido

**No puedo iniciar sesión:**
```sql
-- Verificar y actualizar rol
UPDATE profiles SET rol = 'coordinacion' WHERE email = 'belmaris@psicologakarem.com';
```

**No veo datos en el dashboard:**
```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'sesiones';
```

**Recordatorios no funcionan:**
```bash
# Ver logs
supabase functions logs recordatorios

# Verificar cron job en Dashboard
```

---

## 🚀 Próximos Pasos

1. **Instalar librería de calendario**
   ```bash
   npm install vue-cal
   # o
   npm install @fullcalendar/vue3
   ```

2. **Integrar WhatsApp API** (opcional)
   - Crear cuenta en Twilio
   - Agregar variables de entorno
   - Descomentar código en `recordatorios/index.ts`

3. **Personalizar diseño**
   - Ajustar colores en `tailwind.config.js`
   - Modificar componentes en `/components/coordinacion/`

---

## ✅ Checklist de Verificación

- [ ] Script SQL ejecutado correctamente
- [ ] Usuario de coordinación creado
- [ ] Edge Function desplegada
- [ ] Cron job configurado
- [ ] Login funciona correctamente
- [ ] Dashboard muestra datos
- [ ] Pagos se pueden confirmar
- [ ] Mensajes se envían correctamente
- [ ] WhatsApp Web se abre con mensaje pre-cargado

---

**¡Todo listo para empezar a coordinar sesiones! 🌸**

Para documentación completa, ver: `COORDINACION_SISTEMA_COMPLETO.md`
