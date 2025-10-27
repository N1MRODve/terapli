# 🧪 Guía de Pruebas del Sistema de Gestión de Citas

## 📋 Resumen de Correcciones Implementadas

Se han corregido los siguientes problemas reportados en el sistema de gestión de citas:

### ✅ 1. Entrada de Fecha y Hora Mejorada
- **Problema**: Dificultad para introducir manualmente fecha y hora, campos pequeños
- **Solución**: 
  - Campos de fecha/hora ampliados (44px altura mínima)
  - Atributo `step="900"` añadido (intervalos de 15 minutos)
  - Prevención de envío con Enter al escribir en campos
  - Soporte completo para entrada manual por teclado

### ✅ 2. Detección de Conflictos Corregida
- **Problema**: Falsos positivos al programar a las 21:00
- **Solución**:
  - Lógica de solapamiento mejorada con conversión a minutos
  - Filtrado de citas canceladas y en borrador
  - Validación precisa de conflictos reales
  - Logging detallado para debugging

### ✅ 3. Conteo Coherente de Citas
- **Problema**: Números diferentes entre vistas día/semana/mes
- **Solución**:
  - Filtrado unificado en todas las vistas
  - Exclusión consistente de citas canceladas/borrador/null
  - Misma fuente de datos para todas las vistas

### ✅ 4. Actualización de Tarjeta de Paciente
- **Problema**: "Invalid Date" en próxima sesión
- **Solución**:
  - Validación robusta de formato de fecha
  - Formateo seguro con manejo de errores
  - Recarga automática tras crear cita
  - Enlace "Ver citas" añadido

### ✅ 5. Persistencia del Botón "Asignar Cita"
- **Problema**: Botón desaparece ocasionalmente
- **Solución**:
  - Renderizado condicional mejorado
  - Visible solo para pacientes activos (no pausados)
  - Versión hover para desktop + versión siempre visible en móvil
  - Independiente de filtros de búsqueda

---

## 🔍 Escenarios de Prueba Manual

### Escenario 1: Creación de Cita Sin Conflictos ✓

**Objetivo**: Verificar que se puede crear una cita en horario disponible.

**Pasos**:
1. Navegar a `/terapeuta/pacientes`
2. Hacer hover sobre tarjeta de paciente activo
3. Clic en botón "Asignar Cita"
4. Completar formulario:
   - Fecha: Mañana
   - Hora: 10:00
   - Duración: 60 minutos
   - Tipo: Presencial
   - Estado: Confirmada
5. Clic en "Guardar Cita"

**Resultado Esperado**:
- ✅ Modal se cierra
- ✅ Toast de éxito aparece
- ✅ Cita visible en agenda
- ✅ Tarjeta de paciente muestra próxima sesión
- ✅ Fecha NO muestra "Invalid Date"

---

### Escenario 2: Detección de Conflicto Real ⚠️

**Objetivo**: Verificar que detecta conflictos reales de horario.

**Pasos**:
1. Crear cita a las 14:00-15:00
2. Intentar crear otra cita a las 14:30-15:30

**Resultado Esperado**:
- ⚠️ Alerta amarilla: "Conflicto de Horario"
- ❌ Botón "Guardar" deshabilitado
- 💡 Sugerencia de horario alternativo

---

### Escenario 3: NO Detección de Falsos Positivos ✅

**Objetivo**: Verificar que NO detecta conflictos inexistentes.

**Pasos**:
1. Crear cita a las 10:00-11:00
2. Intentar crear otra cita a las 21:00-22:00

**Resultado Esperado**:
- ✅ SIN alerta de conflicto
- ✅ Botón "Guardar" habilitado
- ✅ Cita se crea exitosamente

---

### Escenario 4: Citas Consecutivas ✅

**Objetivo**: Verificar que citas consecutivas (sin solapamiento) funcionan.

**Pasos**:
1. Crear cita a las 10:00-11:00
2. Crear otra cita a las 11:00-12:00 (inmediatamente después)

**Resultado Esperado**:
- ✅ SIN conflicto detectado
- ✅ Ambas citas se crean correctamente

---

### Escenario 5: Conteo Coherente entre Vistas 🔢

**Objetivo**: Verificar consistencia de conteo.

**Pasos**:
1. Crear 3 citas para hoy (confirmadas)
2. Crear 1 cita cancelada
3. Navegar a:
   - Vista Día
   - Vista Semana
   - Vista Mes

**Resultado Esperado**:
- Vista Día: "3 citas programadas" ✅
- Vista Semana: "3 citas esta semana" ✅
- Vista Mes: "3 citas este mes" ✅
- Citas canceladas NO se cuentan ❌

---

### Escenario 6: Entrada Manual de Fecha/Hora ⌨️

**Objetivo**: Verificar entrada por teclado.

**Pasos**:
1. Abrir modal de nueva cita
2. En campo "Fecha": escribir manualmente usando teclado
3. En campo "Hora de Inicio": escribir manualmente "21:00"
4. Presionar Enter

**Resultado Esperado**:
- ⌨️ Fecha acepta entrada manual
- ⌨️ Hora acepta entrada manual
- ⏎ Enter NO envía formulario (previene envío accidental)
- ✅ Hora de fin se calcula automáticamente: "22:00"

---

### Escenario 7: Actualización de Tarjeta de Paciente 🔄

**Objetivo**: Verificar actualización en tiempo real.

**Pasos**:
1. Seleccionar paciente sin próxima cita
2. Crear cita para mañana a las 15:00
3. Observar tarjeta del paciente en lista

**Resultado Esperado**:
- 🔄 Tarjeta se actualiza automáticamente
- 📅 Muestra: "Próxima: vie, 27 oct, 15:00"
- ❌ NO muestra "Invalid Date"
- 🔗 Link "Ver citas →" visible

---

### Escenario 8: Botón "Asignar Cita" Persistente 📌

**Objetivo**: Verificar que botón siempre aparece.

**Pasos**:
1. Ver lista de pacientes activos (desktop)
2. Hacer hover sobre tarjeta
3. Ver lista en móvil
4. Aplicar filtro "Activos"
5. Aplicar filtro "En pausa"

**Resultado Esperado**:
- Desktop: Botón aparece en hover ✅
- Móvil: Botón siempre visible ✅
- Pacientes activos: Botón visible ✅
- Pacientes pausados: Botón NO visible ❌
- Filtros: No afectan visibilidad del botón ✅

---

### Escenario 9: Diferentes Horas y Días 📆

**Objetivo**: Verificar creación en diversos horarios.

**Pasos**:
1. Crear citas en diferentes horas:
   - 08:00-09:00 (temprano)
   - 14:00-15:00 (mediodía)
   - 21:00-22:00 (tarde)
2. Crear citas en diferentes días:
   - Hoy
   - Mañana
   - Próxima semana

**Resultado Esperado**:
- ✅ Todas las citas se crean correctamente
- ✅ Aparecen en vista correspondiente
- ✅ Sin falsos conflictos

---

### Escenario 10: Sincronización entre Vistas 🔄

**Objetivo**: Verificar que cambios se reflejan en todas partes.

**Pasos**:
1. Crear cita desde "Pacientes" (botón Asignar Cita)
2. Navegar a "Agenda"
3. Volver a "Pacientes"
4. Ver ficha individual del paciente

**Resultado Esperado**:
- Agenda: Cita visible ✅
- Lista de pacientes: Próxima sesión actualizada ✅
- Ficha individual: Información coherente ✅
- Sin discrepancias entre vistas ✅

---

## 📊 Matriz de Validación

| Función | Test | Estado |
|---------|------|--------|
| Entrada manual fecha/hora | ✅ Acepta entrada teclado | 🟢 Implementado |
| Prevenir Enter en campos | ✅ No envía al escribir | 🟢 Implementado |
| Detectar conflicto real | ⚠️ Alerta en 14:00-14:30 | 🟢 Implementado |
| NO falso positivo 21:00 | ✅ Sin alerta en 21:00 | 🟢 Implementado |
| Conteo día | 🔢 Excluye canceladas | 🟢 Implementado |
| Conteo semana | 🔢 Excluye canceladas | 🟢 Implementado |
| Conteo mes | 🔢 Excluye canceladas | 🟢 Implementado |
| Formato fecha válido | ✅ Sin "Invalid Date" | 🟢 Implementado |
| Actualización tarjeta | 🔄 Próxima sesión real | 🟢 Implementado |
| Botón persistente | 📌 Siempre en activos | 🟢 Implementado |

---

## 🐛 Cómo Reportar Nuevos Problemas

Si encuentras un problema durante las pruebas:

1. **Captura de pantalla**: Incluir imagen del error
2. **Pasos para reproducir**: Detallar secuencia exacta
3. **Resultado esperado**: Qué debería suceder
4. **Resultado actual**: Qué sucede realmente
5. **Navegador y dispositivo**: Chrome/Safari/Firefox, desktop/móvil

---

## 📝 Notas Técnicas

### Cambios en `ModalNuevaCita.vue`:
- Campo fecha: `min-height: 44px`, `@keydown.enter.prevent`
- Campo hora: `step="900"` (15 min), entrada manual habilitada
- Función `verificarConflicto()`: Conversión a minutos, filtrado mejorado
- Función `horaAMinutos()`: Comparación precisa de horarios
- Prevención Enter: Solo en inputs/textareas/selects

### Cambios en `agenda.vue`:
- Funciones `cargarCitasDelDia/Semana/Mes()`: Filtrado unificado
- Filtro: `estado !== 'cancelada' && estado !== 'borrador' && estado !== null`
- Estado 'realizada' en lugar de 'completada'

### Cambios en `PacienteCard.vue`:
- Función `proximaSesion`: Validación robusta, manejo de errores
- Enlace "Ver citas →" añadido
- Formato de fecha seguro con try-catch

### Cambios en `pacientes.vue`:
- Botón "Asignar Cita": Condicional `v-if="paciente.activo && !paciente.en_pausa"`
- Versión hover (desktop) + versión visible (móvil)
- Función `manejarCitaCreada()`: Recarga lista completa

---

## ✅ Checklist de Validación Final

Antes de considerar completas las correcciones, verificar:

- [ ] 1. Se puede introducir manualmente fecha y hora
- [ ] 2. Enter no envía formulario al escribir
- [ ] 3. NO hay conflictos falsos a las 21:00
- [ ] 4. Citas canceladas no se cuentan
- [ ] 5. Conteo idéntico en día/semana/mes
- [ ] 6. Tarjeta paciente NO muestra "Invalid Date"
- [ ] 7. Próxima sesión se actualiza tras crear cita
- [ ] 8. Botón "Asignar Cita" siempre visible (activos)
- [ ] 9. Link "Ver citas" funciona correctamente
- [ ] 10. Citas consecutivas (11:00-12:00 tras 10:00-11:00) permitidas

---

## 🚀 Próximos Pasos

1. **Ejecutar tests manuales**: Seguir escenarios arriba
2. **Configurar Vitest**: Para ejecutar `tests/citas.test.ts`
3. **Pruebas de integración**: Verificar con datos reales de Supabase
4. **Pruebas de carga**: Múltiples usuarios creando citas simultáneamente
5. **Optimización**: Reducir llamadas a BD con caché local

---

**Fecha de Implementación**: 26 de octubre de 2025  
**Desarrollador**: Sistema de Gestión de Citas - PsicoKarem  
**Estado**: ✅ Todas las correcciones implementadas
