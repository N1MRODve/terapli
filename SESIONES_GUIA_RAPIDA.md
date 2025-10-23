# 🚀 Guía Rápida: Módulo de Sesiones

## ✅ Checklist de Implementación

### 1. Base de Datos (5 min)
- [ ] Abrir Supabase Dashboard
- [ ] Ir a SQL Editor
- [ ] Ejecutar `supabase/migrations/20251019_modulo_sesiones_financiero.sql`
- [ ] Verificar que no hay errores

### 2. Verificar Instalación (2 min)
```sql
-- En SQL Editor, verificar tablas:
SELECT * FROM sesiones LIMIT 1;
SELECT * FROM pagos_terapeutas LIMIT 1;

-- Verificar funciones:
SELECT proname FROM pg_proc WHERE proname LIKE '%terapeuta%';
```

### 3. Datos de Prueba (Opcional)
```sql
-- Insertar sesión de prueba:
INSERT INTO sesiones (
  paciente_id, 
  terapeuta_id, 
  fecha, 
  modalidad, 
  estado, 
  precio_total
) VALUES (
  (SELECT id FROM pacientes LIMIT 1),
  auth.uid(),
  now() + interval '2 days',
  'online',
  'pendiente',
  50.00
);
```

### 4. Probar en el Frontend
1. Iniciar servidor: `npm run dev`
2. Iniciar sesión como terapeuta
3. Ir a `/terapeuta/sesiones`
4. Verificar que carga sin errores

---

## 📦 Archivos Creados

```
✅ composables/useSesiones.ts               # Lógica de negocio
✅ components/ResumenCard.vue               # Card de métricas
✅ components/TablaSesiones.vue             # Tabla responsive
✅ pages/terapeuta/sesiones.vue             # Página principal
✅ supabase/migrations/20251019_*.sql      # Schema de BD
✅ SESIONES_MODULO_DOCUMENTACION.md        # Docs completas
✅ SESIONES_GUIA_RAPIDA.md                 # Esta guía
```

---

## 🎯 Funcionalidades Principales

### Para Terapeutas
✅ Ver todas sus sesiones (pendientes, confirmadas, anuladas)  
✅ Consultar estado de pagos en tiempo real  
✅ Conocer su saldo acumulado (70% de ingresos)  
✅ Filtrar por mes y estado  
✅ Estadísticas: promedio por sesión, tasa de confirmación  

### Para Administración (Belmaris)
✅ Marcar pagos como confirmados  
✅ Ver distribución 70/30 automática  
✅ Gestionar pagos mensuales  
✅ Auditoría completa de transacciones  

---

## 💰 Cálculos Automáticos

### Cuando el paciente paga:
1. Belmaris marca `pago_confirmado = true`
2. **Trigger automático** calcula:
   - 70% → Terapeuta
   - 30% → Consulta
3. Se crea registro en `pagos_terapeutas`
4. Terapeuta ve su saldo actualizado

### Fórmulas:
```typescript
montoTerapeuta = precio_total × 0.70
montoConsulta = precio_total × 0.30
```

---

## 🔒 Seguridad Implementada

✅ **Row Level Security (RLS)**: Terapeutas solo ven sus datos  
✅ **Privacidad**: Solo nombre + inicial del paciente  
✅ **Roles**: Solo admin/coordinadora pueden confirmar pagos  
✅ **Auditoría**: Todos los cambios registrados con timestamps  

---

## 📱 Interfaz

### Desktop
- Cards de resumen en 4 columnas
- Tabla completa con todas las columnas
- Filtros laterales

### Mobile
- Cards apiladas verticalmente
- Lista compacta con info esencial
- Filtros en acordeón

---

## 🐛 Troubleshooting

### Error: "Cannot find name 'useSesiones'"
**Solución**: Reiniciar servidor de desarrollo
```bash
pkill -f "nuxt" && npm run dev
```

### Error: "relation sesiones does not exist"
**Solución**: Aplicar migración SQL en Supabase

### Las sesiones no aparecen
**Verificar**:
1. Usuario autenticado correctamente
2. `terapeuta_id` coincide con `auth.uid()`
3. Políticas RLS activas

### Los montos no se calculan
**Verificar**:
1. Trigger existe: `SELECT * FROM pg_trigger WHERE tgname LIKE '%terapeuta%'`
2. Campo `precio_total` tiene valor numérico
3. Estado de sesión es válido

---

## 🎨 Personalización

### Cambiar colores por estado
En `components/TablaSesiones.vue`:
```typescript
const obtenerClaseEstado = (estado: EstadoSesion): string => {
  const clases = {
    pendiente: 'bg-amber-100 text-amber-700',  // Cambiar aquí
    confirmada: 'bg-green-100 text-green-700',
    // ...
  }
}
```

### Cambiar porcentaje terapeuta
En `composables/useSesiones.ts`:
```typescript
const PORCENTAJE_TERAPEUTA = 0.7  // Cambiar a 0.75 para 75%
const PORCENTAJE_CONSULTA = 0.3   // Ajustar a 0.25
```

Luego actualizar en SQL:
```sql
-- En la función registrar_pago_terapeuta()
v_monto_terapeuta := NEW.precio_total * 0.75;
v_monto_consulta := NEW.precio_total * 0.25;
```

---

## 📊 Queries Útiles

### Ver resumen de un terapeuta
```sql
SELECT * FROM obtener_resumen_financiero_terapeuta('uuid-terapeuta');
```

### Sesiones pendientes de pago
```sql
SELECT 
  s.fecha,
  p.nombre || ' ' || LEFT(p.apellido, 1) || '.' as paciente,
  s.precio_total,
  s.precio_total * 0.70 as monto_terapeuta
FROM sesiones s
JOIN pacientes p ON s.paciente_id = p.id
WHERE s.estado = 'pendiente'
AND s.terapeuta_id = 'uuid-terapeuta'
ORDER BY s.fecha;
```

### Total a pagar este mes
```sql
SELECT 
  terapeuta_id,
  SUM(monto_terapeuta) as total_a_pagar
FROM pagos_terapeutas
WHERE estado_pago = 'confirmado'
AND fecha_pago IS NULL
GROUP BY terapeuta_id;
```

---

## 🔄 Flujo Completo

```
1. AGENDACIÓN
   Paciente/Admin → Crea sesión → estado='pendiente'
   
2. CONFIRMACIÓN
   Paciente paga → Belmaris marca pago_confirmado=true
   
3. TRIGGER AUTOMÁTICO
   Sistema calcula 70/30 → Inserta en pagos_terapeutas
   
4. VISUALIZACIÓN
   Terapeuta ve saldo actualizado en su panel
   
5. PAGO MENSUAL
   1-5 del mes → Admin procesa pagos → estado_pago='pagado'
```

---

## 📞 Contacto

**Dudas técnicas**: Equipo de desarrollo  
**Dudas de pagos**: admin@psicologakarem.com  
**Bugs**: Reportar en el sistema de gestión

---

## ✨ Próximas Mejoras

- [ ] Exportar reporte mensual en PDF
- [ ] Gráficos de evolución de ingresos
- [ ] Notificaciones push cuando se confirma un pago
- [ ] Calculadora de proyecciones futuras
- [ ] Integración con sistema de facturación

---

## 📚 Recursos

- **Documentación completa**: `SESIONES_MODULO_DOCUMENTACION.md`
- **Schema SQL**: `supabase/migrations/20251019_modulo_sesiones_financiero.sql`
- **Composable**: `composables/useSesiones.ts`
- **Componentes**: `components/ResumenCard.vue`, `components/TablaSesiones.vue`

---

**¡Módulo listo para producción! 🎉**

*Última actualización: 19 de octubre de 2025*
