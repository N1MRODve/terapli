# 🎭 Modo Demo - Instrucciones Rápidas

## ¿Qué es el Modo Demo?

El **Modo Demo** permite explorar todas las funcionalidades del módulo de pacientes con **datos simulados** sin necesidad de tener Supabase configurado.

---

## 🔄 Cambiar entre Modo Demo y Producción

### Activar/Desactivar Modo Demo:

Busca esta línea en los archivos y cámbiala:

```javascript
const MODO_DEMO = ref(true)  // ← Modo Demo ACTIVO
const MODO_DEMO = ref(false) // ← Modo Producción (Supabase)
```

### Archivos a Modificar:

1. **`pages/terapeuta/pacientes.vue`** (Lista de pacientes)
2. **`pages/terapeuta/pacientes/[id].vue`** (Ficha individual)
3. **`components/PacienteEvolucion.vue`** (Gráfico de evolución)

---

## 🎭 Modo Demo (Activo por defecto)

### Características:
- ✅ 6 pacientes de prueba con diferentes perfiles
- ✅ Sesiones históricas simuladas
- ✅ Gráficos de evolución con datos generados
- ✅ Notas clínicas de ejemplo
- ✅ Todos los estados: activo, pausa, finalizado
- ✅ Alertas de seguimiento automáticas

### Pacientes Demo Incluidos:

1. **María González P.** - Activo, evolución positiva
2. **Carlos Mendoza S.** - Activo, requiere atención
3. **Ana Rodríguez L.** - Activo, excelente evolución
4. **Laura Martínez G.** - En pausa
5. **Pedro Sánchez R.** - Finalizado
6. **Sofía Torres M.** - Activo, estable

---

## 📊 Modo Producción

### Requisitos:
- ✅ Supabase configurado y conectado
- ✅ Tablas creadas (pacientes, sesiones, emociones_avanzadas, etc.)
- ✅ Usuario autenticado como terapeuta
- ✅ Pacientes asignados a tu `psicologa_id`

### Cómo Activar:
1. Cambia `MODO_DEMO = ref(false)` en los 3 archivos mencionados
2. Asegúrate de tener datos en Supabase
3. Recarga la página

---

## 🚀 Datos de Prueba para Supabase

Si quieres datos de prueba reales en Supabase:

1. Abre: `supabase/migrations/20251019_datos_prueba_pacientes.sql`
2. Reemplaza: `UUID_DE_LA_PSICOLOGA` con tu UUID real
3. Ejecuta el script en Supabase SQL Editor

Esto creará los mismos 6 pacientes pero en tu base de datos real.

---

## 💡 Recomendación

**Desarrollo**: Usa `MODO_DEMO = true` para desarrollo rápido
**Producción**: Usa `MODO_DEMO = false` con datos reales

---

## 🔍 Identificar Modo Actual

Cuando el **Modo Demo está activo**, verás un banner morado en la parte superior:

```
🎭 Modo Demostración Activo
Estás viendo 6 pacientes de prueba con datos simulados...
```

---

## ⚠️ Limitaciones del Modo Demo

- Las notas editadas NO se guardan (solo memoria)
- No se pueden crear nuevos pacientes
- No hay persistencia de datos
- Datos generados aleatoriamente en cada carga

Para funcionalidad completa, usa **Modo Producción** con Supabase.

---

**Archivo actualizado**: 19 de octubre de 2025
