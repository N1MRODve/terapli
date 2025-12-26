<script setup lang="ts">
/**
 * =============================================================================
 * COMPONENTE: Métricas de Pacientes
 * =============================================================================
 * Tarjetas de métricas con información resumida:
 * - Total pacientes
 * - Pacientes activos
 * - Bonos activos
 * - Bonos por agotar
 */

import {
  UserGroupIcon,
  CheckCircleIcon,
  TicketIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

// Props
interface Props {
  totalPacientes: number
  pacientesActivos: number
  bonosActivos: number
  bonosPorAgotar: number
}

const props = defineProps<Props>()
</script>

<template>
  <div class="metricas-grid">
    <!-- Total Pacientes -->
    <div class="metrica-card">
      <div class="metrica-icon icon-total">
        <UserGroupIcon class="w-6 h-6" />
      </div>
      <div class="metrica-content">
        <span class="metrica-valor">{{ totalPacientes }}</span>
        <span class="metrica-label">Total Pacientes</span>
      </div>
    </div>

    <!-- Pacientes Activos -->
    <div class="metrica-card">
      <div class="metrica-icon icon-activos">
        <CheckCircleIcon class="w-6 h-6" />
      </div>
      <div class="metrica-content">
        <span class="metrica-valor activos">{{ pacientesActivos }}</span>
        <span class="metrica-label">Activos</span>
      </div>
    </div>

    <!-- Bonos Activos -->
    <div class="metrica-card">
      <div class="metrica-icon icon-bonos">
        <TicketIcon class="w-6 h-6" />
      </div>
      <div class="metrica-content">
        <span class="metrica-valor bonos">{{ bonosActivos }}</span>
        <span class="metrica-label">Bonos Activos</span>
      </div>
    </div>

    <!-- Bonos por Agotar -->
    <div class="metrica-card" :class="{ 'alerta': bonosPorAgotar > 0 }">
      <div class="metrica-icon icon-alerta">
        <ExclamationTriangleIcon class="w-6 h-6" />
      </div>
      <div class="metrica-content">
        <span class="metrica-valor alerta">{{ bonosPorAgotar }}</span>
        <span class="metrica-label">Por Agotar</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.metricas-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.metrica-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border-radius: 0.875rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: all 0.15s ease;
}

.metrica-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.metrica-card.alerta {
  border-color: rgba(245, 158, 11, 0.2);
  background: linear-gradient(to right, rgba(245, 158, 11, 0.02), white);
}

.metrica-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  flex-shrink: 0;
}

.icon-total {
  background: rgba(99, 102, 241, 0.1);
  color: #6366F1;
}

.icon-activos {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.icon-bonos {
  background: rgba(139, 92, 246, 0.1);
  color: #8B5CF6;
}

.icon-alerta {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.metrica-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.metrica-valor {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F2937;
  line-height: 1.2;
}

.metrica-valor.activos {
  color: #059669;
}

.metrica-valor.bonos {
  color: #7C3AED;
}

.metrica-valor.alerta {
  color: #D97706;
}

.metrica-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

/* Responsive */
@media (max-width: 1024px) {
  .metricas-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .metricas-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .metrica-card {
    padding: 1rem;
    gap: 0.75rem;
  }

  .metrica-icon {
    width: 2.5rem;
    height: 2.5rem;
  }

  .metrica-valor {
    font-size: 1.25rem;
  }

  .metrica-label {
    font-size: 0.6875rem;
  }
}
</style>
