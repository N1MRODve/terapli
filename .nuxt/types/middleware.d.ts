import type { NavigationGuard } from 'vue-router'
export type MiddlewareKey = "auth-role" | "auth-terapeuta" | "auth"
declare module 'nuxt/app' {
  interface PageMeta {
    middleware?: MiddlewareKey | NavigationGuard | Array<MiddlewareKey | NavigationGuard>
  }
}