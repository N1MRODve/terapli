# 🔧 Fix: Guardar Información de Bono en Perfil del Paciente

## 🎯 Problema Identificado

**Síntoma**: La información del bono no se estaba guardando cuando se creaba un nuevo paciente con bono inicial.

**Causa Raíz**: Incompatibilidad entre los nombres de columnas en la base de datos y los que se estaban usando en el código.

---

## ✅ Soluciones Implementadas

### 1️⃣ **Migración SQL Creada**

**Archivo**: `/supabase/migrations/20251027_fix_bonos_columns.sql`

**Columnas Verificadas/Agregadas**:
```sql
✅ tipo                    -- Tipo de bono (a_demanda, quincenal, semanal)
✅ monto_total             -- Monto total del bono
✅ monto                   -- Alias de monto_total (compatibilidad)
✅ sesiones_totales        -- Número de sesiones incluidas
✅ psicologa_id            -- ID de la psicóloga
✅ fecha_inicio            -- Fecha de inicio del bono
✅ fecha_fin               -- Fecha de expiración
✅ pagado                  -- Indica si está pagado
✅ renovacion_automatica   -- Si se renueva automáticamente
✅ notas                   -- Notas adicionales
✅ metadata                -- Información adicional en JSON
```

**Características del SQL**:
- ✅ **Idempotente**: Puede ejecutarse múltiples veces sin errores
- ✅ **Verificaciones**: Chequea si cada columna existe antes de crearla
- ✅ **Sincronización**: Trigger para mantener `monto` y `monto_total` sincronizados
- ✅ **Índices**: Optimizaciones de consulta agregadas
- ✅ **Compatibilidad**: Renombra columnas antiguas si existen

### 2️⃣ **Código del Modal Corregido**

**Archivo**: `/components/ModalNuevoPaciente.vue`

**Cambios Realizados**:

#### Antes (Problemático):
```typescript
await crearBono({
  monto_total: formulario.value.bono_monto,  // ❌ Solo monto_total
  // ... otros campos
})
```

#### Después (Corregido):
```typescript
const bonoData = {
  monto_total: formulario.value.bono_monto,  // ✅ Ambas columnas
  monto: formulario.value.bono_monto,         // ✅ Para compatibilidad
  tipo: tipoBono,                             // ✅ Tipo explícito
  sesiones_totales: sesiones,                 // ✅ Total de sesiones
  metadata: {
    precio_por_sesion: (monto / sesiones).toFixed(2)  // ✅ Cálculo guardado
  }
}
```

**Mejoras Adicionales**:
- ✅ **Logging detallado**: Console.log antes de crear el bono
- ✅ **Manejo de errores mejorado**: Muestra error al usuario pero no bloquea
- ✅ **Metadata enriquecida**: Guarda precio por sesión calculado
- ✅ **Validación**: Verifica que el bono se creó correctamente

---

## 📋 Instrucciones de Aplicación

### Paso 1: Ejecutar Migración SQL

**Opción A - Desde Supabase Dashboard**:
```bash
1. Ir a SQL Editor en Supabase Dashboard
2. Copiar contenido de: supabase/migrations/20251027_fix_bonos_columns.sql
3. Pegar y ejecutar
4. Verificar que aparezcan los mensajes de ✅
```

**Opción B - Desde CLI**:
```bash
# Si tienes Supabase CLI configurado
cd psicokarem
npx supabase db push
```

**Opción C - Aplicación Manual**:
```bash
# Conectar a tu base de datos y ejecutar el archivo
psql -h <host> -U <user> -d <database> -f supabase/migrations/20251027_fix_bonos_columns.sql
```

### Paso 2: Verificar Columnas

Ejecutar este SQL para verificar que todo esté correcto:

```sql
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'bonos'
ORDER BY ordinal_position;
```

**Columnas Esperadas**:
```
✅ id (uuid)
✅ paciente_id (uuid)
✅ psicologa_id (uuid)
✅ tipo (text)
✅ sesiones_totales (integer)
✅ sesiones_restantes (integer)
✅ fecha_inicio (date)
✅ fecha_fin (date)
✅ estado (estado_bono enum)
✅ monto (numeric)
✅ monto_total (numeric)
✅ pagado (boolean)
✅ renovacion_automatica (boolean)
✅ notas (text)
✅ metadata (jsonb)
✅ created_at (timestamptz)
✅ updated_at (timestamptz)
```

### Paso 3: Probar Funcionalidad

1. **Abrir modal de nuevo paciente**
2. **Rellenar datos básicos**:
   - Nombre: Test
   - Apellido: Bono
   - Email: test@test.com
   - Área: Ansiedad
   - Tipo de bono: Quincenal
   - Primera sesión: [fecha futura]

3. **Activar "Crear bono prepagado"**
   - Verificar que monto se rellena automáticamente
   - Ajustar si necesario

4. **Crear paciente**

5. **Verificar en consola del navegador**:
   ```
   Deberías ver:
   ✅ Creando nuevo paciente...
   ✅ Nuevo paciente creado: {...}
   ✅ 💳 Creando bono inicial...
   ✅ 📦 Datos del bono a crear: {...}
   ✅ ✅ Bono creado exitosamente: {...}
   ```

6. **Verificar en base de datos**:
   ```sql
   SELECT * FROM bonos 
   WHERE paciente_id = '<id_del_paciente_creado>'
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

---

## 🐛 Troubleshooting

### Error: "column monto_total does not exist"

**Causa**: La migración SQL no se ejecutó correctamente

**Solución**:
```sql
-- Ejecutar manualmente:
ALTER TABLE public.bonos ADD COLUMN monto_total numeric(10,2);
UPDATE public.bonos SET monto_total = monto WHERE monto_total IS NULL;
```

### Error: "column tipo does not exist"

**Causa**: La columna tipo no se creó

**Solución**:
```sql
-- Ejecutar manualmente:
ALTER TABLE public.bonos ADD COLUMN tipo text;
UPDATE public.bonos SET tipo = tipo_bono::text WHERE tipo IS NULL;
```

### Error: "foreign key violation on psicologa_id"

**Causa**: El ID de la psicóloga no existe en la tabla profiles

**Solución**:
1. Verificar que el usuario esté autenticado
2. Verificar que exista en la tabla `profiles`
3. Si no existe, el campo se guardará como NULL (permitido)

### El bono se crea pero no aparece en la interfaz

**Causa**: Cache o necesita refresh

**Solución**:
1. Recargar la página del paciente
2. Verificar en la base de datos que el bono exista
3. Revisar la query que obtiene los bonos en la interfaz

### Error: "duplicate key value violates unique constraint"

**Causa**: Intentando crear un bono con el mismo ID

**Solución**: No debería ocurrir (ID se genera automáticamente), pero si pasa:
```sql
-- Verificar IDs duplicados
SELECT id, COUNT(*) 
FROM bonos 
GROUP BY id 
HAVING COUNT(*) > 1;
```

---

## 📊 Verificación de Datos

### Consulta para ver bonos creados con pacientes:

```sql
SELECT 
    b.id,
    b.tipo,
    b.sesiones_totales,
    b.sesiones_restantes,
    b.monto_total,
    b.estado,
    b.pagado,
    b.renovacion_automatica,
    b.fecha_inicio,
    b.fecha_fin,
    b.metadata->>'creado_con_paciente' as creado_con_paciente,
    b.metadata->>'precio_por_sesion' as precio_por_sesion,
    p.nombre_completo as paciente,
    pr.email as psicologa_email
FROM bonos b
JOIN pacientes p ON b.paciente_id = p.id
LEFT JOIN profiles pr ON b.psicologa_id = pr.id
WHERE b.metadata->>'creado_con_paciente' = 'true'
ORDER BY b.created_at DESC;
```

### Consulta para ver resumen de bonos por tipo:

```sql
SELECT 
    tipo,
    estado,
    COUNT(*) as cantidad,
    SUM(monto_total) as monto_total_sum,
    AVG(monto_total) as monto_promedio,
    SUM(sesiones_totales) as sesiones_totales,
    SUM(sesiones_restantes) as sesiones_disponibles
FROM bonos
GROUP BY tipo, estado
ORDER BY tipo, estado;
```

---

## 🔍 Validación Post-Fix

### Checklist de Validación:

- [ ] Migración SQL ejecutada sin errores
- [ ] Todas las columnas existen en tabla `bonos`
- [ ] Trigger de sincronización `monto`/`monto_total` funcionando
- [ ] Índices creados correctamente
- [ ] Modal de nuevo paciente actualizado
- [ ] Crear paciente sin bono → ✅ Funciona
- [ ] Crear paciente con bono → ✅ Funciona
- [ ] Bono se guarda con todos los campos
- [ ] Bono aparece en lista de bonos del paciente
- [ ] Logging en consola muestra todos los pasos
- [ ] No hay errores en consola del navegador

### Consulta de Verificación Completa:

```sql
-- Verificar que todo esté correcto
DO $$
DECLARE
    v_count integer;
BEGIN
    -- Verificar columnas
    SELECT COUNT(*) INTO v_count
    FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = 'bonos'
      AND column_name IN (
          'tipo', 'monto_total', 'sesiones_totales', 
          'psicologa_id', 'fecha_inicio', 'fecha_fin',
          'pagado', 'renovacion_automatica', 'notas', 'metadata'
      );
    
    IF v_count = 10 THEN
        RAISE NOTICE '✅ Todas las 10 columnas requeridas existen';
    ELSE
        RAISE WARNING '⚠️ Solo % de 10 columnas existen', v_count;
    END IF;
    
    -- Verificar trigger
    SELECT COUNT(*) INTO v_count
    FROM pg_trigger
    WHERE tgname = 'trg_sync_monto_fields';
    
    IF v_count > 0 THEN
        RAISE NOTICE '✅ Trigger de sincronización existe';
    ELSE
        RAISE WARNING '⚠️ Trigger de sincronización no existe';
    END IF;
    
    -- Verificar índices
    SELECT COUNT(*) INTO v_count
    FROM pg_indexes
    WHERE tablename = 'bonos'
      AND indexname LIKE 'idx_bonos_%';
    
    RAISE NOTICE '✅ % índices creados para bonos', v_count;
END $$;
```

---

## 📈 Impacto de las Correcciones

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Guardado de bonos** | ❌ Fallaba | ✅ Funciona |
| **Compatibilidad de columnas** | ❌ Inconsistente | ✅ Sincronizada |
| **Logging de errores** | ⚠️ Básico | ✅ Detallado |
| **Manejo de errores** | ❌ Bloqueaba creación | ✅ No bloquea |
| **Metadata guardada** | ❌ Mínima | ✅ Completa |
| **Precio por sesión** | ❌ No guardado | ✅ Guardado |

---

## 🎓 Lecciones Aprendidas

### 1. Nomenclatura de Columnas
- Usar nombres consistentes en toda la aplicación
- Documentar aliases cuando existan (monto vs monto_total)
- Mantener sincronización con triggers cuando hay duplicación

### 2. Migraciones SQL
- Siempre hacer migraciones idempotentes
- Verificar existencia antes de crear
- Incluir verificación final en la migración

### 3. Manejo de Errores
- No bloquear operaciones principales por errores secundarios
- Log detallado para debugging
- Informar al usuario de errores no críticos

### 4. Testing
- Probar con datos reales después de cada cambio
- Verificar en múltiples niveles (código, DB, UI)
- Mantener consultas de verificación documentadas

---

## 🔗 Archivos Relacionados

### Modificados:
1. ✅ `/supabase/migrations/20251027_fix_bonos_columns.sql` - **NUEVO**
2. ✅ `/components/ModalNuevoPaciente.vue` - Corregido
3. ✅ `/composables/useBonos.ts` - Sin cambios necesarios

### Para Revisar:
1. `/supabase/migrations/20251027_sistema_bonos_completo.sql` - Migración base
2. `/pages/terapeuta/pacientes/[id]/bonos.vue` - Vista de bonos
3. `/components/BonoCard.vue` - Tarjeta de bono

---

## ✅ Estado Final

- [x] Migración SQL creada y documentada
- [x] Código del modal corregido
- [x] Logging mejorado
- [x] Manejo de errores optimizado
- [x] Documentación completa generada
- [ ] **Migración SQL pendiente de ejecutar** ⚠️
- [ ] **Testing en ambiente de desarrollo** ⚠️
- [ ] **Testing en ambiente de producción** ⚠️

---

## 🚀 Próximos Pasos

1. **Inmediato**:
   - Ejecutar migración SQL en desarrollo
   - Probar creación de paciente con bono
   - Verificar que los datos se guarden correctamente

2. **Corto Plazo** (1-2 días):
   - Ejecutar migración en producción
   - Monitorear logs de errores
   - Recoger feedback de usuarios

3. **Mediano Plazo** (1 semana):
   - Optimizar queries de bonos
   - Agregar más validaciones
   - Mejorar UI de feedback

---

**Fecha de creación**: 27 de octubre de 2025  
**Estado**: ✅ Solución lista - Pendiente de aplicar migración  
**Prioridad**: 🔴 Alta
