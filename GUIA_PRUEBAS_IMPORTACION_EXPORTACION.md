# Guía de Pruebas - Módulo de Importación/Exportación de Pacientes

## Descripción General

Esta guía detalla los casos de prueba para verificar el correcto funcionamiento del módulo de importación y exportación masiva de pacientes en Teraplí.

## Requisitos Previos

1. Acceso a la aplicación con rol de **terapeuta** (psicologa) o **admin**
2. Navegador web moderno (Chrome, Firefox, Safari)
3. Archivos de prueba CSV/XLSX (usar plantillas generadas)

---

## 1. Pruebas de Exportación

### 1.1 Exportación Básica (CSV)

**Objetivo**: Verificar exportación completa de pacientes en formato CSV

**Pasos**:
1. Iniciar sesión como terapeuta
2. Navegar a `/terapeuta/pacientes`
3. Click en botón "Exportar"
4. Seleccionar formato: **CSV**
5. Seleccionar ámbito: **Todos los pacientes**
6. Mantener todos los campos seleccionados (por defecto)
7. Click en "Exportar"

**Resultado Esperado**:
- ✅ Se descarga archivo `pacientes_YYYY-MM-DD.csv`
- ✅ El archivo contiene encabezados en español
- ✅ Todos los pacientes del terapeuta están incluidos
- ✅ Los datos coinciden con los mostrados en la interfaz
- ✅ El formato CSV es válido (puede abrirse en Excel/Sheets)

---

### 1.2 Exportación XLSX

**Objetivo**: Verificar exportación en formato Excel

**Pasos**:
1. En el modal de exportación, seleccionar formato: **XLSX**
2. Seleccionar ámbito: **Todos los pacientes**
3. Click en "Exportar"

**Resultado Esperado**:
- ✅ Se descarga archivo `pacientes_YYYY-MM-DD.xlsx`
- ✅ El archivo se abre correctamente en Excel/LibreOffice
- ✅ Las columnas tienen ancho automático (legibles)
- ✅ La hoja se llama "Pacientes"

---

### 1.3 Exportación con Filtros

**Objetivo**: Verificar que los filtros de página se aplican correctamente

**Pasos**:
1. En la página de pacientes, aplicar filtros:
   - Estado: **Activo**
   - Área: Seleccionar un área específica (ej. "Ansiedad")
2. Click en "Exportar"
3. Verificar que aparece la opción **"Pacientes filtrados"**
4. Seleccionar ámbito: **Pacientes filtrados**
5. Click en "Exportar"

**Resultado Esperado**:
- ✅ El archivo contiene SOLO pacientes que cumplen los filtros
- ✅ El contador en el modal muestra el número correcto
- ✅ No aparecen pacientes inactivos o de otras áreas

---

### 1.4 Exportación con Selección de Campos

**Objetivo**: Verificar personalización de campos exportados

**Pasos**:
1. Click en "Exportar"
2. Deseleccionar todos los campos con "Deseleccionar todos"
3. Seleccionar solo: **Nombre Completo**, **Email**, **Teléfono**
4. Click en "Exportar"

**Resultado Esperado**:
- ✅ El archivo contiene solo las 3 columnas seleccionadas
- ✅ No aparecen columnas de campos no seleccionados
- ✅ El botón "Exportar" está deshabilitado si no hay campos seleccionados

---

### 1.5 Exportación como Admin

**Objetivo**: Verificar que admin puede exportar pacientes de todos los terapeutas

**Pasos**:
1. Iniciar sesión como **admin**
2. Navegar a la vista de pacientes del admin (si existe)
3. Exportar pacientes

**Resultado Esperado**:
- ✅ El archivo contiene pacientes de TODOS los terapeutas
- ✅ No hay filtrado por `terapeuta_id`

---

## 2. Pruebas de Importación

### 2.1 Descarga de Plantilla

**Objetivo**: Verificar descarga y estructura de plantilla

**Pasos**:
1. Click en "Importar"
2. En el paso 1, click en "Descargar CSV"
3. Abrir el archivo descargado

**Resultado Esperado**:
- ✅ Se descarga `plantilla_pacientes.csv`
- ✅ Contiene encabezados: `nombre_completo,email,telefono,area_de_acompanamiento,frecuencia,activo,notas`
- ✅ Incluye 3 filas de ejemplo con datos válidos

**Repetir para XLSX**:
4. Click en "Descargar XLSX"
5. Abrir archivo en Excel

**Resultado Esperado**:
- ✅ Se descarga `plantilla_pacientes.xlsx`
- ✅ Misma estructura que CSV
- ✅ Formato Excel válido

---

### 2.2 Importación Válida (Crear Nuevos)

**Objetivo**: Importar pacientes nuevos sin duplicados

**Pasos**:
1. Crear archivo CSV con 3 pacientes nuevos (emails únicos no existentes):
```csv
nombre_completo,email,telefono,area_de_acompanamiento,frecuencia,activo,notas
Test Usuario 1,test1@example.com,+34 600 111 222,Ansiedad,Semanal,true,Paciente de prueba
Test Usuario 2,test2@example.com,+34 600 222 333,Depresión,Quincenal,true,
Test Usuario 3,test3@example.com,,Autoestima,Mensual,false,Sin teléfono
```
2. Click en "Importar"
3. Arrastrar el archivo CSV al área de dropzone (o click para seleccionar)
4. Esperar validación automática

**Resultado Esperado**:
- ✅ Parsing exitoso
- ✅ Se muestra resumen: Total: 3, Válidas: 3, Inválidas: 0, Nuevas: 3, Actualizaciones: 0
- ✅ Lista de errores vacía
- ✅ Checkbox "Actualizar duplicados" no aparece (no hay duplicados)

5. Click en "Importar Pacientes"

**Resultado Esperado**:
- ✅ Importación exitosa
- ✅ Mensaje: "3 pacientes creados correctamente"
- ✅ Los pacientes aparecen en la lista de la página
- ✅ El campo `terapeuta_id` está asignado automáticamente al terapeuta actual

---

### 2.3 Importación con Duplicados (Omitir)

**Objetivo**: Verificar detección de duplicados por email/teléfono

**Pasos**:
1. Crear CSV con 1 paciente que ya existe (usar email de paciente existente):
```csv
nombre_completo,email,telefono,area_de_acompanamiento,frecuencia,activo,notas
María García López,maria.garcia@example.com,+34 612 999 888,Estrés,Semanal,true,Intento duplicado
```
2. Importar el archivo
3. En el paso 3, verificar resumen

**Resultado Esperado**:
- ✅ Total: 1, Válidas: 1, Actualizaciones: 1
- ✅ Aparece checkbox "Actualizar pacientes existentes"
- ✅ Mensaje indica que se encontró 1 paciente existente

4. **NO** marcar el checkbox "Actualizar"
5. Click en "Importar Pacientes"

**Resultado Esperado**:
- ✅ Mensaje: "0 pacientes creados, 1 omitido"
- ✅ El paciente original NO se modifica
- ✅ Los datos antiguos se mantienen

---

### 2.4 Importación con Duplicados (Actualizar)

**Objetivo**: Verificar actualización de pacientes existentes

**Pasos**:
1. Usar el mismo CSV del caso anterior
2. En el paso 3, **MARCAR** el checkbox "Actualizar pacientes existentes"
3. Click en "Importar Pacientes"

**Resultado Esperado**:
- ✅ Mensaje: "0 pacientes creados, 1 actualizado"
- ✅ El paciente se actualiza con los nuevos datos:
  - Área cambia a "Estrés"
  - Teléfono cambia a "+34 612 999 888"
  - Notas cambian a "Intento duplicado"

---

### 2.5 Importación con Errores de Validación

**Objetivo**: Verificar detección de errores y descarga de reporte

**Pasos**:
1. Crear CSV con datos inválidos:
```csv
nombre_completo,email,telefono,area_de_acompanamiento,frecuencia,activo,notas
,invalido@test.com,123,,,true,Sin nombre
Test Valid,valid@test.com,+34 600 123 456,Ansiedad,Semanal,true,Este es válido
Test,email-invalido,+34 600 000 000,,,xyz,Email mal formado
```
2. Importar el archivo

**Resultado Esperado**:
- ✅ Total: 3, Válidas: 1, Inválidas: 2
- ✅ Lista de errores muestra:
  - Fila 1: "El nombre completo es obligatorio"
  - Fila 3: "El email no es válido", "El campo activo debe ser 'true' o 'false'"
- ✅ Aparece botón "Descargar Errores (CSV)"

3. Click en "Descargar Errores (CSV)"

**Resultado Esperado**:
- ✅ Se descarga archivo `errores_importacion.csv`
- ✅ Contiene todas las filas con errores
- ✅ Columna adicional "Errores" con mensajes

4. Click en "Importar Pacientes"

**Resultado Esperado**:
- ✅ Solo se importa 1 paciente (el válido)
- ✅ Mensaje: "1 paciente creado, 2 con errores"

---

### 2.6 Importación de Archivo Grande

**Objetivo**: Verificar límite de 5,000 filas

**Pasos**:
1. Crear archivo CSV con 5,001 filas (usar script/generador si es necesario)
2. Intentar importar

**Resultado Esperado**:
- ✅ Error: "El archivo contiene demasiadas filas. Máximo permitido: 5000"
- ✅ No se procesa el archivo

---

### 2.7 Importación de Archivo Muy Grande

**Objetivo**: Verificar límite de tamaño (10MB)

**Pasos**:
1. Crear archivo CSV de más de 10MB (agregar muchas columnas/datos grandes)
2. Intentar importar

**Resultado Esperado**:
- ✅ Error en dropzone: "El archivo es demasiado grande. Máximo permitido: 10MB"
- ✅ No se carga el archivo

---

### 2.8 Formato de Archivo Inválido

**Objetivo**: Verificar validación de extensión

**Pasos**:
1. Crear archivo `.txt` con contenido CSV
2. Intentar importar

**Resultado Esperado**:
- ✅ Error: "Formato de archivo no válido. Solo se permiten: CSV, XLSX"
- ✅ El archivo no se acepta

---

### 2.9 Importación XLSX

**Objetivo**: Verificar soporte completo de Excel

**Pasos**:
1. Crear archivo Excel (.xlsx) con 2 pacientes válidos
2. Importar el archivo

**Resultado Esperado**:
- ✅ Parsing exitoso
- ✅ Validación correcta
- ✅ Importación exitosa
- ✅ Comportamiento idéntico a CSV

---

### 2.10 Detección de Duplicados por Teléfono

**Objetivo**: Verificar coincidencia cuando no hay email

**Pasos**:
1. Crear paciente sin email pero con teléfono único: `+34 699 999 999`
2. Crear CSV con mismo teléfono pero diferente nombre:
```csv
nombre_completo,email,telefono,area_de_acompanamiento,frecuencia,activo,notas
Otro Nombre,,+34 699 999 999,Ansiedad,Semanal,true,
```
3. Importar

**Resultado Esperado**:
- ✅ Se detecta como duplicado (coincidencia por teléfono)
- ✅ Muestra "1 paciente existente (coincidencia por teléfono)"

---

## 3. Pruebas de Seguridad y Permisos

### 3.1 RLS - Terapeuta Solo Ve Sus Pacientes

**Objetivo**: Verificar que terapeuta solo exporta/importa sus propios pacientes

**Pasos**:
1. Iniciar sesión como Terapeuta A
2. Exportar pacientes → guardar archivo
3. Cerrar sesión
4. Iniciar sesión como Terapeuta B
5. Exportar pacientes → guardar archivo
6. Comparar ambos archivos

**Resultado Esperado**:
- ✅ Los archivos contienen pacientes diferentes
- ✅ Cada terapeuta solo ve sus propios pacientes

---

### 3.2 RLS - Importación Asigna Terapeuta Automáticamente

**Objetivo**: Verificar que pacientes importados se asignan al terapeuta actual

**Pasos**:
1. Iniciar sesión como Terapeuta A
2. Importar CSV con 1 paciente nuevo
3. En base de datos, verificar campo `terapeuta_id` del paciente creado

**Resultado Esperado**:
- ✅ `terapeuta_id` = ID del Terapeuta A
- ✅ El paciente NO es visible para otros terapeutas

---

### 3.3 Acceso No Autorizado

**Objetivo**: Verificar que pacientes sin permisos no pueden acceder

**Pasos**:
1. Iniciar sesión como **paciente** (rol no autorizado)
2. Intentar acceder manualmente a:
   - `/api/patients/export`
   - `/api/patients/import` (POST)
   - `/api/patients/template`

**Resultado Esperado**:
- ✅ Error 403: "No tienes permisos para exportar/importar pacientes"
- ✅ No se permite el acceso

---

## 4. Pruebas de UX y Accesibilidad

### 4.1 Navegación con Teclado

**Pasos**:
1. Abrir modal de importación
2. Usar solo teclado para navegar:
   - `Tab` para moverse entre botones
   - `Enter` para activar botones
   - `Esc` para cerrar modal

**Resultado Esperado**:
- ✅ Todos los controles son accesibles por teclado
- ✅ El foco es visible
- ✅ `Esc` cierra el modal

---

### 4.2 Touch Targets (Móvil)

**Pasos**:
1. Abrir en dispositivo móvil o DevTools responsive
2. Verificar que todos los botones tienen al menos 44x44px

**Resultado Esperado**:
- ✅ Botones "Importar", "Exportar", "Cerrar" son táctiles
- ✅ Checkboxes y radios tienen área de click grande

---

### 4.3 Mensajes de Error Claros

**Pasos**:
1. Provocar diferentes errores:
   - Archivo muy grande
   - Formato inválido
   - Datos inválidos
2. Leer mensajes de error

**Resultado Esperado**:
- ✅ Mensajes en español claro
- ✅ Indican QUÉ está mal y CÓMO solucionarlo
- ✅ Usan toast de error (rojo) para errores graves

---

### 4.4 Loading States

**Pasos**:
1. Importar archivo grande (slow 3G en DevTools)
2. Observar indicadores de carga

**Resultado Esperado**:
- ✅ Aparece spinner/texto "Analizando archivo..."
- ✅ Botones se deshabilitan durante la operación
- ✅ No se puede cerrar modal durante importación

---

## 5. Pruebas de Casos Especiales

### 5.1 Caracteres Especiales

**Pasos**:
1. Crear CSV con caracteres especiales:
```csv
nombre_completo,email,telefono,area_de_acompanamiento,frecuencia,activo,notas
José María Ñoño,jose@test.com,+34 600 000 001,"Área con comas, y más",Semanal,true,"Notas con ""comillas"""
```
2. Importar y exportar

**Resultado Esperado**:
- ✅ Caracteres UTF-8 (ñ, á, é) se manejan correctamente
- ✅ Comas dentro de campos entrecomillados no rompen el CSV
- ✅ Comillas escapadas funcionan

---

### 5.2 Campos Opcionales Vacíos

**Pasos**:
1. Crear CSV con campos opcionales vacíos:
```csv
nombre_completo,email,telefono,area_de_acompanamiento,frecuencia,activo,notas
Solo Nombre,test@test.com,,,,true,
```
2. Importar

**Resultado Esperado**:
- ✅ Importación exitosa
- ✅ Campos vacíos se guardan como `null` o string vacío
- ✅ No genera errores de validación

---

### 5.3 Estado "En Pausa"

**Pasos**:
1. Crear paciente con `activo: true` y `metadata.en_pausa: true`
2. Exportar

**Resultado Esperado**:
- ✅ Columna "Estado" muestra: **"En pausa"** (no "Activo")
- ✅ Se distingue de pacientes activos normales

---

## 6. Resumen de Validaciones

### Campos Obligatorios:
- ✅ `nombre_completo`: Requerido, no vacío

### Campos Opcionales con Validación:
- ✅ `email`: Formato válido si presente
- ✅ `telefono`: Sin validación estricta (acepta formatos internacionales)
- ✅ `activo`: Debe ser "true" o "false" si presente

### Campos Opcionales sin Validación:
- ✅ `area_de_acompanamiento`
- ✅ `frecuencia`
- ✅ `notas`

---

## 7. Checklist Final

### Funcionalidad Completa:
- [ ] Importación CSV crea pacientes nuevos
- [ ] Importación XLSX crea pacientes nuevos
- [ ] Importación detecta duplicados por email
- [ ] Importación detecta duplicados por teléfono
- [ ] Importación actualiza duplicados si se marca checkbox
- [ ] Importación omite duplicados si NO se marca checkbox
- [ ] Importación valida datos y muestra errores
- [ ] Descarga de archivo de errores funciona
- [ ] Exportación CSV funciona
- [ ] Exportación XLSX funciona con columnas auto-ajustadas
- [ ] Exportación respeta filtros de página
- [ ] Exportación permite seleccionar campos
- [ ] Descarga de plantillas CSV/XLSX funciona

### Seguridad:
- [ ] Terapeuta solo ve/exporta sus pacientes
- [ ] Pacientes importados se asignan automáticamente al terapeuta
- [ ] Admin puede ver todos los pacientes (si aplica)
- [ ] Roles no autorizados reciben error 403

### UX:
- [ ] Navegación por teclado funciona
- [ ] Touch targets >= 44px en móvil
- [ ] Mensajes de error claros en español
- [ ] Loading states visibles
- [ ] Modales se cierran con Esc
- [ ] Toast notifications aparecen correctamente

### Edge Cases:
- [ ] Archivo > 10MB rechazado
- [ ] Archivo > 5000 filas rechazado
- [ ] Formatos no soportados rechazados
- [ ] Caracteres especiales UTF-8 funcionan
- [ ] Campos opcionales vacíos aceptados
- [ ] Estado "En pausa" se exporta correctamente

---

## 8. Problemas Conocidos / Limitaciones

1. **Selección de pacientes para exportar "seleccionados"**: La funcionalidad de selección múltiple en la lista de pacientes NO está implementada. Por ahora, esta opción solo aparece si se implementa la selección en el futuro.

2. **Progress Bar durante importación**: Durante la importación, solo se muestra un loading spinner. No hay barra de progreso detallada.

3. **Batch Processing**: Importaciones muy grandes (cercanas a 5000 filas) pueden tardar. El proceso es secuencial, no optimizado para lotes.

4. **Audit Logging**: No se registran las importaciones/exportaciones en una tabla de auditoría (mejora futura).

---

## 9. Comandos de Desarrollo

### Verificar build:
```bash
npm run build
```

### Ejecutar en desarrollo:
```bash
npm run dev
```

### Limpiar cache:
```bash
rm -rf node_modules/.cache
```

---

## 10. Contacto y Soporte

Si encuentras bugs o comportamientos inesperados durante las pruebas:

1. Verificar logs en consola del navegador (F12)
2. Verificar logs del servidor en terminal
3. Documentar pasos exactos para reproducir
4. Incluir screenshots si es posible

---

**Fecha de creación**: 2025-12-22
**Versión del módulo**: 1.0.0
**Estado**: ✅ Build exitoso, listo para pruebas
