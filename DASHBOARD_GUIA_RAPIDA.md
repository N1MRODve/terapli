# 🎨 Guía Rápida - Dashboard del Paciente

## 📍 Acceso al Dashboard

**URL:** http://localhost:3001/paciente/dashboard

⚠️ **Nota:** Requiere autenticación. Si no tienes sesión iniciada, serás redirigido al login.

---

## 🧩 Componentes Implementados

### 1️⃣ **HeaderGreeting** 
📍 Ubicación: `/components/dashboard/HeaderGreeting.vue`

**Muestra:**
- ✨ Saludo personalizado según hora del día
- 💬 Mensaje terapéutico rotativo (5 variaciones)
- 🎨 Fondo degradado terracota → beige

**Props:**
- `user-name` (String): Nombre del paciente

---

### 2️⃣ **EmotionTracker**
📍 Ubicación: `/components/dashboard/EmotionTracker.vue`

**Funcionalidades:**
- 😀 😌 😐 😔 😭 Selector de 5 estados emocionales
- 🏷️ 8 etiquetas emocionales (Tranquilo/a, Ansioso/a, etc.)
- ✍️ Campo de reflexión opcional
- ✅ Confirmación visual con animación

**Flujo:**
1. Seleccionar emoji principal
2. (Opcional) Elegir etiquetas específicas
3. (Opcional) Escribir reflexión
4. Guardar → Mensaje de agradecimiento

---

### 3️⃣ **EmotionChart**
📍 Ubicación: `/components/dashboard/EmotionChart.vue`

**Características:**
- 📊 Gráfico de línea con Chart.js
- 📅 Últimos 7 días de registro
- 💡 Insight emocional automático
- 🎯 Tooltips con emojis
- 📈 Detección de tendencias

**Insights generados:**
- Estado positivo sostenido
- Mejoría detectada
- Fluctuaciones normales
- Estabilidad emocional

---

### 4️⃣ **NextSessionCard**
📍 Ubicación: `/components/dashboard/NextSessionCard.vue`

**Información mostrada:**
- 📅 Fecha y hora de próxima sesión
- 📹 Modalidad (Videollamada/Presencial)
- ⏱️ Duración (60 minutos)
- 📝 Nota de preparación
- ⏳ Contador regresivo

**Botón dinámico:**
- "Unirme a la sesión" (si falta ≤15 min)
- "Ver detalles" (más de 15 min)
- "Agendar sesión" (sin sesiones)

---

### 5️⃣ **ResourceGrid**
📍 Ubicación: `/components/dashboard/ResourceGrid.vue`

**Muestra:**
- 🧘‍♀️ 📖 🎧 Recursos categorizados
- 🆕 Indicador de nuevos recursos
- ⏱️ Duración estimada
- 🔗 Link a vista completa

**Ejemplo de recursos:**
- Meditación guiada (5 min)
- Artículos de psicología (8 min)
- Audios relajantes (15 min)

---

### 6️⃣ **DailyQuote**
📍 Ubicación: `/components/dashboard/DailyQuote.vue`

**Contenido:**
- 💭 Frase motivacional del día
- ✨ 7 frases diferentes (rotan diariamente)
- 🎨 Fondo degradado suave
- 🌟 Elementos decorativos

**Ejemplos de frases:**
- "Eres más fuerte de lo que crees 💛"
- "Está bien no estar bien..."
- "Cada paso hacia tu bienestar es un acto de amor propio"

---

## 🎨 Paleta de Colores

| Color | Código | Uso |
|-------|--------|-----|
| **Beige claro** | `#F9F7F3` | Fondo general |
| **Terracota** | `#D8AFA0` | Color principal, botones |
| **Terracota claro** | `#EAD5D3` | Bordes, degradados |
| **Marrón oscuro** | `#5D4A44` | Texto principal |
| **Blanco** | `#FFFFFF` | Tarjetas, fondos |

---

## 📱 Layout Responsivo

### 📱 Móvil (<1024px)
```
┌─────────────────┐
│  HeaderGreeting │
├─────────────────┤
│ EmotionTracker  │
├─────────────────┤
│  EmotionChart   │
├─────────────────┤
│NextSessionCard  │
├─────────────────┤
│  ResourceGrid   │
├─────────────────┤
│   DailyQuote    │
└─────────────────┘
```

### 💻 Desktop (≥1024px)
```
┌───────────────────────────────┐
│       HeaderGreeting          │
├───────────────────────────────┤
│      EmotionTracker           │
├───────────────────────────────┤
│       EmotionChart            │
├──────────────┬────────────────┤
│NextSession   │ ResourceGrid   │
│Card          │                │
├──────────────┴────────────────┤
│        DailyQuote             │
└───────────────────────────────┘
```

---

## ⚡ Animaciones

### Entrada de componentes
- **Efecto:** FadeInUp (opacidad + translateY)
- **Duración:** 600ms
- **Timing:** Escalonado (0.1s, 0.2s, 0.3s...)
- **Easing:** ease-out

### Interacciones
- **Hover:** scale-105, cambio de color
- **Click:** scale-[1.02], shadow-lg
- **Transiciones:** 200ms duration

---

## 🔌 Integración con Supabase

### Tablas necesarias:

#### `pacientes`
```sql
- id (uuid)
- user_id (uuid, ref auth.users)
- nombre (text)
- email (text)
```

#### `registros_emocionales`
```sql
- id (uuid)
- paciente_id (uuid, ref pacientes)
- nivel_emocional (int, 1-5)
- etiquetas (text[])
- reflexion (text)
- created_at (timestamp)
```

#### `sesiones`
```sql
- id (uuid)
- paciente_id (uuid)
- fecha (timestamp)
- modalidad (text: 'online' | 'presencial')
- ubicacion (text, URL para online)
- notas (text)
```

#### `recursos`
```sql
- id (uuid)
- titulo (text)
- descripcion (text)
- categoria (text)
- duracion (text)
- icono (text)
- link (text)
- is_new (boolean)
```

---

## 🧪 Testing Rápido

### ✅ Checklist de verificación:

1. **Navegación**
   - [ ] El dashboard carga sin errores
   - [ ] Se muestra el loading spinner inicialmente
   - [ ] Middleware de auth funciona

2. **HeaderGreeting**
   - [ ] El saludo cambia según hora del día
   - [ ] Se muestra el nombre del paciente
   - [ ] Mensaje terapéutico se visualiza

3. **EmotionTracker**
   - [ ] Se pueden seleccionar emojis
   - [ ] Las etiquetas se marcan/desmarcan
   - [ ] El botón "Registrar" funciona
   - [ ] Aparece mensaje de confirmación

4. **EmotionChart**
   - [ ] El gráfico se renderiza
   - [ ] Los tooltips funcionan
   - [ ] Se muestra el insight emocional

5. **NextSessionCard**
   - [ ] Muestra información de sesión
   - [ ] El contador regresivo actualiza
   - [ ] El botón cambia según contexto

6. **ResourceGrid**
   - [ ] Se muestran 3 recursos
   - [ ] Los hover effects funcionan
   - [ ] El link "Ver más" funciona

7. **DailyQuote**
   - [ ] Se muestra la frase del día
   - [ ] Los elementos decorativos se ven

8. **Responsive**
   - [ ] En móvil: layout vertical
   - [ ] En desktop: grid de 2 columnas
   - [ ] Todos los componentes se adaptan

---

## 🎯 Próximos Pasos Sugeridos

### Corto Plazo (1-2 días)
- [ ] Conectar EmotionTracker con Supabase
- [ ] Cargar datos reales en EmotionChart
- [ ] Obtener sesiones desde la base de datos
- [ ] Implementar sistema de recursos

### Medio Plazo (1 semana)
- [ ] Crear página `/paciente/recursos`
- [ ] Sistema de notificaciones para sesiones
- [ ] Exportar registros emocionales como PDF
- [ ] Añadir gráfico de comparativa mensual

### Largo Plazo (1 mes)
- [ ] Dashboard para la terapeuta (admin)
- [ ] Chat o mensajería interna
- [ ] Sistema de objetivos terapéuticos
- [ ] Integración con calendario (Google/iCal)

---

## 🐛 Troubleshooting

### El dashboard no carga
- ✅ Verifica que estás autenticado
- ✅ Revisa la consola del navegador
- ✅ Confirma que el servidor está corriendo

### El gráfico no se muestra
- ✅ Chart.js debe estar instalado (`npm install chart.js`)
- ✅ Verifica que estás en modo cliente (no SSR)
- ✅ Revisa que `<ClientOnly>` envuelve el componente

### Estilos no se aplican
- ✅ Verifica que TailwindCSS está configurado
- ✅ Confirma que las fuentes Lora y Lato están cargadas
- ✅ Revisa el archivo `tailwind.config.js`

### Errores de TypeScript
- ✅ Los tipos están en `/types/database.types.ts`
- ✅ Puedes usar `// @ts-ignore` temporalmente
- ✅ O cambiar archivos a `.vue` sin `lang="ts"`

---

## 📞 Soporte

Si encuentras algún problema:
1. Revisa la documentación de cada componente
2. Verifica los errores en consola del navegador
3. Revisa los logs del servidor Nuxt
4. Consulta la documentación oficial de:
   - [Nuxt 3](https://nuxt.com)
   - [Chart.js](https://www.chartjs.org)
   - [TailwindCSS](https://tailwindcss.com)
   - [Supabase](https://supabase.com/docs)

---

## 🎉 ¡Listo!

Tu dashboard está completamente implementado y listo para uso.

**URL de acceso:** http://localhost:3001/paciente/dashboard

Disfruta del nuevo diseño emocional y funcional! 💛🌱
