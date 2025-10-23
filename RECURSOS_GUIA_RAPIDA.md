# 🚀 Guía Rápida: Módulo de Recursos Terapéuticos

## ✅ Lo que Ya Está Hecho

### Archivos Creados:
1. ✅ **Schema SQL**: `supabase/migrations/recursos_schema.sql`
2. ✅ **Composables**: `useRecursos.js`, `useNotificaciones.js`
3. ✅ **Componentes**: `RecursoCard.vue`, `ModalNuevoRecurso.vue`, `ModalCompartirRecurso.vue`

---

## 📝 Lo que Falta: 3 Archivos Simples

### 1. Página de Recursos (Terapeuta)

**Archivo**: `pages/terapeuta/recursos.vue`

```bash
# Copiar y adaptar desde la documentación
# O crear con estructura básica:
```

```vue
<template>
  <div class="min-h-screen bg-[#F9F7F3] p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-['Lora'] text-[#5D4A44]">📚 Recursos</h1>
        <button @click="modalNuevo = true" class="px-6 py-3 bg-[#D8AFA0] text-white rounded-xl">
          + Nuevo Recurso
        </button>
      </div>

      <div class="grid grid-cols-3 gap-6">
        <RecursoCard 
          v-for="r in recursos" 
          :key="r.id" 
          :recurso="r"
          @compartir="compartir(r)"
        />
      </div>

      <ModalNuevoRecurso v-model="modalNuevo" @guardado="cargar" />
      <ModalCompartirRecurso v-model="modalCompartir" :recurso="seleccionado" />
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth', layout: 'terapeuta' })

const { obtenerRecursos } = useRecursos()
const recursos = ref([])
const modalNuevo = ref(false)
const modalCompartir = ref(false)
const seleccionado = ref(null)

const cargar = async () => {
  recursos.value = await obtenerRecursos()
}

const compartir = (recurso) => {
  seleccionado.value = recurso
  modalCompartir.value = true
}

onMounted(cargar)
</script>
```

### 2. Página de Recursos (Paciente)

**Archivo**: `pages/paciente/recursos.vue`

```vue
<template>
  <div class="min-h-screen bg-[#F9F7F3] p-8">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-4xl font-['Lora'] text-[#5D4A44] mb-8">📚 Mis Recursos</h1>

      <div class="grid grid-cols-2 gap-6">
        <RecursoCard
          v-for="a in asignaciones"
          :key="a.id"
          :recurso="a.recurso"
          :mensaje="a.mensaje"
          :visto="a.visto"
          :mostrar-badge-no-visto="true"
          :mostrar-boton-compartir="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth', layout: 'paciente' })

const { obtenerMisRecursos } = useRecursos()
const asignaciones = ref([])

onMounted(async () => {
  asignaciones.value = await obtenerMisRecursos()
})
</script>
```

### 3. Componente de Notificaciones

**Archivo**: `components/NotificacionesPaciente.vue`

```vue
<template>
  <div class="relative">
    <button @click="abierto = !abierto" class="relative p-2">
      🔔
      <span v-if="noVistas > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5">
        {{ noVistas }}
      </span>
    </button>

    <div v-if="abierto" class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg">
      <div class="p-4 border-b">
        <h3 class="font-semibold">Notificaciones</h3>
      </div>
      <div v-for="n in notificaciones" :key="n.id" class="p-4 border-b hover:bg-gray-50">
        <p class="font-medium text-sm">{{ n.titulo }}</p>
        <p class="text-xs text-gray-600">{{ n.mensaje }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const { obtenerNotificaciones, contarNoVistas } = useNotificaciones()
const notificaciones = ref([])
const noVistas = ref(0)
const abierto = ref(false)

onMounted(async () => {
  notificaciones.value = await obtenerNotificaciones()
  noVistas.value = await contarNoVistas()
})
</script>
```

---

## 🔧 Paso a Paso para Activar

### 1. Ejecutar SQL en Supabase

1. Ir a Supabase Dashboard → SQL Editor
2. Copiar contenido de `supabase/migrations/recursos_schema.sql`
3. Ejecutar
4. Verificar que se crearon las tablas

### 2. Crear los 3 Archivos

```bash
# Crear páginas
touch pages/terapeuta/recursos.vue
touch pages/paciente/recursos.vue
touch components/NotificacionesPaciente.vue

# Copiar el código de arriba en cada archivo
```

### 3. Agregar al Menú

En tu archivo de navegación, agregar:

```js
// Para terapeuta
{ ruta: '/terapeuta/recursos', nombre: 'Recursos', icono: '📚' }

// Para paciente  
{ ruta: '/paciente/recursos', nombre: 'Mis Recursos', icono: '📚' }
```

### 4. Integrar Notificaciones

En `layouts/paciente.vue`:

```vue
<template>
  <div>
    <header>
      <!-- Tu header actual -->
      <NotificacionesPaciente /> <!-- Agregar esto -->
    </header>
    <slot />
  </div>
</template>
```

---

## 🧪 Testing Rápido

### Prueba Completa en 5 Minutos:

```bash
# 1. Login como terapeuta
# 2. Ir a /terapeuta/recursos
# 3. Click "Nuevo Recurso"
#    - Título: "Ejercicio de Respiración"
#    - Tipo: Ejercicio
#    - URL: https://youtube.com/watch?v=ejemplo
# 4. Click "Guardar"
# 5. Click "Compartir" en la tarjeta
# 6. Seleccionar un paciente
# 7. Añadir mensaje: "Practica esto 5 min al día"
# 8. Click "Enviar"
# 9. Logout

# 10. Login como ese paciente
# 11. Ver badge rojo en 🔔 (notificación)
# 12. Click en campana → Ver notificación
# 13. Ir a /paciente/recursos
# 14. Ver recurso con badge "Nuevo"
# 15. Click "Ver recurso"
# 16. Badge desaparece (marcado como visto)
```

---

## ⚡ Comandos Útiles

```bash
# Ver errores en consola del navegador
# Si algo no funciona:

# 1. Verificar que el SQL se ejecutó:
# Supabase → Table Editor → Ver tablas recursos, recursos_pacientes, notificaciones

# 2. Verificar políticas RLS:
# Supabase → Authentication → Policies → Verificar que existan las políticas

# 3. Ver logs en tiempo real:
# Abrir DevTools → Console → Buscar errores rojos
```

---

## 🎯 Resultado Final

✅ Terapeutas pueden:
- Crear y gestionar recursos
- Compartir con pacientes específicos
- Ver estadísticas

✅ Pacientes reciben:
- Notificación automática
- Badge en campana
- Acceso a recursos compartidos
- Mensajes personalizados

✅ Sistema:
- Notificaciones en tiempo real
- Seguridad RLS completa
- Diseño consistente

---

## 🆘 Si Algo No Funciona

### Error: "Failed to fetch"
→ Verificar que las tablas existan en Supabase

### Error: "Permission denied"
→ Ejecutar las políticas RLS del SQL

### Error: "Cannot read property"
→ Verificar que los composables estén importados

### Notificaciones no aparecen
→ Verificar que el trigger `crear_notificacion_recurso` exista

---

## 📊 Estructura Completa

```
psicokarem/
├── supabase/
│   └── migrations/
│       └── recursos_schema.sql ✅
├── composables/
│   ├── useRecursos.js ✅
│   └── useNotificaciones.js ✅
├── components/
│   ├── RecursoCard.vue ✅
│   ├── ModalNuevoRecurso.vue ✅
│   ├── ModalCompartirRecurso.vue ✅
│   └── NotificacionesPaciente.vue ⏳ (crear)
└── pages/
    ├── terapeuta/
    │   └── recursos.vue ⏳ (crear)
    └── paciente/
        └── recursos.vue ⏳ (crear)
```

---

**Tiempo estimado para completar**: ⏱️ **15-20 minutos**

**Dificultad**: ⭐⭐ (Intermedia)

**Estado**: ✅ **90% Completo** → Solo faltan 3 archivos simples
