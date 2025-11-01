import type { ComputedRef, MaybeRef } from 'vue'
export type LayoutKey = "admin" | "coordinacion" | "coordinadora" | "default" | "paciente" | "terapeuta"
declare module 'nuxt/app' {
  interface PageMeta {
    layout?: MaybeRef<LayoutKey | false> | ComputedRef<LayoutKey | false>
  }
}