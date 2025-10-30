# 💶 Guía Rápida: Gestión de Pagos Confirmados (Coordinadora)

## 🎯 ¿Para qué sirve?

Esta nueva sección en tu Dashboard te permite **gestionar los pagos confirmados de bonos** de forma visual y eficiente, con la capacidad de:
- Ver un resumen financiero al instante
- Acceder a detalles completos de cada pago
- Revertir pagos confirmados por error

---

## 📍 ¿Dónde la encuentro?

La sección **"Pagos Confirmados"** aparece directamente en tu **Dashboard**, entre:
- Las tarjetas KPI (arriba)
- La sección "Citas de Hoy" (abajo)

---

## 🖥️ ¿Cómo usar la sección?

### 👀 **Vista Rápida (Tarjetas de Resumen)**

En la parte superior de la sección verás 3 tarjetas:

1. **✓ Bonos Confirmados**
   - Muestra el número total de bonos que ya han sido confirmados como pagados
   - Ejemplo: "12" bonos

2. **💰 Total Confirmado**
   - Suma total de todos los montos confirmados
   - Ejemplo: "1,920.00€"

3. **📊 Promedio por Bono**
   - El promedio calculado automáticamente
   - Ejemplo: "160.00€" (si hay 12 bonos de 1,920€ en total)

### 📋 **Lista de Últimos Pagos**

Debajo de las tarjetas verás los **3 bonos confirmados más recientes**. Cada fila muestra:

- **Barra verde** a la izquierda (indica estado confirmado)
- **Avatar circular** con las iniciales del paciente
- **Nombre del paciente** y tipo de bono
- **Terapeuta asignado**
- **Monto total** en verde destacado
- **Fecha de pago** con icono 📅
- **Método de pago** con icono 💳

**💡 Tip**: Pasa el mouse sobre cualquier fila para ver el efecto hover (sombra)

### 🔍 **Ver Detalles de un Pago**

Para ver información completa de un bono:

1. **Haz clic en cualquier parte de la fila**
2. Se abrirá un **modal con todos los detalles**

#### Información que verás en el modal:

**Banner de Estado**:
- ✓ "Pago Confirmado"
- Confirmación visual en verde

**Columna Izquierda**:
- **👤 Paciente**: Nombre y email
- **👩‍⚕️ Terapeuta**: Nombre, porcentaje (70%) y su parte calculada

**Columna Derecha**:
- **🧾 Detalles del Bono**: Tipo, sesiones (totales y restantes), monto total
- **💳 Información de Pago**: Método, fecha de confirmación, estado

**Botones**:
- **Cerrar**: Sale del modal sin cambios
- **Desmarcar Pago**: Permite revertir el pago (ver siguiente sección)

---

## ⚠️ Revertir un Pago Confirmado por Error

Si confirmaste un pago por error y necesitas desmarcarlo:

### Paso 1: Abrir el Detalle
1. Haz clic en la fila del bono que quieres revertir
2. Se abre el modal de detalles

### Paso 2: Iniciar Reversión
1. Haz clic en el botón rojo **"⚠️ Desmarcar Pago"**
2. Se abrirá un nuevo modal de confirmación

### Paso 3: Confirmar la Acción
En el modal de confirmación verás:
- **Advertencia visual** en rojo
- **Nombre del paciente** y monto del bono
- **Lista de lo que se eliminará**:
  - Fecha de confirmación de pago
  - Método de pago registrado
  - Información del usuario que confirmó

**Opciones**:
- **Cancelar**: No hace nada, vuelve al modal anterior
- **Sí, Revertir**: Ejecuta la reversión

### Paso 4: Proceso y Confirmación
1. Al confirmar, el botón mostrará **"⏳ Procesando..."**
2. Después de unos segundos verás una **notificación** en la esquina superior derecha:
   - ✓ **Verde** = Éxito: "Pago Revertido"
   - ✗ **Rojo** = Error: "Error al Revertir"

3. Si fue exitoso:
   - El modal se cierra automáticamente
   - El bono desaparece de la lista de confirmados
   - Los totales se actualizan

---

## 🔄 ¿Qué pasa después de revertir?

### El Bono Vuelve a Estado "Sin Pagar"
- Aparecerá de nuevo en la lista de "Pagos por Confirmar"
- La coordinadora puede volver a confirmarlo cuando sea correcto

### ¿Dónde encontrar bonos sin pagar?
Ve a **"Pacientes"** → Selecciona el paciente → En su bono verás el botón **"Confirmar pago"**

---

## 📊 ¿Cómo ver todos los pagos?

Si tienes más de 3 bonos confirmados, verás un botón:

**"Ver todos los pagos confirmados (X)"**

Al hacer clic:
- Te lleva a la sección **"Pacientes"**
- Allí puedes ver la lista completa de todos los pacientes y sus bonos

---

## 💡 Tips y Buenas Prácticas

### ✅ Usa el Dashboard para supervisión rápida
- Entra al Dashboard diariamente
- Revisa el "Total Confirmado" para llevar control financiero
- Verifica los últimos 3 pagos para asegurar que todo esté bien

### ✅ Verifica antes de revertir
- Lee bien la advertencia antes de confirmar
- Asegúrate de que realmente es un error
- Si no estás segura, consulta primero

### ✅ Revisa las notificaciones
- Las notificaciones verdes = Todo bien
- Las notificaciones rojas = Algo falló, intenta de nuevo
- Duran 5 segundos, pero puedes cerrarlas con la ×

### ✅ Mantén actualizada la información
- El dashboard se recarga automáticamente cada 2 minutos
- Si haces cambios, verás la actualización inmediatamente

---

## ❓ Preguntas Frecuentes

### ¿Por qué algunos bonos no aparecen aquí?
**R**: Esta sección solo muestra bonos que ya están **confirmados como pagados**. Los bonos pendientes aparecen en la tarjeta KPI de arriba "Pagos por confirmar".

### ¿Puedo revertir un pago después de días?
**R**: Sí, puedes revertir un pago en cualquier momento, incluso días después de haberlo confirmado.

### ¿Qué pasa si revierto un pago por error?
**R**: No hay problema. Simplemente ve al paciente y vuelve a confirmar el pago correctamente.

### ¿El terapeuta se entera si revierto un pago?
**R**: El bono desaparecerá de su vista de "Pagos Confirmados" automáticamente. No recibe notificación, pero verá que ya no está en su lista.

### ¿Puedo ver pagos de hace meses?
**R**: En el Dashboard solo aparecen los 10 más recientes (se muestran 3). Para ver más antiguos, usa el botón "Ver todos" y busca en la sección de Pacientes.

### ¿El monto que veo es lo que se le paga al terapeuta?
**R**: No. El monto que ves es el **monto total del bono**. El terapeuta recibe el **70%** de ese monto (lo ves calculado en el detalle).

### ¿Puedo editar el monto de un bono ya confirmado?
**R**: No desde aquí. Primero debes revertir el pago, luego ir al paciente y editar el bono, y finalmente volver a confirmar el pago.

---

## 🆘 ¿Problemas?

### No veo ningún bono en la sección
- **Verifica**: ¿Has confirmado algún pago? Si no, esta sección estará vacía.
- **Solución**: Ve a "Pacientes", selecciona uno y confirma un pago de bono.

### El modal no se abre al hacer clic
- **Posible causa**: Error de carga
- **Solución**: Recarga la página (F5 o Cmd+R)

### La reversión no funciona
- **Verifica**: ¿Ves algún mensaje de error rojo?
- **Solución**: Lee el mensaje, puede ser un problema de permisos o conexión
- **Alternativa**: Contacta a soporte técnico

### Los totales no coinciden
- **Espera**: El dashboard se actualiza cada 2 minutos automáticamente
- **Solución rápida**: Recarga la página manualmente

---

## 🎨 Guía Visual Rápida

### Colores y su Significado

| Color | Significado |
|-------|-------------|
| 🟢 **Verde** | Pago confirmado, todo bien |
| 🔴 **Rojo** | Acción crítica (revertir), o error |
| 🟡 **Amarillo** | Advertencia o pendiente |
| ⚪ **Gris** | Información neutral o botón de cancelar |

### Iconos Importantes

| Icono | Significado |
|-------|-------------|
| 💶 | Dinero, pagos |
| ✓ | Confirmado, éxito |
| ⚠️ | Advertencia, cuidado |
| 📅 | Fecha |
| 💳 | Método de pago |
| × | Cerrar modal |
| → | Ver más, acción |

---

## 📞 Soporte

Si necesitas ayuda:
- **Problemas técnicos**: Contacta a soporte técnico
- **Dudas sobre un pago específico**: Verifica con el paciente o terapeuta
- **Errores en montos**: Revisa la configuración del bono

---

**Última actualización**: 29 de octubre de 2025  
**Versión**: 1.0  
**Rol**: Coordinadora
