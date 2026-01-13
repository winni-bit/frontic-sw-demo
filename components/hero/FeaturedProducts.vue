<template>
  <section class="py-20 lg:py-28 bg-stone-50">
    <div class="container mx-auto px-6 lg:px-12">
      <!-- Section Header -->
      <div class="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
        <div>
          <p class="text-stone-400 text-sm tracking-[0.3em] uppercase mb-4">
            Curated Selection
          </p>
          <h2 class="font-serif text-4xl md:text-5xl text-stone-900 font-medium">
            Featured Products
          </h2>
        </div>
        <NuxtLink 
          to="/products"
          class="mt-6 md:mt-0 text-stone-600 hover:text-stone-900 text-sm tracking-wider uppercase flex items-center gap-2 transition-colors"
        >
          View All
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div v-for="i in 4" :key="i" class="space-y-4">
          <div class="aspect-[3/4] bg-stone-200 animate-pulse" />
          <div class="h-4 bg-stone-200 animate-pulse w-3/4" />
          <div class="h-4 bg-stone-200 animate-pulse w-1/2" />
        </div>
      </div>

      <!-- Products Grid -->
      <div 
        v-else 
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        <ProductCard
          v-for="product in products"
          :key="product.key"
          :product="product"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  products: ProductCard[]
  loading?: boolean
}>()
</script>
