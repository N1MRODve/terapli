export default defineNitroConfig({
  // Configuración específica para vue-bundle-renderer en Vercel
  preset: 'vercel',
  
  // Logging para debugging
  logLevel: 'info',
  
  // NO bundlear vue-bundle-renderer, incluirlo como externa
  externals: {
    inline: [
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
      'entities',
      'unhead',
      'hookable',
      'ufo',
      'defu'
    ]
  },
  
  // Optimizaciones para serverless
  minify: true,
  sourceMap: false,
  
  // Configuración experimental
  experimental: {
    wasm: true,
    legacyExternals: false
  },
  
  // Configuración de funciones para Vercel
  vercel: {
    functions: {
      maxDuration: 30,
      memory: 1024
    }
  }
})