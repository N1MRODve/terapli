# 🚀 Recursos Compartidos - Guía Rápida

## Para Terapeutas

### ¿Cómo compartir un recurso con un paciente?

1. **Ve a "Recursos"** en el menú lateral
2. **Busca el recurso** que quieres compartir
3. **Haz clic en "📤 Compartir"**
4. **Selecciona los pacientes** marcando los checkboxes
5. **(Opcional)** Añade una nota personal
6. **Haz clic en "Compartir"**
7. ¡Listo! El paciente recibirá el recurso

### Tips Rápidos

- ✅ Puedes compartir con **múltiples pacientes** a la vez
- ✅ La **nota personal** aparecerá destacada para el paciente
- ✅ Puedes ver **estadísticas** de cuántos recursos han sido vistos
- ✅ Usa el **buscador** para encontrar recursos por categoría o palabra clave

### Recursos Disponibles

📋 **Guías** - Documentos y tutoriales  
🎵 **Audio** - Meditaciones y ejercicios guiados  
🎥 **Video** - Tutoriales en video  
🧘 **Ejercicios** - Actividades prácticas  
📖 **Lecturas** - Artículos y textos  
📄 **PDF** - Formatos descargables

---

## Para Pacientes

### ¿Cómo ver mis recursos?

1. **Ve a "Mis Recursos"** en el menú
2. Verás todos los recursos que tu terapeuta compartió contigo
3. **Haz clic en "Ver recurso"** para abrirlo

### Información Importante

- 🆕 El badge **"Nuevo"** indica recursos que aún no has visto
- 💬 Lee la **nota personal** de tu terapeuta (si la tiene)
- ✅ Los recursos se marcan automáticamente como **vistos** al hacer clic
- 📱 Puedes acceder desde cualquier dispositivo

---

## Próximos Pasos

### Para empezar a usar esta funcionalidad:

**1. Ejecutar la migración SQL en Supabase**

```bash
# Conecta a tu proyecto de Supabase
# Ve a SQL Editor y ejecuta el archivo:
supabase/migrations/20251019_recursos_compartidos.sql
```

**2. Verificar que las tablas se crearon correctamente**

Deberías ver dos nuevas tablas:
- `recursos_repositorio` (con 6 recursos de ejemplo)
- `recursos_compartidos`

**3. Probar la funcionalidad**

- Inicia sesión como terapeuta
- Ve a "Recursos"
- Intenta compartir un recurso con un paciente de prueba
- Inicia sesión como ese paciente
- Ve a "Mis Recursos"
- Verifica que aparece el recurso compartido

---

## ⚠️ Requisitos

- ✅ Supabase configurado
- ✅ Tablas `pacientes` y `profiles` existentes
- ✅ Sistema de autenticación funcionando
- ✅ Layouts `terapeuta` y `paciente` configurados

---

## 📚 Documentación Completa

Para más detalles técnicos, consulta:
`RECURSOS_COMPARTIDOS_DOCS.md`

---

**¿Necesitas ayuda?** Revisa la sección de solución de problemas en la documentación completa.
