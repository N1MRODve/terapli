<script setup lang="ts">
/**
 * =============================================================================
 * PÁGINA: Agenda de Coordinadora
 * =============================================================================
 * Vista de agenda general que muestra citas de todos los terapeutas.
 * Usa el nuevo componente AgendaCalendario con diseño mejorado.
 */

definePageMeta({
  layout: 'coordinadora',
  middleware: ['auth', 'role-coordinadora']
})
</script>

<template>
  <AgendaCalendario :modo-coordinadora="true" />
</template>
