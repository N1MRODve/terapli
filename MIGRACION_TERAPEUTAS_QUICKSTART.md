# 🚀 Guía Rápida: Ejecución de Migración Terapeutas

## ⚡ Pasos de Ejecución (15 minutos)

### 1️⃣ Backup (CRÍTICO)
```bash
# Ir a Supabase Dashboard → Database → Backups
# Crear backup manual antes de continuar
```

### 2️⃣ Ejecutar Migraciones SQL

**Abrir Supabase SQL Editor y ejecutar EN ORDEN:**

```sql
-- Migración 1: Consolidar datos (2-5 segundos)
-- Copia desde: supabase/migrations/20251027_consolidar_terapeutas.sql
-- Pegar en SQL Editor y ejecutar

-- Migración 2: Actualizar funciones RPC (1 segundo)
-- Copia desde: supabase/migrations/20251027_actualizar_crear_paciente_terapeuta.sql
-- Pegar en SQL Editor y ejecutar

-- Migración 3: Actualizar trigger (1-2 segundos)
-- Copia desde: supabase/migrations/20251027_sync_profiles_terapeutas.sql
-- Pegar en SQL Editor y ejecutar
```

### 3️⃣ Verificar Migración

```sql
-- Ejecutar en SQL Editor para verificar
SELECT 
  (SELECT COUNT(*) FROM terapeutas) as terapeutas,
  (SELECT COUNT(*) FROM pacientes WHERE terapeuta_id IS NOT NULL) as pacientes_con_terapeuta,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name='pacientes' AND column_name='psicologa_id') as columna_antigua_existe;

-- Resultado esperado:
-- terapeutas: N (todos los profesionales)
-- pacientes_con_terapeuta: M (todos los pacientes con terapeuta)
-- columna_antigua_existe: 0 (debe ser 0)
```

### 4️⃣ Desplegar Frontend

```bash
# El código frontend ya está actualizado en estos archivos:
# - components/ModalNuevoPaciente.vue
# - components/ModalNuevaCita.vue
# - components/ModalNuevoBono.vue
# - pages/terapeuta/pacientes.vue
# - pages/terapeuta/pacientes/[id].vue

# Hacer commit y push
git add .
git commit -m "feat: consolidar psicologas → terapeutas"
git push origin desarrollo
```

### 5️⃣ Test Rápido

```typescript
// Test en consola del navegador (dashboard de terapeuta)

// 1. Crear paciente nuevo
const { data, error } = await $fetch('/api/supabase/rpc', {
  method: 'POST',
  body: {
    fn: 'crear_paciente_simple',
    args: {
      p_email: 'test.migracion@email.com',
      p_nombre_completo: 'Test Migración',
      p_terapeuta_id: '<tu-user-id>',
      p_tipo_bono: 'quincenal'
    }
  }
})

console.log(data) // Debe mostrar success: true

// 2. Listar pacientes
const pacientes = await $fetch('/api/pacientes')
console.log(pacientes) // Debe mostrar tus pacientes
```

---

## ✅ Checklist Post-Migración

- [ ] Backup creado
- [ ] 3 migraciones SQL ejecutadas sin errores
- [ ] Verificación SQL muestra: `columna_antigua_existe = 0`
- [ ] Frontend desplegado
- [ ] Test de crear paciente funciona
- [ ] Test de listar pacientes funciona
- [ ] Dashboard de terapeuta carga correctamente

---

## 🚨 En Caso de Error

### Error: "INVALID_TERAPEUTA"
```sql
-- Verificar que tu usuario está en terapeutas
SELECT * FROM terapeutas WHERE id = '<tu-user-id>';

-- Si no existe, ejecutar:
INSERT INTO terapeutas (id, nombre_completo, email, activo)
SELECT id, nombre, email, true
FROM profiles
WHERE id = '<tu-user-id>';
```

### Error: "Column psicologa_id does not exist"
```sql
-- Verificar estado de migración
SELECT column_name FROM information_schema.columns 
WHERE table_name='pacientes' AND column_name IN ('psicologa_id', 'terapeuta_id');

-- Si terapeuta_id no existe, re-ejecutar migración 1
```

### Rollback (Solo si es necesario)
```sql
-- Restaurar desde el backup creado en paso 1
-- Ir a Supabase Dashboard → Database → Backups → Restore
```

---

## 📞 Soporte

Si encuentras problemas:
1. Revisar logs en Supabase Dashboard → Database → Logs
2. Consultar documentación completa: `CONSOLIDACION_TERAPEUTAS_COMPLETADA.md`
3. Revisar el código de las migraciones para entender qué hace cada paso

---

**Tiempo total estimado: 15 minutos**  
**Última actualización: 27 de octubre de 2025**
