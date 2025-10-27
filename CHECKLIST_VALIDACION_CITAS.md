# 🔍 Checklist de Validación - Sistema de Citas

## 📋 Instrucciones

Marca cada ítem como completado después de verificar.  
**Tiempo estimado**: 20-30 minutos

---

## ✅ FASE 1: Entrada de Fecha y Hora (5 min)

### Test 1.1: Entrada Manual de Fecha
- [ ] Abrir modal de nueva cita
- [ ] Clic en campo de fecha
- [ ] Escribir fecha manualmente usando teclado
- [ ] Verificar que acepta la entrada
- [ ] **Resultado esperado**: Fecha se introduce correctamente

### Test 1.2: Entrada Manual de Hora
- [ ] En el mismo modal
- [ ] Clic en campo de hora
- [ ] Escribir "21:00" directamente
- [ ] Verificar que acepta la entrada
- [ ] **Resultado esperado**: Hora aparece como "21:00"

### Test 1.3: Hora de Fin Automática
- [ ] Después de introducir 21:00
- [ ] Verificar campo "Hora de Fin"
- [ ] **Resultado esperado**: Muestra "22:00" automáticamente

### Test 1.4: Prevención de Enter
- [ ] Con cursor en campo de fecha
- [ ] Presionar Enter
- [ ] **Resultado esperado**: NO se envía el formulario
- [ ] Formulario permanece abierto

### Test 1.5: Tamaño de Campos
- [ ] Inspeccionar campos de fecha/hora
- [ ] **Resultado esperado**: Altura mínima 44px
- [ ] Campos son fáciles de clickear

**Estado Fase 1**: [ ] Completada

---

## ⚠️ FASE 2: Detección de Conflictos (5 min)

### Test 2.1: Sin Conflicto a las 21:00
- [ ] Crear cita para mañana a las 10:00-11:00
- [ ] Intentar crear otra a las 21:00-22:00
- [ ] **Resultado esperado**: NO hay alerta de conflicto
- [ ] Botón "Guardar" está habilitado
- [ ] Cita se crea exitosamente

### Test 2.2: Conflicto Real
- [ ] Crear cita a las 14:00-15:00
- [ ] Intentar crear otra a las 14:30-15:30
- [ ] **Resultado esperado**: Alerta amarilla "Conflicto de Horario"
- [ ] Botón "Guardar" está deshabilitado

### Test 2.3: Citas Consecutivas (Sin Conflicto)
- [ ] Crear cita a las 10:00-11:00
- [ ] Crear otra a las 11:00-12:00 (justo después)
- [ ] **Resultado esperado**: NO hay conflicto
- [ ] Ambas citas se crean correctamente

### Test 2.4: Diferentes Horas
Crear citas en estos horarios sin conflictos:
- [ ] 08:00-09:00 ✅
- [ ] 14:00-15:00 ✅
- [ ] 21:00-22:00 ✅
- [ ] **Resultado esperado**: Todas se crean sin problema

**Estado Fase 2**: [ ] Completada

---

## 🔢 FASE 3: Conteo Coherente (5 min)

### Test 3.1: Preparación
- [ ] Navegar a Agenda
- [ ] Seleccionar día de hoy
- [ ] Crear 3 citas confirmadas
- [ ] Crear 1 cita y cancelarla

### Test 3.2: Vista Día
- [ ] Vista debe mostrar "3 citas programadas"
- [ ] Cita cancelada NO debe aparecer
- [ ] **Resultado esperado**: Conteo = 3

### Test 3.3: Vista Semana
- [ ] Cambiar a vista Semana
- [ ] Debe mostrar "3 citas esta semana"
- [ ] **Resultado esperado**: Conteo = 3

### Test 3.4: Vista Mes
- [ ] Cambiar a vista Mes
- [ ] Debe mostrar "3 citas este mes"
- [ ] **Resultado esperado**: Conteo = 3

### Test 3.5: Consistencia
- [ ] Los 3 números son idénticos
- [ ] **Resultado esperado**: ✅ Coherencia total

**Estado Fase 3**: [ ] Completada

---

## 🃏 FASE 4: Tarjeta de Paciente (5 min)

### Test 4.1: Sin Próxima Cita
- [ ] Seleccionar paciente sin citas futuras
- [ ] Ver tarjeta en lista de pacientes
- [ ] **Resultado esperado**: NO muestra sección "Próxima:"

### Test 4.2: Crear Cita
- [ ] Clic en "Asignar Cita" del mismo paciente
- [ ] Crear cita para mañana a las 15:00
- [ ] Guardar cita
- [ ] **Resultado esperado**: Toast de éxito aparece

### Test 4.3: Actualización Automática
- [ ] Volver a lista de pacientes
- [ ] Ver tarjeta del paciente
- [ ] **Resultado esperado**: Muestra "Próxima: vie, 27 oct, 15:00"
- [ ] **CRÍTICO**: NO debe mostrar "Invalid Date"

### Test 4.4: Enlace "Ver Citas"
- [ ] En la misma tarjeta
- [ ] Clic en "Ver citas →"
- [ ] **Resultado esperado**: Redirige a agenda con filtro del paciente

### Test 4.5: Formato de Fecha Robusto
Probar con diferentes escenarios:
- [ ] Paciente con cita hoy
- [ ] Paciente con cita mañana
- [ ] Paciente con cita la próxima semana
- [ ] **Resultado esperado**: Todas muestran formato válido

**Estado Fase 4**: [ ] Completada

---

## 📌 FASE 5: Botón "Asignar Cita" (3 min)

### Test 5.1: Paciente Activo (Desktop)
- [ ] Ver lista en desktop (pantalla > 768px)
- [ ] Hacer hover sobre tarjeta de paciente activo
- [ ] **Resultado esperado**: Botón "Asignar Cita" aparece

### Test 5.2: Paciente Activo (Móvil)
- [ ] Ver lista en móvil (< 768px) o simular con DevTools
- [ ] Ver tarjeta de paciente activo
- [ ] **Resultado esperado**: Botón "Asignar Cita" SIEMPRE visible

### Test 5.3: Paciente Pausado
- [ ] Ver tarjeta de paciente en pausa
- [ ] Hacer hover
- [ ] **Resultado esperado**: Botón NO aparece

### Test 5.4: Filtros
- [ ] Aplicar filtro "Activos"
- [ ] Hacer hover sobre tarjeta
- [ ] **Resultado esperado**: Botón aparece
- [ ] Cambiar a filtro "En pausa"
- [ ] **Resultado esperado**: Botón NO aparece (correctamente)

### Test 5.5: Funcionalidad del Botón
- [ ] Clic en "Asignar Cita"
- [ ] **Resultado esperado**: Modal se abre
- [ ] Paciente ya está preseleccionado
- [ ] Datos del bono (si existe) se muestran

**Estado Fase 5**: [ ] Completada

---

## 🔄 FASE 6: Sincronización entre Vistas (5 min)

### Test 6.1: Crear desde Pacientes
- [ ] Ir a "Pacientes"
- [ ] Clic en "Asignar Cita"
- [ ] Crear cita para hoy a las 16:00

### Test 6.2: Verificar en Agenda
- [ ] Navegar a "Agenda"
- [ ] Vista Día
- [ ] **Resultado esperado**: Cita aparece a las 16:00

### Test 6.3: Verificar en Tarjeta
- [ ] Volver a "Pacientes"
- [ ] Ver tarjeta del paciente
- [ ] **Resultado esperado**: "Próxima: hoy, 16:00"

### Test 6.4: Verificar en Ficha Individual
- [ ] Clic en tarjeta del paciente
- [ ] Ver sección "Resumen Terapéutico"
- [ ] **Resultado esperado**: "Próxima sesión programada" muestra fecha correcta

### Test 6.5: Consistencia Total
- [ ] Los datos coinciden en:
  - [ ] Lista de pacientes ✅
  - [ ] Agenda ✅
  - [ ] Ficha individual ✅
- [ ] **Resultado esperado**: 100% sincronizado

**Estado Fase 6**: [ ] Completada

---

## 🎯 RESUMEN FINAL

### Conteo de Tests
- **Fase 1 (Entrada)**: 5 tests
- **Fase 2 (Conflictos)**: 4 tests
- **Fase 3 (Conteo)**: 5 tests
- **Fase 4 (Tarjeta)**: 5 tests
- **Fase 5 (Botón)**: 5 tests
- **Fase 6 (Sync)**: 5 tests
- **TOTAL**: 29 tests

### Estado Global
- [ ] Fase 1: Entrada de Fecha/Hora
- [ ] Fase 2: Detección de Conflictos
- [ ] Fase 3: Conteo Coherente
- [ ] Fase 4: Tarjeta de Paciente
- [ ] Fase 5: Botón Asignar Cita
- [ ] Fase 6: Sincronización

### Resultado Final
- [ ] **APROBADO**: Todos los tests pasaron ✅
- [ ] **RECHAZADO**: Hay fallos (especificar abajo) ❌

---

## 🐛 Problemas Encontrados

Si algún test falló, anótalo aquí:

```
Test: [Número del test]
Problema: [Descripción del error]
Pasos para reproducir: [Pasos exactos]
Resultado esperado: [Qué debería pasar]
Resultado actual: [Qué pasó realmente]
Captura: [Adjuntar screenshot]
```

---

## ✅ Aprobación

**Fecha de validación**: ___________________  
**Validado por**: ___________________  
**Firma**: ___________________

**Estado**: 
- [ ] ✅ Aprobado para producción
- [ ] ⚠️ Aprobado con observaciones menores
- [ ] ❌ Rechazado (requiere correcciones)

---

**Versión**: 2.0.0  
**Fecha de correcciones**: 26 de octubre de 2025
