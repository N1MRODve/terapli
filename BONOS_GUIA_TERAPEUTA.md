# 🎫 Guía Rápida: Sistema de Bonos en Agenda

## Para Terapeutas

### 🎯 ¿Qué hace el sistema automáticamente?

El sistema de bonos integrado en la agenda te ayuda a:
- ✅ Ver cuántas sesiones tiene disponibles cada paciente
- ✅ Descontar automáticamente sesiones al completar citas
- ✅ Alertarte cuando un paciente necesita renovar su bono
- ✅ Evitar conflictos por sesiones agotadas

---

## 📋 Flujo Básico

### 1️⃣ Crear Nueva Cita

**Cuando SELECCIONAS un paciente:**

```
┌─────────────────────────────────────┐
│ ✓ Juan Pérez López                  │ 
│ juan@email.com                      │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🎫 Bono activo: 3 sesiones      │ │
│ │    disponibles                   │ │
│ │                                 │ │
│ │ ☑ Descontar sesión de este     │ │
│ │   bono al completar             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**SI tiene bono:**
- Verás un **panel verde** con información del bono
- Checkbox **pre-marcado** para descontar sesión
- Si quedan ≤2 sesiones, verás una **alerta ámbar**

**SI NO tiene bono:**
- Verás: "💳 Sin bono activo - Sesión por pago individual"
- No podrás marcar el checkbox

---

### 2️⃣ Completar una Cita

**En la vista de día:**

```
┌─────────────────────────────────────┐
│ 🏥 María García                     │
│ 10:00 - 11:00 · Presencial         │
│                                     │
│ [confirmada]  [✓ Completar]        │
└─────────────────────────────────────┘
```

**Cuando haces click en "✓ Completar":**

1. La cita se marca como completada
2. Si tiene el checkbox marcado, se descuenta 1 sesión del bono
3. **Si quedan ≤1 sesión**, verás esta alerta:

```
┌────────────────────────────────────────┐
│ ⚠️  Última sesión disponible           │
│                                        │
│ Al paciente le queda 1 sesión.        │
│ Considere informarle para renovar.    │
│                                        │
│ María García                           │
│ Sesiones restantes: 1                  │
│                                        │
│ [📱 Notificar al paciente] [Entendido]│
└────────────────────────────────────────┘
```

La alerta se cierra automáticamente después de 10 segundos.

---

## 💡 Casos Comunes

### ✅ Paciente con bono activo (sesiones suficientes)

**Lo que ves al crear cita:**
```
🎫 Bono activo: 5 sesiones disponibles
☑ Descontar sesión de este bono al completar
```

**Acción:** Deja el checkbox marcado (ya viene así por defecto)

**Al completar:** La sesión se descuenta automáticamente. Próxima cita mostrará "4 sesiones disponibles"

---

### ⚠️ Paciente con pocas sesiones (≤2)

**Lo que ves al crear cita:**
```
🎫 Bono activo: 1 sesión disponible

⚠️ Esta es la última sesión del bono.
   Considere informar al paciente.

☑ Descontar sesión de este bono al completar
```

**Acción:** 
- Mantén el checkbox marcado
- **Importante:** Informa al paciente ANTES de la cita que es su última sesión
- Ofrécele renovar el bono para continuar sin interrupciones

**Al completar:** Verás una alerta recordándote contactar al paciente para renovación.

---

### 🚫 Paciente sin bono activo

**Lo que ves al crear cita:**
```
💳 Sin bono activo - Sesión por pago individual
```

**Acción:** Procede normalmente. Esta sesión se cobrará de forma individual.

**Sugerencia:** Si el paciente asiste regularmente, ofrécele un bono para que ahorre.

---

### 🤔 Sesión especial (no descontar del bono)

**Ejemplo:** Sesión de evaluación inicial, sesión de pareja cuando solo tiene bono individual, etc.

**Lo que ves al crear cita:**
```
🎫 Bono activo: 8 sesiones disponibles
☑ Descontar sesión de este bono al completar
```

**Acción:** **DES-marca** el checkbox antes de guardar.

**Al completar:** La sesión NO se descontará del bono. Se cobrará por separado.

---

## 🎨 Código de Colores

| Color | Significado | Acción |
|-------|-------------|---------|
| 🟢 Verde | Bono activo, sesiones suficientes | Continuar normalmente |
| 🟡 Ámbar | 1-2 sesiones restantes | Informar al paciente |
| 🔴 Rojo | Bono agotado o sin bono | Ofrecer renovación/nuevo bono |

---

## ❓ Preguntas Frecuentes

### ¿Puedo cambiar mi decisión después de guardar?
**Por ahora no.** Asegúrate de marcar/desmarcar el checkbox correctamente antes de guardar la cita.
_(En futuras versiones habrá un sistema de ajustes)_

### ¿Qué pasa si completo una cita por error?
**Contacta al administrador.** El sistema llevará un registro de auditoría para corregir estos casos.
_(Función en desarrollo)_

### ¿El paciente recibe notificaciones automáticas?
**Aún no.** El botón "📱 Notificar al paciente" está preparado para cuando se implemente el sistema de notificaciones.

### ¿Puedo ver el historial de sesiones usadas?
**Próximamente.** Se está desarrollando un módulo de reportes donde podrás ver todo el historial de uso del bono.

### ¿Qué pasa si el bono tiene fecha de expiración?
**Actualmente los bonos no expiran.** Esta función se implementará en futuras versiones con alertas de expiración cercana.

### ¿Un paciente puede tener múltiples bonos activos?
**Por ahora solo uno.** En el futuro se permitirán bonos múltiples (ej: individual + pareja).

---

## 🚀 Tips para Optimizar tu Trabajo

### 1. **Revisa bonos al inicio de semana**
Mira la vista semanal de tu agenda. Los pacientes con pocas sesiones tendrán un indicador visual.

### 2. **Contacta proactivamente**
No esperes a la última sesión. Cuando veas "2 sesiones restantes", es buen momento para hablar de renovación.

### 3. **Ofrece bonos a pacientes regulares**
Si un paciente asiste cada semana sin bono, sugiérele adquirir uno para ahorrar dinero y tener continuidad garantizada.

### 4. **Verifica antes de completar**
Antes de marcar "✓ Completar", verifica que sea la sesión correcta (no una cancelada, reagendada, etc.)

### 5. **Usa las notas**
Si una sesión tiene algo especial (pagó con otro método, viene a algo específico), agrégalo en las notas de la cita.

---

## 📞 ¿Necesitas Ayuda?

**Problemas técnicos:**
- Revisa la documentación completa: `BONOS_INTEGRACION_AGENDA.md`
- Contacta al equipo de desarrollo

**Dudas sobre uso:**
- Manual completo: `CITAS_GUIA_RAPIDA.md`
- Video tutorial: _(próximamente)_

**Sugerencias de mejora:**
- Tu feedback es valioso. Reporta cualquier idea para mejorar el sistema.

---

## ✨ Beneficios para Ti

- **Ahorra tiempo:** No más cálculos manuales de sesiones
- **Evita errores:** El sistema lleva la cuenta automáticamente
- **Mejora retención:** Alertas te ayudan a contactar pacientes a tiempo
- **Más profesional:** Tus pacientes apreciarán el seguimiento proactivo
- **Datos claros:** Siempre sabes el estado de cada paciente

---

## 🎓 Casos de Estudio

### Caso 1: Renovación Exitosa
**Situación:** Laura tiene 2 sesiones restantes.
**Acción:** Le mencionas que quedan 2 sesiones y ofreces renovar.
**Resultado:** Laura renueva antes de su penúltima sesión, garantizando continuidad.

### Caso 2: Prevención de Sorpresas
**Situación:** Carlos no sabía que era su última sesión.
**Acción:** El sistema te alertó con 2 sesiones de anticipación.
**Resultado:** Carlos pudo planificar y decidir con tiempo si renovar.

### Caso 3: Sesión Especial
**Situación:** Sofía tiene bono individual pero viene en sesión de pareja.
**Acción:** DES-marcas el checkbox "Descontar de bono".
**Resultado:** Sesión de pareja se cobra aparte, bono individual intacto.

---

**Última actualización:** ${new Date().toLocaleDateString('es-ES')}

💡 **Recuerda:** Este sistema está diseñado para ayudarte, no para complicar tu trabajo. Si algo no está claro, ¡pregunta!
