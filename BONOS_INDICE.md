# 📚 Sistema de Bonos - Índice de Documentación

## 🎯 Visión General

Sistema completo de gestión de bonos (paquetes de sesiones) para **psicologakarem.com**, con automatización total de ciclo de vida: creación → pago → consumo → renovación → vencimiento.

---

## 📁 Archivos del Sistema

### 🗄️ Migraciones SQL (Backend)

| Archivo | Líneas | Estado | Descripción |
|---------|--------|--------|-------------|
| `20251027_sistema_bonos_completo.sql` | 1138 | ✅ Ejecutado | Schema completo: tablas, ENUMs, vistas, funciones dashboard |
| `20251027_bonos_logica_negocio.sql` | 950+ | ⏳ Pendiente | Lógica de negocio: triggers, funciones, RLS, constraints |

---

### 📖 Documentación

| Documento | Páginas | Audiencia | Propósito |
|-----------|---------|-----------|-----------|
| `BONOS_INSTALACION_GUIA.md` | ~15 | Desarrolladores | Guía paso a paso de instalación y testing |
| `BONOS_RESUMEN_EJECUTIVO.md` | ~12 | Todos | Visión general del sistema completo |
| `BONOS_RPC_CONFIRMAR_PAGO.md` | ~10 | Frontend Dev | Detalle de función RPC de confirmación de pagos |
| `BONOS_RLS_POLITICAS.md` | ~10 | Backend Dev | Políticas de seguridad por roles |
| `BONOS_INDICE.md` | 1 | Todos | Este documento (índice general) |

---

## 🚀 Inicio Rápido

### Para Nuevos Desarrolladores

1. **Leer primero**: `BONOS_RESUMEN_EJECUTIVO.md` (visión general)
2. **Instalar backend**: `BONOS_INSTALACION_GUIA.md` (paso a paso)
3. **Implementar frontend**: `BONOS_RPC_CONFIRMAR_PAGO.md` (ejemplos de uso)
4. **Seguridad**: `BONOS_RLS_POLITICAS.md` (entender permisos)

### Para Product Managers

- **Leer**: `BONOS_RESUMEN_EJECUTIVO.md`
- **Flujo de negocio**: Sección "Flujo Completo del Sistema"
- **Métricas disponibles**: Sección "Extensiones Futuras"

### Para QA/Testing

- **Guía de testing**: `BONOS_INSTALACION_GUIA.md` → Sección "Paso 4: Testing Manual"
- **Casos de uso**: Todos los "Test X" en la guía
- **Verificación RLS**: `BONOS_RLS_POLITICAS.md` → Sección "Testing de Políticas"

---

## 🗺️ Mapa de Navegación Rápida

```
BONOS_INDICE.md (ESTÁS AQUÍ)
├── 🏗️ INSTALACIÓN
│   └── BONOS_INSTALACION_GUIA.md
│       ├── Pre-requisitos
│       ├── Paso 1: Schema DB ✅
│       ├── Paso 2: Lógica de Negocio ⏳
│       ├── Paso 3: pg_cron
│       ├── Paso 4: Testing Manual
│       ├── Paso 5: Verificar RLS
│       └── Paso 6: Frontend Setup
│
├── 📊 RESUMEN GENERAL
│   └── BONOS_RESUMEN_EJECUTIVO.md
│       ├── Estado de Implementación
│       ├── Arquitectura de BD
│       ├── Funciones y Automatización
│       ├── Flujo Completo (diagrama)
│       ├── Testing Recomendado
│       └── Próximos Pasos
│
├── 💻 DESARROLLO FRONTEND
│   └── BONOS_RPC_CONFIRMAR_PAGO.md
│       ├── Función fn_confirmar_pago_bono()
│       ├── Parámetros y Retorno
│       ├── Ejemplos TypeScript/Nuxt
│       ├── Manejo de Estados
│       ├── Componentes Vue
│       └── Troubleshooting
│
└── 🔒 SEGURIDAD
    └── BONOS_RLS_POLITICAS.md
        ├── Arquitectura de Roles
        ├── Políticas por Tabla
        ├── Función is_staff()
        ├── Testing de Permisos
        ├── Bypass con SECURITY DEFINER
        └── Mejores Prácticas
```

---

## 🔧 Funciones Principales

### Triggers Automáticos

| Trigger | Tabla | Evento | Función Ejecutada | Descripción |
|---------|-------|--------|-------------------|-------------|
| `tr_bono_sesion_usada` | citas | AFTER INSERT | `decrementar_sesion_bono()` | Resta sesión al crear cita con bono |
| `trg_activar_bono_al_pagar` | pagos_bonos | BEFORE INSERT/UPDATE | `fn_activar_bono_al_pagar()` | Activa bono al confirmar pago |
| `tr_crear_renovacion_automatica` | bonos | AFTER UPDATE | `crear_renovacion_automatica()` | Crea nuevo bono al completarse/vencerse |

### Funciones RPC (Frontend)

| Función | Parámetros | Retorno | Uso |
|---------|------------|---------|-----|
| `fn_confirmar_pago_bono()` | `p_pago_id: uuid` | `jsonb` | Confirmar pagos desde UI |
| `fn_renovar_bono_manual()` | `p_bono_id, p_usuario_id, ...` | `jsonb` | Renovación manual con mods |

### Funciones de Mantenimiento

| Función | Ejecución | Propósito |
|---------|-----------|-----------|
| `verificar_vencimiento_bonos()` | pg_cron diario (2 AM) | Marcar bonos vencidos |
| `verificar_vencimiento_bonos_simple()` | pg_cron (versión void) | Mismo, sin retorno |

---

## 📊 Tablas del Sistema

### Tabla: `bonos`
**Propósito**: Gestión de paquetes de sesiones  
**Campos clave**: 
- `sesiones_restantes` (decrementado por trigger)
- `estado` (pendiente → activo → completado/vencido)
- `renovacion_automatica` (boolean)

**Documentación detallada**: 
- Schema → `20251027_sistema_bonos_completo.sql` líneas 111-189
- Lógica → `BONOS_RESUMEN_EJECUTIVO.md` sección "Arquitectura de BD"

---

### Tabla: `pagos_bonos`
**Propósito**: Registro de pagos de bonos  
**Campos clave**:
- `confirmado` (activa trigger al cambiar a true)
- `monto` (se suma para calcular total pagado)
- `confirmado_por` (auditoría)

**Documentación detallada**:
- Schema → `20251027_sistema_bonos_completo.sql` líneas 224-290
- RPC → `BONOS_RPC_CONFIRMAR_PAGO.md`

---

### Tabla: `renovaciones_bonos`
**Propósito**: Historial de renovaciones  
**Campos clave**:
- `bono_original_id` / `nuevo_bono_id` (relación)
- `tipo_renovacion` (automatica/manual)
- `renovado_por` (NULL si automática)

**Documentación detallada**:
- Schema → `20251027_sistema_bonos_completo.sql` líneas 297-329

---

## 🎯 Casos de Uso Principales

### 1. Crear y Activar Bono

**Actor**: Coordinadora/Admin  
**Flujo**:
1. Crear bono (estado='pendiente')
2. Registrar pago en `pagos_bonos`
3. Confirmar pago vía `fn_confirmar_pago_bono()`
4. Trigger activa bono → estado='activo'

**Documentación**: `BONOS_INSTALACION_GUIA.md` Tests 1-2

---

### 2. Consumir Sesiones

**Actor**: Sistema (automático)  
**Flujo**:
1. Usuario registra cita con `bono_id`
2. Trigger `tr_bono_sesion_usada` se ejecuta
3. `sesiones_restantes - 1`
4. Si llega a 0 → estado='completado'

**Documentación**: `BONOS_INSTALACION_GUIA.md` Test 3

---

### 3. Renovación Automática

**Actor**: Sistema (automático)  
**Flujo**:
1. Bono llega a estado='completado' con `renovacion_automatica=true`
2. Trigger `tr_crear_renovacion_automatica` se ejecuta
3. Nuevo bono creado (estado='pendiente')
4. Registro en `renovaciones_bonos`

**Documentación**: `BONOS_INSTALACION_GUIA.md` Test 4

---

### 4. Marcar Vencidos

**Actor**: pg_cron (diario)  
**Flujo**:
1. Cada día a las 2 AM ejecuta `verificar_vencimiento_bonos_simple()`
2. Bonos con `fecha_fin < hoy` → estado='vencido'
3. Si `renovacion_automatica=true` → crea nuevo bono

**Documentación**: `BONOS_INSTALACION_GUIA.md` Test 5 y Paso 3

---

## 🔐 Matriz de Permisos

| Acción | Paciente | Psicóloga | Coordinadora | Admin |
|--------|----------|-----------|--------------|-------|
| Ver bonos propios | ✅ | ✅ | ✅ | ✅ |
| Ver todos los bonos | ❌ | ❌ | ✅ | ✅ |
| Crear bonos | ❌ | ❌ | ✅ | ✅ |
| Confirmar pagos | ❌ | ❌ | ✅ | ✅ |
| Renovar manualmente | ❌ | ❌ | ✅ | ✅ |
| Ver pagos propios | ✅ | ✅ | ✅ | ✅ |
| Ver todos los pagos | ❌ | ❌ | ✅ | ✅ |

**Documentación completa**: `BONOS_RLS_POLITICAS.md`

---

## 📈 Métricas Disponibles

### Vistas Predefinidas

1. **`vista_dashboard_bonos_completo`**
   - Bonos con info de paciente, psicóloga, pagos
   - Uso: Dashboard principal

2. **`vista_bonos_estadisticas`**
   - Estadísticas agregadas por psicóloga
   - Métricas: total bonos, activos, completados

### Funciones de Métricas

| Función | Parámetro | Retorno | Uso |
|---------|-----------|---------|-----|
| `fn_bonos_por_psicologa()` | `psicologa_id` | Conteo | Bonos por terapeuta |
| `fn_bonos_proximos_vencer()` | `dias: int` | Lista | Alertas de vencimiento |
| `fn_estadisticas_bonos()` | - | jsonb | Dashboard general |

**Documentación**: `20251027_sistema_bonos_completo.sql` líneas 580-905

---

## 🛠️ Herramientas de Desarrollo

### Queries Útiles

```sql
-- Ver bonos activos con sesiones restantes
SELECT * FROM vista_dashboard_bonos_completo 
WHERE estado = 'activo' 
ORDER BY sesiones_restantes ASC;

-- Bonos próximos a vencer (7 días)
SELECT * FROM fn_bonos_proximos_vencer(7);

-- Historial de renovaciones
SELECT * FROM renovaciones_bonos 
ORDER BY fecha_renovacion DESC;

-- Pagos pendientes de confirmación
SELECT * FROM pagos_bonos 
WHERE confirmado = false;
```

**Más queries**: `BONOS_RESUMEN_EJECUTIVO.md` → "Mantenimiento"

---

## 📞 Soporte y Referencias

### Recursos Internos

- **Migraciones SQL**: `/supabase/migrations/2025102*.sql`
- **Documentación**: `/*.md` (5 archivos)
- **Composables**: `/composables/useBonos.ts` (por crear)

### Referencias Externas

- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [pg_cron Extension](https://github.com/citusdata/pg_cron)

---

## ✅ Checklist de Implementación

### Fase 1: Backend (Actual)
- [x] ✅ Schema de tablas
- [ ] ⏳ Lógica de negocio **← SIGUIENTE PASO**
- [ ] ⏳ pg_cron configurado
- [ ] ⏳ Testing manual completo

### Fase 2: Frontend
- [ ] Tipos TypeScript generados
- [ ] Composable `useBonos.ts`
- [ ] Componentes UI bonos
- [ ] Panel de confirmación de pagos
- [ ] Dashboard de métricas

### Fase 3: Producción
- [ ] Testing E2E
- [ ] Deploy staging
- [ ] Capacitación equipo
- [ ] Deploy producción
- [ ] Monitoreo activo

---

## 🎓 Onboarding Recomendado

### Día 1: Entender el Sistema
- Leer `BONOS_RESUMEN_EJECUTIVO.md` completo
- Revisar diagrama de flujo
- Entender tablas principales

### Día 2: Instalación y Testing
- Ejecutar migraciones SQL
- Realizar tests manuales 1-5
- Verificar políticas RLS

### Día 3: Desarrollo Frontend
- Generar tipos TypeScript
- Crear composable básico
- Implementar componente de prueba

### Día 4: Integración
- Integrar con sistema de citas
- Testing de integración
- Documentar hallazgos

---

## 🔄 Versionado

| Versión | Fecha | Cambios |
|---------|-------|---------|
| **3.0** | 27 oct 2025 | Optimización según Prompt 2 (estados 'completado', trigger simplificado) |
| **2.0** | 27 oct 2025 | Lógica de negocio completa con RPC |
| **1.0** | 27 oct 2025 | Schema base implementado |

---

## 📝 Notas Importantes

### ⚠️ Antes de Ejecutar en Producción

1. **Backup de BD**: Hacer snapshot antes de migrar
2. **Testing en Staging**: Probar TODOS los flujos
3. **Validar is_staff()**: Verificar que funciona correctamente
4. **Revisar UUIDs**: No hardcodear UUIDs en código
5. **Monitorear logs**: Activar logging de triggers

### 🔒 Seguridad

- ✅ Todas las funciones usan `SECURITY DEFINER`
- ✅ RLS habilitado en todas las tablas
- ✅ Validación de permisos en funciones RPC
- ✅ Auditoría con campos `created_at`, `updated_at`

### 🚀 Performance

- ✅ Índices en columnas de búsqueda frecuente
- ✅ Función `is_staff()` marcada como `STABLE`
- ✅ Triggers optimizados (sin consultas innecesarias)
- ✅ Vistas materializadas para dashboards (considerar)

---

## 🎯 Siguiente Acción Inmediata

**EJECUTAR**: `/supabase/migrations/20251027_bonos_logica_negocio.sql` en Supabase Dashboard

1. Abrir Supabase → SQL Editor
2. Copiar contenido completo del archivo
3. Click RUN
4. Verificar mensaje de éxito
5. Ejecutar tests manuales

**Documentación**: `BONOS_INSTALACION_GUIA.md` → Paso 2

---

**Última actualización**: 27 de octubre de 2025  
**Mantenido por**: GitHub Copilot  
**Estado**: ✅ Documentación completa y actualizada
