export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
    // Solo incluir @nuxt/content si no está deshabilitado
    ...(process.env.DISABLE_CONTENT !== 'true' && process.env.NODE_ENV === 'development' ? ['@nuxt/content'] : []),
    '@nuxtjs/google-fonts',
    // Solo incluir PWA si no está deshabilitado
    ...(process.env.DISABLE_PWA !== 'true' ? ['@vite-pwa/nuxt'] : [])
  ],

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
    },
    define: {
      // Suprimir warnings experimentales de Vue
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false
    },
    build: {
      // Evitar rutas absolutas del filesystem en sourcemaps
      sourcemap: process.env.NODE_ENV === 'development' ? 'inline' : false,
      rollupOptions: {
        output: {
          // Sanitizar nombres de chunks para evitar paths absolutos
          chunkFileNames: '_nuxt/[name]-[hash].js',
          entryFileNames: '_nuxt/[name]-[hash].js',
          assetFileNames: '_nuxt/[name]-[hash][extname]'
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
      'Elms+Sans': [400, 500, 600, 700],  // Sans moderna para títulos
      'Lato': [300, 400, 500, 600, 700]   // Sans clásica para párrafos
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

  // Content solo se configura si está disponible y no deshabilitado
  ...(process.env.DISABLE_CONTENT !== 'true' && process.env.NODE_ENV === 'development' && {
    content: {
      // Configuración básica para desarrollo con puerto específico
      watch: {
        ws: {
          port: 4000,
          hostname: 'localhost',
          showURL: false
        }
      },
      // Deshabilitar en caso de error de conexión
      experimental: {
        clientDB: false
      }
    }
  }),

  // @ts-expect-error - PWA configuration from @vite-pwa/nuxt module
  pwa: {
    registerType: 'prompt',
    disable: process.env.NODE_ENV === 'development' || process.env.DISABLE_PWA === 'true',
    manifest: {
      name: 'Terapli',
      short_name: 'Agenda',
      description: 'Sistema de gestión clínica',
      theme_color: '#D8AFA0',
      background_color: '#F9F7F3',
      display: 'standalone',
      start_url: '/',
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
      skipWaiting: false,
      globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg,ico}'],
      navigateFallback: null,
      navigateFallbackDenylist: [
        /^\/api\//, 
        /^\/_nuxt\//, 
        /^\/login/, 
        /^\/terapeuta\/login/, 
        /^\/coordinacion\/login/,
        /^\/admin/
      ],
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
    // CRÍTICO: devOptions.enabled DEBE ser false en desarrollo
    // De lo contrario sobrescribe el 'disable' de arriba
    devOptions: {
      enabled: false, // CAMBIADO: era true, causa bug de SW en dev
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
      title: 'Teraplí - Sistema de Gestión Clínica',
      meta: [
        { 
          name: 'description', 
          content: 'Teraplí: Sistema de gestión clínica moderna para terapeutas. Gestiona pacientes, citas, bonos y recursos de manera eficiente y segura.' 
        },
        // Robots - No indexar la app de gestión
        { name: 'robots', content: 'noindex, nofollow' },
        // SEO Local
        { name: 'geo.region', content: 'ES-M' },
        { name: 'geo.placename', content: 'Ciempozuelos' },
        { name: 'geo.position', content: '40.1524167;-3.6171837' },
        { name: 'ICBM', content: '40.1524167, -3.6171837' },
        
        // Open Graph
        { property: 'og:title', content: 'Teraplí - Sistema de Gestión Clínica' },
        { property: 'og:description', content: 'Teraplí: Sistema de gestión clínica moderna para terapeutas. Gestiona pacientes, citas, bonos y recursos de manera eficiente y segura.' },
        { property: 'og:image', content: 'https://terapli.com/og-image.jpg' },
        { property: 'og:url', content: 'https://terapli.com' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'es_ES' },
        { property: 'og:site_name', content: 'Teraplí - Sistema de Gestión Clínica' },
        
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Teraplí - Sistema de Gestión Clínica' },
        { name: 'twitter:description', content: 'Teraplí: Sistema de gestión clínica moderna para terapeutas. Gestiona pacientes, citas, bonos y recursos de manera eficiente y segura.' },
        { name: 'twitter:image', content: 'https://terapli.com/og-image.jpg' },
        
        // Additional SEO
        { name: 'keywords', content: 'Teraplí, sistema gestión clínica, software terapeutas, gestión pacientes, agenda citas terapia, bonos terapia, psicoterapia digital' },
        { name: 'author', content: 'Teraplí Team' },
        { name: 'robots', content: 'index, follow' }
      ],
      link: [
        { rel: 'canonical', href: 'https://terapli.com' },
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
  },

  // Configuración para deployment en Vercel
  nitro: {
    preset: 'vercel',
    vercel: {
      functions: {
        maxDuration: 30,
        memory: 1024
      }
    },
    // Configuración para vue-bundle-renderer
    experimental: {
      wasm: true
    },
    // CRÍTICO: Bundlear Supabase y dependencias directamente en el código
    // Esto evita que se listen como dependencias externas
    externals: {
      inline: [
        // Vue y relacionados
        'vue-bundle-renderer',
        '@vue/server-renderer',
        'vue',
        '@vue/shared',
        '@vue/reactivity',
        '@vue/runtime-core',
        '@vue/runtime-dom',
        '@vue/compiler-core',
        '@vue/compiler-dom',
        '@vue/compiler-sfc',
        '@vue/compiler-ssr',
        // Supabase - TODOS los paquetes deben estar inline
        '@supabase/supabase-js',
        '@supabase/ssr',
        '@supabase/auth-js',
        '@supabase/functions-js',
        '@supabase/storage-js',
        '@supabase/realtime-js',
        '@supabase/postgrest-js',
        '@supabase/node-fetch',
        '@nuxtjs/supabase',
        // Otras dependencias
        'entities',
        'estree-walker',
        'magic-string',
        'source-map',
        'picocolors',
        'csstype',
        'unhead',
        'hookable',
        'ufo',
        'defu',
        'devalue',
        'klona',
        'perfect-debounce',
        'scule',
        'pathe',
        'ohash',
        'cookie',
        'cross-fetch',
        'node-fetch',
        // tslib es requerido por @supabase/realtime-js
        'tslib'
      ],
      // Forzar que NADA de Supabase sea externo
      external: []
    },
    // Rollup config para asegurar que Supabase se bundlee
    rollupConfig: {
      output: {
        // Mantener todo en el bundle
        manualChunks: undefined
      }
    },
    // Optimizar para serverless
    minify: true
  },

  // Configuración de build para incluir vue-bundle-renderer
  build: {
    transpile: [
      'vue-bundle-renderer',
      'vue',
      '@vue/shared',
      '@vue/server-renderer',
      '@vue/compiler-dom',
      '@vue/compiler-core',
      '@vue/compiler-sfc',
      '@vue/compiler-ssr',
      'entities',
      'estree-walker',
      'magic-string',
      'source-map',
      'picocolors',
      'csstype',
      'devalue',
      'klona',
      'perfect-debounce',
      'scule',
      'pathe',
      'ohash',
      '@supabase/ssr',
      '@supabase/supabase-js'
    ]
  },

  // Asegurar SSR habilitado
  ssr: true,

  // Configuración experimental para Vercel
  experimental: {
    payloadExtraction: false,
    appManifest: false
  }
})
