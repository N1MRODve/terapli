# 📝 Scripts de Verificación - Guía de Uso

## 📂 Archivos Disponibles

Este directorio contiene **tres versiones** del script de verificación:

### 1. `verificar_profiles_pacientes_dashboard.sql` ⭐ **RECOMENDADO**
**Para:** Supabase Dashboard SQL Editor  
**Compatibilidad:** ✅ Supabase Dashboard, pgAdmin, DBeaver, TablePlus  
**Características:**
- ✅ **100% limpio** - Sin NINGÚN comando `\echo`
- ✅ 16 verificaciones exhaustivas
- ✅ Comentarios descriptivos con emojis
- ✅ Checklist de resultados incluido
- ✅ Sección de migración comentada al final
- ✅ Queries independientes y ordenadas

**Uso recomendado:**
```
1. Abrir Supabase Dashboard → SQL Editor
2. Copiar TODO el contenido del archivo
3. Pegar en el editor
4. Click "Run" (▶️)
5. Revisar resultados de cada query
```

### 2. `verificar_profiles_pacientes.sql` (Obsoleto)
**Estado:** ⚠️ Contiene algunos `\echo` que causan warnings  
**Recomendación:** Usar `verificar_profiles_pacientes_dashboard.sql` en su lugar

### 3. `verificar_profiles_pacientes_psql.sql`
**Para:** psql (PostgreSQL Terminal Client)  
**Compatibilidad:** ✅ psql, psql dentro de Docker  
**Características:**
- ✅ Usa comandos `\echo` para mensajes informativos
- ✅ Output formateado con colores (si la terminal lo soporta)
- ✅ Ejecutable desde línea de comandos
- ✅ Ideal para scripts automatizados

**Uso recomendado:**
```bash
# Desde terminal (con conexión directa)
psql "postgresql://postgres.aafepclgkyzgonbymnjg:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" \
  -f verificar_profiles_pacientes_psql.sql

# Desde psql interactivo
psql> \i supabase/verificar_profiles_pacientes_psql.sql

# Con Supabase CLI (si está configurado)
supabase db psql < supabase/verificar_profiles_pacientes_psql.sql
```

## 🎯 ¿Cuál Usar?

| Escenario | Script Recomendado |
|-----------|-------------------|
| Verificación desde Supabase Dashboard | `verificar_profiles_pacientes_dashboard.sql` ⭐ |
| Verificación desde terminal/CLI | `verificar_profiles_pacientes_psql.sql` |
| Primera vez verificando | `verificar_profiles_pacientes_dashboard.sql` ⭐ |
| Script automatizado en CI/CD | `verificar_profiles_pacientes_psql.sql` |
| Copiando queries individuales | `verificar_profiles_pacientes_dashboard.sql` ⭐ |
| Sin warnings en consola | `verificar_profiles_pacientes_dashboard.sql` ⭐ |

## 📊 Verificaciones Incluidas

La versión Dashboard (`verificar_profiles_pacientes_dashboard.sql`) ejecuta **16 verificaciones**:

1. **Funciones RPC** - Confirma que `crear_paciente_simple` y `crear_paciente_con_profile` existen
2. **Estructura de Profiles** - Verifica columnas en tabla `profiles`
3. **Estructura de Pacientes** - Verifica columna `profile_id` existe
4. **Foreign Keys** - Confirma relación `pacientes.profile_id → profiles.id`
5. **Índices** - Verifica índices de optimización
6. **Políticas RLS** - Confirma políticas de seguridad
7. **Profiles Totales** - Cuenta total de profiles
8. **Profiles por Rol** - Distribución por rol (terapeuta, paciente, etc.)
9. **Pacientes Totales** - Cuenta total de pacientes
10. **Pacientes con Profile ID** - Cuenta pacientes sincronizados
11. **⚠️ Pacientes SIN Profile ID** - Lista problemas (DEBE SER 0)
12. **Sincronización OK** - Pacientes con emails coincidentes
13. **⚠️ Emails Desincronizados** - Lista problemas (DEBE SER 0)
14. **Lista Pacientes sin Profile** - Top 10 pacientes problemáticos
15. **Lista Emails Desincronizados** - Top 10 emails no coincidentes
16. **Permisos de Funciones** - Verifica permisos de funciones RPC

**Versión psql** ejecuta las mismas verificaciones con output formateado.

## ✅ Resultado Esperado

Después de ejecutar la migración `20251027_fix_crear_paciente_profile.sql`, deberías ver:

```
✅ Funciones creadas: 2
   - crear_paciente_con_profile
   - crear_paciente_simple

✅ Foreign Keys: 2
   - pacientes_profile_id_fkey → profiles.id
   - pacientes_psicologa_id_fkey → psicologas.id

✅ Pacientes SIN profile_id: 0

✅ Emails desincronizados: 0
```

## 🐛 Troubleshooting

### Supabase SQL Editor: "syntax error near '\echo'"

**Problema:** Estás usando el script de psql en Supabase Dashboard  
**Solución:** Usa `verificar_profiles_pacientes.sql` (sin `\echo`)

### psql: Sin mensajes informativos

**Problema:** Estás usando el script de Supabase en psql  
**Solución:** Usa `verificar_profiles_pacientes_psql.sql` (con `\echo`)

### "Pacientes SIN profile_id: > 0"

**Problema:** Tienes pacientes creados antes de aplicar la migración  
**Solución:** 
1. Descomenta la sección "MIGRACIÓN DE PACIENTES EXISTENTES" al final del script
2. Ejecuta esa parte del script
3. Vuelve a verificar

## 📚 Documentación Relacionada

- **Migración Principal:** `migrations/20251027_fix_crear_paciente_profile.sql`
- **Documentación Completa:** `../FIX_PROFILE_SINCRONIZACION.md`
- **Resumen Ejecutivo:** `../FIX_PROFILE_RESUMEN_EJECUTIVO.md`

## 🔄 Orden de Ejecución Recomendado

```
1. Ejecutar migración:
   → 20251027_fix_crear_paciente_profile.sql

2. Ejecutar verificación:
   → verificar_profiles_pacientes.sql (Supabase Dashboard)
   o
   → verificar_profiles_pacientes_psql.sql (Terminal)

3. Si hay pacientes sin profile_id:
   → Ejecutar sección comentada de migración

4. Verificar nuevamente:
   → Re-ejecutar script de verificación
```

## 💡 Tips

### Ejecutar Solo Una Verificación

Puedes copiar solo la query que te interesa:

```sql
-- Solo verificar funciones
SELECT routine_name, security_type, data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%crear_paciente%';

-- Solo contar pacientes sin profile_id
SELECT COUNT(*) FROM pacientes WHERE profile_id IS NULL;
```

### Guardar Resultados

Desde psql, puedes guardar el output:

```bash
psql "connection_string" -f verificar_profiles_pacientes_psql.sql > resultados.txt
```

### Ejecutar Periódicamente

Añadir a cron para monitoreo:

```bash
# Verificar cada día a las 9 AM
0 9 * * * psql "connection_string" -f /path/to/verificar_profiles_pacientes_psql.sql | mail -s "Reporte Diario Profiles" admin@example.com
```

## ⚠️ Importante

- ⚠️ Los scripts de verificación **NO MODIFICAN DATOS**
- ⚠️ Son seguros de ejecutar en producción
- ⚠️ La sección de migración está **comentada por defecto**
- ⚠️ Solo descomenta la migración si confirmas que necesitas corregir datos

---

**Última actualización:** 27 de octubre de 2025  
**Versión:** 1.0  
**Compatibilidad:** PostgreSQL 12+, Supabase
