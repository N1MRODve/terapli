// Plugin de cliente para Vercel Analytics
// Se ejecuta solo en el navegador, evitando problemas de SSR
import { inject } from '@vercel/analytics'

export default defineNuxtPlugin(() => {
  // inject() inicializa Vercel Analytics en el cliente
  inject()
})
