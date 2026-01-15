<template>
  <!-- Loading State -->
  <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
    <div v-for="i in 9" :key="i" class="animate-pulse">
      <div class="aspect-[4/5] bg-stone-100 mb-4" />
      <div class="h-4 bg-stone-100 w-3/4 mb-2" />
      <div class="h-4 bg-stone-100 w-1/2" />
    </div>
  </div>

  <!-- Products Grid -->
  <div v-else-if="products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
    <FurnitureProductCard 
      v-for="product in products" 
      :key="product.key" 
      :product="product" 
    />
  </div>

  <!-- No Products -->
  <div v-else class="text-center py-16">
    <div class="w-16 h-16 mx-auto mb-4 bg-stone-100 rounded-full flex items-center justify-center">
      <svg class="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    </div>
    <p class="text-stone-500 mb-4">No furniture found matching your criteria.</p>
    <button 
      @click="$emit('clearFilters')"
      class="text-amber-600 hover:text-amber-700 font-medium"
    >
      Clear all filters
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  loading: boolean
  products: FurnitureProductCard[]
}

defineProps<Props>()
defineEmits<{ clearFilters: [] }>()
</script>
