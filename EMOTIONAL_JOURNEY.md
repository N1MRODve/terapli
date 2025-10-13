# 🌿 Emotional Journey - psicologakarem.com

## Complete User Flow Documentation

This document maps the complete emotional journey for visitors on psicologakarem.com, from discovery to booking confirmation.

---

## 🎯 Philosophy

Every page transition is designed to:
- **Validate** the visitor's emotional state
- **Guide** them gently through their decision process
- **Personalize** using their name when available
- **Maintain** calm, breathing rhythm in animations
- **Build trust** through empathy and professionalism

---

## 📍 The Complete Journey

### Stage 1: Discovery & Emotional Recognition
**Path**: `/` → `/sentirse/[emotion]`

**Pages**:
- `/sentirse/ansiedad` - Anxiety support
- `/sentirse/autoestima` - Self-esteem
- `/sentirse/desanimo` - Low mood
- `/sentirse/duelo` - Grief
- `/sentirse/crisis-vital` - Life crisis
- `/sentirse/identidad` - Identity
- `/sentirse/migracion` - Migration
- `/sentirse/relaciones` - Relationships

**Personalization**:
```javascript
// Each page adapts empathic messaging based on visitor context
const { visitorName, greeting } = useVisitorContext()
```

**Tone**: *"Te comprendo. No estás solo/a."*

---

### Stage 2: Building Trust
**Path**: `/sentirse/[emotion]` → `/conoceme`

**Experience**:
- Professional credentials (COPC)
- Personal approach to therapy
- Specializations clearly explained
- Social proof (Google reviews)

**Tone**: *"Soy Karem, y puedo acompañarte en este proceso."*

---

### Stage 3: Understanding the Process
**Path**: `/conoceme` → `/como-empezar`

**New Component**: `pages/como-empezar.vue`

**Personalized Sections**:
1. **Hero with personalized greeting**:
   - With name: *"José, este puede ser el comienzo de tu proceso."*
   - Without: *"Este puede ser el comienzo de tu proceso."*

2. **3-Step Process**:
   - Sesión de orientación gratuita
   - Inicio del acompañamiento
   - Proceso terapéutico

3. **What to Expect**:
   - Safe space, confidential, non-judgmental
   - Adapted to your pace
   - Active listening
   - Emotional management tools
   - Human accompaniment with scientific basis

4. **FAQ Section** with pricing:
   - Encuentro Puntual: 60€
   - Proceso Constante (quincenal): 100€/mes
   - Proceso Profundo (semanal): 160€/mes
   - Sliding scale available

**Tone**: *"Así funciona el proceso, para que te sientas tranquilo/a."*

---

### Stage 4: Emotional Transition (Optional)
**Path**: `/como-empezar` → `/transicion-como-empezar` → `/reservar`

**New Component**: `components/EmotionalTransition.vue`

**Experience**:
- Full-screen calm message
- Personalized: *"José, me alegra que hayas llegado hasta aquí."*
- 2.5 second breathing pause
- Smooth fade to booking page

**Purpose**: Create emotional space between decision and action

---

### Stage 5: Taking Action
**Path**: `/reservar`

**New Features**:
1. **Personalized Hero**:
   - *"José, me alegra acompañarte en este primer paso."*

2. **Device-Aware Booking Options**:
   - **Mobile**: WhatsApp button with pre-filled personalized message
   - **Desktop**: Email + WhatsApp contact options
   - Both: Calendar booking link

3. **WhatsApp Personalization**:
   ```javascript
   const whatsappLink = computed(() => {
     const message = visitorName.value
       ? `Hola, soy ${visitorName.value} y me gustaría agendar una sesión de orientación.`
       : 'Hola, me gustaría agendar una sesión de orientación.'
     return `https://wa.me/34640533697?text=${encodeURIComponent(message)}`
   })
   ```

4. **Trust Section**:
   - COPC confidentiality guarantee
   - *"José, tu información y tu proceso estarán siempre protegidos."*

5. **Process Timeline**:
   - Confirmation → Reminder → First session

**Tone**: *"Da el paso con confianza. Estás acompañado/a."*

---

### Stage 6: Emotional Closure
**Path**: `/gracias`

**New Component**: `pages/gracias.vue`

**Experience**:
1. **Personalized Thank You**:
   - *"Gracias, José. Te acompañaré en este proceso con calma y presencia."*

2. **Breathing Circle Animation**:
   - 8-second pulse (mimics calm breathing)
   - Visual symbol of peace and completion

3. **Next Steps**:
   - Return to home
   - Explore emotional resources

4. **Auto-redirect**:
   - Countdown timer (6 seconds)
   - Gentle fade to homepage

**Tone**: *"Has dado un paso valiente. Te acompaño desde aquí."*

---

## �� Design System

### Colors
- **Terracota**: `#D8AFA0` - Primary actions, warmth
- **Rosa Empolvado**: `#EAD5D3` - Soft accents
- **Café**: `#5D4A44` - Text, grounding
- **Fondo**: `#F9F7F3` - Background, calm

### Typography
- **Headings**: Lora (serif, elegant)
- **Body**: Lato (sans-serif, readable)

### Animations
```css
/* Breathing rhythm: 8s cycle (4s in, 4s out) */
@keyframes calm-pulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.02); opacity: 0.7; }
}

/* Content reveal */
@keyframes fade-in-up {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
```

### Components
- **CalmButton**: Breathing animation, 3 variants (primary, secondary, tertiary)
- **EmotionalTransition**: Full-screen transition with personalization
- **PersonalizedHero**: Dynamic greeting based on context

---

## 📊 Personalization System

### Context Data (`useVisitorContext.js`)
```javascript
{
  visitorName: computed(() => string),      // "José" or ""
  deviceType: computed(() => string),       // "mobile" or "desktop"
  greeting: computed(() => string),         // Time-aware greeting
  isFirstVisit: computed(() => boolean),    // First-time detection
  setName: (name: string) => void,          // Store visitor name
  updateGreeting: () => void,               // Refresh greeting
  personalized: (neutral, withName) => string // Helper function
}
```

### Storage
- `localStorage.visitorName` - Persisted across sessions
- `localStorage.lastVisit` - Return visitor detection
- `localStorage.hasVisited` - First-time flag

---

## 🔗 Navigation Flow

```
Home (/)
  │
  ├─→ Cómo te sientes (/sentirse)
  │     ├─→ Ansiedad
  │     ├─→ Autoestima
  │     ├─→ Desánimo
  │     ├─→ Duelo
  │     ├─→ Crisis vital
  │     ├─→ Identidad
  │     ├─→ Migración
  │     └─→ Relaciones
  │           ↓
  ├─→ Conóceme (/conoceme)
  │           ↓
  └─→ Cómo empezar (/como-empezar)
              ↓
      [Optional Transition]
              ↓
      Reservar (/reservar)
              ↓
      Gracias (/gracias)
              ↓
      [Auto-redirect to Home]
```

---

## ✨ Key UX Innovations

### 1. Breathing Animations
Every CTA button "breathes" at 8-second intervals, mimicking therapeutic breathing exercises.

### 2. Staggered Content Reveals
Elements fade in with 0.2s delays, creating calm, sequential discovery.

### 3. Device-Aware CTAs
Mobile users see WhatsApp priority; desktop users see calendar + email.

### 4. Emotional Transitions
Named routes create psychological space between decision points.

### 5. Personalized Messaging
42 unique personalization points across the journey.

---

## 📱 Responsive Design

All pages adapt to:
- Mobile (320px+)
- Tablet (768px+)
- Desktop (1024px+)
- Large screens (1440px+)

Key breakpoints use Tailwind's `md:` and `lg:` prefixes.

---

## ♿ Accessibility

- Semantic HTML5 (`<section>`, `<article>`, `<nav>`)
- ARIA labels on all interactive elements
- Focus states with visible outlines
- Color contrast ≥ 4.5:1 (WCAG AA)
- Keyboard navigation support
- Screen reader friendly

---

## 📈 Success Metrics

### Emotional Engagement
- Time on "Cómo te sientes" pages
- Scroll depth on "Cómo empezar"
- Interaction with personalization (name entry)

### Conversion Points
- "Cómo empezar" page views
- Booking page visits
- Thank you page completions

### Device Behavior
- Mobile WhatsApp click rate
- Desktop calendar booking rate
- Cross-device journey completion

---

## 🚀 Future Enhancements

### Audio Elements
- Optional soft breathing sound on `/gracias` (commented in code)
- Accessibility: Muted by default, user-activated

### Advanced Personalization
- Emotion-based journey tracking
- Return visitor messaging adaptation
- Progress indicators for multi-visit journeys

### A/B Testing Opportunities
- Transition duration (2.5s vs 3.5s)
- Auto-redirect timing (6s vs 8s)
- WhatsApp vs Calendar priority on mobile

---

## 🛠️ Technical Stack

- **Framework**: Nuxt 3 (Vue 3)
- **Styling**: TailwindCSS
- **State**: Composables + localStorage
- **Routing**: Vue Router with query params
- **Animations**: CSS keyframes + Tailwind utilities

---

## 📝 Maintenance Notes

### Adding New Emotional Journey Pages
1. Create page in `/pages/sentirse/[emotion].vue`
2. Use `useVisitorContext()` composable
3. Follow personalization patterns (see examples)
4. Include Google review sections
5. Link to `/como-empezar`

### Updating Personalization
Edit `/composables/useVisitorContext.js` - all pages update automatically.

### Modifying Animation Timing
Edit `/assets/css/main.css` - breathing and fade timings centralized.

---

**Created**: October 11, 2025  
**Version**: 1.0  
**Designer**: Senior UX Writer & Frontend Designer  
**Philosophy**: Therapeutic design meets human-centered technology 🌿
