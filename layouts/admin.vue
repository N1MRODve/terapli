<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Navegación superior -->
    <nav class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo y título -->
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <ChartBarIcon class="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">Panel de Administración</h1>
              <p class="text-xs text-gray-500">Sistema de gestión</p>
            </div>
          </div>

          <!-- Usuario -->
          <div class="flex items-center gap-4">
            <div class="text-right hidden sm:block">
              <p class="text-sm font-semibold text-gray-900">{{ usuario?.email || 'Admin' }}</p>
              <p class="text-xs text-gray-500">Administrador</p>
            </div>
            <button
              @click="cerrarSesion"
              class="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
            >
              <ArrowRightOnRectangleIcon class="w-4 h-4" aria-hidden="true" />
              <span class="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Navegación de pestañas -->
    <div class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="flex gap-1 -mb-px" aria-label="Tabs">
          <NuxtLink
            to="/admin"
            exact
            class="group inline-flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition-all"
            :class="rutaActual === '/admin' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'"
          >
            <ChartBarIcon class="w-5 h-5" aria-hidden="true" />
            <span>Métricas</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/terapeutas"
            class="group inline-flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition-all"
            :class="rutaActual.startsWith('/admin/terapeutas')
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'"
          >
            <UsersIcon class="w-5 h-5" aria-hidden="true" />
            <span>Terapeutas</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/pacientes"
            class="group inline-flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition-all"
            :class="rutaActual.startsWith('/admin/pacientes')
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'"
          >
            <UserGroupIcon class="w-5 h-5" aria-hidden="true" />
            <span>Pacientes</span>
          </NuxtLink>

          <NuxtLink
            to="/admin/finanzas"
            class="group inline-flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition-all"
            :class="rutaActual.startsWith('/admin/finanzas')
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'"
          >
            <CurrencyDollarIcon class="w-5 h-5" aria-hidden="true" />
            <span>Finanzas</span>
          </NuxtLink>
        </nav>
      </div>
    </div>

    <!-- Contenido principal -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ChartBarIcon,
  UsersIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const supabase = useSupabaseClient()
const usuario = ref<any>(null)

const rutaActual = computed(() => route.path)

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  usuario.value = user
})

const cerrarSesion = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}
</script>
