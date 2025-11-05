export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/supabase', '@nuxtjs/tailwindcss', '@nuxt/content', '@nuxtjs/google-fonts', '@vite-pwa/nuxt'],

  css: ['~/assets/css/main.css'],

  // Suprimir warnings de Vue
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => false
    }
  },

  vite: {
    vue: {
      template: {
        compilerOptions: {
          // Suprimir warning de Suspense experimental
          isCustomElement: () => false
        }
      }
    }
  },

  supabase: {
    redirect: false,
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  runtimeConfig: {
    // Variables privadas para SSR
    supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
    
    // Variables públicas accesibles en cliente
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
      googleAnalyticsId: process.env.NUXT_PUBLIC_GOOGLE_ANALYTICS_ID
    }
  },

  googleFonts: {
    families: {
      'Lora': [400, 500, 600, 700],      // Serif para títulos
      'Inter': [300, 400, 500, 600, 700] // Sans para cuerpo (mejor legibilidad)
    },
    display: 'swap',
    prefetch: true,
    preconnect: true,
    preload: true
  },

  tailwindcss: {
    exposeConfig: true,
    viewer: false
  },

  content: {
    // highlight configuration is not supported, removing it
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Terapli',
      short_name: 'Agenda',
      description: 'Sistema de gestión clínica �',
      theme_color: '#D8AFA0',
      background_color: '#F9F7F3',
      display: 'standalone',
      start_url: '/login',
      orientation: 'portrait',
      lang: 'es',
      scope: '/',
      icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icons/maskable_icon.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ]
    },
    workbox: {
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      navigateFallback: '/',
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'image-cache',
            expiration: {
              maxEntries: 60,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
            }
          }
        }
      ]
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  },

  app: {
    baseURL: '/',
    buildAssetsDir: '/_nuxt/',
    head: {
      htmlAttrs: { lang: 'es' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Terapli - Sistema de Gestión Clínica',
      meta: [
        { 
          name: 'description', 
          content: 'Sistema de gestión clínica para terapeutas. Gestiona pacientes, citas, bonos y recursos de manera eficiente y segura.' 
        },
        // Robots - No indexar la app de gestión
        { name: 'robots', content: 'noindex, nofollow' },
        // SEO Local
        { name: 'geo.region', content: 'ES-M' },
        { name: 'geo.placename', content: 'Ciempozuelos' },
        { name: 'geo.position', content: '40.1524167;-3.6171837' },
        { name: 'ICBM', content: '40.1524167, -3.6171837' },
        
        // Open Graph
        { property: 'og:title', content: 'Terapli - Sistema de Gestión Clínica' },
        { property: 'og:description', content: 'Sistema de gestión clínica para terapeutas. Gestiona pacientes, citas, bonos y recursos de manera eficiente y segura.' },
        { property: 'og:image', content: 'https://terapli.com/og-image.jpg' },
        { property: 'og:url', content: 'https://terapli.com' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'es_ES' },
        { property: 'og:site_name', content: 'Terapli - Sistema de Gestión Clínica' },
        
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Terapli - Sistema de Gestión Clínica' },
        { name: 'twitter:description', content: 'Sistema de gestión clínica para terapeutas. Gestiona pacientes, citas, bonos y recursos de manera eficiente y segura.' },
        { name: 'twitter:image', content: 'https://terapli.com/og-image.jpg' },
        
        // Additional SEO
        { name: 'keywords', content: 'psicóloga Ciempozuelos, terapia ansiedad Madrid Sur, psicología emocional, terapia de pareja, psicóloga online, psicoterapia Madrid' },
        { name: 'author', content: 'Karem Peña' },
        { name: 'robots', content: 'index, follow' }
      ],
      link: [
        { rel: 'canonical', href: 'https://psicologakarem.com' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Psychologist',
            name: 'Psicóloga Karem Peña',
            image: 'https://psicologakarem.com/images/karem-pena-psicologa.jpg',
            '@id': 'https://psicologakarem.com',
            url: 'https://psicologakarem.com',
            telephone: '+34722377290',
            priceRange: '€€',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Calle del Dr. Rivas, 2, Número 8',
              addressLocality: 'Ciempozuelos',
              postalCode: '28350',
              addressRegion: 'Madrid',
              addressCountry: 'ES'
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: 40.1524167,
              longitude: -3.6171837
            },
            openingHoursSpecification: [
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '11:00',
                closes: '14:00'
              },
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '18:00',
                closes: '22:00'
              }
            ],
            sameAs: [
              'https://www.instagram.com/psicokarem',
              'https://www.tiktok.com/@psicokarem',
              'https://www.copc.cat/es/contacte/karem-eydelys-pena-de-rodriguez-138759'
            ],
            areaServed: [
              {
                '@type': 'City',
                name: 'Ciempozuelos'
              },
              {
                '@type': 'AdministrativeArea',
                name: 'Madrid Sur'
              }
            ],
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Servicios de Psicoterapia',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Terapia Individual',
                    description: 'Acompañamiento psicológico personalizado para ansiedad, autoestima y bienestar emocional'
                  }
                },
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Service',
                    name: 'Terapia de Pareja',
                    description: 'Psicoterapia de pareja para mejorar la comunicación y fortalecer el vínculo emocional'
                  }
                },
                {
                  '@type': 'Service',
                  name: 'Terapia Online',
                  description: 'Sesiones de psicoterapia a distancia con la misma cercanía y confidencialidad'
                }
              ]
            }
          })
        }
      ]
    },
    pageTransition: { 
      name: 'fade-route', 
      mode: 'out-in' 
    }
  },

  router: {
    options: {
      scrollBehaviorType: 'smooth'
    }
  }
})
