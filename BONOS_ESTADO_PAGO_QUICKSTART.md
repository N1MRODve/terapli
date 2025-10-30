# 💳 Estado de Pago en Bonos - Quickstart

## ⚡ Resumen Ultra-Rápido

Se agregó control de pago independiente del estado del bono:

- ✅ Campo `pagado` (boolean) en tabla `bonos`
- ✅ Badge visual "💳 Sin pagar" / "✓ Pagado" 
- ✅ Botón "Confirmar pago" en componente BonosPaciente
- ✅ Función RPC `confirmar_pago_bono()` para marcar como pagado

## 🚀 Aplicar en 2 Pasos

### 1. Ejecutar la Migración

**Opción A - Dashboard Supabase:**
```
1. Ir a supabase.com → SQL Editor
2. Copiar contenido de: supabase/migrations/20251029_agregar_estado_pago_bonos.sql
3. Pegar y ejecutar ▶️
```

**Opción B - CLI:**
```bash
npx supabase db push
```

### 2. Verificar

```sql
-- Ver columnas nuevas
SELECT pagado, fecha_pago, metodo_pago 
FROM bonos 
LIMIT 3;
```

## 💡 Uso

**Para confirmar un pago:**
1. Abrir panel de paciente
2. Click en "💳 Confirmar pago" en el bono
3. Seleccionar método de pago (1-6)
4. ¡Listo! El bono se marca como pagado

## 🎯 Estados Posibles

| Estado | Pagado | Badge |
|--------|--------|-------|
| Pendiente | ❌ | 🔵 Pendiente + 💳 Sin pagar |
| Activo | ❌ | 🟢 Activo + 💳 Sin pagar |
| Activo | ✅ | 🟢 Activo + ✓ Pagado |
| Finalizado | ✅ | ⚫ Finalizado |

## 📄 Documentación Completa

Ver: `BONOS_ESTADO_PAGO_GUIA.md`
