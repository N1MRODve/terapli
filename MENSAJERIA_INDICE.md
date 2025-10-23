# 📚 Índice Maestro - Sistema de Mensajería Interna

## 📖 Guía de Documentación

Este sistema de mensajería incluye **múltiples archivos de documentación** para diferentes propósitos y audiencias. Usa este índice para encontrar rápidamente lo que necesitas.

---

## 🚀 Para Empezar (COMIENZA AQUÍ)

### 1. [MENSAJERIA_CHECKLIST.md](./MENSAJERIA_CHECKLIST.md) ⚡
**⏱️ 5 minutos**  
**Para:** Instalación rápida  
**Incluye:**
- ✅ Checklist paso a paso
- ✅ Validación en 5 minutos
- ✅ Soluciones a errores comunes
- ✅ Query de verificación todo-en-uno

**👉 Comienza aquí si quieres instalar YA.**

---

## 📚 Documentación Principal

### 2. [MENSAJERIA_QUICKSTART.md](./MENSAJERIA_QUICKSTART.md) ⚡
**⏱️ 10 minutos**  
**Para:** Desarrolladores que necesitan vista general  
**Incluye:**
- Instalación en 3 pasos
- Archivos incluidos
- Testing rápido
- Uso de composables
- Componentes clave
- Tips rápidos

**👉 Lee esto después del checklist.**

### 3. [MENSAJERIA_SISTEMA_COMPLETO.md](./MENSAJERIA_SISTEMA_COMPLETO.md) 📖
**⏱️ 30 minutos**  
**Para:** Documentación técnica exhaustiva  
**Incluye:**
- Descripción general completa
- Archivos creados (detallado)
- Instalación y configuración paso a paso
- Uso del sistema (paciente y terapeuta)
- API de componentes y composables
- Seguridad y privacidad (RLS)
- Estilo y diseño
- Testing y validación
- Funciones SQL auxiliares
- Troubleshooting detallado
- Mejoras futuras
- Recursos adicionales

**👉 Lee esto para entender el sistema en profundidad.**

---

## ⚠️ Resolución de Problemas

### 4. [MENSAJERIA_CONFLICTO_ESQUEMA.md](./MENSAJERIA_CONFLICTO_ESQUEMA.md) 🔧
**⏱️ 10 minutos**  
**Para:** Resolver conflictos de base de datos  
**Incluye:**
- Problema identificado (tabla existente vs nueva)
- Comparación de esquemas
- 3 soluciones detalladas
- Recomendación con pros/contras
- Pasos de migración
- Queries de verificación

**👉 Lee esto si tienes tabla `mensajes` existente.**

### 5. [MENSAJERIA_RESUMEN_FINAL.md](./MENSAJERIA_RESUMEN_FINAL.md) 📊
**⏱️ 15 minutos**  
**Para:** Vista ejecutiva del proyecto  
**Incluye:**
- Resumen ejecutivo
- Archivos creados (tabla completa)
- Acción requerida (decisión BD)
- Instalación rápida
- Funcionalidades implementadas
- API de composables
- Checklist de testing
- Troubleshooting
- Estado del proyecto
- Próximos pasos

**👉 Lee esto para tener panorama completo.**

---

## 🗄️ Scripts SQL

### 6. [supabase_mensajeria_completa.sql](./supabase_mensajeria_completa.sql) 🆕
**Para:** Instalación desde cero (tabla NO existe)  
**Incluye:**
- Crear tabla `mensajes` completa
- Crear tabla `notificaciones`
- Políticas RLS (6 políticas)
- Índices optimizados
- Trigger para notificaciones automáticas
- Funciones auxiliares
- Comentarios documentación

**👉 Usa esto si NO tienes tabla mensajes.**

### 7. [supabase_mensajeria_migracion.sql](./supabase_mensajeria_migracion.sql) ♻️
**Para:** Migración de tabla existente  
**Incluye:**
- Agregar columnas nuevas
- Migrar datos existentes
- Aplicar constraints
- Crear índices
- Habilitar RLS
- Crear políticas
- Crear tabla notificaciones
- Trigger y funciones
- Verificación de migración

**👉 Usa esto si YA tienes tabla mensajes.**

---

## 📁 Archivos de Código

### Composables
- `composables/useMensajes.ts` - Gestión de mensajes y conversaciones
- `composables/useNotificaciones.ts` - Sistema de notificaciones

### Componentes
- `components/MensajeCard.vue` - Tarjeta individual de mensaje
- `components/MensajeInput.vue` - Campo de entrada con envío
- `components/NotificacionesBell.vue` - Campana con dropdown

### Páginas
- `pages/paciente/mensajes.vue` - Vista para pacientes
- `pages/terapeuta/mensajes.vue` - Vista para terapeutas

### Layouts (modificados)
- `layouts/paciente.vue` - Con NotificacionesBell integrado
- `layouts/terapeuta.vue` - Con NotificacionesBell integrado

---

## 🎯 Guías por Caso de Uso

### Caso 1: Soy nuevo, quiero instalar rápido
1. ✅ [MENSAJERIA_CHECKLIST.md](./MENSAJERIA_CHECKLIST.md)
2. ✅ Ejecuta SQL apropiado
3. ✅ [MENSAJERIA_QUICKSTART.md](./MENSAJERIA_QUICKSTART.md)
4. ✅ Prueba el sistema

### Caso 2: Ya tengo tabla mensajes
1. ✅ [MENSAJERIA_CONFLICTO_ESQUEMA.md](./MENSAJERIA_CONFLICTO_ESQUEMA.md)
2. ✅ Decidir estrategia (Opción A recomendada)
3. ✅ Ejecutar [supabase_mensajeria_migracion.sql](./supabase_mensajeria_migracion.sql)
4. ✅ [MENSAJERIA_CHECKLIST.md](./MENSAJERIA_CHECKLIST.md) para verificar

### Caso 3: Quiero entender todo el sistema
1. ✅ [MENSAJERIA_RESUMEN_FINAL.md](./MENSAJERIA_RESUMEN_FINAL.md)
2. ✅ [MENSAJERIA_SISTEMA_COMPLETO.md](./MENSAJERIA_SISTEMA_COMPLETO.md)
3. ✅ Revisar código fuente (composables y componentes)
4. ✅ [MENSAJERIA_QUICKSTART.md](./MENSAJERIA_QUICKSTART.md) para referencia rápida

### Caso 4: Tengo un error
1. ✅ [MENSAJERIA_CHECKLIST.md](./MENSAJERIA_CHECKLIST.md) - Sección "Errores Comunes"
2. ✅ [MENSAJERIA_SISTEMA_COMPLETO.md](./MENSAJERIA_SISTEMA_COMPLETO.md) - Sección "Troubleshooting"
3. ✅ [MENSAJERIA_RESUMEN_FINAL.md](./MENSAJERIA_RESUMEN_FINAL.md) - Sección "Troubleshooting"
4. ✅ [MENSAJERIA_CONFLICTO_ESQUEMA.md](./MENSAJERIA_CONFLICTO_ESQUEMA.md) - Si es problema de BD

### Caso 5: Quiero desarrollar sobre el sistema
1. ✅ [MENSAJERIA_SISTEMA_COMPLETO.md](./MENSAJERIA_SISTEMA_COMPLETO.md) - Sección "API de Composables"
2. ✅ Revisar código de componentes
3. ✅ [MENSAJERIA_SISTEMA_COMPLETO.md](./MENSAJERIA_SISTEMA_COMPLETO.md) - Sección "Mejoras Futuras"
4. ✅ Estudiar funciones SQL en archivos SQL

---

## 📊 Comparación de Documentos

| Documento | Tiempo | Profundidad | Audiencia | Propósito |
|-----------|--------|-------------|-----------|-----------|
| **CHECKLIST** | 5 min | 🔹 | Todos | Instalación rápida |
| **QUICKSTART** | 10 min | 🔹🔹 | Devs | Vista general práctica |
| **COMPLETO** | 30 min | 🔹🔹🔹🔹 | Devs | Documentación técnica |
| **CONFLICTO** | 10 min | 🔹🔹 | Devs/DBAs | Resolver conflictos BD |
| **RESUMEN** | 15 min | 🔹🔹🔹 | PM/Devs | Vista ejecutiva |
| **SQL Completo** | - | 🔹🔹🔹 | DBAs | Instalación nueva |
| **SQL Migración** | - | 🔹🔹🔹🔹 | DBAs | Migración existente |

---

## ✅ Flujo Recomendado

```
1. ¿Primera vez?
   ↓
   [CHECKLIST] → [QUICKSTART]
   ↓
   ✅ Sistema funcionando
   
2. ¿Necesitas más detalles?
   ↓
   [SISTEMA_COMPLETO]
   ↓
   ✅ Dominio completo

3. ¿Tienes problemas?
   ↓
   [CONFLICTO_ESQUEMA] o [Troubleshooting sections]
   ↓
   ✅ Problema resuelto
```

---

## 🔍 Búsqueda Rápida

### Busco información sobre...

**Instalación:**
- Rápida → CHECKLIST
- Detallada → SISTEMA_COMPLETO o QUICKSTART
- Con tabla existente → CONFLICTO_ESQUEMA + SQL_MIGRACION

**Composables:**
- Referencia rápida → QUICKSTART
- API completa → SISTEMA_COMPLETO o RESUMEN_FINAL
- Código fuente → `composables/useMensajes.ts` y `composables/useNotificaciones.ts`

**Componentes:**
- Props y uso → SISTEMA_COMPLETO
- Ejemplos → QUICKSTART
- Código fuente → `components/MensajeCard.vue`, etc.

**SQL:**
- Desde cero → supabase_mensajeria_completa.sql
- Migración → supabase_mensajeria_migracion.sql
- Funciones → SISTEMA_COMPLETO (sección "Funciones Auxiliares")

**Seguridad (RLS):**
- Explicación → SISTEMA_COMPLETO (sección "Seguridad y Privacidad")
- Verificación → CHECKLIST (queries de validación)

**Troubleshooting:**
- Errores comunes → CHECKLIST
- Problemas detallados → SISTEMA_COMPLETO
- Conflictos BD → CONFLICTO_ESQUEMA

**Testing:**
- Checklist rápido → CHECKLIST
- Casos completos → SISTEMA_COMPLETO o RESUMEN_FINAL

---

## 📞 Soporte por Tipo de Usuario

### 👨‍💻 Desarrollador Backend
1. CONFLICTO_ESQUEMA (si aplica)
2. SQL apropiado
3. SISTEMA_COMPLETO (sección SQL)
4. CHECKLIST para validar

### 👩‍💻 Desarrollador Frontend
1. QUICKSTART
2. SISTEMA_COMPLETO (sección Composables y Componentes)
3. Código fuente directo
4. CHECKLIST para testing

### 👔 Product Manager / Tech Lead
1. RESUMEN_FINAL
2. QUICKSTART (vista general)
3. SISTEMA_COMPLETO (sección Funcionalidades)

### 🔧 DevOps / DBA
1. CONFLICTO_ESQUEMA
2. SQL_MIGRACION o SQL_COMPLETO
3. CHECKLIST (queries de verificación)
4. SISTEMA_COMPLETO (troubleshooting)

---

## 🎓 Nivel de Conocimiento Requerido

| Documento | Nivel | Conocimientos Necesarios |
|-----------|-------|--------------------------|
| CHECKLIST | 🔰 Básico | SQL básico, Terminal |
| QUICKSTART | 🔰 Básico | Nuxt/Vue básico |
| COMPLETO | 🎓 Intermedio | Nuxt, Supabase, TypeScript |
| CONFLICTO | 🎓 Intermedio | SQL, Migraciones BD |
| RESUMEN | 🔰 Básico | Lectura técnica |
| SQL Scripts | 🎓 Intermedio | SQL, RLS, Triggers |

---

## ⏱️ Tiempo Total por Perfil

### ⚡ Instalación Rápida (No leo docs)
- CHECKLIST: 5 min
- Ejecutar SQL: 2 min
- Testing básico: 3 min
- **Total: 10 minutos**

### 📖 Lectura Completa (Entiendo todo)
- RESUMEN_FINAL: 15 min
- SISTEMA_COMPLETO: 30 min
- QUICKSTART: 10 min
- Revisar código: 20 min
- **Total: 75 minutos**

### 🛠️ Con Migración (Tabla existente)
- CONFLICTO_ESQUEMA: 10 min
- Backup y decisión: 5 min
- Ejecutar migración: 5 min
- CHECKLIST validación: 5 min
- **Total: 25 minutos**

---

## 🔗 Enlaces Rápidos

### Documentación
- [📋 Checklist](./MENSAJERIA_CHECKLIST.md)
- [⚡ Quickstart](./MENSAJERIA_QUICKSTART.md)
- [📖 Completo](./MENSAJERIA_SISTEMA_COMPLETO.md)
- [⚠️ Conflictos](./MENSAJERIA_CONFLICTO_ESQUEMA.md)
- [📊 Resumen](./MENSAJERIA_RESUMEN_FINAL.md)

### Scripts SQL
- [🆕 Completo](./supabase_mensajeria_completa.sql)
- [♻️ Migración](./supabase_mensajeria_migracion.sql)

### Código Fuente
- [Composables] `composables/useMensajes.ts`, `composables/useNotificaciones.ts`
- [Componentes] `components/Mensaje*.vue`, `components/NotificacionesBell.vue`
- [Páginas] `pages/*/mensajes.vue`

---

## 🎯 Recomendación Final

**Primera vez:**
1. 📋 CHECKLIST (5 min)
2. ⚡ QUICKSTART (10 min)
3. ✅ Testing
4. 📖 COMPLETO (cuando tengas tiempo)

**Con tabla existente:**
1. ⚠️ CONFLICTO_ESQUEMA (10 min)
2. ♻️ SQL Migración
3. 📋 CHECKLIST (validar)

**Para dominio completo:**
1. 📊 RESUMEN_FINAL (15 min)
2. 📖 SISTEMA_COMPLETO (30 min)
3. 💻 Revisar código (20 min)

---

**Usa este índice como tu guía de navegación principal. ¡Éxito con tu implementación! 🚀**

---

*Última actualización: 21 de Octubre de 2025*
