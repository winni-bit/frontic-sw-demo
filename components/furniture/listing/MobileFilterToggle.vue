<template>
  <div class="lg:hidden mb-6">
    <button 
      @click="$emit('toggle')"
      class="w-full flex items-center justify-center gap-2 border border-stone-200 py-3 text-stone-700"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
      Filters
      <span v-if="activeFilterCount > 0" class="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full">
        {{ activeFilterCount }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  activeFilterCount: number
}

defineProps<Props>()
defineEmits<{ toggle: [] }>()
</script>
