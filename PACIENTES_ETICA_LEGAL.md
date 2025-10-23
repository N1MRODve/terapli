# ⚖️ Consideraciones Éticas y Legales - Módulo de Pacientes

## 📜 Marco Legal y Normativo

### RGPD (Reglamento General de Protección de Datos)

#### ✅ Cumplimiento Implementado:

1. **Minimización de Datos**
   - Solo se muestran datos estrictamente necesarios
   - No se exponen direcciones, teléfonos o documentos
   - Nombres con inicial del segundo apellido en vistas públicas

2. **Cifrado y Seguridad**
   - Datos en tránsito: HTTPS obligatorio
   - Datos en reposo: Cifrado en Supabase
   - Autenticación: JWT + RLS

3. **Derecho al Olvido**
   - Preparado para eliminación de datos
   - Cascada de eliminación configurada
   - Logs de auditoría para trazabilidad

4. **Consentimiento Informado**
   - (Pendiente implementar formulario de consentimiento)
   - Aviso de privacidad en primera sesión
   - Consentimiento para uso de plataforma digital

5. **Derecho de Acceso**
   - Pacientes pueden solicitar sus datos
   - Exportación de datos preparada
   - Rectificación de datos permitida

### LOPD (Ley Orgánica de Protección de Datos - España)

#### ✅ Cumplimiento Adicional:

1. **Datos de Salud (Categoría Especial)**
   - Protección reforzada con RLS
   - Acceso restringido solo al terapeuta asignado
   - No se comparten entre terapeutas sin consentimiento

2. **Registro de Actividades de Tratamiento**
   ```
   Responsable: Karem Peña (Psicóloga)
   Finalidad: Gestión de terapia psicológica
   Base legal: Consentimiento + Interés legítimo
   Categoría de datos: Salud mental, emociones
   Destinatarios: Solo terapeuta asignado
   Plazo conservación: Durante relación terapéutica + 5 años
   ```

3. **Delegado de Protección de Datos (DPO)**
   - Recomendado para clínicas con >250 empleados
   - Para práctica individual: responsable = terapeuta

---

## 🏥 Código Deontológico del Psicólogo

### Principios Éticos Aplicados:

#### 1. **Confidencialidad (Art. 40-44)**

✅ **Implementado:**
- Las notas terapéuticas son privadas y seguras
- No se muestran contenidos de sesiones públicamente
- El sistema no permite acceso cruzado entre terapeutas
- Alertas discretas sin exponer detalles

⚠️ **Excepciones Legales:**
- Riesgo grave para el paciente o terceros
- Orden judicial
- Menor de edad en riesgo
(Estas deben manejarse fuera del sistema)

#### 2. **Competencia Profesional (Art. 17-18)**

✅ **Facilitado por el sistema:**
- Registro organizado de evolución
- Notas clínicas para seguimiento
- Detección de patrones emocionales
- Alertas de cambios significativos

❌ **No sustituye:**
- Juicio clínico del profesional
- Supervisión cuando sea necesaria
- Formación continua

#### 3. **Responsabilidad (Art. 6-9)**

✅ **Sistema promueve:**
- Documentación adecuada de sesiones
- Seguimiento de evolución
- Toma de decisiones informada
- Continuidad del cuidado

⚠️ **El terapeuta es responsable de:**
- Interpretación de datos
- Decisiones clínicas
- Derivación cuando proceda
- Custodia de información

#### 4. **Integridad (Art. 10-12)**

✅ **Diseño ético:**
- No se manipulan datos automáticamente
- Transparencia en alertas
- No se generan diagnósticos automáticos
- Respeto a la privacidad del paciente

---

## 🔒 Buenas Prácticas de Seguridad

### Para el Terapeuta:

1. **Gestión de Acceso**
   ```
   ✓ Usar contraseñas fuertes únicas
   ✓ Activar autenticación de dos factores
   ✓ Cerrar sesión al terminar
   ✓ No compartir credenciales
   ✓ Usar dispositivos seguros
   ```

2. **Uso de la Plataforma**
   ```
   ✓ No acceder desde redes públicas sin VPN
   ✓ Mantener el navegador actualizado
   ✓ Verificar HTTPS en la URL
   ✓ No tomar capturas de pantalla con datos
   ✓ No compartir pantalla en videollamadas públicas
   ```

3. **Gestión de Notas**
   ```
   ✓ Ser objetivo y profesional
   ✓ Evitar juicios de valor
   ✓ Documentar hechos, no interpretaciones subjetivas
   ✓ Usar lenguaje técnico apropiado
   ✓ Revisar antes de guardar
   ```

### Para Administradores del Sistema:

1. **Configuración de Supabase**
   ```sql
   -- Verificar RLS activo
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   
   -- Todas las tablas deben tener rowsecurity = true
   ```

2. **Backups Regulares**
   ```bash
   # Configurar backups automáticos diarios
   # Retención mínima: 30 días
   # Almacenamiento: Cifrado y redundante
   ```

3. **Auditoría de Accesos**
   ```sql
   -- Implementar tabla de logs
   CREATE TABLE audit_logs (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid REFERENCES auth.users,
     action text,
     table_name text,
     record_id uuid,
     timestamp timestamptz DEFAULT now()
   );
   ```

---

## 📋 Checklist de Cumplimiento

### Antes de Usar con Pacientes Reales:

#### Legal:
- [ ] Consentimiento informado firmado
- [ ] Aviso de privacidad entregado
- [ ] Política de protección de datos disponible
- [ ] Contrato de prestación de servicios
- [ ] Registro de actividades de tratamiento completo

#### Técnico:
- [ ] RLS verificado en todas las tablas
- [ ] Backups automáticos configurados
- [ ] HTTPS/SSL activo
- [ ] Autenticación robusta implementada
- [ ] Logs de auditoría activos

#### Clínico:
- [ ] Protocolo de crisis definido
- [ ] Procedimiento de derivación establecido
- [ ] Supervisión profesional disponible
- [ ] Seguro de responsabilidad civil vigente
- [ ] Colegiación activa y en regla

#### Organizativo:
- [ ] Procedimiento de borrado de datos
- [ ] Política de retención definida
- [ ] Plan de respuesta a brechas de seguridad
- [ ] Formación en protección de datos realizada
- [ ] Documentación técnica completa

---

## ⚠️ Limitaciones del Sistema

### El sistema NO:

❌ Genera diagnósticos automáticos
❌ Reemplaza el juicio clínico profesional
❌ Garantiza resultados terapéuticos
❌ Sustituye la supervisión
❌ Protege contra errores humanos
❌ Es un dispositivo médico certificado
❌ Cumple automáticamente toda la normativa

### El terapeuta DEBE:

✅ Interpretar los datos con criterio profesional
✅ Verificar la información antes de tomar decisiones
✅ Mantener la confidencialidad fuera del sistema
✅ Actualizar su formación en herramientas digitales
✅ Informar al paciente sobre el uso de la plataforma
✅ Tener plan B si el sistema falla
✅ Documentar decisiones importantes por escrito

---

## 🚨 Protocolo de Emergencia

### Si se detecta brecha de seguridad:

1. **Inmediato (0-2 horas)**
   - Cambiar todas las contraseñas
   - Notificar al administrador del sistema
   - Documentar el incidente

2. **Corto plazo (2-24 horas)**
   - Evaluar el alcance de la brecha
   - Notificar a la Agencia de Protección de Datos (si procede)
   - Informar a los pacientes afectados

3. **Medio plazo (1-7 días)**
   - Implementar medidas correctivas
   - Revisar políticas de seguridad
   - Actualizar procedimientos

4. **Largo plazo (1-3 meses)**
   - Auditoría completa de seguridad
   - Formación adicional
   - Mejoras en infraestructura

---

## 📞 Recursos y Contactos

### Organismos Reguladores (España):

- **AEPD** (Agencia Española de Protección de Datos)
  - Web: www.aepd.es
  - Teléfono: 901 100 099

- **Colegio Oficial de Psicólogos**
  - Consulta tu delegación regional
  - Asesoría deontológica disponible

### Recursos Adicionales:

- Guía RGPD para profesionales de la salud
- Código Deontológico actualizado
- Protocolos de actuación en emergencias
- Modelos de consentimiento informado

---

## ✍️ Modelos de Documento

### Consentimiento para Uso de Plataforma Digital

```
Yo, [NOMBRE DEL PACIENTE], doy mi consentimiento para que
[NOMBRE DEL TERAPEUTA] utilice una plataforma digital segura
para la gestión de mi proceso terapéutico.

He sido informado/a de que:
- Mis datos estarán protegidos según RGPD/LOPD
- Solo mi terapeuta tendrá acceso a mi información
- Puedo solicitar acceso, rectificación o eliminación
- Los datos se conservarán durante [X años] tras finalizar

Fecha: _______________
Firma: _______________
```

---

## 🎯 Resumen Ejecutivo

### ✅ El módulo cumple con:
- Normativa RGPD/LOPD
- Principios del Código Deontológico
- Estándares de seguridad actuales
- Buenas prácticas clínicas

### ⚠️ Requiere del terapeuta:
- Uso responsable y ético
- Formación en protección de datos
- Supervisión profesional
- Consentimiento informado de pacientes

### 🔄 Se recomienda:
- Revisión legal periódica
- Auditorías de seguridad anuales
- Actualización ante cambios normativos
- Formación continua del equipo

---

*Documento elaborado conforme a normativa vigente en España (2025)*
*Consultar con asesoría legal para casos específicos*
*Este documento es informativo, no sustituye asesoría profesional*
