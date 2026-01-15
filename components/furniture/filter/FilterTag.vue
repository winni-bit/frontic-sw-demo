<script setup lang="ts">
/**
 * FilterTag - Einzelner aktiver Filter-Tag mit Remove-Button
 * ~30 Zeilen
 */

interface Props {
  label: string
  variant?: 'default' | 'sale' | 'stock'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default'
})

const emit = defineEmits<{
  remove: []
}>()

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'sale':
      return 'bg-amber-100 text-amber-800 hover:text-amber-900'
    case 'stock':
      return 'bg-green-100 text-green-800 hover:text-green-900'
    default:
      return 'bg-stone-100 text-stone-800 hover:text-stone-900'
  }
})
</script>

<template>
  <span :class="['inline-flex items-center gap-1 px-3 py-1 text-sm', variantClasses]">
    {{ label }}
    <button @click="emit('remove')">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </span>
</template>
