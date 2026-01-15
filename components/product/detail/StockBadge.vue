<template>
  <!-- 3D Available Badge -->
  <div 
    v-if="has3DModel" 
    class="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-sm px-3 py-2 mb-4"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
    <span>3D View Available</span>
  </div>

  <!-- Stock Warning Badge -->
  <div 
    v-else-if="showLowStockWarning" 
    class="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-sm px-3 py-2 mb-4"
  >
    <svg class="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
    </svg>
    <span>Only <strong>{{ stock }}</strong> left in stock - order soon!</span>
  </div>

  <!-- Out of Stock Badge -->
  <div 
    v-else-if="isOutOfStock" 
    class="inline-flex items-center gap-2 bg-stone-100 text-stone-600 text-sm px-3 py-2 mb-4"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
    <span>Currently out of stock</span>
  </div>

  <!-- Sale Badge -->
  <div v-else-if="hasDiscount" class="inline-block bg-rose-500 text-white text-xs font-medium px-3 py-1 mb-4">
    On Sale - Save {{ discountPercentage }}%
  </div>
</template>

<script setup lang="ts">
interface Props {
  stock?: number
  has3DModel?: boolean
  hasDiscount?: boolean
  discountPercentage?: number
}

const props = withDefaults(defineProps<Props>(), {
  stock: undefined,
  has3DModel: false,
  hasDiscount: false,
  discountPercentage: 0
})

const isOutOfStock = computed(() => {
  return props.stock !== undefined && props.stock <= 0
})

const showLowStockWarning = computed(() => {
  return props.stock !== undefined && props.stock > 0 && props.stock <= 5
})
</script>
