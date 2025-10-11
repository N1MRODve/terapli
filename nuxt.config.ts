export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxt/content', '@nuxtjs/google-fonts'],

  css: ['assets/css/main.css'],

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.VITE_SUPABASE_URL,
      supabaseKey: process.env.VITE_SUPABASE_SUPABASE_ANON_KEY
    }
  },

  googleFonts: {
    families: {
      Lora: [400, 500, 600, 700],
      Lato: [300, 400, 700]
    },
    display: 'swap'
  },

  content: {
    highlight: {
      theme: 'nord'
    },
    markdown: {
      toc: { depth: 3, searchDepth: 3 }
    }
  },

  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Karem Peña - Psicóloga en Madrid Sur',
      meta: [
        { name: 'description', content: 'Terapia psicológica con calidez y profesionalidad en Madrid Sur. Especializada en ansiedad, autoestima, relaciones y procesos migratorios.' }
      ]
    }
  }
})
