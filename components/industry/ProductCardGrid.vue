<template>
  <NuxtLink 
    :to="`/industry/product/${product.key}`"
    class="group bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all duration-300"
  >
    <!-- Image -->
    <div class="relative aspect-square overflow-hidden bg-slate-800">
      <img
        v-if="product.cover?.src"
        :src="product.cover.thumbnailSrc || product.cover.src"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div 
        v-else 
        class="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center"
      >
        <svg class="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
    </div>

    <!-- Info -->
    <div class="p-3">
      <!-- Product Name -->
      <h3 class="text-white font-medium text-sm mb-1 line-clamp-1 group-hover:text-blue-400 transition-colors">
        {{ product.name }}
      </h3>
      
      <!-- SKU -->
      <p class="text-slate-500 text-xs mb-2">
        SKU: {{ product.key.slice(-8).toUpperCase() }}
      </p>
      
      <!-- Price & Stock -->
      <div class="flex items-center justify-between">
        <span class="text-blue-400 font-bold text-sm">
          {{ formattedPrice }}
        </span>
        <div class="flex items-center gap-1">
          <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
          <span class="text-green-400 text-xs">In Stock</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  product: ProductCard
}>()

const formattedPrice = computed(() => {
  if (!props.product.price) return ''
  const amount = (props.product.price.amount || 0) / Math.pow(10, props.product.price.precision || 2)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.product.price.currency || 'USD'
  }).format(amount)
})
</script>
