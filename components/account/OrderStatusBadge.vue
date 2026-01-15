<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full',
      statusClasses
    ]"
  >
    {{ statusLabel }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  status: string
}>()

const statusConfig: Record<string, { label: string; classes: string }> = {
  open: {
    label: 'Offen',
    classes: 'bg-amber-100 text-amber-800',
  },
  in_progress: {
    label: 'In Bearbeitung',
    classes: 'bg-blue-100 text-blue-800',
  },
  completed: {
    label: 'Abgeschlossen',
    classes: 'bg-green-100 text-green-800',
  },
  shipped: {
    label: 'Versendet',
    classes: 'bg-green-100 text-green-800',
  },
  delivered: {
    label: 'Geliefert',
    classes: 'bg-green-100 text-green-800',
  },
  cancelled: {
    label: 'Storniert',
    classes: 'bg-red-100 text-red-800',
  },
  refunded: {
    label: 'Erstattet',
    classes: 'bg-stone-100 text-stone-800',
  },
  // Payment states
  paid: {
    label: 'Bezahlt',
    classes: 'bg-green-100 text-green-800',
  },
  pending: {
    label: 'Ausstehend',
    classes: 'bg-amber-100 text-amber-800',
  },
  failed: {
    label: 'Fehlgeschlagen',
    classes: 'bg-red-100 text-red-800',
  },
}

const statusClasses = computed(() => {
  const config = statusConfig[props.status.toLowerCase()] || statusConfig[props.status]
  return config?.classes || 'bg-stone-100 text-stone-800'
})

const statusLabel = computed(() => {
  const config = statusConfig[props.status.toLowerCase()] || statusConfig[props.status]
  return config?.label || props.status
})
</script>
