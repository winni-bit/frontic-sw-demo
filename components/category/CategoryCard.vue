<template>
  <NuxtLink 
    :to="`/category/${category.slug}`"
    class="group relative aspect-[3/4] overflow-hidden cursor-pointer bg-stone-100"
    :class="[
      index === 0 ? 'md:col-span-2 md:row-span-2' : ''
    ]"
  >
    <!-- Category Image -->
    <div class="absolute inset-0">
      <img
        v-if="category.cover?.src"
        :src="category.cover.thumbnailSrc || category.cover.src"
        :alt="category.title"
        class="w-full h-full object-cover img-zoom"
      />
      <div 
        v-else 
        class="w-full h-full bg-gradient-to-br from-stone-200 via-stone-300 to-stone-400"
      />
    </div>

    <!-- Overlay -->
    <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />

    <!-- Content -->
    <div class="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
      <div class="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
        <h3 class="font-serif text-2xl lg:text-3xl text-white font-medium mb-2">
          {{ category.title }}
        </h3>
        <div class="flex items-center gap-2 text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <span>Discover</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  category: CategoryCard
  index: number
}>()
</script>
