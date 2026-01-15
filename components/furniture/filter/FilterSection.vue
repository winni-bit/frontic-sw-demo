<script setup lang="ts">
/**
 * FilterSection - Expandierbarer Filter-Abschnitt mit Header
 * ~35 Zeilen
 */

interface Props {
  title: string
  expanded?: boolean
  hasBorder?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  expanded: true,
  hasBorder: true
})

const isExpanded = ref(props.expanded)

const toggle = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div :class="[hasBorder ? 'border-b border-stone-100 pb-6' : 'pb-6']">
    <button 
      @click="toggle"
      class="flex items-center justify-between w-full text-left"
    >
      <span class="font-medium text-stone-900">{{ title }}</span>
      <svg 
        class="w-5 h-5 text-stone-400 transition-transform"
        :class="{ 'rotate-180': isExpanded }"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    <div v-show="isExpanded" class="mt-4">
      <slot />
    </div>
  </div>
</template>
