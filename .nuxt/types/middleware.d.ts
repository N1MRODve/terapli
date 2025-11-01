import type { NavigationGuard } from 'vue-router'
export type MiddlewareKey = "admin-auth" | "auth-role" | "auth-terapeuta" | "auth" | "role-coordinadora"
declare module 'nuxt/app' {
  interface PageMeta {
    middleware?: MiddlewareKey | NavigationGuard | Array<MiddlewareKey | NavigationGuard>
  }
}