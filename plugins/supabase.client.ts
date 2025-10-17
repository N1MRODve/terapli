import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const supabase = createClient<Database>(
    config.public.supabaseUrl as string,
    config.public.supabaseAnonKey as string,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  )

  return {
    provide: {
      supabase
    }
  }
})
