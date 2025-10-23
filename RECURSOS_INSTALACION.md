# 🔧 Instrucciones de Instalación - Módulo de Recursos

## Paso 1: Ejecutar Migración SQL en Supabase

### Opción A: Desde el Dashboard de Supabase (Recomendado)

1. **Accede a tu proyecto de Supabase**
   - Ve a https://supabase.com/dashboard
   - Selecciona tu proyecto "psicologakarem"

2. **Abre el SQL Editor**
   - En el menú lateral, click en "SQL Editor"
   - O directo: `https://supabase.com/dashboard/project/[tu-proyecto-id]/sql`

3. **Copia el SQL**
   - Abre el archivo: `supabase/migrations/recursos_schema.sql`
   - Selecciona TODO el contenido (Cmd+A / Ctrl+A)
   - Copia (Cmd+C / Ctrl+C)

4. **Pega y Ejecuta**
   - En SQL Editor, pega el código
   - Click en botón "Run" (o F5)
   - Espera confirmación: ✅ "Success"

5. **Verifica las Tablas**
   - Ve a "Table Editor" en el menú lateral
   - Deberías ver 3 nuevas tablas:
     - ✅ `recursos`
     - ✅ `recursos_pacientes`
     - ✅ `notificaciones`

---

### Opción B: Desde Supabase CLI (Avanzado)

```bash
# Si tienes Supabase CLI instalado:
cd /Users/dieterlorenzo/psicologakarem/psicokarem

# Aplicar migración
supabase db push

# O ejecutar directamente:
supabase db execute -f supabase/migrations/recursos_schema.sql
```

---

## Paso 2: Verificar Políticas RLS

1. **Ve a Authentication → Policies**
2. Deberías ver **16 políticas nuevas**:

### Políticas esperadas:

**Tabla: recursos (4 políticas)**
- ✅ Terapeutas pueden ver todos los recursos
- ✅ Terapeutas pueden crear recursos
- ✅ Terapeutas pueden actualizar sus propios recursos
- ✅ Terapeutas pueden eliminar sus propios recursos
- ✅ Pacientes pueden ver sus recursos asignados

**Tabla: recursos_pacientes (7 políticas)**
- ✅ Terapeutas pueden ver todas las asignaciones
- ✅ Terapeutas pueden crear asignaciones
- ✅ Terapeutas pueden actualizar asignaciones
- ✅ Terapeutas pueden eliminar asignaciones
- ✅ Pacientes pueden ver sus asignaciones
- ✅ Pacientes pueden marcar recursos como vistos

**Tabla: notificaciones (5 políticas)**
- ✅ Terapeutas pueden crear notificaciones
- ✅ Pacientes pueden ver sus notificaciones
- ✅ Pacientes pueden marcar notificaciones como vistas
- ✅ Terapeutas pueden ver todas las notificaciones

---

## Paso 3: Verificar Triggers

1. **Ve a Database → Functions**
2. Deberías ver 2 funciones:
   - ✅ `crear_notificacion_recurso()`
   - ✅ `update_updated_at_column()`

3. **Ve a Database → Triggers**
   - ✅ `trigger_crear_notificacion_recurso` en tabla `recursos_pacientes`
   - ✅ `update_recursos_updated_at` en tabla `recursos`

---

## Paso 4: Configurar Storage (Opcional)

Si quieres permitir subida de archivos (PDFs, audios, etc.):

### 1. Crear Bucket

```sql
-- En SQL Editor, ejecutar:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('recursos', 'recursos', true);
```

### 2. Políticas de Storage

```sql
-- Permitir a terapeutas subir archivos
CREATE POLICY "Terapeutas pueden subir archivos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recursos' AND
  EXISTS (SELECT 1 FROM terapeutas WHERE terapeutas.user_id = auth.uid())
);

-- Permitir a todos ver archivos
CREATE POLICY "Todos pueden ver archivos públicos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'recursos');

-- Permitir a terapeutas actualizar sus archivos
CREATE POLICY "Terapeutas pueden actualizar sus archivos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'recursos' AND
  EXISTS (SELECT 1 FROM terapeutas WHERE terapeutas.user_id = auth.uid())
);

-- Permitir a terapeutas eliminar sus archivos
CREATE POLICY "Terapeutas pueden eliminar sus archivos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'recursos' AND
  EXISTS (SELECT 1 FROM terapeutas WHERE terapeutas.user_id = auth.uid())
);
```

---

## Paso 5: Datos de Prueba (Opcional)

Para testing, puedes insertar recursos de ejemplo:

```sql
-- Asegúrate de tener al menos un terapeuta creado
-- Reemplaza [ID_DEL_TERAPEUTA] con un ID real

INSERT INTO public.recursos (titulo, descripcion, tipo, url, creado_por) VALUES
(
  'Guía de Respiración Consciente',
  'Ejercicios básicos de respiración para manejo de ansiedad',
  'Guía',
  'https://www.youtube.com/watch?v=exemplo',
  '[ID_DEL_TERAPEUTA]'
),
(
  'Audio: Meditación Guiada',
  'Meditación de 10 minutos para principiantes',
  'Audio',
  'https://example.com/meditacion.mp3',
  '[ID_DEL_TERAPEUTA]'
),
(
  'Video: Técnicas de Relajación',
  'Tutorial sobre técnicas de relajación muscular progresiva',
  'Video',
  'https://www.youtube.com/watch?v=exemplo2',
  '[ID_DEL_TERAPEUTA]'
);

-- Verificar inserción
SELECT * FROM recursos;
```

---

## Paso 6: Verificación Final

### Checklist de Verificación:

```bash
✅ Tablas creadas (recursos, recursos_pacientes, notificaciones)
✅ 16 políticas RLS activas
✅ 2 funciones creadas
✅ 2 triggers configurados
✅ Bucket de storage creado (opcional)
✅ Datos de prueba insertados (opcional)
```

### Test Rápido con SQL:

```sql
-- 1. Verificar tablas
SELECT COUNT(*) FROM recursos;
SELECT COUNT(*) FROM recursos_pacientes;
SELECT COUNT(*) FROM notificaciones;

-- 2. Verificar políticas
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('recursos', 'recursos_pacientes', 'notificaciones');

-- 3. Verificar triggers
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN ('recursos', 'recursos_pacientes');
```

---

## Paso 7: Crear Páginas Frontend

Ahora que la base de datos está lista, crea los 3 archivos faltantes:

1. **`pages/terapeuta/recursos.vue`**
2. **`pages/paciente/recursos.vue`**
3. **`components/NotificacionesPaciente.vue`**

El código completo está en: `RECURSOS_GUIA_RAPIDA.md`

---

## Troubleshooting

### Error: "relation already exists"
**Solución**: Las tablas ya existen. Puedes eliminarlas primero:
```sql
DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS recursos_pacientes CASCADE;
DROP TABLE IF EXISTS recursos CASCADE;
```
Luego vuelve a ejecutar el script completo.

### Error: "permission denied"
**Solución**: Verifica que RLS esté habilitado:
```sql
ALTER TABLE recursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE recursos_pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
```

### Error: "function does not exist"
**Solución**: Ejecuta primero la creación de funciones antes de los triggers.

### Error: "column does not exist"
**Solución**: Asegúrate de que la tabla `terapeutas` tenga la columna `user_id`.

---

## Logs Útiles

Para ver actividad en tiempo real:

1. **Supabase Dashboard → Logs**
2. Filtrar por:
   - `Database` → Ver queries
   - `Auth` → Ver autenticaciones
   - `Storage` → Ver uploads (si aplica)

---

## Siguiente Paso

Una vez completada la instalación de la BD, continúa con:

📄 **`RECURSOS_GUIA_RAPIDA.md`** → Crear las páginas frontend

---

**Estado**: ✅ Base de datos lista para usar  
**Tiempo estimado**: ⏱️ 5-10 minutos  
**Dificultad**: ⭐ Fácil (copiar y pegar SQL)
