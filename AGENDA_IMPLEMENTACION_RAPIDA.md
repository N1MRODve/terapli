# 🚀 Guía Rápida: Implementación Final de Agenda

## ⚡ Pasos para Completar la Integración

### 📋 Checklist Rápido

- [x] ✅ Composable `useCitas.ts` actualizado con Realtime
- [x] ✅ Vista SQL `vista_agenda_terapeutas` creada
- [x] ✅ Agenda terapeuta con Realtime
- [x] ✅ Agenda coordinación implementada
- [ ] ⏳ Ejecutar migración SQL en Supabase
- [ ] ⏳ Verificar políticas RLS
- [ ] ⏳ Testing manual del flujo completo

---

## 1️⃣ Ejecutar Migraciones SQL (10 minutos)

### Opción A: Supabase Dashboard (Recomendado)

Ejecutar en este orden exacto:

**Migración 1: Fix función estadísticas**
1. Abrir Supabase Dashboard: https://app.supabase.com
2. Ir a **SQL Editor**
3. Copiar el contenido de:
   ```
   supabase/migrations/20251027_fix_obtener_estadisticas_bono.sql
   ```
4. Pegar en el editor
5. Click en **Run**
6. ✅ Verificar mensaje: "✅ Función obtener_estadisticas_bono recreada correctamente"

**Migración 2: Fix vista dashboard bonos**
1. En el mismo **SQL Editor** (new query)
2. Copiar el contenido de:
   ```
   supabase/migrations/20251027_fix_vista_dashboard_bonos.sql
   ```
3. Pegar en el editor
4. Click en **Run**
5. ✅ Verificar mensaje: "✅ Vista vista_dashboard_bonos recreada correctamente"

**Migración 3: Vista agenda**
1. En el mismo **SQL Editor** (new query)
2. Copiar el contenido de:
   ```
   supabase/migrations/20251027_vista_agenda_terapeutas.sql
   ```
3. Pegar en el editor
4. Click en **Run**
5. ✅ Verificar mensaje: "✅ Vista vista_agenda_terapeutas creada correctamente"

### Opción B: CLI

```bash
cd /Users/dieterlorenzo/psicologakarem/psicokarem
supabase db push
```

### Verificación Rápida

```sql
-- En SQL Editor de Supabase
SELECT COUNT(*) FROM vista_agenda_terapeutas;
-- Debe retornar el número de citas existentes

SELECT * FROM vista_agenda_terapeutas LIMIT 3;
-- Debe mostrar datos de citas con pacientes y bonos
```

---

## 2️⃣ Verificar Realtime Está Habilitado (2 minutos)

### En Supabase Dashboard:

1. Ir a **Settings** → **API**
2. Buscar sección **Realtime**
3. Verificar que esté habilitado para tabla `citas`

### Verificación SQL:

```sql
-- Verificar que la tabla citas está en publicación Realtime
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'citas';

-- Si no aparece, ejecutar:
ALTER PUBLICATION supabase_realtime ADD TABLE citas;
```

---

## 3️⃣ Verificar Políticas RLS (5 minutos)

### Verificar Políticas Existentes:

```sql
-- Ver todas las políticas de la tabla citas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'citas'
ORDER BY policyname;
```

### Políticas Esperadas:

```
✅ "Terapeutas ven sus citas" (SELECT)
✅ "Pacientes ven sus citas" (SELECT)
✅ "Staff y terapeutas crean citas" (INSERT)
✅ "Staff y terapeuta actualizan citas" (UPDATE)
✅ "Solo staff elimina citas" (DELETE)
```

### Si Falta Alguna Política:

El archivo `supabase/migrations/20251026_sistema_citas_completo.sql` ya las incluye.

---

## 4️⃣ Testing Manual (10 minutos)

### Test 1: Crear Cita desde Terapeuta

```bash
# 1. Iniciar app
npm run dev

# 2. Login como terapeuta
http://localhost:3000/terapeuta/login

# 3. Ir a agenda
http://localhost:3000/terapeuta/agenda

# 4. Click en botón "+" (Nueva Cita)
# 5. Seleccionar paciente
# 6. Elegir fecha y hora
# 7. Click "Guardar"

# ✅ Verificar:
# - La cita aparece automáticamente en la agenda (sin recargar)
# - Se muestra el nombre del paciente
# - Se muestra el bono activo (si existe)
# - La hora y fecha son correctas
```

### Test 2: Realtime entre Terapeuta y Coordinación

```bash
# Terminal 1: Terapeuta
npm run dev
Login → /terapeuta/agenda

# Terminal 2: Coordinación (en otro navegador/incógnito)
npm run dev  
Login → /coordinacion/agenda

# Crear cita desde terapeuta
# ✅ Verificar que aparece en coordinación automáticamente

# Editar cita desde coordinación
# ✅ Verificar que se actualiza en terapeuta automáticamente
```

### Test 3: Marcar Cita como Completada y Verificar Bono

```bash
# 1. Crear cita con bono activo (seleccionar "Descontar de bono")
# 2. Ver sesiones_restantes antes: Ejemplo 10/12
# 3. Marcar cita como "Completada"

# ✅ Verificar en SQL:
SELECT 
    c.id as cita_id,
    c.sesion_descontada,
    b.sesiones_restantes
FROM citas c
LEFT JOIN bonos b ON b.id = c.bono_id
WHERE c.id = 'id-de-la-cita';

# Debe mostrar:
# sesion_descontada: true
# sesiones_restantes: 9 (decrementado)
```

### Test 4: Vista SQL Performance

```sql
-- Query antigua (múltiples joins manuales)
EXPLAIN ANALYZE
SELECT * FROM citas c
INNER JOIN pacientes p ON p.id = c.paciente_id
INNER JOIN terapeutas t ON t.id = c.terapeuta_id
LEFT JOIN bonos b ON b.id = c.bono_id
WHERE c.terapeuta_id = 'uuid';

-- Query nueva (vista consolidada)
EXPLAIN ANALYZE
SELECT * FROM vista_agenda_terapeutas
WHERE terapeuta_id = 'uuid';

-- ✅ La vista debe ser más rápida (menos planning time)
```

---

## 5️⃣ Verificar Console del Navegador

### Mensajes Esperados al Cargar Agenda:

```
📡 Inicializando Realtime para terapeuta: Nombre del Terapeuta
✅ Suscrito a cambios de citas en tiempo real
```

### Al Crear/Editar Cita:

```
📡 Cambio en citas detectado: INSERT {cita_id: "...", ...}
🔄 Cita actualizada
```

### Al Cerrar la Página:

```
📡 Desuscrito de cambios de citas
```

---

## 🐛 Troubleshooting Rápido

### ❌ Error: "cannot change return type of existing function"

**Solución**: Ejecutar primero la migración de fix:
```bash
# En Supabase SQL Editor, ejecutar:
supabase/migrations/20251027_fix_obtener_estadisticas_bono.sql
```

### ❌ Error: "relation vista_agenda_terapeutas does not exist"

**Solución**: Ejecutar migración SQL (Paso 1)

### ❌ Error: "permission denied for table users"

**Solución**: Las políticas RLS están mal configuradas. Ejecutar:
```sql
-- Archivo: supabase/migrations/20251026_sistema_citas_completo.sql
-- Sección 9: ROW LEVEL SECURITY (RLS)
```

### ❌ No se actualizan las citas automáticamente

**Solución**: 
1. Verificar que Realtime está habilitado (Paso 2)
2. Verificar console del navegador (debe mostrar "✅ Suscrito...")
3. Verificar que la tabla `citas` está en publicación Realtime

### ❌ Error: "No se pudo identificar el terapeuta actual"

**Solución**: El email del usuario no coincide con ningún terapeuta en la tabla. Verificar:
```sql
SELECT * FROM terapeutas WHERE email = 'email@delUsuario.com';
```

---

## 📊 Comandos SQL Útiles

### Ver Todas las Citas de Hoy:

```sql
SELECT 
    paciente_nombre,
    terapeuta_nombre,
    hora_inicio,
    hora_fin,
    estado,
    bono_sesiones_restantes
FROM vista_agenda_terapeutas
WHERE fecha_cita = CURRENT_DATE
ORDER BY hora_inicio;
```

### Ver Alertas de Bonos:

```sql
SELECT 
    paciente_nombre,
    terapeuta_nombre,
    bono_sesiones_restantes,
    alerta_bono
FROM vista_agenda_terapeutas
WHERE alerta_bono IN ('ultima_sesion', 'por_agotar', 'agotado')
  AND fecha_cita >= CURRENT_DATE
ORDER BY fecha_cita;
```

### Probar Funciones RPC:

```sql
-- Citas del día
SELECT * FROM get_citas_dia_vista(
    'terapeuta-uuid'::uuid,
    CURRENT_DATE
);

-- Próximas citas con alertas
SELECT * FROM get_proximas_citas_con_alertas(
    'terapeuta-uuid'::uuid,
    5
);
```

---

## ✅ Checklist Final

Antes de dar por completada la integración:

- [ ] Migración SQL ejecutada sin errores
- [ ] Vista `vista_agenda_terapeutas` existe y tiene datos
- [ ] Realtime habilitado para tabla `citas`
- [ ] Políticas RLS configuradas correctamente
- [ ] Test manual: Crear cita desde terapeuta ✅
- [ ] Test manual: Realtime entre terapeuta/coordinación ✅
- [ ] Test manual: Descuento de bono funciona ✅
- [ ] Console del navegador sin errores
- [ ] Mensajes Realtime aparecen en console

---

## 🎯 Resultado Esperado

### Terapeuta:
- ✅ Ve solo sus citas
- ✅ Puede crear nuevas citas
- ✅ Puede marcar como completadas
- ✅ Ve actualizaciones en tiempo real
- ✅ Ve alertas de bonos por agotarse

### Coordinación:
- ✅ Ve todas las citas de todos los terapeutas
- ✅ Puede filtrar por terapeuta
- ✅ Puede crear citas para cualquier terapeuta
- ✅ Ve actualizaciones globales en tiempo real

---

## 📚 Archivos de Referencia

1. **Documentación Completa**: `AGENDA_INTEGRACION_COMPLETA.md`
2. **Migración SQL**: `supabase/migrations/20251027_vista_agenda_terapeutas.sql`
3. **Composable**: `composables/useCitas.ts`
4. **Agenda Terapeuta**: `pages/terapeuta/agenda.vue`
5. **Agenda Coordinación**: `pages/coordinacion/agenda.vue`

---

## 🎓 Próximos Pasos Opcionales

Una vez completado el testing:

1. **Notificaciones**: Implementar sistema de recordatorios 24h antes
2. **Vista Semanal/Mensual**: Ampliar las vistas de calendario
3. **Filtros Avanzados**: Por estado, modalidad, tipo de bono
4. **Exportar**: Generar reportes PDF/Excel de citas
5. **Estadísticas**: Dashboard con métricas de asistencia

---

**Tiempo Estimado Total**: ~25 minutos  
**Dificultad**: 🟢 Baja (solo ejecutar SQL y verificar)  
**Estado**: ✅ Listo para implementar
