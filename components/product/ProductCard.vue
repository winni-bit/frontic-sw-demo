<template>
  <NuxtLink 
    :to="`/product/${product.key}`"
    class="group cursor-pointer"
  >
    <!-- Product Image -->
    <div class="relative aspect-[3/4] overflow-hidden bg-stone-100 mb-5">
      <img
        v-if="product.cover?.src"
        :src="product.cover.thumbnailSrc || product.cover.src"
        :alt="product.name"
        class="w-full h-full object-cover img-zoom"
      />
      <div 
        v-else 
        class="w-full h-full bg-gradient-to-br from-stone-200 via-stone-300 to-stone-400"
      />
      
      <!-- Quick View Overlay -->
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
        <span class="bg-white text-stone-900 px-6 py-3 text-xs tracking-wider uppercase opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
          Quick View
        </span>
      </div>
    </div>

    <!-- Product Info -->
    <div class="space-y-2">
      <h3 class="text-stone-900 font-medium text-base group-hover:text-stone-600 transition-colors line-clamp-2">
        {{ product.name }}
      </h3>
      <p class="text-stone-500 text-sm font-light">
        {{ formattedPrice }}
      </p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{
  product: ProductCard
}>()

const formattedPrice = computed(() => {
  if (!props.product.price) return ''
  
  const amount = props.product.price.amount / Math.pow(10, props.product.price.precision || 2)
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.product.price.currency || 'USD'
  }).format(amount)
})
</script>
