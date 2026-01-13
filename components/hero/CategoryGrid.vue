<template>
  <section class="py-20 lg:py-28 bg-white">
    <div class="container mx-auto px-6 lg:px-12">
      <!-- Section Header -->
      <div class="text-center mb-16">
        <p class="text-stone-400 text-sm tracking-[0.3em] uppercase mb-4">
          Explore
        </p>
        <h2 class="font-serif text-4xl md:text-5xl text-stone-900 font-medium">
          Shop by Category
        </h2>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="i in 4" 
          :key="i" 
          class="aspect-[3/4] bg-stone-100 animate-pulse rounded-sm"
        />
      </div>

      <!-- Category Grid -->
      <div 
        v-else 
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <CategoryCard
          v-for="(category, index) in categories"
          :key="category.key"
          :category="category"
          :index="index"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  categories: CategoryCard[]
  loading?: boolean
}>()
</script>
