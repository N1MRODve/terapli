# 🏥 Terapli - Sistema de Gestión Clínica

Sistema completo de gestión clínica para terapeutas, desarrollado con Nuxt 3 y Supabase.

## 🌐 Acceso en Vivo

**URL:** [agenda.psicologakarem.com](https://agenda.psicologakarem.com)

## 🚀 Características Principales

### 👥 Gestión Multi-Rol
- **Administrador:** Control total del sistema
- **Coordinadora:** Gestión de pagos y citas
- **Terapeuta:** Manejo de pacientes y sesiones  
- **Paciente:** Acceso a su información personal

### 📅 Sistema de Agenda
- Creación y gestión de citas
- Calendario interactivo
- Notificaciones automáticas
- Confirmación de asistencia

### 💰 Sistema de Bonos
- Compra de bonos de sesiones
- Seguimiento de pagos
- Estado de bonos en tiempo real
- Integración con agenda

### 📊 Dashboard Inteligente
- Métricas en tiempo real
- Gráficos de progreso
- Resúmenes personalizados
- Exportación de datos

### 📱 PWA (Progressive Web App)
- Instalable como app nativa
- Funciona offline
- Optimizado para móviles
- Notificaciones push ready

## 🛠️ Stack Tecnológico

- **Frontend:** Nuxt 3, Vue 3, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **PWA:** Vite PWA Plugin
- **Deploy:** Vercel
- **Database:** PostgreSQL con RLS
- **Auth:** Supabase Auth con roles

## 📦 Instalación Rápida

```bash
# Clonar repositorio
git clone https://github.com/N1MRODve/terapli.git
cd terapli

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Ejecutar en desarrollo
npm run dev
```

## 🔧 Variables de Entorno

```bash
# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima

# Site URL
NUXT_PUBLIC_SITE_URL=https://agenda.psicologakarem.com

# Google Analytics (opcional)
NUXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
npm run deploy:vercel
```

### Configuración DNS
```
CNAME: agenda -> tu-deployment.vercel.app
```

Ver `DEPLOYMENT.md` para más detalles.
