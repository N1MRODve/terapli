# 🏥 Agenda Clínica - Despliegue

Sistema de gestión clínica desplegado en `terapli.com`

## 🚀 Despliegue Rápido

### 1. Variables de Entorno

Configurar en tu plataforma de hosting (Vercel/Netlify):

```bash
NUXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
NUXT_PUBLIC_SITE_URL=https://terapli.com
NODE_ENV=production
```

### 2. Configuración de Dominio

- **Dominio principal:** `psicologakarem.com` (sitio web marketing)
- **Subdominio clínica:** `terapli.com` (sistema de gestión)

### 3. DNS Configuration

```
CNAME: agenda -> tu-deployment-url.vercel.app
```

## 📋 Checklist de Despliegue

- [ ] Variables de entorno configuradas
- [ ] DNS configurado para terapli.com
- [ ] Supabase RLS policies activas
- [ ] SSL certificate configurado
- [ ] PWA funcionando correctamente

## 🔧 Comandos de Build

```bash
# Instalación
npm install

# Build de producción
npm run build

# Preview local
npm run preview
```

## 🔐 Acceso Inicial

1. Crear usuario administrador en Supabase
2. Asignar rol 'admin' en la tabla user_roles
3. Acceder a `https://terapli.com`

## 🛠️ Stack Tecnológico

- **Framework:** Nuxt 3
- **Backend:** Supabase
- **Deploy:** Vercel
- **PWA:** @vite-pwa/nuxt
- **UI:** Tailwind CSS

## 📱 Características PWA

- Instalable como app nativa
- Funciona offline (caché básico)
- Notificaciones push (configurar en futuro)
- Optimizado para móviles

## 🔗 Enlaces

- **App:** https://terapli.com
- **Docs:** Ver archivos MD en el proyecto
- **Supabase:** Panel de administración