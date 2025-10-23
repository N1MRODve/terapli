# 🚀 Guía Rápida - Módulo de Pacientes

## ⚡ Inicio Rápido

### 1. Verificar que el servidor está corriendo
```bash
npm run dev
```

### 2. Acceder al módulo
Navega a: `http://localhost:3000/terapeuta/pacientes`

### 3. Si necesitas datos de prueba

Ejecuta el script de migración (opcional para desarrollo):

```bash
# Edita primero el archivo y reemplaza UUID_DE_LA_PSICOLOGA
# Con tu UUID real de terapeuta
supabase/migrations/20251019_datos_prueba_pacientes.sql
```

O ejecuta manualmente desde el panel de Supabase:
- Copia el contenido del archivo
- Reemplaza `UUID_DE_LA_PSICOLOGA` con tu UUID
- Ejecuta en el SQL Editor de Supabase

---

## 📋 Funcionalidades Disponibles

### Lista de Pacientes (`/terapeuta/pacientes`)

✅ **Ver todos los pacientes** asignados a tu terapeuta
✅ **Buscar** por nombre en tiempo real
✅ **Filtrar** por estado:
  - Todos
  - Activos
  - En pausa
  - Finalizados

✅ **Ver información rápida** de cada paciente:
  - Estado emocional actual
  - Última sesión
  - Próxima sesión
  - Total de sesiones
  - Evolución general

### Ficha Individual (`/terapeuta/pacientes/[id]`)

✅ **Resumen completo** del paciente
✅ **Historial de sesiones** (últimas 5)
✅ **Gráfico de evolución emocional** (últimos 30 días)
✅ **Notas clínicas privadas** editables
✅ **Alertas automáticas** si requiere atención

---

## 🔐 Seguridad y Confidencialidad

### ✅ Implementado:

- **RLS (Row Level Security)** activado
- Solo el terapeuta asignado puede ver sus pacientes
- Notas terapéuticas protegidas
- No se muestran datos sensibles explícitos
- Nombres con inicial del segundo apellido

### 🔒 Protección de Datos:

Todas las consultas verifican:
```javascript
.eq('psicologa_id', user.value?.id)
```

Las notas terapéuticas verifican:
```javascript
.eq('psicologa_id', user.value?.id)
.eq('paciente_id', pacienteId)
```

---

## 🎨 Componentes Disponibles

### `<PacienteCard>`
Tarjeta de paciente para listas:
```vue
<PacienteCard 
  :paciente="pacienteObj" 
  @click="irAFicha" 
/>
```

### `<NotasPrivadas>`
Editor de notas clínicas:
```vue
<NotasPrivadas
  :paciente-id="id"
  :contenido="texto"
  :ultima-actualizacion="fecha"
  @guardar="handleGuardar"
/>
```

### `<PacienteEvolucion>`
Gráfico de evolución emocional:
```vue
<PacienteEvolucion 
  :paciente-id="id" 
/>
```

---

## 🐛 Solución de Problemas

### No se muestran pacientes

1. Verifica que estás autenticado como terapeuta
2. Revisa que tienes pacientes asignados con tu `psicologa_id`
3. Comprueba la consola del navegador por errores

### El gráfico no carga

1. Verifica que Chart.js está instalado:
```bash
npm list chart.js
```

2. Si no está, instala:
```bash
npm install chart.js
```

### Las notas no se guardan

1. Verifica permisos RLS en tabla `notas_terapeuticas`
2. Comprueba que el `psicologa_id` coincide con tu usuario
3. Revisa la consola por errores de Supabase

---

## 📊 Estructura de Datos Esperada

### Paciente:
```javascript
{
  id: 'uuid',
  nombre: 'María',
  apellidos: 'González Pérez',
  email: 'maria@test.com',
  activo: true,
  en_pausa: false,
  area_de_acompanamiento: 'Ansiedad',
  frecuencia: 'semanal',
  ultima_sesion: '2024-10-15',
  proxima_sesion: '2024-10-22',
  total_sesiones: 12,
  estado_emocional_promedio: 4.2,
  evolucion_porcentaje: 78,
  requiere_atencion: false
}
```

### Nota Terapéutica:
```javascript
{
  id: 'uuid',
  paciente_id: 'uuid',
  psicologa_id: 'uuid',
  contenido: 'Texto de la nota...',
  created_at: '2024-10-01',
  updated_at: '2024-10-15'
}
```

---

## 🔄 Próximas Funcionalidades

### En Desarrollo:
- [ ] Modal para añadir nuevo paciente
- [ ] Modal para editar paciente existente
- [ ] Integración directa con agenda
- [ ] Exportar ficha a PDF
- [ ] Gestión de bonos desde la ficha

### Planificadas:
- [ ] Filtros avanzados
- [ ] Ordenamiento personalizado
- [ ] Etiquetas personalizadas
- [ ] Comparativa de evolución
- [ ] Alertas configurables

---

## 💡 Tips de Uso

### Búsqueda Eficiente
- Puedes buscar por nombre o apellido
- La búsqueda es en tiempo real
- No distingue mayúsculas/minúsculas

### Navegación Rápida
- Click en cualquier tarjeta → Abre ficha completa
- Botón "Volver" → Regresa a la lista
- Navegación con teclado disponible

### Edición de Notas
- Doble Enter → Salto de línea
- Cmd/Ctrl + Enter → Guardar rápido
- Las notas se guardan automáticamente

### Interpretación de Emociones
- 😊 = Estado positivo (4-5)
- 😐 = Estado neutro (3)
- 😔 = Requiere atención (1-2)

---

## 📞 Soporte

Si encuentras algún problema:

1. Revisa la consola del navegador (F12)
2. Verifica los logs del servidor (`npm run dev`)
3. Comprueba la configuración de Supabase
4. Revisa los permisos RLS

---

## ✅ Checklist de Verificación

Antes de usar en producción:

- [ ] RLS configurado en todas las tablas
- [ ] Políticas de seguridad activas
- [ ] Backups automáticos habilitados
- [ ] SSL/TLS configurado
- [ ] Variables de entorno seguras
- [ ] Datos de prueba eliminados
- [ ] Logs de auditoría activos
- [ ] Políticas de retención definidas

---

*Última actualización: 19 de octubre de 2025*
*Versión: 1.0.0*
