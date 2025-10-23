import type { ComputedRef, MaybeRef } from 'vue'
export type LayoutKey = "coordinacion" | "default" | "paciente" | "terapeuta"
declare module 'nuxt/app' {
  interface PageMeta {
    layout?: MaybeRef<LayoutKey | false> | ComputedRef<LayoutKey | false>
  }
}