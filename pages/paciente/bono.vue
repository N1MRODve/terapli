<template>
  <div class="max-w-4xl mx-auto space-y-6 px-4 py-8">
    <!-- Loader -->
    <div v-if="loading" class="flex flex-col items-center justify-center min-h-[40vh]">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5550F2]"></div>
      <p class="mt-4 text-[#2D3748] opacity-70 font-sans">Cargando tu bono...</p>
    </div>

    <!-- Contenido -->
    <div v-else>
      <!-- Header -->
      <header class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-serif font-medium text-[#2D3748]">
          Mi Bono
        </h1>
        <p class="text-sm text-[#2D3748] opacity-70 font-sans mt-1">
          Gestiona y consulta tu bono de sesiones
        </p>
      </header>

      <!-- Bono activo -->
      <section v-if="bonoActivo" class="bg-white rounded-xl shadow-sm border border-[#E2E8F0]/30 p-6 mb-8">
        <header class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-serif font-medium text-[#2D3748]">Bono de {{ bonoActivo.total_sesiones }} Sesiones</h2>
            <p class="text-sm text-[#2D3748] opacity-70 font-sans">Contratado el {{ formatearFecha(bonoActivo.created_at) }}</p>
          </div>
          <div>
            <span :class="estadoBonoClass(bonoActivo.estado)" class="px-3 py-1 rounded-full text-xs font-sans font-medium">
              {{ estadoBonoTexto(bonoActivo.estado) }}
            </span>
          </div>
        </header>

        <!-- Estadísticas -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div class="text-center">
            <p class="text-4xl font-serif font-bold text-[#5550F2]">{{ bonoActivo.sesiones_restantes }}</p>
            <p class="text-sm text-[#2D3748] opacity-70 font-sans mt-1">Disponibles</p>
          </div>
          <div class="text-center">
            <p class="text-4xl font-serif font-bold text-[#2D3748]">{{ bonoActivo.total_sesiones }}</p>
            <p class="text-sm text-[#2D3748] opacity-70 font-sans mt-1">Totales</p>
          </div>
          <div class="text-center">
            <p class="text-4xl font-serif font-bold text-[#2D3748] opacity-50">{{ bonoActivo.sesiones_usadas }}</p>
            <p class="text-sm text-[#2D3748] opacity-70 font-sans mt-1">Completadas</p>
          </div>
        </div>

        <!-- Progreso -->
        <div class="space-y-2">
          <div class="flex justify-between text-xs font-sans text-[#2D3748] opacity-70">
            <span>Progreso del bono</span>
            <span>{{ Math.round((bonoActivo.sesiones_usadas / bonoActivo.total_sesiones) * 100) }}%</span>
          </div>
          <div class="w-full bg-[#E2E8F0]/30 rounded-full h-3 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="getProgressColor(bonoActivo.sesiones_restantes, bonoActivo.total_sesiones)"
              :style="{ width: `${(bonoActivo.sesiones_usadas / bonoActivo.total_sesiones) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- Precio y estado -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div class="flex items-center space-x-3 p-4 bg-[#F2F2F2] rounded-lg">
            <div class="w-10 h-10 rounded-full bg-[#5550F2]/20 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-[#5550F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p class="text-xs text-[#2D3748] opacity-70 font-sans">Precio total</p>
              <p class="text-lg font-serif font-medium text-[#2D3748]">{{ formatearPrecio(bonoActivo.precio_total) }}€</p>
              <p class="text-xs text-[#2D3748] opacity-50 font-sans">{{ formatearPrecio(bonoActivo.precio_total / bonoActivo.total_sesiones) }}€ por sesión</p>
            </div>
          </div>
          <div class="flex items-center space-x-3 p-4 bg-[#F2F2F2] rounded-lg">
            <div class="w-10 h-10 rounded-full bg-[#5550F2]/20 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-[#5550F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p class="text-xs text-[#2D3748] opacity-70 font-sans">Estado</p>
              <p class="text-lg font-serif font-medium text-[#2D3748]">{{ estadoBonoTexto(bonoActivo.estado) }}</p>
              <p v-if="bonoActivo.fecha_expiracion" class="text-xs text-[#2D3748] opacity-50 font-sans">Válido hasta {{ formatearFecha(bonoActivo.fecha_expiracion) }}</p>
            </div>
          </div>
        </div>

        <!-- Alertas -->
        <div v-if="bonoActivo.sesiones_restantes <= 2 && bonoActivo.sesiones_restantes > 0" class="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mt-6">
          <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <div>
            <p class="text-sm font-sans font-medium text-amber-900">Quedan pocas sesiones</p>
            <p class="text-xs font-sans text-amber-700 mt-1">Considera renovar tu bono pronto para mantener la continuidad.</p>
          </div>
        </div>

        <div v-if="bonoActivo.sesiones_restantes === 0" class="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg mt-6">
          <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <p class="text-sm font-sans font-medium text-red-900">Bono agotado</p>
            <p class="text-xs font-sans text-red-700 mt-1">Has utilizado todas las sesiones. Contacta para adquirir uno nuevo.</p>
          </div>
        </div>

        <!-- Renovar -->
        <div v-if="bonoActivo.sesiones_restantes <= 2" class="pt-4 border-t border-[#E2E8F0]/30 mt-6">
          <NuxtLink to="/como-empezar" class="block w-full text-center px-6 py-3 bg-[#5550F2] hover:bg-[#C89B8A] text-white rounded-lg font-sans font-medium transition-colors">Renovar Bono</NuxtLink>
        </div>
      </section>

      <!-- Bonos anteriores -->
      <section v-if="bonosAnteriores.length > 0" class="space-y-4">
        <h2 class="text-lg font-serif font-medium text-[#2D3748] mb-2">Historial de Bonos</h2>
        <div class="space-y-3">
          <article v-for="bono in bonosAnteriores" :key="bono.id" class="bg-white rounded-lg shadow-sm border border-[#E2E8F0]/30 p-4">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h3 class="text-base font-sans font-medium text-[#2D3748]">Bono de {{ bono.total_sesiones }} Sesiones</h3>
                <p class="text-xs text-[#2D3748] opacity-70 font-sans">{{ formatearFecha(bono.created_at) }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-serif font-medium text-[#2D3748]">{{ bono.sesiones_usadas }}/{{ bono.total_sesiones }}</p>
                <p class="text-xs text-[#2D3748] opacity-70 font-sans">sesiones</p>
              </div>
            </div>
            <div class="w-full bg-[#E2E8F0]/30 rounded-full h-2">
              <div class="h-full bg-[#2D3748] opacity-30 rounded-full" :style="{ width: `${(bono.sesiones_usadas / bono.total_sesiones) * 100}%` }"></div>
            </div>
            <div class="flex items-center space-x-2 mt-2 text-xs text-[#2D3748] opacity-60 font-sans">
              <span class="px-2 py-0.5 rounded-full font-medium" :class="estadoBonoClass(bono.estado)">{{ estadoBonoTexto(bono.estado) }}</span>
              <span>·</span>
              <span>Contratado: {{ formatearFecha(bono.created_at) }}</span>
              <span v-if="bono.fecha_expiracion">· Expira: {{ formatearFecha(bono.fecha_expiracion) }}</span>
            </div>
          </article>
        </div>
      </section>

      <!-- Empty state -->
      <div v-if="!bonoActivo && bonosAnteriores.length === 0" class="flex flex-col items-center justify-center text-center py-16">
        <div class="w-20 h-20 rounded-full bg-[#E2E8F0]/30 flex items-center justify-center mb-4">
          <svg class="w-10 h-10 text-[#5550F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
        </div>
        <h3 class="text-xl font-serif font-medium text-[#2D3748] mb-2">No tienes bonos activos</h3>
        <p class="text-sm text-[#2D3748] opacity-70 font-sans max-w-md mb-6">Adquiere un bono para comenzar tu proceso terapéutico.</p>
        <NuxtLink to="/contacto" class="px-6 py-3 bg-[#5550F2] hover:bg-[#C89B8A] text-white rounded-lg font-sans font-medium transition-colors">Contactar</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define la estructura de un bono
interface Bono {
  id: string;
  total_sesiones: number;
  sesiones_restantes: number;
  precio_total: number;
  estado: 'activo' | 'agotado' | 'expirado' | 'cancelado';
  created_at: string;
  fecha_expiracion?: string;
  // Computed property, not from DB
  sesiones_usadas: number;
}

definePageMeta({
  layout: 'paciente',
  middleware: 'auth'
});

const { getBonos } = usePacientes();

const loading = ref(true);
const bonos = ref<Bono[]>([]);

// Propiedades computadas
const bonoActivo = computed(() => bonos.value.find((b: Bono) => b.estado === 'activo'));
const bonosAnteriores = computed(() => 
  bonos.value
    .filter((b: Bono) => b.estado !== 'activo')
    .sort((a: Bono, b: Bono) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
);

// Métodos
const cargarBonos = async () => {
  loading.value = true;
  try {
    const data = await getBonos();
    // Calcula las sesiones usadas
    bonos.value = (data || []).map(bono => ({
      ...bono,
      estado: bono.estado as Bono['estado'],
      sesiones_usadas: bono.total_sesiones - bono.sesiones_restantes
    }));
  } catch (error) {
    console.error('Error al cargar bonos:', error);
  } finally {
    loading.value = false;
  }
};

const formatearFecha = (fecha: string) => {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatearPrecio = (precio: number) => {
  try {
    return new Intl.NumberFormat('es-ES', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(precio);
  } catch {
    return precio;
  }
};

const estadoBonoTexto = (estado: Bono['estado']) => {
  const estados = { activo: 'Activo', agotado: 'Agotado', expirado: 'Expirado', cancelado: 'Cancelado' };
  return estados[estado] || estado;
};

const estadoBonoClass = (estado: Bono['estado']) => {
  const clases = {
    activo: 'bg-green-100 text-green-800',
    agotado: 'bg-red-100 text-red-800',
    expirado: 'bg-gray-100 text-gray-800',
    cancelado: 'bg-orange-100 text-orange-800'
  };
  return clases[estado] || 'bg-gray-100 text-gray-800';
};

const getProgressColor = (restantes: number, total: number) => {
  const porcentaje = (restantes / total) * 100;
  if (porcentaje > 50) return 'bg-[#5550F2]';
  if (porcentaje > 25) return 'bg-amber-500';
  return 'bg-red-500';
};

onMounted(cargarBonos);
</script>