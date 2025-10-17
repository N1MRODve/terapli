export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxt/content', '@nuxtjs/google-fonts'],

  css: ['assets/css/main.css'],

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
      googleAnalyticsId: process.env.NUXT_PUBLIC_GOOGLE_ANALYTICS_ID
    }
  },

  googleFonts: {
    families: {
      'Lora': [400, 500, 600, 700],
      'Lato': [300, 400, 500, 600, 700]
    },
    display: 'swap'
  },

  content: {
    // highlight configuration is not supported, removing it
  },

  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Psicóloga en Ciempozuelos | Terapia Individual, Pareja y Ansiedad – Karem Peña',
      meta: [
        { 
          name: 'description', 
          content: 'Psicóloga en Ciempozuelos especializada en ansiedad, pareja y autoestima. Un espacio cálido y seguro para recuperar tu bienestar emocional. Primera orientación gratuita.' 
        },
        // SEO Local
        { name: 'geo.region', content: 'ES-M' },
        { name: 'geo.placename', content: 'Ciempozuelos' },
        { name: 'geo.position', content: '40.1524167;-3.6171837' },
        { name: 'ICBM', content: '40.1524167, -3.6171837' },
        
        // Open Graph
        { property: 'og:title', content: 'Psicóloga en Ciempozuelos – Karem Peña' },
        { property: 'og:description', content: 'Terapia individual, de pareja y para ansiedad. Espacio cálido, profesional y sin juicios en Ciempozuelos.' },
        { property: 'og:image', content: 'https://psicologakarem.com/images/karem-pena-psicologa.jpg' },
        { property: 'og:url', content: 'https://psicologakarem.com' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'es_ES' },
        { property: 'og:site_name', content: 'Psicóloga Karem Peña' },
        
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Psicóloga en Ciempozuelos – Karem Peña' },
        { name: 'twitter:description', content: 'Terapia individual, de pareja y para ansiedad. Espacio cálido, profesional y sin juicios en Ciempozuelos.' },
        { name: 'twitter:image', content: 'https://psicologakarem.com/images/karem-pena-psicologa.jpg' },
        
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
