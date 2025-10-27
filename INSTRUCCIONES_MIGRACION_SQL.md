# 🚀 Instrucciones para Ejecutar la Migración SQL

## Opción 1: Dashboard de Supabase (MÁS FÁCIL) ⭐

1. **Ir al Dashboard de Supabase**
   - Abre https://supabase.com/dashboard
   - Selecciona tu proyecto `psicologakarem`

2. **Abrir SQL Editor**
   - En el menú lateral, ve a **SQL Editor**
   - Click en **+ New Query**

3. **Copiar y Pegar la Migración**
   - Abre el archivo: `supabase/migrations/20251026_sistema_citas_completo.sql`
   - Copia TODO el contenido (766 líneas)
   - Pégalo en el editor SQL de Supabase

4. **Ejecutar**
   - Click en el botón **Run** (▶) o presiona `Cmd + Enter` (Mac) / `Ctrl + Enter` (Windows)
   - Espera a que termine (puede tardar 10-15 segundos)

5. **Verificar Éxito**
   - Deberías ver el mensaje: `Success. No rows returned`
   - Si hay errores, copia el mensaje y pégalo en el chat

## Opción 2: Supabase CLI (Para usuarios avanzados)

```bash
# 1. Instalar Supabase CLI si no lo tienes
npm install -g supabase

# 2. Iniciar sesión
supabase login

# 3. Vincular el proyecto
supabase link --project-ref TU_PROJECT_REF

# 4. Ejecutar la migración
supabase db push

# 5. Verificar que se aplicó
supabase db diff
```

## ✅ Verificar que la Migración Funcionó

Después de ejecutar, verifica en el Dashboard de Supabase:

### 1. Tablas Creadas
- Ve a **Table Editor** → deberías ver:
  - ✅ `terapeutas` (nueva tabla)
  - ✅ `citas` (nueva tabla)
  - ✅ `bonos` (actualizada con nuevas columnas)
  - ✅ `bloqueos_agenda` (nueva tabla)

### 2. Triggers Creados
- Ve a **Database** → **Triggers**
- Deberías ver:
  - ✅ `validar_disponibilidad_terapeuta_trigger`
  - ✅ `validar_saldo_bono_trigger`
  - ✅ `descontar_sesion_bono_automatico_trigger`
  - ✅ `registrar_cambio_estado_cita_trigger`

### 3. Funciones Creadas
- Ve a **Database** → **Functions**
- Deberías ver:
  - ✅ `obtener_estadisticas_bono`
  - ✅ `verificar_disponibilidad_terapeuta`
  - ✅ `obtener_proximas_citas_paciente`

### 4. RLS Habilitado
- Ve a **Authentication** → **Policies**
- Verifica que las tablas `citas`, `bonos`, `terapeutas` tengan políticas RLS activas

## 🐛 Troubleshooting

### Error: "type tipo_bono already exists"
**Solución**: El tipo ya existe, puedes ignorar este error. La migración continúa.

### Error: "relation terapeutas already exists"
**Solución**: La tabla ya existe. Comenta las líneas de `CREATE TABLE` de esa tabla.

### Error: "column metadata already exists"
**Solución**: La columna ya existe. Puedes ignorar o comentar esa sección.

### Error: "permission denied"
**Solución**: Asegúrate de estar conectado como `postgres` (admin) en Supabase.

## 📝 Notas Importantes

1. **Orden de Ejecución**: El archivo SQL está diseñado para ejecutarse en orden. No ejecutes secciones individuales.

2. **Idempotencia**: El script usa `CREATE IF NOT EXISTS` y `DO $$ BEGIN` para evitar errores si las tablas ya existen.

3. **RLS Habilitado**: Todas las tablas tienen Row Level Security habilitado. Asegúrate de tener las políticas correctas.

4. **Triggers Automáticos**: Una vez ejecutada, las siguientes acciones serán automáticas:
   - ✅ Validación de disponibilidad del terapeuta
   - ✅ Validación de saldo de bono
   - ✅ Descuento automático de sesión al completar cita
   - ✅ Registro de cambios de estado

## ⏭️ Siguiente Paso

Una vez ejecutada exitosamente la migración:
1. Actualiza los composables en el código
2. Regenera los tipos TypeScript de Supabase (si usas `supabase gen types typescript`)
3. Prueba crear una cita en la interfaz

## 🆘 ¿Necesitas Ayuda?

Si encuentras algún problema:
1. Copia el mensaje de error completo
2. Toma captura de pantalla del SQL Editor
3. Pégalo en el chat para diagnóstico
