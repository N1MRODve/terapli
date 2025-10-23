# 📋 Mensajería Interna - Checklist de Instalación

## ⚡ Instalación en 5 Minutos

### ☑️ Paso 1: Decidir Estrategia (1 min)

```sql
-- En Supabase SQL Editor, ejecuta:
SELECT COUNT(*) as total_mensajes FROM mensajes;
```

**¿Resultado?**
- ✅ **0 mensajes o error "tabla no existe"** → Usa `supabase_mensajeria_completa.sql`
- ⚠️ **Más de 0 mensajes** → Usa `supabase_mensajeria_migracion.sql`

---

### ☑️ Paso 2: Ejecutar SQL (2 min)

1. Abre **Supabase Dashboard** > **SQL Editor**
2. Copia contenido del archivo elegido
3. Pega en el editor
4. Click **Run** (▶️)
5. ✅ Espera mensaje de éxito

---

### ☑️ Paso 3: Verificar Creación (30 seg)

```sql
-- Ejecuta esto para verificar:
SELECT 
  'mensajes' as tabla,
  COUNT(*) as politicas
FROM pg_policies 
WHERE tablename = 'mensajes'
UNION ALL
SELECT 
  'notificaciones',
  COUNT(*)
FROM pg_policies 
WHERE tablename = 'notificaciones';
```

**Resultado esperado:**
```
tabla            | politicas
-----------------|----------
mensajes         | 3
notificaciones   | 3
```

---

### ☑️ Paso 4: Iniciar App (30 seg)

```bash
npm run dev
```

Verifica que no hay errores de compilación.

---

### ☑️ Paso 5: Probar Sistema (1 min)

#### Como Paciente:
1. Login → http://localhost:3000/auth/paciente
2. Ir a Mensajes (menú lateral)
3. Escribir: "Hola, este es un mensaje de prueba"
4. Click Enviar
5. ✅ Mensaje aparece en pantalla

#### Como Terapeuta:
1. Login → http://localhost:3000/auth/terapeuta
2. Ir a Mensajes
3. ✅ Ver paciente en lista
4. ✅ Ver badge con "1" mensaje no leído
5. Click en paciente
6. ✅ Ver mensaje del paciente
7. Responder: "Hola, recibí tu mensaje"
8. Click Enviar
9. ✅ Respuesta aparece

#### Verificar Notificaciones:
1. Como paciente, mira la campana 🔔
2. ✅ Badge rojo con "1"
3. Click en campana
4. ✅ Ver "Nuevo mensaje"
5. Click en notificación
6. ✅ Navega a mensajes y muestra respuesta

---

## ✅ Checklist Completo

### Base de Datos
- [ ] SQL ejecutado sin errores
- [ ] Tabla `mensajes` creada/actualizada
- [ ] Tabla `notificaciones` creada
- [ ] 6 políticas RLS activas (3 por tabla)
- [ ] Trigger `trg_notify_new_message` creado
- [ ] Funciones auxiliares creadas

### Frontend
- [ ] `npm run dev` funciona sin errores
- [ ] No hay errores TypeScript en terminal
- [ ] Campana de notificaciones visible en headers
- [ ] Ruta `/paciente/mensajes` accesible
- [ ] Ruta `/terapeuta/mensajes` accesible

### Funcionalidad
- [ ] Paciente puede enviar mensaje
- [ ] Mensaje aparece en pantalla del paciente
- [ ] Terapeuta ve mensaje en lista
- [ ] Badge muestra "1" en lista de terapeuta
- [ ] Terapeuta puede responder
- [ ] Paciente recibe notificación (badge en campana)
- [ ] Click en notificación navega a mensajes
- [ ] Mensajes se marcan como vistos automáticamente

### Seguridad
- [ ] Usuario A no puede ver mensajes de conversación B-C
- [ ] RLS bloquea accesos no autorizados
- [ ] Solo participantes ven su conversación

---

## 🚨 Errores Comunes y Soluciones

### ❌ Error: "relation 'mensajes' does not exist"

**Solución:** Ejecuta el SQL apropiado (paso 2).

---

### ❌ Error: "column 'remitente_id' does not exist"

**Solución:** Usaste el SQL incorrecto. 
- Si tabla existe → Usa `supabase_mensajeria_migracion.sql`
- Si no existe → Usa `supabase_mensajeria_completa.sql`

---

### ❌ Error: TypeScript "Property X does not exist"

**Solución:**
```bash
# Detén el servidor (Ctrl+C)
rm -rf .nuxt
npm run dev
```

---

### ❌ No aparecen mensajes en la UI

**Verificación:**
```sql
-- 1. Ver si hay datos
SELECT * FROM mensajes LIMIT 10;

-- 2. Ver si RLS está habilitado
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'mensajes';
-- Debe mostrar: rowsecurity = true

-- 3. Ver tu ID de usuario
SELECT auth.uid();
-- Debe retornar tu UUID

-- 4. Ver mensajes con tu ID
SELECT * FROM mensajes 
WHERE remitente_id = 'TU-UUID' 
   OR destinatario_id = 'TU-UUID';
```

---

### ❌ Notificaciones no se crean

**Verificación:**
```sql
-- Ver si trigger existe
SELECT tgname, tgenabled FROM pg_trigger 
WHERE tgname = 'trg_notify_new_message';
-- Debe mostrar: tgenabled = O (enabled)

-- Probar manualmente
INSERT INTO mensajes (remitente_id, destinatario_id, mensaje, visto)
SELECT 
  (SELECT id FROM profiles WHERE rol = 'paciente' LIMIT 1),
  (SELECT id FROM profiles WHERE rol = 'terapeuta' LIMIT 1),
  'Mensaje de prueba',
  false;

-- Ver si creó notificación
SELECT * FROM notificaciones ORDER BY created_at DESC LIMIT 1;
```

---

## 📊 Validación Rápida

### Query Todo-en-Uno

```sql
-- Ejecuta esto para ver estado completo:
SELECT 
  '✅ Mensajes' as componente,
  COUNT(*) as cantidad,
  'tabla' as tipo
FROM mensajes
UNION ALL
SELECT 
  '✅ Notificaciones',
  COUNT(*),
  'tabla'
FROM notificaciones
UNION ALL
SELECT 
  '✅ Políticas Mensajes',
  COUNT(*),
  'seguridad'
FROM pg_policies WHERE tablename = 'mensajes'
UNION ALL
SELECT 
  '✅ Políticas Notificaciones',
  COUNT(*),
  'seguridad'
FROM pg_policies WHERE tablename = 'notificaciones'
UNION ALL
SELECT 
  '✅ Trigger Notificaciones',
  COUNT(*),
  'funcionalidad'
FROM pg_trigger WHERE tgname = 'trg_notify_new_message';
```

**Resultado esperado:**
```
componente                       | cantidad | tipo
---------------------------------|----------|-------------
✅ Mensajes                      | N        | tabla
✅ Notificaciones                | N        | tabla
✅ Políticas Mensajes            | 3        | seguridad
✅ Políticas Notificaciones      | 3        | seguridad
✅ Trigger Notificaciones        | 1        | funcionalidad
```

---

## 🎯 Próximos Pasos

Una vez que todos los checkboxes están marcados:

1. ✅ **Crear usuarios de prueba** (si no existen)
2. ✅ **Probar flujo completo** paciente → terapeuta → paciente
3. ✅ **Verificar notificaciones** funcionan en ambos roles
4. ✅ **Revisar responsive** en móvil y tablet
5. ✅ **Documentar** para tu equipo

---

## 📚 Documentación Completa

- **Inicio Rápido:** `MENSAJERIA_QUICKSTART.md`
- **Guía Completa:** `MENSAJERIA_SISTEMA_COMPLETO.md`
- **Resolución de Conflictos:** `MENSAJERIA_CONFLICTO_ESQUEMA.md`
- **Resumen Final:** `MENSAJERIA_RESUMEN_FINAL.md`
- **Este checklist:** `MENSAJERIA_CHECKLIST.md`

---

## ⏱️ Tiempo Estimado

- ✅ Instalación básica: **5 minutos**
- ✅ Testing completo: **10 minutos**
- ✅ Lectura de documentación: **20 minutos**
- ✅ **Total:** 35 minutos

---

**¿Todo funcionando? ¡Perfecto! 🎉**

El sistema de mensajería está listo para usar en producción.
