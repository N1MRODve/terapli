# 📚 Índice: Documentación Migración Terapeutas

## 📖 Documentos Disponibles

### 1. 🚀 [MIGRACION_TERAPEUTAS_QUICKSTART.md](./MIGRACION_TERAPEUTAS_QUICKSTART.md)
**Para:** Ejecutar la migración rápidamente  
**Contenido:**
- Pasos de ejecución (15 minutos)
- Checklist post-migración
- Troubleshooting básico
- Comandos SQL listos para copiar/pegar

**Úsalo cuando:** Necesites ejecutar la migración paso a paso

---

### 2. 📊 [MIGRACION_TERAPEUTAS_RESUMEN.md](./MIGRACION_TERAPEUTAS_RESUMEN.md)
**Para:** Entender qué cambió de forma resumida  
**Contenido:**
- Comparación antes/después
- Lista de archivos creados
- Cambios clave en base de datos y frontend
- Beneficios obtenidos
- Verificación rápida

**Úsalo cuando:** Quieras una visión general de la migración

---

### 3. 📋 [CONSOLIDACION_TERAPEUTAS_COMPLETADA.md](./CONSOLIDACION_TERAPEUTAS_COMPLETADA.md)
**Para:** Documentación completa y detallada  
**Contenido:**
- Resumen ejecutivo completo
- Estructura de datos detallada
- Proceso de migración paso a paso
- Políticas RLS
- Casos de prueba
- Troubleshooting exhaustivo
- Métricas de éxito
- Próximos pasos

**Úsalo cuando:** Necesites información técnica detallada o para debugging

---

## 🗂️ Archivos de Migración SQL

### Base de Datos (Supabase)

#### 1. 📄 `supabase/migrations/20251027_consolidar_terapeutas.sql`
**Archivo principal de migración**

Acciones:
- ✅ Verifica estado actual (psicologas vs terapeutas)
- ✅ Migra datos de psicologas → terapeutas
- ✅ Actualiza tabla pacientes: psicologa_id → terapeuta_id
- ✅ Actualiza tabla sesiones: psicologa_id → terapeuta_id (si existe)
- ✅ Actualiza tabla bonos: psicologa_id → terapeuta_id (si existe)
- ✅ Crea vista psicologas (compatibilidad temporal)
- ✅ Elimina tabla física psicologas
- ✅ Actualiza índices
- ✅ Actualiza políticas RLS
- ✅ Verifica migración exitosa

**Tamaño:** ~600 líneas  
**Tiempo ejecución:** 2-5 segundos

---

#### 2. 📄 `supabase/migrations/20251027_actualizar_crear_paciente_terapeuta.sql`
**Actualización de funciones RPC**

Funciones actualizadas:
- ✅ `crear_paciente_simple()`: parámetro p_psicologa_id → p_terapeuta_id
- ✅ `crear_paciente_con_profile()`: parámetro p_psicologa_id → p_terapeuta_id
- ✅ Validación de terapeuta activo
- ✅ Mensajes de error actualizados

**Tamaño:** ~350 líneas  
**Tiempo ejecución:** 1 segundo

---

#### 3. 📄 `supabase/migrations/20251027_sync_profiles_terapeutas.sql`
**Trigger de sincronización automática**

Acciones:
- ✅ Elimina trigger antiguo `tr_sync_psicologa`
- ✅ Elimina función `sync_psicologa_from_profile()`
- ✅ Crea nueva función `sync_terapeuta_from_profile()`
- ✅ Crea nuevo trigger `tr_sync_terapeuta`
- ✅ Sincroniza profiles existentes
- ✅ Verifica sincronización

**Trigger se ejecuta en:**
- INSERT de profile con rol `psicologa` o `terapeuta`
- UPDATE de nombre, email, teléfono, o rol

**Tamaño:** ~250 líneas  
**Tiempo ejecución:** 1-2 segundos

---

## 💻 Código Frontend Actualizado

### Componentes Vue

#### `components/ModalNuevoPaciente.vue`
**Cambios:**
```diff
- p_psicologa_id: userId,
+ p_terapeuta_id: userId,

- psicologa_id: user.value.id,
+ terapeuta_id: user.value.id,
```

**Líneas modificadas:** ~8 cambios

---

#### `components/ModalNuevaCita.vue`
**Cambios:**
```diff
- .eq('psicologa_id', user.id)
+ .eq('terapeuta_id', user.id)

- psicologa_id: user.id,
+ terapeuta_id: user.id,
```

**Líneas modificadas:** ~4 cambios

---

#### `components/ModalNuevoBono.vue`
**Cambios:**
```diff
- psicologa_id: props.psicologaId,
+ terapeuta_id: props.psicologaId,
```

**Líneas modificadas:** ~2 cambios

---

### Páginas

#### `pages/terapeuta/pacientes.vue`
**Cambios:**
```diff
- .eq('psicologa_id', userId)
+ .eq('terapeuta_id', userId)
```

**Líneas modificadas:** ~1 cambio

---

#### `pages/terapeuta/pacientes/[id].vue`
**Cambios:**
```diff
- .eq('psicologa_id', user.value?.id)
+ .eq('terapeuta_id', user.value?.id)
```

**Líneas modificadas:** ~4 cambios

---

## 🎯 Orden de Lectura Recomendado

### Para Ejecutar la Migración
1. **Primero:** [MIGRACION_TERAPEUTAS_QUICKSTART.md](./MIGRACION_TERAPEUTAS_QUICKSTART.md)
2. **Durante ejecución:** Tener abierto [CONSOLIDACION_TERAPEUTAS_COMPLETADA.md](./CONSOLIDACION_TERAPEUTAS_COMPLETADA.md) sección "Troubleshooting"
3. **Después:** [MIGRACION_TERAPEUTAS_RESUMEN.md](./MIGRACION_TERAPEUTAS_RESUMEN.md) para verificar

### Para Entender los Cambios
1. **Primero:** [MIGRACION_TERAPEUTAS_RESUMEN.md](./MIGRACION_TERAPEUTAS_RESUMEN.md)
2. **Para detalles:** [CONSOLIDACION_TERAPEUTAS_COMPLETADA.md](./CONSOLIDACION_TERAPEUTAS_COMPLETADA.md)
3. **Para ejecutar:** [MIGRACION_TERAPEUTAS_QUICKSTART.md](./MIGRACION_TERAPEUTAS_QUICKSTART.md)

### Para Debugging
1. **Primero:** [CONSOLIDACION_TERAPEUTAS_COMPLETADA.md](./CONSOLIDACION_TERAPEUTAS_COMPLETADA.md) → Sección "Troubleshooting"
2. **Si persiste:** Revisar código de migraciones SQL directamente
3. **Logs:** Supabase Dashboard → Database → Logs

---

## 📊 Estadísticas del Proyecto

### Archivos Creados
- **Documentación:** 4 archivos (.md)
- **Migraciones SQL:** 3 archivos (.sql)
- **Código modificado:** 5 archivos (.vue)

### Líneas de Código
- **Documentación:** ~1,500 líneas
- **SQL:** ~1,200 líneas
- **Frontend:** ~20 cambios

### Tiempo Estimado
- **Desarrollo:** 2-3 horas
- **Ejecución:** 15 minutos
- **Testing:** 30 minutos

---

## ✅ Checklist General

### Pre-Migración
- [ ] Leer [MIGRACION_TERAPEUTAS_RESUMEN.md](./MIGRACION_TERAPEUTAS_RESUMEN.md)
- [ ] Entender cambios en base de datos
- [ ] Revisar código frontend a modificar
- [ ] Preparar entorno de testing

### Durante Migración
- [ ] Crear backup de base de datos
- [ ] Ejecutar migración SQL 1/3
- [ ] Ejecutar migración SQL 2/3
- [ ] Ejecutar migración SQL 3/3
- [ ] Verificar con queries
- [ ] Deploy frontend

### Post-Migración
- [ ] Test crear paciente
- [ ] Test listar pacientes
- [ ] Test crear cita
- [ ] Verificar dashboard
- [ ] Monitorear logs
- [ ] Actualizar documentación de API (si aplica)

---

## 🔗 Enlaces Útiles

### Documentación Supabase
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Migrations](https://supabase.com/docs/guides/database/migrations)
- [Foreign Keys](https://supabase.com/docs/guides/database/tables#foreign-keys)

### Documentación Vue/Nuxt
- [Composables](https://nuxt.com/docs/guide/directory-structure/composables)
- [Components](https://nuxt.com/docs/guide/directory-structure/components)

---

## 📞 Soporte y Contacto

### En Caso de Problemas

1. **Revisar logs:**
   - Supabase Dashboard → Database → Logs
   - Browser DevTools → Console

2. **Consultar documentación:**
   - [CONSOLIDACION_TERAPEUTAS_COMPLETADA.md](./CONSOLIDACION_TERAPEUTAS_COMPLETADA.md) → Troubleshooting

3. **Verificar estado:**
   ```sql
   -- Estado de migración
   SELECT 
     EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='psicologas') as tabla_psicologas_existe,
     EXISTS(SELECT 1 FROM information_schema.views WHERE table_name='psicologas') as vista_psicologas_existe,
     EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='pacientes' AND column_name='terapeuta_id') as terapeuta_id_existe;
   ```

4. **Rollback si es necesario:**
   - Restaurar desde backup
   - Supabase Dashboard → Database → Backups → Restore

---

## 🎉 Éxito de la Migración

Si todos los checklist están completos:
- ✅ Base de datos consolidada
- ✅ Frontend actualizado
- ✅ Tests pasando
- ✅ Sistema funcionando correctamente

**🎯 La migración ha sido completada exitosamente!**

---

**Última actualización:** 27 de octubre de 2025  
**Versión:** 1.0  
**Mantenido por:** GitHub Copilot
