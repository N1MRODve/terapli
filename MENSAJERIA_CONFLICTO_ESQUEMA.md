# ⚠️ NOTA IMPORTANTE: Conflicto de Esquema Detectado

## 🔴 Problema Identificado

El proyecto **ya tiene una tabla `mensajes`** con una estructura diferente a la que necesitamos para el sistema de mensajería completo.

### Esquema Actual (existente)
```typescript
mensajes {
  id: string
  paciente_id: string
  contenido: string
  de_psicologa: boolean
  leido: boolean
  created_at: string
}
```

### Esquema Requerido (nuevo sistema)
```typescript
mensajes {
  id: string
  remitente_id: string          // ← Necesario
  destinatario_id: string        // ← Necesario
  sesion_id: string (opcional)
  mensaje: string                // ← En lugar de "contenido"
  visto: boolean                 // ← En lugar de "leido"
  created_at: string
}
```

---

## ✅ Soluciones Posibles

### Opción 1: Migrar tabla existente (RECOMENDADO)

Ejecutar este SQL para **agregar columnas y migrar datos**:

```sql
-- PASO 1: Agregar nuevas columnas
ALTER TABLE mensajes 
ADD COLUMN IF NOT EXISTS remitente_id uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS destinatario_id uuid REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS sesion_id uuid REFERENCES sesiones(id),
ADD COLUMN IF NOT EXISTS mensaje text,
ADD COLUMN IF NOT EXISTS visto boolean DEFAULT false;

-- PASO 2: Migrar datos existentes
UPDATE mensajes 
SET 
  mensaje = contenido,
  visto = leido,
  destinatario_id = paciente_id,
  remitente_id = (
    CASE 
      WHEN de_psicologa THEN (SELECT id FROM profiles WHERE rol = 'terapeuta' LIMIT 1)
      ELSE paciente_id
    END
  );

-- PASO 3: Hacer las nuevas columnas NOT NULL (después de migrar)
ALTER TABLE mensajes 
ALTER COLUMN remitente_id SET NOT NULL,
ALTER COLUMN destinatario_id SET NOT NULL,
ALTER COLUMN mensaje SET NOT NULL;

-- PASO 4: (Opcional) Eliminar columnas viejas
-- Solo ejecutar si estás seguro de no usarlas
-- ALTER TABLE mensajes 
-- DROP COLUMN contenido,
-- DROP COLUMN de_psicologa,
-- DROP COLUMN leido,
-- DROP COLUMN paciente_id;

-- PASO 5: Recrear índices
CREATE INDEX IF NOT EXISTS idx_mensajes_remitente ON mensajes(remitente_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_destinatario ON mensajes(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion ON mensajes(remitente_id, destinatario_id);

-- PASO 6: Aplicar RLS del archivo supabase_mensajeria_completa.sql
```

### Opción 2: Crear tabla nueva con nombre diferente

Si prefieres mantener la tabla actual intacta:

```sql
-- Cambiar nombre en el archivo SQL
-- De: CREATE TABLE mensajes
-- A:  CREATE TABLE mensajeria_interna

-- Luego actualizar los composables para usar 'mensajeria_interna'
```

### Opción 3: Adaptar composables a esquema actual

Modificar `useMensajes.ts` para trabajar con el esquema existente (más limitado).

---

## 🛠️ Archivos a Modificar Según Opción Elegida

### Si eliges Opción 1 (Migración):
1. ✅ Ejecutar SQL de migración
2. ✅ Ejecutar `supabase_mensajeria_completa.sql` (solo políticas RLS y trigger)
3. ✅ Los composables funcionarán sin cambios

### Si eliges Opción 2 (Tabla nueva):
1. ✅ Renombrar tabla en `supabase_mensajeria_completa.sql`
2. ⚠️ Actualizar `composables/useMensajes.ts` líneas 41, 106, 150, 199, etc.
3. ⚠️ Actualizar referencias en páginas y componentes

### Si eliges Opción 3 (Adaptar a esquema actual):
1. ⚠️ Modificar `composables/useMensajes.ts` completamente
2. ⚠️ Perderás funcionalidad como:
   - Conversaciones bidireccionales complejas
   - Relaciones entre múltiples terapeutas/pacientes
   - Vinculación a sesiones

---

## 📋 Recomendación Final

**OPCIÓN 1 es la mejor**, porque:
- ✅ Mantiene compatibilidad con datos existentes
- ✅ Habilita todas las funcionalidades del nuevo sistema
- ✅ Permite evolución futura
- ✅ No requiere reescribir código

**Siguiente paso:**
1. Hacer backup de la tabla actual:
   ```sql
   CREATE TABLE mensajes_backup AS SELECT * FROM mensajes;
   ```

2. Ejecutar migración de Opción 1

3. Verificar que datos se migraron correctamente:
   ```sql
   SELECT * FROM mensajes LIMIT 10;
   ```

4. Ejecutar el resto del archivo `supabase_mensajeria_completa.sql`

---

## 🔍 Para Verificar Esquema Actual

Ejecuta en SQL Editor de Supabase:

```sql
-- Ver estructura de tabla mensajes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'mensajes'
ORDER BY ordinal_position;

-- Ver datos de ejemplo
SELECT * FROM mensajes LIMIT 5;

-- Ver cantidad de mensajes actuales
SELECT COUNT(*) as total_mensajes FROM mensajes;
```

---

## ❓ ¿Necesitas Ayuda?

Si no estás seguro de qué opción elegir o cómo proceder:

1. Verifica primero si hay datos importantes en la tabla actual
2. Haz un backup completo de la base de datos
3. Ejecuta la migración en entorno de desarrollo primero
4. Consulta con el equipo antes de aplicar en producción

---

**Fecha:** 21 de octubre de 2025
**Prioridad:** ALTA - Requiere decisión antes de usar el sistema de mensajería
